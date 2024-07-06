import { useState, useEffect } from 'react'

import './SidePanel.css'

export const SidePanel = () => {
  const [countSync, setCountSync] = useState(0)
  const [selectedJobTitle, setSelectedJobTitle] = useState('');
  const [matchResults, setMatchResults] = useState<string>('');

  const jobTitles = ['Software Engineer', 'Product Manager', 'UX Designer', 'Data Scientist']; // Example job titles
  const link = 'https://github.com/guocaoyi/create-chrome-ext'

  useEffect(() => {
    chrome.storage.sync.get(['count'], (result) => {
      setCountSync(result.count || 0)
    })

    chrome.runtime.onMessage.addListener((request) => {
      if (request.type === 'COUNT') {
        setCountSync(request.count || 0)
      }
    })
  }, [])

  const handleMatchNow = () => {
    // Simulate fetching data or processing match
    // For now, let's just set a simple text result
    setMatchResults(`Matching results for ${selectedJobTitle}: Lorem ipsum dolor sit amet.`);
  };


  return (
    <main>
      <h3>SidePanel Page</h3>
      <h4>Count from Popup: {countSync}</h4>
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
      {matchResults && (
        <div className="results-container">
          <h4>Match Results:</h4>
          <p>{matchResults}</p>
        </div>
      )}
    </main>
  )
}

export default SidePanel
