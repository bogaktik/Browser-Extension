const inputUI = document.getElementById('inputUI');
const finishUI = document.getElementById('finishUI');

// Get references to the HTML elements
const triggerSiteInput = document.getElementById('triggerSite');
const destinationSiteInput = document.getElementById('destinationSite');
const titleKeywordsInput = document.getElementById('titleKeywords');
const saveButton = document.getElementById('saveButton');
const statusDiv = document.getElementById('status');

// Save settings when the save button is clicked
saveButton.addEventListener('click', () => {
  const triggerSite = triggerSiteInput.value;
  const destinationSite = destinationSiteInput.value;
  const titleKeywords = titleKeywordsInput.value;

  // Basic validation to ensure URLs are not empty
  if (( triggerSite || titleKeywords) && destinationSite) {
    // Save the URLs using chrome.storage.sync
    chrome.storage.sync.set({ triggerSite, destinationSite, titleKeywords }, () => {      
      // Display message for 3s and close the popup
      inputUI.hidden = true;
      finishUI.hidden = false;
      setTimeout(() => {
        window.close();
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
