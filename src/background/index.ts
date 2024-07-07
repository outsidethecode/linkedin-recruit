console.log('background is running')

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'AUTHENTICATE') {
    authenticateLinkedInUser(sendResponse);
    return true; // Indicate that you will send a response asynchronously
  }
});

const authenticateLinkedInUser = (sendResponse: (response?: any) => void) => {
  const clientId = '78pidx3x194n5y'; // Replace with your LinkedIn app client ID
    const redirectUri = chrome.identity.getRedirectURL();
    const state = encodeURIComponent('random_state_string12345'); // Generate a random state string
    console.log('Redirect URI:', redirectUri);

    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=openid%20profile%20email&state=${state}`;

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
  
        const urlParams = new URLSearchParams(new URL(redirectUrl).search);
        const code = urlParams.get('code');
        console.log('Authorization code:', code);
  
        if (code) {
          // Exchange the code for an access token
          console.log('Now are fetching the access token .. ')
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
  const redirectUri = chrome.identity.getRedirectURL();
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
  console.log('Response of fetching the access token', data)

  return data.access_token;
};

chrome.runtime.onMessage.addListener((request) => {
  if (request.type === 'COUNT') {
    console.log('background has received a message from popup, and count is ', request?.count)
  }
})

// Define the regular expression pattern for LinkedIn URLs
const linkedinPattern = /^https:\/\/(www\.)?linkedin\.com\/.*/;

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

// Define your Google OAuth client ID
const GOOGLE_CLIENT_ID = '26281100920-l8uu4l9557tsl7u6f02v76u3786pc2sq.apps.googleusercontent.com'; // Replace with your actual client ID

// Function to handle authentication flow
const handleAuthentication = () => {
  console.log('About to auth ...');

  chrome.identity.launchWebAuthFlow({
    url: `https://accounts.google.com/o/oauth2/auth` +
         `?client_id=${GOOGLE_CLIENT_ID}` +
         `&response_type=code` +
         `&redirect_uri=${encodeURIComponent(chrome.identity.getRedirectURL())}` +
         `&scope=profile email`,
    interactive: true
  }, (redirectUrl: any) => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      return;
    }

    console.log('Got redirectUrl: ',redirectUrl);
    const urlParams = new URLSearchParams(new URL(redirectUrl).search);
    const code = urlParams.get('code');
    console.log('Got code: ',code);

    if (code) {
      fetch('http://localhost:3000/auth/google/exchange', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      })
      .then(response => response.json())
      .then(data => {
        console.log('User registered:', data);
        chrome.storage.local.set({ isAuthenticated: true, profile: data.profile }, () => {
          console.log('Authentication status stored.');
        });
      })
      .catch(error => {
        console.error('Error:', error);
      });
    }
  });
};

// Example listener for receiving messages from side panel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'AUTHENTICATE_GOOGLE') {
    handleAuthentication();
  }
});