import { useState, useEffect } from 'react';
import './SidePanel.css';

const mockLinkedInProfile = {
  name: 'John Doe',
  headline: 'Software Engineer at XYZ Corp',
  location: 'San Francisco Bay Area',
  connections: 500,
  // Add more fields as needed
};

interface JobRequirement {
  category: string;
  importance: string;
  text: string;
}

interface Job {
  title: string;
  description: string;
  requirements: JobRequirement[];
}

const requirementDetails = [
  {
    index: 0,
    comment: "Requirement 0: Strong match.",
    matchingPercentage: 90,
  },
  {
    index: 1,
    comment: "Requirement 1: Moderate match.",
    matchingPercentage: 75,
  },
  {
    index: 2,
    comment: "Requirement 2: Weak match.",
    matchingPercentage: 50,
  },
  // Add more requirements as needed
];

export const SidePanel = () => {
  const [countSync, setCountSync] = useState(0);
  const [selectedJobTitle, setSelectedJobTitle] = useState('');
  const [matchResults, setMatchResults] = useState<{ requirement: JobRequirement, percentage: number, comment: string }[]>([]);
  const [totalMatchPercentage, setTotalMatchPercentage] = useState<number>(0);
  const [jobTitles, setJobTitles] = useState<string[]>([]);
  const [profileName, setProfileName] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const link = 'https://github.com/guocaoyi/create-chrome-ext';

  useEffect(() => {
    chrome.storage.sync.get(['count'], (result) => {
      setCountSync(result.count || 0);
    });

    chrome.storage.local.get(['jobs'], (result) => {
      if (result.jobs) {
        const titles = result.jobs.map((job: Job) => job.title);
        setJobTitles(titles);
      }
    });

    chrome.runtime.onMessage.addListener((request) => {
      if (request.type === 'COUNT') {
        setCountSync(request.count || 0);
      }
    });

    // Get current tab URL
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0] && tabs[0].url) {
        const url = tabs[0].url;
        console.log('Checking the URL: ', url);

        if (/^https:\/\/(www\.)?linkedin\.com\/in\/.*/.test(url)) {
          console.log('The URL is related to a LinkedIn profile');

          // Placeholder for calling the LinkedIn API
          // Simulate fetching LinkedIn profile data
          fetchLinkedInProfile().then((profile: any) => {
            console.log('Got the profile', profile);
            setProfileName(profile.name);
          });
        }
      }
    });
  }, []);

  const fetchLinkedInProfile = async () => {
    // Simulate an API call by returning a promise that resolves to the mock JSON
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockLinkedInProfile);
      }, 1000);
    });
  };

  const calculateMatchPercentage = (requirements: JobRequirement[]): { requirement: JobRequirement, percentage: number, comment: string }[] => {
    // Use the hardcoded requirement details to calculate match percentage
    return requirements.map((requirement, index) => {
      const detail = requirementDetails.find(detail => detail.index === index);
      return {
        requirement,
        percentage: detail ? detail.matchingPercentage : 0,
        comment: detail ? detail.comment : "No comment available."
      };
    });
  };

  const handleMatchNow = () => {
    chrome.storage.local.get(['jobs'], (result) => {
      if (result.jobs) {
        const job = result.jobs.find((job: Job) => job.title === selectedJobTitle);
        if (job) {
          const matchedRequirements = calculateMatchPercentage(job.requirements);
          setMatchResults(matchedRequirements);
          const totalPercentage = matchedRequirements.reduce((sum, item) => sum + item.percentage, 0) / matchedRequirements.length;
          setTotalMatchPercentage(totalPercentage);
        }
      }
    });
  };

  // const handleLinkedInAuth = () => {
  //   const clientId = '78pidx3x194n5y'; // Replace with your LinkedIn app client ID
  //   const redirectUri = chrome.identity.getRedirectURL();
  //   const state = encodeURIComponent('random_state_string123456'); // Generate a random state string
  //   console.log('Redirect URI:', redirectUri);

  //   const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=r_liteprofile%20r_emailaddress&state=${state}`;

  //   chrome.identity.launchWebAuthFlow(
  //     {
  //       url: authUrl,
  //       interactive: true,
  //     },
  //     (redirectUrl: any) => {
  //       if (chrome.runtime.lastError) {
  //         console.error(chrome.runtime.lastError);
  //         //return;
  //       }

  //       if (!redirectUrl) {
  //         console.error('No redirect URL returned.');
  //         //return;
  //       }
        
  //       const urlParams = new URLSearchParams(new URL(redirectUrl).search);
  //       const code = urlParams.get('code');
  //       console.log('Code', code);

  //       if (code) {
  //         console.log('Authorization code:', code);
  //         // You need to exchange the authorization code for an access token
  //         // Implement the token exchange logic here

  //         // For now, set isAuthenticated to true to simulate a successful login
  //         setIsAuthenticated(true);
  //       }
  //     }
  //   );
  // };

  const handleLinkedInAuth = () => {
    chrome.runtime.sendMessage({ type: 'AUTHENTICATE' }, (response) => {
      if (response && response.token) {
        console.log('Access token:', response.token);
        fetchLinkedInProfileWithToken(response.token).then((profile) => {
          setProfileName(profile.localizedFirstName + ' ' + profile.localizedLastName);
        });
      } else {
        console.error('Authentication failed or user did not authorize the app');
      }
    });
  };

  const fetchLinkedInProfileWithToken = async (token: string) => {
    const response = await fetch('https://api.linkedin.com/v2/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const profile = await response.json();
    return profile;
  };
  

  return (
    <main>
      <h3>SidePanel Page</h3>
      <h4>Count from Popup: {countSync}</h4>
      {profileName && <h4>Profile Name: {profileName}</h4>}

      <button onClick={handleLinkedInAuth}>
        {isAuthenticated ? 'Authenticated' : 'Authenticate with LinkedIn'}
      </button>

      <div className="form-container">
        <label htmlFor="jobTitle">Select Job Title:</label>
        <select
          id="jobTitle"
          value={selectedJobTitle}
          onChange={(e) => setSelectedJobTitle(e.target.value)}
        >
          <option value="">Select a job title...</option>
          {jobTitles.map((title, index) => (
            <option key={index} value={title}>
              {title}
            </option>
          ))}
        </select>
        <button onClick={handleMatchNow}>Match now</button>
      </div>
      {matchResults.length > 0 && (
        <div className="results-container">
          <h4>Match Results:</h4>
          <ul>
            {matchResults.map((item, index) => (
              <li key={index}>
                {item.requirement.text} - {item.percentage}% ({item.comment})
              </li>
            ))}
          </ul>
          <h4>Total Match Percentage: {totalMatchPercentage.toFixed(2)}%</h4>
        </div>
      )}
    </main>
  );
};

export default SidePanel;
