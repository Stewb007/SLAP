import './styles/Main.css';
import React, { useEffect, useState } from 'react';
import Nav from './Nav';

function CourseProjects() {
    return (
        <div className="CourseProjects">
            <Nav /> 
            <div className='content'>
                <h1>Course Projects</h1>
                <p>Welcome to the Courses page! Course Projects can be viewed here.</p>

                <details>
                <summary style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#333', cursor: 'pointer' }}>Math Project 1</summary>
                    <div>
                    <p>Project Description: Algebra and Equations</p>
                    <p>Due Date: 11/12/2024</p>
                    </div>
                </details>
                
                <details>
                <summary style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#333', cursor: 'pointer' }}>Math Project 2</summary>
                    <div>
                    <p>Project Description: Geometry and Shapes</p>
                    <p>Due Date: 11/18/2024</p>
                    </div>
                </details>
            
                <details>
                <summary style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#333', cursor: 'pointer' }}>Math Project 3</summary>
                    <div>
                    <p>Project Description: Calculus Basics</p>
                    <p>Due Date: 11/30/2024</p>
                    </div>
                </details>
                </div>
        </div>
    );
}

export default CourseProjects;