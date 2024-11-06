import './styles/Main.css';
import React, { useEffect, useState } from 'react';
import Nav from './Nav';
import { getCourses, useUserSession, logout } from './firebase';
import { useNavigate } from 'react-router-dom';

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

  return (
    <div className="Home">
      <Nav />
      <div className='content'>
        <h1>Logged in as {user.name} who is a {!user.isAdmin && !user.isInstructor ? "Student" : user.isAdmin ? "Admin" : "Instructor"} </h1>
      </div>
    </div>
  );
}

export default Home;
