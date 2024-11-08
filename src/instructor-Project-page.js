// “Projects” page:
//   - “New Project” button for adding a new assignment
//   - Assignment list, each assignment is clickable for details.
//     - “View document” button for instruction document → new window
//     - “View Submission history” button → new window
//     - “Upload Instruction document” button -> file selection
//     - “Submit Evaluation” button → new window
//     - “Edit Project” button → new window
//       - “Save” button

import React, { useState } from "react";

const ProjectsPage = ({ courseCode, assignments }) => {
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [instructionFile, setInstructionFile] = useState(null);

  // Handle selection of an assignment to show details
  const handleAssignmentClick = (assignment) => {
    setSelectedAssignment(assignment);
  };

  // Handle instruction file upload
  const handleFileUpload = (event) => {
    setInstructionFile(event.target.files[0]);
    // Here you can also handle the file upload process (e.g., to a server or Firebase)
  };

  return (
    <div>
      <h1>{courseCode} Projects</h1>

      {/* New Project button */}
      <button onClick={() => alert("New Project")}>New Project</button>

      {/* Assignment list */}
      <div>
        {assignments.map((assignment, index) => (
          <div key={index} onClick={() => handleAssignmentClick(assignment)}>
            <h3>{assignment.assignmentName}</h3>
            <p>{assignment.description}</p>
          </div>
        ))}
      </div>

      {/* Assignment details modal */}
      {selectedAssignment && (
        <div className="assignment-details">
          <h2>{selectedAssignment.assignmentName}</h2>
          <p>{selectedAssignment.description}</p>

          {/* Instruction files */}
          <h4>Instruction Files:</h4>
          {selectedAssignment.instructionFiles.map((file, index) => (
            <div key={index}>
              <a href={file} target="_blank" rel="noopener noreferrer">
                View Document {index + 1}
              </a>
            </div>
          ))}

          {/* Action buttons */}
          <button
            onClick={() => window.open("view-submission-history-url", "_blank")}
          >
            View Submission History
          </button>

          <button>
            <label htmlFor="upload-instruction-file">
              Upload Instruction Document
            </label>
            <input
              id="upload-instruction-file"
              type="file"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
          </button>

          <button onClick={() => alert("Submit Evaluation")}>
            Submit Evaluation
          </button>

          <button onClick={() => alert("Edit Project")}>Edit Project</button>

          <button onClick={() => setSelectedAssignment(null)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
