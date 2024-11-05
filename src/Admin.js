import './styles/Admin.css'
import Nav from './Nav'
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHandPointer, faArrowsRotate, faUserPlus, faUserMinus, faAsterisk, faUserLock } from '@fortawesome/free-solid-svg-icons';
import { useUserSession, getCourses, getUsers, createUser, deleteUser, updateUser} from './firebase';

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
                        <p onClick={() => setAction('System Notifications')}>System Notifications</p>
                        <p onClick={() => setAction('Manage Courses')}>Manage Courses</p>
                        <p onClick={() => setAction('Manage Users')}>Manage Users</p>
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
                                : selectedAction === 'System Notifications' ?
                                    <SystemNotifications />
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
    const [selectedUsers, setSelectedUsers] = useState([]);
    useEffect(() => {
        getUsers().then((users) => {
            setUsers(users);
        });
        setLoading(false);
    }, []);

    const handleCheckboxToggle = (userId) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    };

    const handleAddUser = () => {
        const name = prompt('Enter the name of the user:');
        if (!name) return;
        let email;
        while (true) {
            email = prompt('Enter the email of the user (@gsu.com):');
            if (!email) return;
            if (email.endsWith('@gsu.com')) break;
            alert('Please ensure you enter a valid GSU email.');
        }
        let student_number;
        while (true) {
            student_number = prompt('Enter the student number of the user:');
            if (!student_number) return;
            if (student_number.length === 9) break;
            alert('Please ensure you enter a valid student number.');
        }
        const year = prompt('Enter the year of the user:');
        if (!year) return;
        const program = prompt('Enter the program of the user:');
        if (!program) return;
        let isAdmin;
        while (true) {
            isAdmin = prompt('Is the user an admin? (Yes/No)').toLowerCase();
            if (!isAdmin) break;
            if (isAdmin === 'yes' || isAdmin === 'no') break;
            alert('Please ensure you enter either Yes or No.');
        }
        let isInstructor;
        while (true) {
            isInstructor = prompt('Is the user an instructor? (Yes/No)').toLowerCase();
            if (!isInstructor) break;
            if (isInstructor === 'yes' || isInstructor === 'no') break;
            alert('Please ensure you enter either Yes or No.');
        }
        createUser(name, email, student_number, year, program, isAdmin === 'yes', isInstructor === 'yes');
    };

    const handleRemoveUsers = () => {
        selectedUsers.forEach(user => {
            deleteUser(user);
        });
        setSelectedUsers([]);
    };

    const handleRequestPasswordReset = () => {
        selectedUsers.forEach(user => {
            updateUser(user, { resetPasswordTarget: true});
        });
        setSelectedUsers([]);
    };

    const handleResetPassword = () => {
        if (selectedUsers.length === 1) {
            let newPassword;
            let confirmedPassword;
            while (true) {
                newPassword = prompt('Enter the new password for the user:');
                confirmedPassword = prompt('Confirm the new password for the user:');
                if (newPassword === confirmedPassword) break;
                alert('Passwords do not match. Please try again.');
            }
            updateUser(selectedUsers[0], { password: confirmedPassword });
        }
        setSelectedUsers([]);
    };

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
                <div className='search'>
                    <input type='text' placeholder='Search Users' />
                    <button>Search</button>
                </div>
                <div className='database-actions-list'>
                    <p onClick={selectedUsers.length === 0 ? handleAddUser : null} 
                       className={selectedUsers.length === 0 ? '' : 'disabled'}>
                        <FontAwesomeIcon icon={faUserPlus} size='l' title='Add User'/>
                    </p>
                    <p onClick={selectedUsers.length > 0 ? handleRemoveUsers : null} 
                       className={selectedUsers.length > 0 ? '' : 'disabled'}>
                        <FontAwesomeIcon icon={faUserMinus} size='l' title='Remove User'/>
                    </p>
                    <p onClick={selectedUsers.length > 0 ? handleRequestPasswordReset : null} 
                       className={selectedUsers.length > 0 ? '' : 'disabled'}>
                        <FontAwesomeIcon icon={faUserLock} size='l' title='Request Password Reset on Login'/>
                    </p>
                    <p onClick={selectedUsers.length === 1 ? handleResetPassword : null} 
                       className={selectedUsers.length === 1 ? '' : 'disabled'}>
                        <FontAwesomeIcon icon={faAsterisk} size='lg' title='Reset Password'/>
                    </p>
                </div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Select</th>
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
                            <td className='select'>
                                <input
                                    type='checkbox'
                                    checked={selectedUsers.includes(user.id)}
                                    onChange={() => handleCheckboxToggle(user.id)}
                                />
                            </td>
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

function SystemNotifications() {
    return (
        <div className='sys-notif'>
            <h2>System Notifications</h2>
        </div>
    )
}

export default Admin;