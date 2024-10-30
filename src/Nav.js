import './styles/Nav.css';
import React, { useEffect, useState } from 'react';
import { useUserSession, logout } from './firebase';

function Nav() {
    const { user, loading } = useUserSession();
    const [initials, setInitials] = useState('')
    useEffect(() => {
        if (!loading) {
            setInitials(user.name
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase())
            .slice(0, 2) // Get only the first two initials
            .join(''));
        }
    }, [loading])

    if(loading) {
      return (
        <div className="Home">
          <p>Fetching...</p>
        </div>
      )
    }
  
    return (
      <div className="Nav">
        <img src='/images/logo-alt.png' alt='gsu-logo' />
        <div className='right'>
            <p>Courses</p>
            <p></p>
            <div className='profile'>
                <div className='initials'>
                    <p>{initials}</p>
                </div>
                <div className='profile-right'>
                    <p>{user.name}</p>
                    {user.isAdmin ?
                        <p className='profile-below'>Administrator | <span onClick={logout}>Logout</span></p>
                        :
                        <p className='profile-below'>{user.student_number} | <span onClick={logout}>Logout</span></p>
                    }
                </div>
            </div>
        </div>
      </div>
    );
  }
  
export default Nav;