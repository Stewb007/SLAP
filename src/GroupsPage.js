import React, { useState } from 'react';
import './styles/GroupsPage.css';

const GroupsPage = ({ groups, students, addGroup }) => {
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);

  const handleCreateGroup = () => {
    if (newGroupName.trim() && selectedStudents.length > 0) {
      addGroup({ name: newGroupName, members: selectedStudents });
      setNewGroupName('');
      setSelectedStudents([]);
    }
  };

  const handleStudentSelection = (student) => {
    setSelectedStudents((prevSelected) =>
      prevSelected.includes(student)
        ? prevSelected.filter((s) => s !== student)
        : [...prevSelected, student]
    );
  };

  return (
    <div className="GroupsPage">
      <h1>Groups</h1>
      <div className="create-group">
        <input
          type="text"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          placeholder="Enter group name"
        />
        <div className="student-selection">
          {students.map((student, index) => (
            <div key={index}>
              <input
                type="checkbox"
                id={`student-${index}`}
                checked={selectedStudents.includes(student)}
                onChange={() => handleStudentSelection(student)}
              />
              <label htmlFor={`student-${index}`}>{student}</label>
            </div>
          ))}
        </div>
        <button onClick={handleCreateGroup}>Create a Group</button>
      </div>
      <div className="groups-list">
        {groups.length > 0 ? (
          groups.map((group, index) => (
            <div key={index} className="group">
              <h2>{group.name}</h2>
              <ul>
                {group.members.map((student, idx) => (
                  <li key={idx}>{student}</li>
                ))}
              </ul>
              <button onClick={() => alert(`View Activity for ${group.name}`)}>View Activity</button>
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