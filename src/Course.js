import React, { useState, useEffect } from "react";
import { useUserSession, getCourses } from "./firebase";
import { useParams } from "react-router-dom";
import Nav from "./Nav";
import CourseProjects from "./CourseProjects";
import CourseNotifications from "./CourseNotifications";

function Course() {
  const { user, loading } = useUserSession();
  const { courseCode } = useParams();
  const [course, setCourse] = useState(null);
  const [refresh, setRefresh] = useState(false); // Toggle state for refresh

  useEffect(() => {
    getCourses().then((courses) => {
      const foundCourse = courses.find((course) => course.code === courseCode);
      setCourse(foundCourse);
    });
  }, [courseCode, refresh]); // Re-run when `refresh` changes

  const handleRefresh = () => {
    setRefresh((prev) => !prev); // Toggle refresh state to force re-render
  };

  if (loading || !course) {
    return <p>Loading...</p>;
  }

  return (
    <div className="Course">
      <Nav />
      <div className="content">
        <h1>{course.name} ({course.code})</h1>
        <CourseNotifications
          user={user}
          notifications={course.notifications || []}
          courseId={course.id}
          handleRefresh={handleRefresh} // Pass refresh function to child
        />
        <CourseProjects user={user} course={course} />
      </div>
    </div>
  );
}

export default Course;
