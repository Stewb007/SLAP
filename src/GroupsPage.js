import React, { useState, useEffect } from 'react';
import './styles/GroupsPage.css';
import { addGroupToAssignment, fetchGroupsForAssignment, fetchAllStudentNames } from './firebase'; // Import the functions

const GroupsPage = ({ user, courseId, assignmentId, students }) => {
  const [groups, setGroups] = useState([]);
  const [studentsNotInGroup, setStudentsNotInGroup] = useState(students);
  const [studentNamesMap, setStudentNamesMap] = useState({});

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const { mappedGroups, studentsNotInGroup } = await fetchGroupsForAssignment(courseId, assignmentId);
        const studentNames = await fetchAllStudentNames({ mappedGroups, studentsNotInGroup });
        setGroups(Object.entries(mappedGroups));
        setStudentsNotInGroup(studentsNotInGroup);
        setStudentNamesMap(studentNames);
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
    };

    fetchGroups();
  }, [courseId, assignmentId]);

  const handleCreateGroup = async () => {
    if (studentsNotInGroup.length > 0) {
      const newGroup = { name: `Group ${groups.length + 1}`, members: studentsNotInGroup };
      try {
        await addGroupToAssignment(courseId, assignmentId, newGroup);
        setGroups([...groups, [newGroup.name, studentsNotInGroup]]);
        setStudentsNotInGroup([]);
      } catch (error) {
        console.error('Error creating group:', error);
      }
    }
  };

  if (!user.isInstructor) {
    return null;
  }

  return (
    <div className="GroupsPage">
      <h1>Groups</h1>
      <div className="create-group">
        <button onClick={handleCreateGroup}>Create a Group</button>
      </div>
      <div className="groups-list">
        {groups.length > 0 ? (
          groups.map(([groupName, groupMembers], index) => (
            <div key={index} className="group">
              <h2>{groupName}</h2>
              <ul>
                {groupMembers.map((student, idx) => (
                  <li key={idx}>{studentNamesMap[student] || student}</li>
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
            <li key={index}>{studentNamesMap[student] || student}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default GroupsPage;