import React, { useState } from 'react';
import './styles/CourseNotifications.css';
import { addCourseNotification, removeCourseNotification } from './firebase';

const CourseNotifications = ({ user, notifications, courseId, handleRefresh }) => {
  const [newNotification, setNewNotification] = useState('');

  const handleCreateNotification = async () => {
    if (newNotification.trim()) {
      const notification = {
        title: `Notification ${notifications.length + 1}`,
        message: newNotification,
      };

      try {
        await addCourseNotification(courseId, notification);
        handleRefresh(); // Trigger refresh to reload the notifications
        setNewNotification('');
      } catch (error) {
        console.error('Error adding notification:', error);
      }
    }
  };

  const handleDeleteNotification = async (notification) => {
    try {
      await removeCourseNotification(courseId, notification);
      handleRefresh(); // Trigger refresh after deleting
    } catch (error) {
      console.error('Error removing notification:', error);
    }
  };

  return (
    <div className="CourseNotifications">
      <h1>Course Notifications</h1>
      {user.isInstructor && (
        <div className="create-notification">
          <input
            type="text"
            value={newNotification}
            onChange={(e) => setNewNotification(e.target.value)}
            placeholder="Enter new SLAP"
          />
          <button onClick={handleCreateNotification}>Create new SLAPs</button>
        </div>
      )}
      <div className="notifications-board">
        {notifications.length > 0 ? (
          notifications.map((notification, index) => (
            <div key={index} className="notification">
              <h2>{notification.title}</h2>
              <p>{notification.message}</p>
              {user.isInstructor && (
                <button
                  onClick={() => handleDeleteNotification(notification)}
                  className="delete-button"
                >
                  Delete
                </button>
              )}
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
