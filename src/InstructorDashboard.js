import React from 'react';
import InstructorAnnouncements from './InstructorAnnouncements';

const InstructorDashboard = ({ user }) => {
  if (!user || !user.isInstructor) {
    return <p>You do not have access to this page.</p>;
  }

  return (
    <div className="InstructorDashboard">
      <h1>Instructor Dashboard</h1>
      <InstructorAnnouncements user={user} />
    </div>
  );
};

export default InstructorDashboard;