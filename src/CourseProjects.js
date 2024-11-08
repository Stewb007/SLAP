import React, { useState } from "react";
import { useUserSession } from "./firebase";
import "./styles/ProjectsPage.css";

function CourseProjects({ user, course }) {
  const [instructionFile, setInstructionFile] = useState(null);
  const [showNewProjectInput, setShowNewProjectInput] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  const handleFileUpload = (event) => {
    setInstructionFile(event.target.files[0]);
  };

  // Handle new project button click to toggle input box
  const handleNewProjectClick = () => {
    setShowNewProjectInput((prev) => !prev);
  };

  // Handle submit new project
  const handleSubmit = () => {
    if (newProjectName.trim()) {
      alert(`New project submitted: ${newProjectName}`);
      setNewProjectName("");
      setShowNewProjectInput(false);
    } else {
      alert("Please enter a project name.");
    }
  };

  return (
    <div className="projects-page-container">
      <h1 className="projects-page-title"> Projects</h1>

      {user.isInstructor && (
        <div className="new-project-container">
          {showNewProjectInput && (
            <input
              type="text"
              placeholder="Enter project name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="new-project-input"
            />
          )}
          <button
            onClick={showNewProjectInput ? handleSubmit : handleNewProjectClick}
            className="new-project-button"
          >
            {showNewProjectInput ? "Submit" : "New Project"}
          </button>
        </div>
      )}

      <div className="assignment-list">
        {course.assignments.map((assignment, index) => (
          <AssignmentItem
            key={index}
            assignment={assignment}
            user={user}
            handleFileUpload={handleFileUpload}
          />
        ))}
      </div>
    </div>
  );
}

const AssignmentItem = ({ assignment, user, handleFileUpload }) => {
  const [showButtons, setShowButtons] = useState(false);

  const toggleButtons = () => {
    setShowButtons(!showButtons);
  };

  return (
    <div className="assignment-item" onClick={toggleButtons}>
      <div className="assignment-parent">
        <div className="assignment-left">
        <h2>{assignment.assignmentName}</h2>
        <p className="assignment-description">{assignment.description}</p>
        </div>
        <div className="assignment-right">
          <span className={`arrow-icon ${showButtons ? "open" : ""}`}>▶</span>
        </div>
      </div>
      {showButtons && (
        <div className="assignment-buttons">
          <button
              onClick={() => {
                window.open(
                  assignment.instructionFiles[0],
                  "DocumentPopup",
                  "width=800,height=600,scrollbars=yes,resizable=yes"
                );
              }}
              className="assignment-button"
            >
            View Document
          </button>
          <button
            onClick={() => alert("View Submission History")}
            className="assignment-button"
          >
            View Submission History
          </button>

          {user.isInstructor ? (
            <>
              <button className="assignment-button">
                <label>
                  Upload Instruction Document
                  <input type="file" onChange={handleFileUpload} />
                </label>
              </button>
              <button
                onClick={() => alert("Submit Evaluation")}
                className="assignment-button"
              >
                Submit Evaluation
              </button>
              <button
                onClick={() => alert("Edit Project")}
                className="assignment-button"
              >
                Edit Project
              </button>
            </>
          ) : (
            <>
              <button className="assignment-button">
                <label>
                  Submit Assignment
                  <input type="file" onChange={handleFileUpload} />
                </label>
              </button>
              <button
                onClick={() => alert("View Evaluation")}
                className="assignment-button"
              >
                View Evaluation
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseProjects;
