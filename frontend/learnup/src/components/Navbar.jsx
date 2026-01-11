import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
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

                {/* Navigation Buttons */}
                <div className="navbar-actions">
                    <Link to="/login" className="nav-button login-button">
                        Login
                    </Link>
                    <Link to="/signup" className="nav-button signup-button">
                        Sign Up
                    </Link>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
