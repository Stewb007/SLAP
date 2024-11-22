import React, { useState, useEffect } from 'react';
import { getInstructorAnnouncements, addInstructorAnnouncement, getCoursesByInstructor } from './firebase';
import './styles/InstructorAnnouncements.css';

const InstructorAnnouncements = ({ user }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', message: '' });
  const [courses, setCourses] = useState([]);

  // Fetch courses taught by the instructor
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const fetchedCourses = await getCoursesByInstructor(user.id);
        setCourses(fetchedCourses);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };
    fetchCourses();
  }, [user.id]);

  // Fetch announcements for the instructor's email
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const fetchedAnnouncements = await getInstructorAnnouncements(user.id);
        setAnnouncements(fetchedAnnouncements);
      } catch (error) {
        console.error('Error fetching instructor announcements:', error);
      }
    };

    fetchAnnouncements();
  }, [user.id]);

  const handleCreateAnnouncement = async () => {
    if (newAnnouncement.title.trim() && newAnnouncement.message.trim()) {
      try {
        // Automatically associate with all courses the instructor teaches
        const courseIds = courses.map((course) => course.id);
        await addInstructorAnnouncement(user.id, newAnnouncement, courseIds);

        setAnnouncements([...announcements, { ...newAnnouncement, courses: courseIds }]);
        setNewAnnouncement({ title: '', message: '' });
      } catch (error) {
        console.error('Error adding announcement:', error);
      }
    }
  };

  return (
    <div className="InstructorAnnouncements">
      <h1>Instructor Announcements</h1>
      <div className="create-announcement">
        <input
          type="text"
          value={newAnnouncement.title}
          onChange={(e) =>
            setNewAnnouncement({ ...newAnnouncement, title: e.target.value })
          }
          placeholder="Announcement Title"
        />
        <textarea
          value={newAnnouncement.message}
          onChange={(e) =>
            setNewAnnouncement({ ...newAnnouncement, message: e.target.value })
          }
          placeholder="Announcement Message"
        />
        <button onClick={handleCreateAnnouncement}>Create Announcement</button>
      </div>
      <div className="announcements-board">
        {announcements.length > 0 ? (
          announcements.map((announcement, index) => (
            <div key={index} className="announcement">
              <h2>{announcement.title}</h2>
              <p>{announcement.message}</p>
              <p>
                Courses: {announcement.courses.join(', ') || 'All Courses'}
              </p>
            </div>
          ))
        ) : (
          <p>No announcements available.</p>
        )}
      </div>
    </div>
  );
};

export default InstructorAnnouncements;

