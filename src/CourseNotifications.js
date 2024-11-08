import React from 'react';
import './styles/CourseNotifications.css';

const CourseNotifications = ({ notifications }) => {
  return (
    <div className="CourseNotifications">
      <h1>Course Notifications</h1>
      <button onClick={() => alert('Create new SLAPs')}>Create new SLAPs</button>
      <div className="notifications-board">
        {notifications.length > 0 ? (
          notifications.map((notification, index) => (
            <div key={index} className="notification">
              <h2>{notification.title}</h2>
              <p>{notification.message}</p>
            </div>
          ))
        ) : (
          <p>No notifications available.</p>
        )}
      </div>
    </div>
  );
};

export default CourseNotifications;