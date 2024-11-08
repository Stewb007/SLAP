import React, { useState } from "react";

const ProjectsPage = ({ courseCode, assignments, isInstructor }) => {
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [instructionFile, setInstructionFile] = useState(null);

  // Handle instruction file upload
  const handleFileUpload = (event) => {
    setInstructionFile(event.target.files[0]);
    // Here you can handle the actual file upload logic, e.g., uploading to Firebase or a server
  };

  return (
    <div>
      <h1>{courseCode} Projects Page</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {assignments.map((assignment, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              border: "1px solid #ccc",
              padding: "10px",
              borderRadius: "5px",
            }}
          >
            {/* Left side: Assignment Details */}
            <div>
              <h2>{assignment.assignmentName}</h2>
              <p>{assignment.description}</p>
            </div>

            {/* Right side: Control Buttons */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <button
                onClick={() =>
                  window.open(assignment.instructionFiles[0], "_blank")
                }
              >
                View Document
              </button>
              <button onClick={() => alert("View Submission History")}>
                View Submission History
              </button>
              {isInstructor ? (
                <>
                  <button>
                    <label>
                      Upload Instruction Document
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        style={{ display: "none" }}
                      />
                    </label>
                  </button>
                  <button onClick={() => alert("Submit Evaluation")}>
                    Submit Evaluation
                  </button>
                  <button onClick={() => alert("Edit Project")}>
                    Edit Project
                  </button>
                </>
              ) : (
                <>
                  <button>
                    <label>
                      Submit Assignment
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        style={{ display: "none" }}
                      />
                    </label>
                  </button>
                  <button onClick={() => alert("View Evaluation")}>
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

export default ProjectsPage;
