import './styles/Nav.css';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUserSession, useLogout } from './firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRightFromBracket} from '@fortawesome/free-solid-svg-icons'
 import { useNavigate } from 'react-router-dom';

function Nav() {
    const { user, loading } = useUserSession();
    const [initials, setInitials] = useState('');
    const navigate = useNavigate();
    const logout = useLogout();
    useEffect(() => {
        if (!loading && user) {
            setInitials(user.name
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase())
            .slice(0, 2) // Get only the first two initials
            .join(''));
        }
    }, [loading, user])

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
          {/* Add submissions link here */}
          <Link to="/submissions" className="nav-link">Submissions</Link>
            <p>Courses</p>
            <p></p>
            {user.isAdmin ?
                <></>
                :
                <div className='right-content'>
                  <p onClick={() => navigate('./Courses')}>Courses</p>
                </div>
            }
            <div className='profile'>
                <div className='initials'>
                    <p>{initials}</p>
                </div>
                <div className='profile-right'>
                    <p>{user.name}</p>
                    {user.isAdmin ?
                        <p className='profile-below'>Administrator |<span onClick={logout}> <FontAwesomeIcon icon={faArrowRightFromBracket} /> Logout</span></p>
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