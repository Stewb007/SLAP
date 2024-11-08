import React, { useState, useEffect } from "react";
import { useUserSession, getCourses } from "./firebase";
import "./styles/ProjectsPage.css";
import { useParams } from "react-router-dom";
import Nav from "./Nav";
import CourseProjects from "./CourseProjects";
import CourseNotifications from "./CourseNotifications";

function Course() {
  const {user, loading} = useUserSession();
  const {courseCode} = useParams();
  const [instructionFile, setInstructionFile] = useState(null);
  const [showNewProjectInput, setShowNewProjectInput] = useState(false);
  const [course, setCourse] = useState(null);
  const [newProjectName, setNewProjectName] = useState("");

  useEffect(() => {
    getCourses().then((courses) => {
      const course = courses.find((course) => course.code === courseCode);
      setCourse(course);
    });
  }, [courseCode]);

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

  if (loading && !course) {
    return <p>Loading...</p>;
  }

  return (
    <div className="Course">
    <Nav />
    <div className="content">
        <h1>{course.name} ({course.code})</h1>
        <CourseNotifications user={user} notifications={course.notifications} />
        <CourseProjects user={user} course={course} />
    </div>
   </div> 
  );
};

export default Course;
