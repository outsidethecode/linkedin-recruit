console.log('background is running')

chrome.runtime.onMessage.addListener((request) => {
  if (request.type === 'COUNT') {
    console.log('background has received a message from popup, and count is ', request?.count)
  }
})

// Define the regular expression pattern for LinkedIn URLs
const linkedinPattern = /^https:\/\/(www\.)?linkedin\.com\/.*/;

// Listen for extension installation or update
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed or updated.');

  // Listen for tab URL changes
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url && tab && tab.active) {
      handleUrlChange(tabId, changeInfo.url);
    }
  });
});

// Function to handle URL changes and show/hide the side panel
function handleUrlChange(tabId: number, url: string) {
  // Check if the current URL matches the LinkedIn pattern
  if (linkedinPattern.test(url)) {
    // Set options to enable and specify the path to sidepanel.html
    chrome.sidePanel.setOptions({
      enabled: true,
      path: 'sidepanel.html',
      tabId: tabId,
    }).then(() => {
      console.log('Side panel enabled for LinkedIn page.');
    }).catch((error) => {
      console.error('Error setting side panel options:', error);
    });
  } else {
    // Disable side panel if not on a LinkedIn page
    chrome.sidePanel.setOptions({
      enabled: false,
      tabId: tabId,
    }).then(() => {
      console.log('Side panel disabled.');
    }).catch((error) => {
      console.error('Error setting side panel options:', error);
    });
  }
}