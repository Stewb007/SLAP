import './styles/Admin.css'
import Nav from './Nav'
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHandPointer, faArrowsRotate, faUserPlus, faUserMinus, faAsterisk, faUserLock, faPlusCircle, faMinusCircle, faTimesCircle, faEyeSlash, faEye} from '@fortawesome/free-solid-svg-icons';
import { useUserSession, getCourses, getUsers, createUser, deleteUser, updateUser, deleteCourse, enrollUserInCourse, searchUserByEmail, usersInCourse, removeUserCourse, getSLAPS, createSLAP, updateSLAP, createCourse} from './firebase';

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
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [enrolledUsers, setEnrolledUsers] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [showModal, setShowModal] = useState(false);
    useEffect(() => {
        getCourses().then((courses) => {
            setCourses(courses);
        });
        setLoading(false);
    }, []);

    const handleCheckboxToggle = (courseId) => {
        if (selectedCourses.includes(courseId)) {
            setSelectedCourses(selectedCourses.filter(id => id !== courseId));
        } else {
            setSelectedCourses([...selectedCourses, courseId]);
        }
    }
    const handleAddCourse = () => {
        const code = prompt('Enter the course code:');
        if (!code) return;
        const name = prompt('Enter the course name:');
        if (!name) return;
        const capacity = prompt('Enter the course capacity:');
        if (!capacity) return;
        const description = prompt('Enter the course description:');
        if (!description) return;
        createCourse(name, code, description, capacity);
        refreshCourses();
    };

    const handleRemoveCourse = () => {
        selectedCourses.forEach(course => {
            deleteCourse(course);
        });
        refreshCourses();
        setSelectedCourses([]);
    };

    const handleEnrollUser = async () => {
        for (const course of selectedCourses) {
            const email = prompt('Enter the email of the user to enroll:');
            if (!email) return;  // Exit if no email is provided
            
            try {
                const user = await searchUserByEmail(email);
                console.log(user);
                
                if (!user) {
                    alert('User not found.');
                    return;
                }
                
                await enrollUserInCourse(user.id, course); 
            } catch (error) {
                console.error('Error enrolling user:', error);
                alert('An error occurred while enrolling the user.');
            }
        }
        refreshCourses();
        setSelectedCourses([]); 
    };

    const handleRemoveUserCourse = async (id) => {
        removeUserCourse(id, selectedCourse)
        const users = await usersInCourse(selectedCourse);
        refreshCourses();
        setEnrolledUsers(users);
    };

    const refreshCourses = async () => {
        setLoading(true);
        const courses = await getCourses();
        setCourses(courses);
        setLoading(false);
    };
    
    const toggleEnrolled = async (courseCode) => {
        try {
            const users = await usersInCourse(courseCode);
            setEnrolledUsers(users);
            setSelectedCourse(courseCode);
            setShowModal(true);
        } catch (error) {
            console.error("Failed to retrieve enrolled users:", error);
            alert("Could not retrieve enrolled users.");
        }
    };
    

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
            <div className='database-actions-list'>
                    <p onClick={selectedCourses.length === 0 ? handleAddCourse : null} 
                       className={selectedCourses.length === 0 ? '' : 'disabled'}>
                        <FontAwesomeIcon icon={faPlusCircle} size='lg' title='Add Course'/>
                    </p>
                    <p onClick={selectedCourses.length > 0 ? handleRemoveCourse : null} 
                       className={selectedCourses.length > 0 ? '' : 'disabled'}>
                        <FontAwesomeIcon icon={faMinusCircle} size='lg' title='Remove Course'/>
                    </p>
                    <p onClick={selectedCourses.length > 0 ? handleEnrollUser : null} 
                       className={selectedCourses.length > 0 ? '' : 'disabled'}>
                        <FontAwesomeIcon icon={faUserPlus} size='lg' title='Enroll User'/>
                    </p>
            </div>
            <table>
                <thead>
                    <tr>
                        <th style={{textAlign:'center'}}>Select</th>
                        <th>Code</th>
                        <th>Name</th>
                        <th>Instructor</th>
                        <th>Capacity</th>
                        <th>Enrolled</th>
                        <th>Assignments</th>
                    </tr>
                </thead>
                <tbody>
                    {courses.map((course, index) => (
                        <>
                        <tr key={index}>
                            <td className='select' rowSpan={2}>
                                <input
                                    type='checkbox'
                                    checked={selectedCourses.includes(course.code)}
                                    onChange={() => handleCheckboxToggle(course.code)}
                                />
                            </td>
                            <td>{course.code}</td>
                            <td>{course.name}</td>
                            <td style={{color: course.instructor === '' ? 'red' : 'black'}}>{course.instructor === '' ? 'N/A' : course.instructor}</td>
                            <td>{course.capacity}</td>
                            <td className='view-users' onClick={() => toggleEnrolled(course.code)}>View Users</td>
                            <td>{course.assignments.length}</td>
                        </tr>
                        <tr>
                            <td colSpan='7' className='course-description'><b>Description:</b> {course.description}</td>
                        </tr>
                        </>
                    ))}
                </tbody>
            </table>
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <FontAwesomeIcon icon={faTimesCircle} className="modal-close-icon" onClick={() => setShowModal(false)} />
                        <h3>Enrolled Users</h3>
                        <ul className='enrolled-list'>
                            {enrolledUsers.length === 0 && <p>No users enrolled in this course.</p>}
                            {enrolledUsers.map((user, index) => (
                                <li className='enrolled-entry' key={index}>
                                    <p>{user.name} ({user.email}, {user.isInstructor ? <b>Instructor</b> : <b>Student</b>})</p>
                                    <button onClick={() => handleRemoveUserCourse(user.id)}>Remove</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    )
} 

function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectedFilter, setFilter] = useState('Select Filter');
    const [isFiltered, setFiltered] = useState(false);
    useEffect(() => {
        getUsers().then((users) => {
            setUsers(users);
        });
        setLoading(false);
    }, []);

    const handleFilterChange = (e) => {
        setFilter(e.target.value);
    };

    const filterUsers = () => {
        if (selectedFilter === 'Select Filter') return;
        if (selectedFilter === 'Alphabetical') {
            setFilteredUsers(users.sort((a, b) => a.name.localeCompare(b.name)));
        } else if (selectedFilter === 'Course') {
            setFilteredUsers(users.filter(user => user.enrolled.length > 0));
        } else if (selectedFilter === 'Instructor') {
            setFilteredUsers(users.filter(user => user.isInstructor));
        }
        setFiltered(true);
    }

    const clearFilter = () => {
        setFiltered(false);
        setSelectedUsers([]);
        setFilter('Select Filter');
    }

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
        createUser(
          name,
          email,
          email,
          student_number,
          year,
          program,
          isAdmin === "yes",
          isInstructor === "yes"
        )
          .then(() => {
            window.location.reload();
          })
          .catch((error) => {
            console.error("Error creating user:", error);
            alert("Failed to create user.");
          });
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
            <p>Retrieved {(isFiltered ? filteredUsers.length : users.length)} {(isFiltered ? filteredUsers.length : users.length) === 1 ? 'user' : 'users'}.</p>
            <div className='database-actions'>
                <div className='filter'>
                    <select onChange={handleFilterChange} value={selectedFilter}>
                        <option disabled>Select Filter</option>
                        <option>Alphabetical</option>
                        <option>Course</option>
                        <option>Instructor</option>
                    </select>
                    <button onClick={selectedFilter === "Select Filter" ? null : filterUsers} className={selectedFilter !== "Select Filter" ? 'filter-btn' : 'filter-btn-disabled'}>Set Filter</button>
                    <button onClick={isFiltered ? clearFilter : null} className={isFiltered ? 'filter-reset' : 'filter-reset-disabled'}>Clear</button>
                </div>
                <div className='database-actions-list'>
                    <p onClick={selectedUsers.length === 0 ? handleAddUser : null} 
                       className={selectedUsers.length === 0 ? '' : 'disabled'}>
                        <FontAwesomeIcon icon={faUserPlus} size='lg' title='Add User'/>
                    </p>
                    <p onClick={selectedUsers.length > 0 ? handleRemoveUsers : null} 
                       className={selectedUsers.length > 0 ? '' : 'disabled'}>
                        <FontAwesomeIcon icon={faUserMinus} size='lg' title='Remove User'/>
                    </p>
                    <p onClick={selectedUsers.length > 0 ? handleRequestPasswordReset : null} 
                       className={selectedUsers.length > 0 ? '' : 'disabled'}>
                        <FontAwesomeIcon icon={faUserLock} size='lg' title='Request Password Reset on Login'/>
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
                        <th style={{textAlign:'center'}}>Select</th>
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
                    {(isFiltered ? filteredUsers : users).map((user, index) => (
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
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedNotifications, setSelectedNotifications] = useState([]);
    useEffect(() => {
        getSLAPS().then((slaps) => {
            setNotifications(slaps);
        });
        setLoading(false);
    }, []);

    const handleSLAPCreate = () => {
        const content = prompt('Enter the content of the notification:');
        if (!content) return;
        createSLAP(content, 'SYS', false);
        refreshSLAPS();
    };

    const handleSLAPDisable = () => {
        selectedNotifications.forEach(notification => {
            updateSLAP(notification, { isActive: false });
        });
        refreshSLAPS();
    };

    const handleSLAPEnable = () => {
        const activeNotification = notifications.find(notification => notification.isActive);
        if (activeNotification) {
            updateSLAP(activeNotification.id, { isActive: false });
        }
        selectedNotifications.forEach(notification => {
            updateSLAP(notification, { isActive: true });
        });
        refreshSLAPS();
    };

    const handleCheckboxToggle = (notificationId) => {
        if (selectedNotifications.includes(notificationId)) {
            setSelectedNotifications(selectedNotifications.filter(id => id !== notificationId));
        } else {
            setSelectedNotifications([...selectedNotifications, notificationId]);
        }
    }

    const refreshSLAPS = async () => {
        setLoading(true);
        const slaps = await getSLAPS();
        setNotifications(slaps);
        setLoading(false);
    };

    if (loading) {
        return (
            <div className='fetching-admin'>
                <FontAwesomeIcon icon={faArrowsRotate} spin/>
            </div>
        )
    }

    return (
        <div className='sys-notif'>
            <h2>System Notifications</h2>
            <p>Retrieved {notifications.length} {notifications.length === 1 ? 'notification' : 'notifications'}. <br/><i>Only one System Wide notification can be active at <b>once</b>.</i></p>
            <div className='database-actions-list'>
                <p onClick={selectedNotifications.length === 0 ? handleSLAPCreate : null} 
                       className={selectedNotifications.length === 0 ? '' : 'disabled'}>
                    <FontAwesomeIcon icon={faPlusCircle} size='lg' title='Create Notification'/>
                </p>
                <p onClick={selectedNotifications.length === 1 ? handleSLAPDisable : null} 
                       className={selectedNotifications.length === 1 ? '' : 'disabled'}>
                        <FontAwesomeIcon icon={faEyeSlash} size='lg' title='Disable SLAP'/>
                </p>
                <p onClick={selectedNotifications.length === 1 ? handleSLAPEnable : null}
                          className={selectedNotifications.length === 1 ? '' : 'disabled'}>
                            <FontAwesomeIcon icon={faEye} size='lg' title='Enable SLAP'/>
                </p>
            </div>
            <table>
                <thead>
                    <tr>
                        <th style={{textAlign:'center'}}>Select</th>
                        <th>Content</th>
                        <th>Is Active</th>
                        <th>Type</th>
                    </tr>
                </thead>
                <tbody>
                    {notifications.map((notification, index) => (
                        <tr key={index}>
                            <td className='select'>
                                <input
                                    type='checkbox'
                                    checked={selectedNotifications.includes(notification.id)}
                                    onChange={() => handleCheckboxToggle(notification.id)}
                                />
                            </td>
                            <td>{notification.content}</td>
                            <td>{notification.isActive ? 'Yes' : 'No'}</td>
                            <td>{notification.type === 'SYS' ? 'System Wide' : <span><b>Course:</b> notification.type</span>}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default Admin;