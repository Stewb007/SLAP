import React, { useState } from "react";
import {useUserSession} from "./firebase";

const StudentSubmissionHistory = ({ result, courseCode, assignmentId, studentId }) => {
    const { user, loading } = useUserSession();

    if (loading) {
        return <p>Loading user session...</p>;
    }

    if (!user) {
        return <p>No user is logged in.</p>;
    }

    const handleDownload = (fileContent, fileName) => {
        const blob = new Blob([fileContent], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
      };

    if (!result || result.length === 0) {
        return <p>No submissions found for this assignment.</p>;
    }

    const submissions = result.map((submission, index) => ({
        ...submission,
        submissionNumber: index
      }));
    

    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
          <h2>Submission History</h2>
          <ul style={{ listStyleType: "none", padding: 0 }}>
            {submissions.sort((a, b) => {
                const dateA = a.submissionDate?.seconds || 0;
                const dateB = b.submissionDate?.seconds || 0;
                return dateB - dateA;
            }).map((submission, index) => (
              <li
                key={submission.submissionNumber}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "15px",
                  marginBottom: "10px",
                  backgroundColor: "#f9f9f9",
                }}
              >
                <h3>Submission #{submission.submissionNumber + 1}</h3>
                <p>
                  <strong>Submitted On:</strong>{" "}
                  {submission.submissionDate?.seconds
                    ? new Date(submission.submissionDate.seconds * 1000).toLocaleString()
                    : "Date not available"}
                </p>
                <p>
                  <strong>File:</strong>{" "}
                  {submission.submissionFile && submission.submissionFile !== "No submission string" ? (
                    <button
                      onClick={() => handleDownload(submission.submissionFile, `submissionFile_${index + 1}.txt`)}>
                      Download
                    </button>
                  ) : (
                    "No submission"
                  )}
                </p>
              </li>
            ))}
          </ul>
        </div>
      );
    };
    
    export default StudentSubmissionHistory;
