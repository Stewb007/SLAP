import React, { useState, useEffect } from "react";
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
      <h1 className="projects-page-title">{course.code} Projects Page</h1>

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
          <div key={index} className="assignment-item">
            <div className="assignment-details">
              <h2>{assignment.assignmentName}</h2>
              <p>{assignment.description}</p>
            </div>

            <div className="assignment-buttons">
              <button
                onClick={() =>
                  window.open(assignment.instructionFiles[0], "_blank")
                }
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseProjects;
