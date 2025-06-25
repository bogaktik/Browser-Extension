// Listen for when a tab is updated (e.g., new URL is loaded)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Check if the tab update is complete and there is a URL
  if (changeInfo.status === 'complete' && tab.url) {
    // Get the saved trigger and destination sites from storage
    chrome.storage.sync.get(['triggerSite', 'destinationSite', 'titleKeywords'], (data) => {
      const triggerSite = data.triggerSite;
      const destinationSite = data.destinationSite;
      const titleKeywords = data.titleKeywords;

      // Check if both sites are configured and the current tab's URL includes the trigger site
      // Using .includes() makes it more flexible (e.g., works for http/https and subdomains)
      if (triggerSite && destinationSite && tab.url.includes(triggerSite)) {
        
        // IMPORTANT: Check to prevent an infinite loop of opening the same tab.
        // We do this by checking if the trigger and destination are the same.
        if (triggerSite.includes(destinationSite) || destinationSite.includes(triggerSite)) {
            console.warn("Redirector: Trigger and destination sites are the same or circular. Aborting to prevent infinite loop.");
            return;
        }
        
        // Create a new tab with the destination URL
        chrome.tabs.create({ url: destinationSite });
      }
      
      if (titleKeywords && tab.url.includes("youtube.com/watch")) {
        const tabTitle = tab.title.toLowerCase();
        if (tabTitle.includes(titleKeywords.toLowerCase())) {
          chrome.tabs.create({ url: destinationSite });
        }
      }
    });
  }
});
