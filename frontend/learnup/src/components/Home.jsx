import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import ChatInterface from './ChatInterface';
import HeroSection from './HeroSection';
import Sidebar from './Sidebar';
import { getCurrentUser } from '../services/api';
import './Home.css';

function Home() {
    const [user, setUser] = useState(null);
    const [selectedChatId, setSelectedChatId] = useState(null);

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

    const handleChatSelect = (chatId) => {
        setSelectedChatId(chatId);
    };

    return (
        <div className={`home-wrapper ${user ? 'with-sidebar' : ''}`}>
            {!user && <Navbar />}
            {user && <Sidebar user={user} onChatSelect={handleChatSelect} selectedChatId={selectedChatId} />}
            <div className="home-container">
                {user ? (
                    <div className="chat-section">
                        <ChatInterface 
                            user={user} 
                            chatId={selectedChatId} 
                            onChatCreated={handleChatSelect}
                            onNewChat={() => handleChatSelect(null)}
                        />
                    </div>

                ) : (
                    <HeroSection user={user} />
                )}
            </div>
        </div>
    );
}

export default Home;

