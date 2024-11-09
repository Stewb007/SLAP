import React, { useState } from "react";
// import { db } from "./firebase";
// import { collection } from "firebase/firestore";

import "./styles/ProjectsPage.css";

function CourseProjects({ user, course }) {
  const [showNewProjectInput, setShowNewProjectInput] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  const handleNewProjectClick = () => {
    setShowNewProjectInput((prev) => !prev);
  };

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
          <AssignmentItem key={index} assignment={assignment} user={user} />
        ))}
      </div>
    </div>
  );
}

const AssignmentItem = ({ assignment, user }) => {
  const [showButtons, setShowButtons] = useState(false);

  
  const toggleButtons = () => {
    setShowButtons(!showButtons);
  };

  const handleUploadInstructionDocument = (event, assignmentName) => {
    console.log(1);
  };

  const handleUploadAssignment = (event, assignmentName) => {
    const file = event.target.files[0];
    if (file) {
      alert(`Assignment for ${assignmentName} submitted: ${file.name}`);
    }
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
              const newWindow = window.open(
                "",
                "DocumentPopup",
                "width=800,height=600,scrollbars=yes,resizable=yes"
              );
              newWindow.document.write(
                "<pre>" + assignment.instructionFile + "</pre>"
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
                  <input
                    type="file"
                    accept=".txt"
                    onChange={(e) =>
                      handleUploadInstructionDocument(
                        e,
                        assignment.assignmentName
                      )
                    }
                  />
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
                  <input
                    type="file"
                    onChange={(e) =>
                      handleUploadAssignment(e, assignment.assignmentName)
                    }
                  />
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
