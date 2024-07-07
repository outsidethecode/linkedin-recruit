console.log('background is running')

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'AUTHENTICATE') {
    authenticateLinkedInUser(sendResponse);
    return true; // Indicate that you will send a response asynchronously
  }
});

const authenticateLinkedInUser = (sendResponse: (response?: any) => void) => {
  const clientId = '78pidx3x194n5y';
  const redirectUri = chrome.identity.getRedirectURL();
  const state = 'randomStateString'; // Use a unique state for each request
  const scope = 'profile';//'r_liteprofile r_emailaddress'
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scope)}`;

  chrome.identity.launchWebAuthFlow(
    {
      url: authUrl,
      interactive: true,
    },
    (redirectUrl: any) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        sendResponse(null);
        return;
      }

      console.log('redirectUrl:', redirectUrl);

      const urlParams = new URLSearchParams(new URL(redirectUrl).search);
      const code = urlParams.get('code');
      console.log('Authorization code:', code);

      if (code) {
        // Exchange the code for an access token
        fetchAccessToken(code).then((token) => {
          sendResponse({ token });
        });
      } else {
        console.error('Authorization code is null');
        sendResponse(null);
      }
    }
  );
};

const fetchAccessToken = async (code: string) => {
  const clientId = '78pidx3x194n5y';
  const clientSecret = 'AHxjR7VonuFrPjo9';
  const redirectUri = chrome.identity.getRedirectURL('oauth2');
  const tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  const data = await response.json();
  return data.access_token;
};

chrome.runtime.onMessage.addListener((request) => {
  if (request.type === 'COUNT') {
    console.log('background has received a message from popup, and count is ', request?.count)
  }
})

console.log('background 111111111111111 ')
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