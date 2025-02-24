document.addEventListener('DOMContentLoaded', () => {
    let settings = {
        isEnabled: false,
        showDeadname: false,
        deadname: "",
        name: "",
    };

    const deadnameCheckbox = document.querySelector(".deadnameCheckbox");
    const deadnameTextbox = document.querySelector(".textinput.deadname");
    const nameTextbox = document.querySelector(".textinput.name");
    const checkbox = document.querySelector(".enabledCheckbox");
    const text = document.querySelector(".flip");

    // Get saved settings from storage
    chrome.storage.local.get('settings', (data) => {
        if (data.settings) {
            settings = data.settings;

            // Apply settings to the UI
            checkbox.checked = settings.isEnabled;
            text.innerHTML = settings.isEnabled ? "On" : "Off";
            deadnameCheckbox.checked = settings.showDeadname;
            deadnameTextbox.value = settings.deadname;
            nameTextbox.value = settings.name;
            
            // Show/hide deadname textbox
            deadnameTextbox.setAttribute("type", settings.showDeadname ? "text" : "password");
        }
    });

    // Listen to checkbox changes (Enable/Disable extension)
    checkbox.addEventListener("change", (e) => {
        text.innerHTML = checkbox.checked ? "On" : "Off";
        sendMessage(); // Send settings update to background.js
    });

    // Toggle deadname visibility
    deadnameCheckbox.addEventListener("change", () => {
        deadnameTextbox.setAttribute("type", deadnameCheckbox.checked ? "text" : "password");
        sendMessage(); // Send settings update to background.js
    });

    // Update settings when name or deadname is changed
    deadnameTextbox.addEventListener("change", sendMessage);
    nameTextbox.addEventListener("change", sendMessage);

    function sendMessage() {
        settings = {
            isEnabled: checkbox.checked,
            showDeadname: deadnameCheckbox.checked,
            deadname: deadnameTextbox.value,
            name: nameTextbox.value,
        };
        chrome.runtime.sendMessage({ action: 'updateSettings', value: settings });
    }
});
