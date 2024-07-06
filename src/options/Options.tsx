import React, { useState, useEffect } from 'react';
import './Options.css';

interface Requirement {
  category: string;
  importance: string;
  text: string;
}

interface Job {
  id: string;
  title: string;
  description: string;
  requirements: Requirement[];
}

const Options = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  useEffect(() => {
    chrome.storage.local.get(['jobs'], (result) => {
      if (result.jobs) {
        setJobs(result.jobs);
      }
    });
  }, []);

  const saveJobs = (newJobs: Job[]) => {
    chrome.storage.local.set({ jobs: newJobs });
    setJobs(newJobs);
  };

  const addJob = () => {
    const newJob: Job = {
      id: Date.now().toString(),
      title: jobTitle,
      description: jobDescription,
      requirements: requirements,
    };
    const updatedJobs = [...jobs, newJob];
    saveJobs(updatedJobs);
    resetForm();
  };

  const resetForm = () => {
    setJobTitle('');
    setJobDescription('');
    setRequirements([]);
    setCurrentJobId(null);
  };

  const deleteJob = (jobId: string) => {
    const updatedJobs = jobs.filter((job) => job.id !== jobId);
    saveJobs(updatedJobs);
  };

  const editJob = (jobId: string) => {
    const jobToEdit = jobs.find((job) => job.id === jobId);
    if (jobToEdit) {
      setJobTitle(jobToEdit.title);
      setJobDescription(jobToEdit.description);
      setRequirements(jobToEdit.requirements);
      setCurrentJobId(jobId);
    }
  };

  const updateJob = () => {
    const updatedJobs = jobs.map((job) =>
      job.id === currentJobId
        ? {
            ...job,
            title: jobTitle,
            description: jobDescription,
            requirements: requirements,
          }
        : job
    );
    saveJobs(updatedJobs);
    resetForm();
  };

  const addRequirement = () => {
    setRequirements([...requirements, { category: '', importance: '', text: '' }]);
  };

  const handleRequirementChange = (index: number, field: keyof Requirement, value: string) => {
    const updatedRequirements = [...requirements];
    updatedRequirements[index][field] = value;
    setRequirements(updatedRequirements);
  };

  return (
    <main>
      <h3>Options Page</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          currentJobId ? updateJob() : addJob();
        }}
      >
        <h2>{currentJobId ? 'Edit Job' : 'Add New Job'}</h2>
        <label>
          Title:
          <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} required />
        </label>
        <br />
        <label>
          Description:
          <input type="text" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} required />
        </label>
        <h3>Requirements</h3>
        {requirements.map((requirement, index) => (
          <div key={index}>
            <label>
              Category:
              <select
                value={requirement.category}
                onChange={(e) => handleRequirementChange(index, 'category', e.target.value)}
                required
              >
                <option value="">Select</option>
                <option value="Education">Education</option>
                <option value="Experience">Experience</option>
                <option value="Activity">Activity</option>
              </select>
            </label>
            <br />
            <label>
              Importance:
              <select
                value={requirement.importance}
                onChange={(e) => handleRequirementChange(index, 'importance', e.target.value)}
                required
              >
                <option value="">Select</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </label>
            <br />
            <label>
              Text:
              <input
                type="text"
                value={requirement.text}
                onChange={(e) => handleRequirementChange(index, 'text', e.target.value)}
                required
              />
            </label>
            <br />
          </div>
        ))}
        <button type="button" onClick={addRequirement}>
          Add Requirement
        </button>
        <br />
        <button type="submit">{currentJobId ? 'Update Job' : 'Add Job'}</button>
        {currentJobId && <button onClick={resetForm}>Cancel</button>}
      </form>

      <h3>Job List</h3>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Requirements</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id}>
              <td>{job.title}</td>
              <td>{job.description}</td>
              <td>
                {job.requirements.map((req: any, index: any) => (
                  <div key={index}>
                    {req.category} - {req.importance} - {req.text}
                  </div>
                ))}
              </td>
              <td>
                <button onClick={() => editJob(job.id)}>Edit</button>
                <button onClick={() => deleteJob(job.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
};

export default Options;
