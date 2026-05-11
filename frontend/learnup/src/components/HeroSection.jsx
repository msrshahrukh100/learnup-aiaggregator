import React from 'react';
import './Home.css';

const HeroSection = ({ user }) => {
    return (
        <div className="hero-section">
            <h1 className="welcome-title">
                {user ? `Welcome back, ${user.username}!` : 'Welcome to Learnup'}
            </h1>
            <p className="welcome-subtitle">
                Your personalized learning journey continues here.
            </p>
        </div>
    );
};

export default HeroSection;
