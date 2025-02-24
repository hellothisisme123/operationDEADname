console.log("Background script loaded");
const policy = trustedTypes.createPolicy('my-policy', {
    createHTML: (input) => {
      return DOMPurify.sanitize(input);  // Sanitize input to ensure safety
    }
});

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Message received in background:", message);

    if (message.action === 'updateSettings') {
        // Get the active tab
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0 && tabs[0].id !== undefined) {
                // Send the updated settings to content.js
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'settingsUpdated',
                    value: message.value
                });
            }
        });
    }
});

chrome.action.onClicked.addListener(() => {
    // Send message to popup to trigger settings update
    chrome.runtime.sendMessage({
        action: 'replaceText',
        value: {
            replace: true
        }
    });
});