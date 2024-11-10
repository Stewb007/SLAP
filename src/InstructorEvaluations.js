import React, { useState, useEffect } from "react";
import {
  fetchAllStudentNames,
  fetchSubmissions,
  evaluateStudent,
} from "./firebase";
import styles from "./styles/SubmissionAndEvaluation";

const InstructorEvaluations = ({ assignment, courseCode }) => {
  const [studentNumberstoNamesMap, setStudentNumberstoNamesMap] = useState({});
  const [clickableGroups, setClickableGroups] = useState({});
  const [marks, setMarks] = useState({});

  useEffect(() => {
    fetchAllStudentNames(assignment).then((result) => {
      setStudentNumberstoNamesMap(result);

      const groupPromises = Object.entries(assignment.mappedGroups || {}).map(
        async ([groupName, groupMembers]) => {
          for (let studentId of groupMembers) {
            const submissions = await fetchSubmissions({
              studentId,
              assignmentId: assignment.assignmentId,
              courseCode,
            });
            if (submissions && submissions.length > 0) {
              return { [groupName]: true };
            }
          }
          return { [groupName]: false };
        }
      );

      Promise.all(groupPromises).then((results) => {
        const groupClickableMap = results.reduce((acc, group) => {
          return { ...acc, ...group };
        }, {});
        setClickableGroups(groupClickableMap);
      });
    });
  }, [assignment, courseCode]);

  const handleMarkChange = (groupName, mark) => {
    setMarks((prevMarks) => ({
      ...prevMarks,
      [groupName]: mark,
    }));
  };

  const handleEvaluateClick = (groupMembers, groupName) => {
    const mark = marks[groupName];
    if (!mark) {
      console.log("Please enter a mark for the group!");
      return;
    }

    groupMembers.forEach((studentId) => {
      evaluateStudent({studentId, assignmentId: assignment.assignmentId, courseCode, mark});
    });
  };

  const existingGroupCount = assignment.mappedGroups
    ? Object.keys(assignment.mappedGroups).length
    : 0;

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Evaluations</h2>
      {assignment.mappedGroups &&
        Object.entries(assignment.mappedGroups)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([groupName, groupMembers], index) => (
            <div
              key={index}
              style={{
                ...styles.groupContainer,
                ...(clickableGroups[groupName]
                  ? styles.groupContainerClickable
                  : styles.groupContainerNonClickable),
              }}
            >
              <h3 style={styles.groupHeader}>{groupName}</h3>
              <span
                style={
                  clickableGroups[groupName]
                    ? styles.groupStatusClickable
                    : styles.groupStatusNonClickable
                }
              >
                {clickableGroups[groupName]
                  ? "Submission(s) found"
                  : "No submissions found"}
              </span>
              <ul style={styles.groupMembersList}>
                {groupMembers.map((studentId, studentIndex) => (
                  <li key={studentIndex} style={styles.groupMemberItem}>
                    {studentNumberstoNamesMap[studentId] || "Loading..."}
                  </li>
                ))}
              </ul>

              {clickableGroups[groupName] && (
                <div>
                  <label>Grade:</label>
                  <input
                    type="number"
                    value={marks[groupName] || ""}
                    onChange={(e) =>
                      handleMarkChange(groupName, e.target.value)
                    }
                    placeholder="Enter mark"
                  />
                </div>
              )}

              {clickableGroups[groupName] && (
                <button
                  style={styles.evaluateButton}
                  onClick={() => handleEvaluateClick(groupMembers, groupName)}
                >
                  Evaluate
                </button>
              )}
            </div>
          ))}

      {assignment.studentsNotInGroup &&
        assignment.studentsNotInGroup.length > 0 && (
          <div>
            {assignment.studentsNotInGroup.map((studentId, index) => {
              const groupNumber = existingGroupCount + index + 1;
              const isStudentClickable = clickableGroups[studentId] || false;

              return (
                <div
                  key={index}
                  style={{
                    ...styles.groupContainer,
                    ...(isStudentClickable
                      ? styles.groupContainerClickable
                      : styles.groupContainerNonClickable),
                  }}
                >
                  <h3 style={styles.groupHeader}>Group {groupNumber}</h3>
                  <span
                    style={
                      isStudentClickable
                        ? styles.groupStatusClickable
                        : styles.groupStatusNonClickable
                    }
                  >
                    {isStudentClickable
                      ? "Submission(s) found"
                      : "No submissions found"}
                  </span>
                  <ul style={styles.studentList}>
                    <li style={styles.studentListItem}>
                      {studentNumberstoNamesMap[studentId] || "Loading..."}
                    </li>
                  </ul>

                  {isStudentClickable && (
                    <div>
                      <label>Grade:</label>
                      <input
                        type="number"
                        value={marks[groupNumber] || ""}
                        onChange={(e) =>
                          handleMarkChange(groupNumber, e.target.value)
                        }
                        placeholder="Enter mark"
                      />
                    </div>
                  )}

                  {isStudentClickable && (
                    <button
                      style={styles.evaluateButton}
                      onClick={() =>
                        handleEvaluateClick([studentId], groupNumber)
                      }
                    >
                      Evaluate
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
};

export default InstructorEvaluations;
