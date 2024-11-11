import './styles/Main.css';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from './Nav';
import { viewUserCourses, useUserSession } from './firebase';


function CourseList() {
    const { user, loading } = useUserSession();
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const navigate = useNavigate();


    useEffect(() => {
        if (!loading && user) {
            viewUserCourses(user.id).then((courses) => {
                setEnrolledCourses(courses);
            });
        }
    }, [loading, user]);

    const handleCourseClick = (courseCode) => {
        navigate(`/Course/${courseCode}`);
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div className="Courses">
            <Nav /> 
            <div className='content'>
                <h1>Your Enrolled Courses</h1>
                <ul>
                {enrolledCourses.length > 0 && (
                    <ul>
                        {enrolledCourses.map((course, index) => (
                            <li key={index}>
                                <button onClick={() => handleCourseClick(course.code)}>
                                    {course.code}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
                {enrolledCourses.length === 0 && <p>You are not enrolled in any courses.</p>}
                </ul>
            </div>
        </div>
    );
}

export default CourseList;
