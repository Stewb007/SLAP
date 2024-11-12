import React, { useState , useEffect } from "react";
import "./styles/CourseProjects.css";


const StudentViewGrade = ({ result, courseCode, assignmentId, studentId }) => {
    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <h2>Evaluation for {courseCode} Assignment {assignmentId}</h2>
        
        {result !== undefined && result !== null ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "15px",
                backgroundColor: "#f9f9f9",
                textAlign: "center",
                fontSize: "100px",
                fontWeight: "bold",
                display: "inline-block",
                margin: "20px auto",
              }}
            >
              {result}%
            </div>
            <h3>Comments:</h3>
          </div>
        ) : (
          <p>No grade available</p>
        )}
      </div>
    );
  };
    
export default StudentViewGrade;
