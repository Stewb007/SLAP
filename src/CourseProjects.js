import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { createAssignment, fetchSubmissions, fetchStudentGrade  } from "./firebase";
import InstructorSubmissionHistory from "./InstructorSubmissionHistory";
import StudentSubmissionHistory from "./StudentSubmissionHistory";
import InstructorEvaluations from "./InstructorEvaluations";
import StudentViewGrade from "./StudentViewGrade";
import GroupsPage from "./GroupsPage"; // Import GroupsPage component
import FileUploader from "./FileUploader"
import "./styles/CourseProjects.css";


const CourseProjects = ({ user, course }) => {
  const [showNewProjectInput, setShowNewProjectInput] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [groups, setGroups] = useState([]);
  const [students] = useState([
    "Student1",
    "Student2",
    "Student3",
    "Student4",
    "Student5",
  ]); // Example student list

  const handleNewProjectClick = () => {
    setShowNewProjectInput((prev) => !prev);
  };

  const handleSubmit = async () => {
    if (newProjectName.trim()) {
      try {
        await createAssignment(course.code, newProjectName);

        alert(`New project submitted: ${newProjectName}`);
        setNewProjectName("");
        setShowNewProjectInput(false);
        window.location.reload();
      } catch (error) {
        console.error("Error creating assignment:", error);
      }
    } else {
      alert("Please enter a project name.");
    }
  };

  const addGroup = (newGroup) => {
    setGroups([...groups, newGroup]);
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
            course={course}
            groups={groups}
            students={students}
            addGroup={addGroup}
          />
        ))}
      </div>
    </div>
  );
};

