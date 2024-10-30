import React from 'react';
import './styles/Auth.css';
import { Navigate } from 'react-router-dom';
import { retrieveSession } from './firebase';

const ProtectedRoute = ({ children }) => {
    const [loading, setLoading] = React.useState(true);
    const [isAuthenticated, setIsAuthenticated] = React.useState(false);
    React.useEffect(() => {
        const checkSession = async () => {
            const userSession = await retrieveSession();
            if (userSession) {
                setIsAuthenticated(true);
                sessionStorage.setItem("isVerified", true);
            } 
            setTimeout(() => {
                setLoading(false);
            }, 1500);
        };

        // Check if the user is already verified
        if (sessionStorage.getItem("isVerified")) {
            setIsAuthenticated(true);
            setLoading(false);
        } else {
            checkSession();
        }
    }, []);
    if (loading) {
        return (
            <div className="Auth">
            <form className='login-form'>
                <img className='school-logo' src='/images/logo.png' alt='GSU Logo'/>
                <h3 className='login-redirection'>Authentication Portal</h3>
                <p className='login-redirection-desc'>Verifying your identity...</p>
                <div className="loader"></div>
            </form>
            </div>
        )
    }

    return isAuthenticated ? children : <Navigate to="/auth" />;
};

export default ProtectedRoute;
