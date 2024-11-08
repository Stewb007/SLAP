import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import Home from './Home';
import CourseList from'./CourseList'
import Course from './Course';
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
        <Route path='/admin' element={<Admin />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
