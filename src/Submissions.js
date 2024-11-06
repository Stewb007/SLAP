import React, { useEffect, useState } from 'react';
import { getSubmissions } from './firebase'; 

const Submissions = () => {
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      const submissionsData = await getSubmissions();
      setSubmissions(submissionsData);
    };
    fetchSubmissions();
  }, []);

  return (
    <div className="submissions-page">
      <h1>Your Submissions</h1>
      <ul>
        {submissions.map(submission => (
          <li key={submission.id}>
            <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer">
              {submission.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Submissions;