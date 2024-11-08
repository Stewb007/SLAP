import React from 'react';
import './styles/GroupsPage.css';

const GroupsPage = ({ groups }) => {
  return (
    <div className="GroupsPage">
      <h1>Groups</h1>
      <button onClick={() => alert('Create a Group')}>Create a Group</button>
      <div className="groups-list">
        {groups.length > 0 ? (
          groups.map((group, index) => (
            <div key={index} className="group">
              <h2>Group {index + 1}</h2>
              <ul>
                {group.map((student, idx) => (
                  <li key={idx}>{student}</li>
                ))}
              </ul>
              <button onClick={() => alert(`View Activity for Group ${index + 1}`)}>View Activity</button>
            </div>
          ))
        ) : (
          <p>No groups available.</p>
        )}
      </div>
    </div>
  );
};

export default GroupsPage;