/* function setVideoSettings() {
  const video = document.querySelector("video");

  if (video) {
    // Set playback speed to 1.5x
    video.playbackRate = 1.5;

    // Set quality to the lowest available
    const settingsButton = document.querySelector(".ytp-settings-button");
    if (settingsButton) {
      settingsButton.click();
      setTimeout(() => {
        const qualityMenu = document.querySelector(".ytp-quality-menu");
        if (qualityMenu) {
          const qualityItems = qualityMenu.querySelectorAll(
            ".ytp-menuitem"
          );
          if (qualityItems.length > 0) {
            qualityItems[qualityItems.length - 1].click(); // Click the last item (lowest quality)
          }
        }
        // Click the settings button again to close the menu
        settingsButton.click();
      }, 100);
    }
  }
}

// Observe for changes in the DOM to detect video player loading
const observer = new MutationObserver((mutationsList, observer) => {
  for (const mutation of mutationsList) {
    if (mutation.type === "childList") {
      const video = document.querySelector("video");
      if (video) {
        setVideoSettings();
        observer.disconnect(); // Stop observing once the video is found and settings are applied
        return;
      }
    }
  }
});

observer.observe(document.body, { childList: true, subtree: true });

// Also handle single-page navigation
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    if (url.includes("youtube.com/watch")) {
      setTimeout(setVideoSettings, 1000); // Delay to ensure the video player is loaded
    }
  }
}).observe(document.body, { subtree: true, childList: true }); */


/* // This guard clause ensures the script only runs once on the page, preventing errors.
if (!window.hasRun) {
  window.hasRun = true;

  const applySettings = (video) => {
    // Check if we've already modified this specific video element
    if (video.dataset.settingsApplied) {
      return;
    }

    // Set playback speed to 1.5x
    video.playbackRate = 1.5;

    // Mark this video as modified
    video.dataset.settingsApplied = 'true';

    // --- Automatically set video quality to the lowest ---
    // This is a complex interaction, so we add delays to ensure buttons are available.
    setTimeout(() => {
      const settingsButton = document.querySelector('.ytp-settings-button');
      if (!settingsButton) return;

      settingsButton.click(); // Open the settings menu

      setTimeout(() => {
        const menuItems = document.querySelectorAll('.ytp-menuitem-label');
        let qualityMenuItem = null;
        menuItems.forEach(item => {
          // Find the "Quality" menu item by its text content
          if (item.textContent.trim() === 'Quality') {
            qualityMenuItem = item.parentElement;
          }
        });

        if (qualityMenuItem) {
          qualityMenuItem.click(); // Click the "Quality" item to open the quality list

          setTimeout(() => {
            // Get all available quality options
            const qualityOptions = document.querySelectorAll('.ytp-quality-menu .ytp-menuitem');
            if (qualityOptions.length > 0) {
              // Click the last option, which is always the lowest quality (e.g., 144p)
              qualityOptions[qualityOptions.length - 1].click();
            }
          }, 250); // Wait for the quality menu to appear
        } else {
            // If we couldn't find the quality menu, close the settings menu
            settingsButton.click();
        }
      }, 250); // Wait for the settings menu to appear
    }, 500); // Wait for the settings button to be interactive
  };

  // This function handles finding new video players on the page
  const handleNewVideo = (video) => {
    // Wait for the video's metadata to load before applying settings
    video.addEventListener('loadedmetadata', () => applySettings(video));
  };

  // Use a MutationObserver to watch for when YouTube loads a video player
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeName === 'VIDEO') {
          handleNewVideo(node);
        } else if (node.querySelector) {
          // Also check for videos inside newly added elements
          const video = node.querySelector('video');
          if (video) {
            handleNewVideo(video);
          }
        }
      }
    }
  });

  // Start observing the entire page for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Also check for a video that might already be on the page when the script loads
  const initialVideo = document.querySelector('video');
  if (initialVideo) {
    handleNewVideo(initialVideo);
  }
} */

/**
 * This script is designed to be highly reliable for Single-Page Applications like YouTube.
 * It works by detecting URL changes to identify when a user navigates to a new video page.
 */

// We keep track of the last video URL we've applied settings to.
// This is the most reliable way to know if it's a new video.
let lastProcessedUrl = null;

