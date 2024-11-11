import React, { useState, useEffect } from 'react';
import './styles/GroupsPage.css';
import { addGroupToAssignment, fetchGroupsForAssignment } from './firebase'; // Import the functions

const GroupsPage = ({ courseId, assignmentId, students }) => {
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [studentsNotInGroup, setStudentsNotInGroup] = useState(students);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const { mappedGroups, studentsNotInGroup } = await fetchGroupsForAssignment(courseId, assignmentId);
        setGroups(Object.entries(mappedGroups));
        setStudentsNotInGroup(studentsNotInGroup);
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
    };

    fetchGroups();
  }, [courseId, assignmentId]);

  const handleCreateGroup = async () => {
    if (newGroupName.trim() && selectedStudents.length > 0) {
      const newGroup = { name: newGroupName, members: selectedStudents };
      try {
        await addGroupToAssignment(courseId, assignmentId, newGroup);
        setGroups([...groups, [newGroupName, selectedStudents]]);
        setStudentsNotInGroup(studentsNotInGroup.filter(student => !selectedStudents.includes(student)));
        setNewGroupName('');
        setSelectedStudents([]);
      } catch (error) {
        console.error('Error creating group:', error);
      }
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
          {studentsNotInGroup.map((student, index) => (
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
          groups.map(([groupName, groupMembers], index) => (
            <div key={index} className="group">
              <h2>{groupName}</h2>
              <ul>
                {groupMembers.map((student, idx) => (
                  <li key={idx}>{student}</li>
                ))}
              </ul>
              <button onClick={() => alert(`View Activity for ${groupName}`)}>View Activity</button>
            </div>
          ))
        ) : (
          <p>No groups available.</p>
        )}
      </div>
      <div className="students-not-in-group">
        <h2>Students Not in Any Group</h2>
        <ul>
          {studentsNotInGroup.map((student, index) => (
            <li key={index}>{student}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default GroupsPage;