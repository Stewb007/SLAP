import './styles/Main.css';
import React, { useEffect, useState } from 'react';
import Nav from './Nav';
import { getCourses, useUserSession, logout } from './firebase';
import Submissions from './Submissions';
import { BrowserRouter as Router, Link, Routes, Route, useNavigate } from 'react-router-dom';
import SubmissionsPage from './SubmissionsPage';
import Auth from './Auth';

function Home() {
  const { user, loading } = useUserSession();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading) {
      if(user.isAdmin) {
          navigate('/admin');
      }
    }
  }, [user, navigate]);
  
  if(loading) {
    return (
      <div className="Home">
        <p>Fetching...</p>
      </div>
    )
  }

  //check if user is still undefined after loading
  if (!user){
    return(
      <div className="Home">
        <p>Unable to load user data.</p>
      </div>
    );
  }

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
    </div>
  );
}

export default Home;
