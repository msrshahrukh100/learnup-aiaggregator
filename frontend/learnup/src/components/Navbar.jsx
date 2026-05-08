import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getCurrentUser, logout } from '../services/api';
import './Navbar.css';

function Navbar() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await getCurrentUser();
                if (data.success) {
                    setUser(data.user);
                }
            } catch (error) {
                // Not logged in or error, keep user as null
                console.log('User not logged in');
            }
        };

        fetchUser();
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            setUser(null);
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Logo and Brand */}
                <Link to="/" className="navbar-brand">
                    <div className="logo">
                        <svg
                            width="40"
                            height="40"
                            viewBox="0 0 40 40"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <rect width="40" height="40" rx="10" fill="url(#gradient)" />
                            <path
                                d="M12 28V12L20 16L28 12V28L20 24L12 28Z"
                                fill="white"
                                stroke="white"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <defs>
                                <linearGradient
                                    id="gradient"
                                    x1="0"
                                    y1="0"
                                    x2="40"
                                    y2="40"
                                    gradientUnits="userSpaceOnUse"
                                >
                                    <stop offset="0%" stopColor="#667eea" />
                                    <stop offset="100%" stopColor="#764ba2" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <span className="brand-name">Learnup</span>
                </Link>

                {/* Navigation Buttons or User Profile */}
                <div className="navbar-actions">
                    {user ? (
                        <>
                            <div className="user-profile">
                                <span className="user-name">Hi, {user.username}</span>
                                <div className="user-avatar">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                            </div>
                            <button onClick={handleLogout} className="nav-button logout-button">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-button login-button">
                                Login
                            </Link>
                            <Link to="/signup" className="nav-button signup-button">
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
