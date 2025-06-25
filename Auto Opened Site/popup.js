// Get references to the HTML elements
const triggerSiteInput = document.getElementById('triggerSite');
const destinationSiteInput = document.getElementById('destinationSite');
const saveButton = document.getElementById('save');
const statusDiv = document.getElementById('status');

// Load saved settings when the popup opens
document.addEventListener('DOMContentLoaded', () => {
  // Use chrome.storage.sync to get the saved URLs
  chrome.storage.sync.get(['triggerSite', 'destinationSite'], (data) => {
    if (data.triggerSite) {
      triggerSiteInput.value = data.triggerSite;
    }
    if (data.destinationSite) {
      destinationSiteInput.value = data.destinationSite;
    }
  });
});

// Save settings when the save button is clicked
saveButton.addEventListener('click', () => {
  const triggerSite = triggerSiteInput.value;
  const destinationSite = destinationSiteInput.value;

  // Basic validation to ensure URLs are not empty
  if (triggerSite && destinationSite) {
    // Save the URLs using chrome.storage.sync
    chrome.storage.sync.set({ triggerSite, destinationSite }, () => {
      // Display a success message
      statusDiv.textContent = 'Settings saved!';
      // Clear the message after a few seconds
      setTimeout(() => {
        statusDiv.textContent = '';
      }, 3000);
    });
  } else {
    // Display an error message if fields are empty
    statusDiv.textContent = 'Please fill out both fields.';
    setTimeout(() => {
        statusDiv.textContent = '';
      }, 3000);
  }
});
