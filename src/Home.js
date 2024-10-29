import './styles/Main.css';
import React, { useEffect, useState } from 'react';
import { getCourses } from './firebase';

function Home() {
  const [courses, setCourses] = useState([]);
  const [fetching, isFetching] = useState(true);
  useEffect(() => {
    const fetchCourses = async () => {
      const coursesList = await getCourses();
      setCourses(coursesList);
    };
  fetchCourses();
  }, []);

  useEffect(() => {
    isFetching(false)
    console.log(courses)
  }, [courses])

  if(fetching) {
    return (
      <div className="Home">
        <p>Fetching...</p>
      </div>
    )
  }

  return (
    <div className="Home">
      <h1>Courses</h1>
      <ul>
        {courses.map(course => (
          <li key={course.id}>
            <h2>{course.name}</h2>
            <p>{course.description}</p>
            <p>Course Code: {course.code}</p>
            <p>Capacity: {course.capacity}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Home;
