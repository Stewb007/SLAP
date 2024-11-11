import './styles/Main.css';
import React, { useEffect, useState } from 'react';
import Nav from './Nav';
import Submissions from './Submissions';
import { BrowserRouter as Router, Link, Routes, Route, useNavigate } from 'react-router-dom';
import SubmissionsPage from './SubmissionsPage';
import Auth from './Auth';
import { getCourses, useUserSession, logout, enrollUserInCourse, viewUserCourses, removeUserCourse } from './firebase';
import ProjectsPage from "./CourseProjects";

function Home() {
  const { user, loading } = useUserSession();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading) {
      if (user.isAdmin) {
        navigate("/admin");
      }
    }
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="Home">
        <p>Fetching...</p>
      </div>
    );
  }

  //check if user is still undefined after loading
  if (!user){
    return(
      <div className="Home">
        <p>Unable to load user data.</p>
      </div>
    );
  }
  const courseCode = "CS101";
  const assignments = [
    {
      assignmentName: "Assignment 1",
      description:
        "This is a description for the first assignment.",
      instructionFiles: [
        "https://example.com/file1.pdf",
        "https://example.com/file2.pdf",
      ],
      groups: [
        ["Student1", "Student2"],
        ["Student3", "Student4"],
      ],
      studentsNotInGroup: ["Student5", "Student6"],
    },
    {
      assignmentName: "Assignment 2",
      description:
        "This is a description for the second assignment.",
      instructionFiles: ["https://example.com/file3.pdf"],
      groups: [["Student7", "Student8"]],
      studentsNotInGroup: ["Student9"],
    }
  ];

  return (
    <div className="Home">
      <Nav />
      <div className='content'>
        <h1>Logged in as {user.name} who is a {!user.isAdmin && !user.isInstructor ? "Student" : user.isAdmin ? "Admin" : "Instructor"} </h1>
        <Link to="/submissions" className="submissions-link"></Link>
        <Routes>
          <Route path="/submissions" element={<SubmissionsPage user={user} />} />
        </Routes>
      </div>
      <div className="content">
        <h1>
          Logged in as {user.name} who is a{" "}
          {!user.isAdmin && !user.isInstructor
            ? "Student"
            : user.isAdmin
            ? "Admin"
            : "Instructor"}{" "}
        </h1>
        <ProjectsPage
          courseCode={"(Instructor pov, for dev purposes) " + courseCode}
          assignments={assignments}
          isInstructor={user.isInstructor}
        />
        <ProjectsPage
          courseCode={"(Student pov, for dev purposes) " + courseCode}
          assignments={assignments}
          isInstructor={!user.isInstructor}
        />
      </div>
    </div>
  );
}

export default Home;
