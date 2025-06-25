/**
 * This script is designed to be highly reliable for Single-Page Applications like YouTube.
 * It works by detecting URL changes to identify when a user navigates to a new video page,
 * and it now correctly handles returning to a previously watched video.
 */

// We keep track of the last video URL we've applied settings to.
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
      // Intelligently find the lowest quality, preferring '144p'.
      let targetQualityOption = Array.from(qualityOptions).find(el => el.textContent.includes('144p'));
      if (!targetQualityOption) {
        const numericalOptions = Array.from(qualityOptions).filter(el => !el.textContent.toLowerCase().includes('auto'));
        if (numericalOptions.length > 0) {
          targetQualityOption = numericalOptions[numericalOptions.length - 1];
        }
      }
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
  const checkInterval = setInterval(() => {
    const videoElement = document.querySelector('video');
    if (videoElement && videoElement.src) {
      clearInterval(checkInterval);
      applySettings(videoElement);
    }
  }, 500);
  setTimeout(() => clearInterval(checkInterval), 10000);
};

// This function checks the URL and decides if the script should run.
const onUrlChange = () => {
  const currentUrl = window.location.href;

  // Check if we are on a watch page.
  if (currentUrl.includes('/watch')) {
    // If the URL is different from the last one we processed, it's a new video.
    if (currentUrl !== lastProcessedUrl) {
      lastProcessedUrl = currentUrl;
      runVideoScript();
    }
  } else {
    // --- THIS IS THE KEY FIX ---
    // If we are NOT on a watch page (e.g., homepage, search), reset the tracker.
    // This makes the extension "forget" the last video, so if we navigate back
    // to it, the settings will be re-applied correctly.
    lastProcessedUrl = null;
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