const AssignmentItem = ({ assignment, user, course, groups, students, addGroup }) => {
  const [showButtons, setShowButtons] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(assignment.assignmentName);
  const [editedDescription, setEditedDescription] = useState(
    assignment.description
  );

  const toggleButtonsVisibility = () => {
    setShowButtons(!showButtons);
  };

  const handleViewDocument = async (assignmentName) => {
    const db = getFirestore();
    const coursesRef = collection(db, "courses");
    const snapshot = await getDocs(coursesRef);

    for (const docSnapshot of snapshot.docs) {
      const courseData = docSnapshot.data();
      const assignments = courseData.assignments;

      const assignmentData = assignments.find(
        (a) => a.assignmentName === assignmentName
      );

      if (assignmentData) {
        const newWindow = window.open(
          "",
          "DocumentPopup",
          "width=800,height=600,scrollbars=yes,resizable=yes"
        );

        newWindow.document.write(
          "<pre>" + assignmentData.instructionFile + "</pre>"
        );
      }
    }
  };
  // const handlefetchUserSubmissionsForAssignment = (assignmentId, courseCode ,studentId) => {
  //   fetchSubmissions({assignmentId, courseCode,studentId}).then((result) => {
  //     console.log(result)
  //   })
  // };

  const handlefetchUserSubmissionsForAssignment = (assignmentId, courseCode, studentId) => {
    fetchSubmissions({assignmentId, courseCode, studentId}).then((result) => {
      const newWindow = window.open(
        "",
        "SubmissionHistoryPopup",
        "width=800,height=1200,scrollbars=yes,resizable=yes"
      );
  
      newWindow.document.write('<div id="root"></div>');
      newWindow.document.close();
      setTimeout(() => {
        const container = newWindow.document.getElementById("root");
        if (container) {
          const root = createRoot(container);
          root.render(
            <StudentSubmissionHistory
              result={result}           
              courseCode={courseCode}       
              assignmentId={assignmentId}
              studentId={studentId}
          />
          );
        } else {
          console.error("Container not found.");
        }
      }, 100);
    })
  };

  // const handlefetchUserGrade = (assignmentId, courseCode, studentId) => {
  //   fetchStudentGrade({assignmentId, courseCode, studentId}).then((result) => {
  //     console.log(result)
  //   })
  // };
  const handleUploadAssignment = (event, assignmentName, courseCode, studentId, assignmentId) => {
    const newWindow = window.open(
      "",
      "SubmissionHistoryPopup",
      "width=800,height=1200,scrollbars=yes,resizable=yes"
    );

    newWindow.document.write('<div id="root"></div>');
    newWindow.document.close();
    setTimeout(() => {
      const container = newWindow.document.getElementById("root");
      if (container) {
        const root = createRoot(container);
        root.render(
          <FileUploader
          assignmentName={assignmentName}
          courseCode={courseCode}
          studentId={studentId}
          assignmentId={assignment.assignmentId}
        />
        );
      } else {
        console.error("Container not found.");
      }
    }, 100);
  };



  const handlefetchUserGrade = (assignmentId, courseCode, studentId) => {
    fetchStudentGrade({assignmentId, courseCode, studentId}).then((result) => {
      const newWindow = window.open(
        "",
        "SubmissionHistoryPopup",
        "width=800,height=500,scrollbars=yes,resizable=yes"
      );
  
      newWindow.document.write('<div id="root"></div>');
      newWindow.document.close();
      setTimeout(() => {
        const container = newWindow.document.getElementById("root");
        if (container) {
          const root = createRoot(container);
          root.render(
            <StudentViewGrade
              result={result}           
              courseCode={courseCode}       
              assignmentId={assignmentId}
              studentId={studentId}
          />
          );
        } else {
          console.error("Container not found.");
        }
      }, 100);
    })
  };
  
  
  
  const handleUploadInstructionDocument = async (event, assignmentName) => {
    const file = event.target.files[0];

    if (!file || file.type !== "text/plain") return;

    const reader = new FileReader();

    const readFile = new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

    reader.readAsText(file);

    const instructionContent = await readFile;

    const db = getFirestore();
    const coursesRef = collection(db, "courses");
    const snapshot = await getDocs(coursesRef);

    for (const docSnapshot of snapshot.docs) {
      const courseData = docSnapshot.data();
      const assignments = courseData.assignments;

      const assignment = assignments.find(
        (assignment) => assignment.assignmentName === assignmentName
      );

      if (assignment) {
        const docRef = doc(db, "courses", docSnapshot.id);
        await updateDoc(docRef, {
          assignments: assignments.map((a) =>
            a.assignmentName === assignmentName
              ? { ...a, instructionFile: instructionContent }
              : a
          ),
        });
      }
    }

    window.location.reload();
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleSaveClick = async (e) => {
    e.stopPropagation();
    const db = getFirestore();
    const coursesRef = collection(db, "courses");
    const snapshot = await getDocs(coursesRef);

    for (const docSnapshot of snapshot.docs) {
      const courseData = docSnapshot.data();
      const assignments = courseData.assignments;

      const updatedAssignments = assignments.map((a) =>
        a.assignmentName === assignment.assignmentName
          ? { ...a, assignmentName: editedName, description: editedDescription }
          : a
      );

      const docRef = doc(db, "courses", docSnapshot.id);
      await updateDoc(docRef, { assignments: updatedAssignments });
    }

    setIsEditing(false);
    window.location.reload();
  };

  const handleCancelClick = (e) => {
    e.stopPropagation();
    setIsEditing(false);
    setEditedName(assignment.assignmentName);
    setEditedDescription(assignment.description);
  };

  const handleViewInstructorSubmissionHistory = () => {
    const newWindow = window.open(
      "",
      "SubmissionHistoryPopup",
      "width=800,height=1200,scrollbars=yes,resizable=yes"
    );

    newWindow.document.write('<div id="root"></div>');
    newWindow.document.close();
    setTimeout(() => {
      const container = newWindow.document.getElementById("root");
      if (container) {
        const root = createRoot(container);
        root.render(
          <InstructorSubmissionHistory
            assignment={assignment}
            courseCode={course.code}
          />
        );
      } else {
        console.error("Container not found.");
      }
    }, 100);
  };

  const handleViewInstructorEvaluations = () => {
    const newWindow = window.open(
      "",
      "SubmissionHistoryPopup",
      "width=800,height=1200,scrollbars=yes,resizable=yes"
    );
    newWindow.document.write('<div id="root"><InstructorEvaluations assignment={assignment}courseCode={course.code}/></div>');
    newWindow.document.close();
    setTimeout(() => {
      const container = newWindow.document.getElementById("root");
      if (container) {
        const root = createRoot(container);
        root.render(
          <InstructorEvaluations
            assignment={assignment}
            courseCode={course.code}
          />
        );
      } else {
        console.error("Container not found.");
      }
    }, 100);
  };


  return (
    <div className="assignment-item" onClick={toggleButtonsVisibility}>
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
        <>
          <div className="assignment-buttons">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleViewDocument(assignment.assignmentName);
              }}
              className="assignment-button"
            >
              View Document
            </button>

            {user.isInstructor ? (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewInstructorSubmissionHistory();
                  }}
                  className="assignment-button"
                >
                  View Submission History
                </button>
                <button
                  className="assignment-button"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <label>
                    Upload Instruction Document
                    <input
                      type="file"
                      accept=".txt"
                      onChange={(e) => {
                        handleUploadInstructionDocument(
                          e,
                          assignment.assignmentName
                        );
                      }}
                    />
                  </label>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewInstructorEvaluations();
                  }}
                  className="assignment-button"
                >
                  Submit Evaluation
                </button>
                <button onClick={handleEditClick} className="assignment-button">
                  Edit Project
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlefetchUserSubmissionsForAssignment(assignment.assignmentId,course.code,user.student_number);
                  }}
                  className="assignment-button"
                >
                  Check submission
                </button>
                <button className="assignment-button" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleUploadAssignment(e,assignment.assignmentName,course.code,user.student_number);
                }}>
                  <label>
                    Submit Assignment
                  </label>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlefetchUserGrade(assignment.assignmentId,course.code,user.student_number,assignment.assignmentId)
                  }}
                  className="assignment-button"
                >
                  View Evaluation
                </button>
              </>
            )}
          </div>
          {user.isInstructor && (
            <GroupsPage
              user={user}
              courseId={course.id}
              assignmentId={assignment.assignmentId}
              students={students}
            />
          )}
        </>
      )}
      {isEditing && (
        <div
          className="edit-panel"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <input
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            placeholder="Edit Assignment Name"
          />
          <textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            placeholder="Edit Description"
          />
          <div className="edit-panel-buttons">
            <button onClick={handleSaveClick} className="edit-button">
              Save
            </button>
            <button onClick={handleCancelClick} className="edit-button">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseProjects;
