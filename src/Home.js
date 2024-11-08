import './styles/Main.css';
import React, { useEffect, useState } from 'react';
import Nav from './Nav';
import { getCourses, useUserSession, logout, enrollUserInCourse, viewUserCourses, removeUserCourse } from './firebase';
import { useNavigate } from 'react-router-dom';
import ProjectsPage from "./CourseProjects";
import CourseNotifications from './CourseNotifications';
import GroupsPage from './GroupsPage';

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

  const notifications = [
    { title: "Notification 1", message: "This is the first notification." },
    { title: "Notification 2", message: "This is the second notification." },
  ];

  const groups = [
    ["Student1", "Student2"],
    ["Student3", "Student4"],
    ["Student5", "Student6"],
  ];

  return (
    <div className="Home">
      <Nav />
      <div className="content">
        <h1>
          Logged in as {user.name} who is a{" "}
          {!user.isAdmin && !user.isInstructor
            ? "Student"
            : user.isAdmin
            ? "Admin"
            : "Instructor"}{" "}
        </h1>

      </div>
    </div>
  );
}

export default Home;
