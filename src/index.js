import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import Home from './Home';
<<<<<<< HEAD
import Submissions from './Submissions';
import SubmissionsPage from './SubmissionsPage';
import Courses from'./Courses'
import CourseProjects from './CourseProjects';
=======
import CourseList from'./CourseList'
import Course from './Course';
>>>>>>> bcd1f77e5783bd1489a576e3f57c84f51f45ae6d
import Auth from './Auth';
import Admin from './Admin';
import reportWebVitals from './reportWebVitals';
import ProtectedRoute from './ProtectedRoute';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

      <Route
          path="/Courses"
          element={
            <ProtectedRoute>
              <CourseList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Course/:courseCode"
          element={
            <ProtectedRoute>
              <Course />
            </ProtectedRoute>
          }
        />

        <Route path="/auth" element={<Auth />} />
        <Route
          path="/submissions"
          element={
            <ProtectedRoute>
              <SubmissionsPage />
            </ProtectedRoute>
          }
        /> 
        <Route path='/admin' element={<Admin />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
