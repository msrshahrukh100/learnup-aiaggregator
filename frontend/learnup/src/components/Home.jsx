import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { getCurrentUser } from '../services/api';
import './Home.css';

function Home() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await getCurrentUser();
                if (data.success) {
                    setUser(data.user);
                }
            } catch (error) {
                console.log('User not logged in');
            }
        };

        fetchUser();
    }, []);

    return (
        <>
            <Navbar />
            <div className="home-container">
                <div className="hero-section">
                    <h1 className="welcome-title">
                        {user ? `Welcome back, ${user.username}!` : 'Welcome to Learnup'}
                    </h1>
                    <p className="welcome-subtitle">
                        Your personalized learning journey continues here.
                    </p>
                </div>
            </div>
        </>
    );
}

export default Home;
