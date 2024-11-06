import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import Home from './Home';
import Courses from'./Courses'
import CourseProjects from './CourseProjects';
import Auth from './Auth'; // import your Auth component
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
              <Courses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/CourseProjects"
          element={
            <ProtectedRoute>
              <CourseProjects />
            </ProtectedRoute>
          }
        />
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
