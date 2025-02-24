let settings = {
    isEnabled: false,
    showDeadname: false,
    deadname: "",
    name: "",
}
let originalTextMap = new Map(); // Store original text for reversal

// Retrieve the stored value of settings from storage
chrome.storage.local.get('settings', (data) => {
    console.log(data, settings);
    
    if (data.settings) {
        settings = data.settings;
    }
    handleSettingsChange();  // Apply settings when the script loads
});

// Listen for changes from background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'settingsUpdated') {
        settings = message.value;
        // Save the new settings to storage
        chrome.storage.local.set({ settings: settings });
        handleSettingsChange();
    }
});

// Adjust the page according to settings
function handleSettingsChange() {
    console.log(settings);
    
    if (settings.isEnabled && settings.deadname && settings.name) {
        console.log('Extension enabled - running code');
        const deadname = settings.deadname.toLowerCase();
        const deadnameCap = capitalizeFirstLetter(deadname);
        const name = `[${capitalizeFirstLetter(settings.name.toLowerCase())}]`;
        
        console.log(deadname, deadnameCap, name);
        
        // Replace existing text
        replaceVisibleText(deadname, name);
        replaceVisibleText(deadnameCap, name);
        
        // Set up a MutationObserver to handle dynamically added text
        observeTextNodes();
    } else {
        console.log('Extension disabled - stopping code');
        reverseReplaceVisibleText();
    }
}

// Capitalize the first letter of the string
function capitalizeFirstLetter(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

// Function to replace visible text in the document
function replaceVisibleText(targetText, replacementText) {
    const bodyTextNodes = getTextNodesInDocument(document);
    bodyTextNodes.forEach(node => {
        if (node.nodeType === 3) {  // Text node
            // Save original text for reversal
            if (!originalTextMap.has(node)) {
                originalTextMap.set(node, node.nodeValue);
            }
            // Replace the text
            node.nodeValue = node.nodeValue.replace(new RegExp(targetText, 'g'), replacementText);
        }
    });
}

// Reverse the text replacement
function reverseReplaceVisibleText() {
    const bodyTextNodes = getTextNodesInDocument(document);
    bodyTextNodes.forEach(node => {
        if (node.nodeType === 3) {  // Text node
            if (originalTextMap.has(node)) {
                // Restore the original text
                node.nodeValue = originalTextMap.get(node);
                originalTextMap.delete(node); // Remove it from map after restoring
            }
        }
    });
}

// Get all the text nodes in the document body
function getTextNodesInDocument(node) {
    let textNodes = [];
    if (node.nodeType === 3) {  // Text node
        textNodes.push(node);
    } else {
        for (let childNode of node.childNodes) {
            textNodes = textNodes.concat(getTextNodesInDocument(childNode));
        }
    }
    return textNodes;
}

function observeTextNodes() {
    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    // Check if the node is a shadow root or an element containing a shadow root
                    if (node.shadowRoot) {
                        observeTextNodesInShadowDOM(node.shadowRoot); // Recursively observe shadow roots
                    }
                    if (node.nodeType === 3) {  // Text node added
                        replaceVisibleText(settings.deadname.toLowerCase(), `[${capitalizeFirstLetter(settings.name.toLowerCase())}]`);
                        replaceVisibleText(capitalizeFirstLetter(settings.deadname.toLowerCase()), `[${capitalizeFirstLetter(settings.name.toLowerCase())}]`);
                    }
                });
            }

            if (mutation.type === 'characterData') {
                const node = mutation.target;
                if (node.nodeValue.includes(settings.deadname)) {
                    replaceVisibleText(settings.deadname.toLowerCase(), `[${capitalizeFirstLetter(settings.name.toLowerCase())}]`);
                    replaceVisibleText(capitalizeFirstLetter(settings.deadname.toLowerCase()), `[${capitalizeFirstLetter(settings.name.toLowerCase())}]`);
                }
            }
        }
    });

    observer.observe(document, {
        childList: true,
        subtree: true,
        characterData: true
    });
}

// Helper function to observe shadow DOMs
function observeTextNodesInShadowDOM(shadowRoot) {
    const shadowObserver = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 3) { // Text node added inside shadow DOM
                        replaceVisibleText(settings.deadname.toLowerCase(), `[${capitalizeFirstLetter(settings.name.toLowerCase())}]`);
                        replaceVisibleText(capitalizeFirstLetter(settings.deadname.toLowerCase()), `[${capitalizeFirstLetter(settings.name.toLowerCase())}]`);
                    }
                });
            }

            if (mutation.type === 'characterData') {
                const node = mutation.target;
                if (node.nodeValue.includes(settings.deadname)) {
                    replaceVisibleText(settings.deadname.toLowerCase(), `[${capitalizeFirstLetter(settings.name.toLowerCase())}]`);
                    replaceVisibleText(capitalizeFirstLetter(settings.deadname.toLowerCase()), `[${capitalizeFirstLetter(settings.name.toLowerCase())}]`);
                }
            }
        }
    });

    shadowObserver.observe(shadowRoot, {
        childList: true,
        subtree: true,
        characterData: true
    });
}