// Helper function to create a delay. This is crucial for waiting for UI elements to appear.
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// The main async function that clicks through the UI to apply settings.
const applySettings = async (video) => {
  // Set the playback rate directly. This is instant and reliable.
  video.playbackRate = 1.5;

  try {
    // Wait for the UI to be settled before we start clicking things.
    await sleep(500);

    const settingsButton = document.querySelector('.ytp-settings-button');
    if (!settingsButton) {
      console.log("YouTube Auto Settings: Could not find settings button.");
      return;
    }

    // --- Set Quality (Visually) ---
    settingsButton.click();
    await sleep(250);

    const qualityMenuItem = Array.from(document.querySelectorAll('.ytp-menuitem-label')).find(el => el.textContent.trim() === 'Quality')?.parentElement;
    if (!qualityMenuItem) {
      if (document.querySelector('.ytp-popup.ytp-settings-menu')) settingsButton.click();
      console.log("YouTube Auto Settings: Could not find Quality menu item.");
      return;
    }
    qualityMenuItem.click();
    await sleep(250);

    const qualityOptions = document.querySelectorAll('.ytp-quality-menu .ytp-menuitem');
    if (qualityOptions.length > 0) {
      // --- NEW, SMARTER LOGIC ---
      // 1. Try to find '144p' explicitly.
      let targetQualityOption = Array.from(qualityOptions).find(el => el.textContent.includes('144p'));

      // 2. If '144p' isn't found, find the lowest numerical quality, avoiding "Auto".
      if (!targetQualityOption) {
        const numericalOptions = Array.from(qualityOptions).filter(el => !el.textContent.toLowerCase().includes('auto'));
        if (numericalOptions.length > 0) {
          // The last item in this filtered list is the lowest numerical quality.
          targetQualityOption = numericalOptions[numericalOptions.length - 1];
        }
      }

      // 3. Click the target if found, otherwise fall back to the original behavior.
      if (targetQualityOption) {
        targetQualityOption.click();
      } else {
        qualityOptions[qualityOptions.length - 1].click(); // Fallback
      }
    }
    await sleep(250);

    // --- Set Speed (Visually) ---
    const speedMenuItem = Array.from(document.querySelectorAll('.ytp-menuitem-label')).find(el => el.textContent.trim() === 'Playback speed')?.parentElement;
    if (!speedMenuItem) {
      if (document.querySelector('.ytp-popup.ytp-settings-menu')) settingsButton.click();
      console.log("YouTube Auto Settings: Could not find Playback speed menu item.");
      return;
    }
    speedMenuItem.click();
    await sleep(250);

    const speedOption = Array.from(document.querySelectorAll('.ytp-menuitem-content')).find(el => el.textContent.trim() === '1.5')?.parentElement;
    if (speedOption) {
      speedOption.click();
    } else {
      if (document.querySelector('.ytp-popup.ytp-settings-menu')) settingsButton.click();
    }

  } catch (error) {
    console.error("YouTube Auto Settings Error:", error);
  }
};

// This function is the main trigger. It finds the video and applies settings.
const runVideoScript = () => {
  // Use an interval to wait for the video element to appear on the page.
  const checkInterval = setInterval(() => {
    const videoElement = document.querySelector('video');
    // We need to check if the video element exists AND that it has a source loaded.
    if (videoElement && videoElement.src) {
      clearInterval(checkInterval); // Stop checking once we find it.
      applySettings(videoElement);
    }
  }, 500); // Check for the video every half-second.

  // As a safeguard, stop checking after 10 seconds to prevent infinite loops.
  setTimeout(() => clearInterval(checkInterval), 10000);
};

// This function checks the URL and decides if the script should run.
const onUrlChange = () => {
  // Check if we are on a watch page and if it's a new URL we haven't processed.
  if (window.location.href.includes('/watch') && window.location.href !== lastProcessedUrl) {
    // Update the last processed URL to the current one.
    lastProcessedUrl = window.location.href;
    // Run the main logic to find the video and apply settings.
    runVideoScript();
  }
};

// Create a MutationObserver to watch for changes in the page title.
// YouTube's page title changes on every navigation, making it a perfect trigger.
const observer = new MutationObserver(() => {
    onUrlChange();
});

// Start observing the <title> element for changes.
observer.observe(document.querySelector('title'), {
  childList: true
});

// Finally, run the check once when the script is first injected.
// This handles the case of loading directly onto a video page.
onUrlChange();

