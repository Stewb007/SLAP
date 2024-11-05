import './styles/Admin.css'
import Nav from './Nav'
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHandPointer, faArrowsRotate, faUserPlus, faUserMinus, faAsterisk } from '@fortawesome/free-solid-svg-icons';
import { useUserSession, getCourses, getUsers} from './firebase';

function Admin() {
    const {user, loading} = useUserSession();
    const [selectedAction, setAction] = useState('');
    const time = new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });

    if(loading) {
        return (
          <div className="Home">
            <p>Fetching...</p>
         </div>
        )
    }

    return (
        <div className="Admin">
            <Nav />
            <div className='content'>
                <h1 className='admin-title'>Hey, {user.name}! </h1>
                <p>This page was securely loaded at <b>{time}</b>.</p>
                <div className='action-table'>
                    <div className='actions'>
                        <p onClick={() => setAction('Manage Courses')}>Manage Courses</p>
                        <p onClick={() => setAction('Manage Users')}>Manage Users</p>
                        <p onClick={() => setAction('Finances')}>Finances</p>
                    </div>
                    <div className='action-content'>
                    {selectedAction === '' ?
                        <div className='select-action'>
                            <FontAwesomeIcon icon={faHandPointer} size='2xl' />
                            <h3>No Action Selected</h3>
                            <p>Please select an action to begin performing operations.</p>
                        </div>
                        : selectedAction === 'Manage Courses' ?
                            <ManageCourses />
                            : selectedAction === 'Manage Users' ?
                                <ManageUsers />
                                : selectedAction === 'Finances' ?
                                    <Finances />
                                    : <></>
                    }
                    </div>
                </div>
            </div>
        </div>
    );
}

function ManageCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        getCourses().then((courses) => {
            setCourses(courses);
        });
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <div className='fetching-admin'>
                <FontAwesomeIcon icon={faArrowsRotate} spin/>
            </div>
        )
    }
    return (
        <div className='manage-courses'>
            <h2>Manage Courses</h2>
            <p>Retrieved {courses.length} {courses.length > 1 ? 'courses' : 'course'}.</p>
        </div>
    )
} 

function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        getUsers().then((users) => {
            setUsers(users);
        });
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <div className='fetching-admin'>
                <FontAwesomeIcon icon={faArrowsRotate} spin/>
            </div>
        )
    }
    return (
        <div className='manage-users'>
            <h2>Manage Users</h2>
            <p>Retrieved {users.length} {users.length > 1 ? 'users' : 'user'}.</p>
            <div className='database-actions'>
                <p><FontAwesomeIcon icon={faUserPlus} size='l' title='Add User'/></p>
                <p><FontAwesomeIcon icon={faUserMinus} size='l' title='Remove User'/></p>
                <p><FontAwesomeIcon icon={faAsterisk} size='l'title='Request Password Reset on Login'/></p>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Student Number</th>
                        <th>Year</th>
                        <th>Program</th>
                        <th>Enrolled</th>
                        <th>Is Admin</th>
                        <th>Is Instructor</th>
                        <th>Created At</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user, index) => (
                        <tr key={index}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.student_number}</td>
                            <td>{user.year}</td>
                            <td>{user.program}</td>
                            <td>{user.enrolled.join(', ')}</td>
                            <td>{user.isAdmin ? 'Yes' : 'No'}</td>
                            <td>{user.isInstructor ? 'Yes' : 'No'}</td>
                            <td>{user.createdAt?.toDate().toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

function Finances() {
    return (
        <div className='finances'>
            <h2>Manage Finances</h2>
        </div>
    )
}

export default Admin;