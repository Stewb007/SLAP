import './styles/Main.css';
import React, { useEffect, useState } from 'react';
import Nav from './Nav';
import { getCourses, useUserSession, logout, enrollUserInCourse, viewUserCourses, removeUserCourse } from './firebase';

function Home() {
  const { user, loading } = useUserSession();

  if(loading) {
    return (
      <div className="Home">
        <p>Fetching...</p>
      </div>
    )
  }

  return (
    <div className="Home">
      <Nav />
      <div className='content'>
        <h1>Logged in as {user.name} who is a {!user.isAdmin && !user.isInstructor ? "Student" : user.isAdmin ? "Admin" : "Instructor"} </h1>
        <button onClick={() => enrollUserInCourse(user.id,"MTH108")}> </button>
        <button onClick={() => viewUserCourses(user.id)}> </button>
        <button onClick={() => removeUserCourse(user.id,"MTH108")}> </button>
      </div>
    </div>
  );
}

export default Home;
