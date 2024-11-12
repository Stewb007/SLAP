import React, { useState, useEffect } from "react";
import { fetchAllStudentNames, fetchSubmissions } from "./firebase";
import styles from "./styles/SubmissionAndEvaluation";

const InstructorSubmissionHistory = ({ assignment, courseCode }) => {
  const [studentNumbersToNamesMap, setStudentNumbersToNamesMap] = useState({});
  const [studentIdsToSubmissionsMap, setStudentIdsToSubmissionsMap] = useState(
    {}
  );

  useEffect(() => {
    fetchAllStudentNames(assignment).then((result) => {
      setStudentNumbersToNamesMap(result);

      const studentIdsToSubmissionsMap = {};
      const promises = Object.keys(result).map((studentId) => {
        return fetchSubmissions({
          studentId,
          assignmentId: assignment.assignmentId,
          courseCode,
        }).then((submissions) => {
          if (!studentIdsToSubmissionsMap[studentId]) {
            studentIdsToSubmissionsMap[studentId] = [];
          }
          if (submissions) {
            submissions.forEach((submission) => {
              studentIdsToSubmissionsMap[studentId].push(submission);
            });
          }
        });
      });

      Promise.all(promises).then(() => {
        setStudentIdsToSubmissionsMap(studentIdsToSubmissionsMap);
      });
    });
  }, [assignment, courseCode]);

  const existingGroupCount = assignment.mappedGroups
    ? Object.keys(assignment.mappedGroups).length
    : 0;

  const handleDownload = (fileContent, fileName) => {
    const blob = new Blob([fileContent], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Submission History</h2>
      {assignment.mappedGroups &&
        Object.entries(assignment.mappedGroups)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([groupName, groupMembers], index) => {
            const groupSubmissions = [];
            groupMembers.forEach((studentId) => {
              const studentSubmissions =
                studentIdsToSubmissionsMap[studentId] || [];
              studentSubmissions.forEach((submission) => {
                groupSubmissions.push({
                  studentId,
                  studentName:
                    studentNumbersToNamesMap[studentId] || "Loading...",
                  submissionFile:
                    submission.submissionFile || "No submission string",
                  submissionDate:
                    submission.submissionDate &&
                    submission.submissionDate.seconds
                      ? new Date(submission.submissionDate.seconds * 1000)
                      : new Date(),
                });
              });
            });

            groupSubmissions.sort(
              (a, b) => b.submissionDate - a.submissionDate
            );

            return (
              <div key={index} style={styles.groupContainer}>
                <h3 style={styles.groupHeader}>{groupName}</h3>
                <h4>Members:</h4>
                <ul style={styles.groupMembersList}>
                  {groupMembers.map((studentId, studentIndex) => (
                    <li key={studentIndex} style={styles.groupMemberItem}>
                      {studentNumbersToNamesMap[studentId] || "Loading..."}
                    </li>
                  ))}
                </ul>

                <h4>Submissions:</h4>
                <ul>
                  {groupSubmissions.map((submission, submissionIndex) => (
                    <li key={submissionIndex} style={styles.submissionItem}>
                      <div>
                        <strong>{submission.studentName}</strong>
                      </div>
                      <div>
                        <strong>File:</strong>{" "}
                        {submission.submissionFile !==
                        "No submission string" ? (
                          <button
                            onClick={() =>
                              handleDownload(
                                submission.submissionFile,
                                `submissionFile.txt`
                              )
                            }
                            style={styles.downloadButton}
                          >
                            Download{" "}
                          </button>
                        ) : (
                          "No submission"
                        )}
                      </div>
                      <div>
                        <strong>Date:</strong>{" "}
                        {submission.submissionDate.toLocaleString()}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

      {assignment.studentsNotInGroup &&
        assignment.studentsNotInGroup.length > 0 && (
          <div>
            {assignment.studentsNotInGroup.map((studentId, index) => {
              const groupNumber = existingGroupCount + index + 1;
              const studentName =
                studentNumbersToNamesMap[studentId] || "Loading...";
              const studentSubmissions =
                studentIdsToSubmissionsMap[studentId] || [];

              studentSubmissions.sort(
                (a, b) =>
                  new Date(b.submissionDate.seconds * 1000) -
                  new Date(a.submissionDate.seconds * 1000)
              );

              return (
                <div key={index} style={styles.groupContainer}>
                  <h3 style={styles.groupHeader}>Group {groupNumber}</h3>
                  <h4>Members:</h4>
                  <ul style={styles.studentList}>
                    <li style={styles.studentListItem}>
                      <strong>{studentName}</strong>
                      {studentSubmissions.length > 0 ? (
                        <ul>
                          {studentSubmissions.map(
                            (submission, submissionIndex) => (
                              <li
                                key={submissionIndex}
                                style={styles.studentListItem}
                              >
                                <div>
                                  <strong>
                                    Submission {submissionIndex + 1}:
                                  </strong>
                                  <br />
                                  Date:{" "}
                                  {new Date(
                                    submission.submissionDate.seconds * 1000
                                  ).toLocaleString()}
                                  <br />
                                  Submission:{" "}
                                  {submission.submissionFile !==
                                  "No submission string" ? (
                                    <button
                                      onClick={() =>
                                        handleDownload(
                                          submission.submissionFile,
                                          `${submission.studentName}_${submission.studentId}.txt`
                                        )
                                      }
                                      style={styles.downloadButton}
                                    >
                                      Download{" "}
                                      {`(${submission.submissionFile
                                        .split("/")
                                        .pop()})`}
                                    </button>
                                  ) : (
                                    "No submission"
                                  )}
                                  <br />
                                  <a
                                    href={submission.submissionFile}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    View Submission
                                  </a>
                                </div>
                              </li>
                            )
                          )}
                        </ul>
                      ) : (
                        <p>No submissions found.</p>
                      )}
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
