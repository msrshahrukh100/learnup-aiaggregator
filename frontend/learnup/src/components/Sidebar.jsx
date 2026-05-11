import React, { useState, useEffect } from 'react';
import { logout, getUserChats } from '../services/api';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ user, onChatSelect, selectedChatId }) => {
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const CHATS_LIMIT = 10; // Batched in 10
  const navigate = useNavigate();




  const fetchChats = async (newOffset = 0, append = false) => {
    setIsLoading(true);
    try {
      const data = await getUserChats(CHATS_LIMIT, newOffset);
      if (append) {
        setChats(prev => [...prev, ...data.chats]);
      } else {
        setChats(data.chats);
      }
      setHasMore(data.has_more);
      setOffset(newOffset);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      // Always reset to page 1 when user changes or a new chat is created/selected
      fetchChats(0, false);
    }
  }, [user, selectedChatId]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSeeMore = () => {
    const nextOffset = offset + CHATS_LIMIT;
    fetchChats(nextOffset, true);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon">
            <svg
                width="32"
                height="32"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <rect width="40" height="40" rx="10" fill="url(#gradient-sidebar)" />
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
                        id="gradient-sidebar"
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
          <span className="logo-text">Learnup</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section">
          <button className="new-chat-sidebar-btn" onClick={() => onChatSelect(null)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Chat
          </button>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-title">History</div>
          <div className="chats-list">
            {chats.map((chat) => (
              <button
                key={chat.id}
                className={`chat-item ${selectedChatId === chat.id ? 'active' : ''}`}
                onClick={() => onChatSelect(chat.id)}
              >
                <svg className="chat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <div className="chat-info">
                  <span className="chat-title">{chat.title}</span>
                </div>
              </button>
            ))}
            
            {chats.length === 0 && !isLoading && (
              <div className="no-chats">No recent chats</div>
            )}

            {hasMore && (
              <button 
                className="see-more-btn" 
                onClick={handleSeeMore}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'See more'}
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar-circle">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="user-info">
            <span className="user-name">{user?.username || 'User'}</span>
            <span className="user-email">{user?.email}</span>
          </div>
          <button onClick={handleLogout} className="logout-icon-btn" title="Logout">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;



