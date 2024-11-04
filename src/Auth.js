import './styles/Auth.css';
import React, { useEffect, useState } from 'react';
import { authenticateUser } from './firebase';
import { useNavigate } from 'react-router-dom';

function Auth() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  useEffect(() => {
  if (token) {
    navigate("/");
  }
  }, [token, navigate]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fetching, isFetching] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [error, setError] = useState('N');

  const handleEmailChange = (event) => {
    const value = event.target.value;
    setEmail(value);
    setShowTooltip(!value.endsWith('@gsu.com'));
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const authenticate = async () => {
    isFetching(true);
    setError('');

    try {
      const user = await authenticateUser(email, password);
      if (user) {
        if (user.isAdmin) {
          navigate("/admin");
        } else {
          window.location.reload();
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      isFetching(false);
    }
  }

  return (
    <div className="Auth">
        <form className='login-form'>
            <img className='school-logo' src='/images/logo.png' alt='gsu-logo' />
            <h3 className='login-title'>Sign In</h3>
            <p className='login-desc'>to continue to Student Portal</p>
            <div className='inputs'>
                <input type='text' placeholder='name@gsu.com' name='email' id='email' value={email} onChange={handleEmailChange}></input>
                {(showTooltip || error === "User not found") && (
                    <p className="email-tooltip">Please ensure you enter a valid <b>GSU</b> email.</p>
                )}                
                <input type='password' placeholder='Password' name='password' id='password' value={password} onChange={handlePasswordChange}></input>
                {error === "Invalid password" && (
                    <p className="email-tooltip">Please ensure you enter a valid <b>password</b>.</p>
                )}
                <p className='no-access'>Can't access your account?</p>
            </div>
            <button onClick={authenticate} disabled={fetching} className='sign-in'>
                {fetching ? 'Logging in...' : 'Login'}
            </button>
        </form>
    </div>
  );
}

export default Auth;
