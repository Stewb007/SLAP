import React, { useState, useEffect } from "react";
import { fetchAllStudentNames } from "./firebase";
// import "./styles/InstructorSubmissionHistory.css";

const InstructorSubmissionHistory = ({ assignment, courseCode }) => {
  console.log(courseCode);
  const [studentNumberstoNamesMap, setStudentNumberstoNamesMap] = useState({});

  useEffect(() => {
    fetchAllStudentNames(assignment).then((result) => {
      setStudentNumberstoNamesMap(result);
    });
  }, [assignment]);

  const existingGroupCount = assignment.mappedGroups
    ? Object.keys(assignment.mappedGroups).length
    : 0;

  const styles = {
    container: {
      padding: "20px",
      backgroundColor: "white",
      borderRadius: "8px",
      margin: "20px",
    },
    header: {
      fontSize: "24px",
      color: "#333",
      textAlign: "center",
    },
    groupContainer: {
      marginTop: "20px",
      padding: "10px",
      border: "1px solid #ddd",
      borderRadius: "4px",
    },
    groupHeader: {
      fontSize: "20px",
      fontWeight: "bold",
      marginBottom: "10px",
    },
    groupMembersList: {
      listStyleType: "none",
      padding: "0",
    },
    groupMemberItem: {
      padding: "5px",
      borderBottom: "1px solid #ddd",
    },
    studentList: {
      listStyleType: "none",
      padding: "0",
    },
    studentListItem: {
      padding: "5px",
      borderBottom: "1px solid #ddd",
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Submission History</h2>
      {assignment.mappedGroups &&
        Object.entries(assignment.mappedGroups)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([groupName, groupMembers], index) => (
            <div key={index} style={styles.groupContainer}>
              <h3 style={styles.groupHeader}>{groupName}</h3>
              <ul style={styles.groupMembersList}>
                {groupMembers.map((studentId, studentIndex) => (
                  <li key={studentIndex} style={styles.groupMemberItem}>
                    {studentNumberstoNamesMap[studentId] || "Loading..."}
                  </li>
                ))}
              </ul>
            </div>
          ))}
      {assignment.studentsNotInGroup &&
        assignment.studentsNotInGroup.length > 0 && (
          <div>
            {assignment.studentsNotInGroup.map((studentId, index) => {
              const groupNumber = existingGroupCount + index + 1;
              return (
                <div key={index} style={styles.groupContainer}>
                  <h3 style={styles.groupHeader}>Group {groupNumber}</h3>
                  <ul style={styles.studentList}>
                    <li style={styles.studentListItem}>
                      {studentNumberstoNamesMap[studentId] || "Loading..."}
                    </li>
                  </ul>
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
};

export default InstructorSubmissionHistory;
