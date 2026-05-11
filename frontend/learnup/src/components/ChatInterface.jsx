import { useState, useEffect, useRef } from 'react';
import { getModels, sendMessage, getChatMessages } from '../services/api';
import './ChatInterface.css';

function ChatInterface({ user, chatId, onChatCreated, onNewChat }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [models, setModels] = useState([]);
    const [selectedModel, setSelectedModel] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const fetchModels = async () => {
            try {
                const data = await getModels();
                setModels(data.models);
                if (data.models.length > 0) {
                    setSelectedModel(data.models[0]);
                }
            } catch (error) {
                console.error('Error fetching models:', error);
            }
        };

        fetchModels();
    }, []);

    // Fetch messages when chatId changes
    useEffect(() => {
        const fetchMessages = async () => {
            if (!chatId) {
                setMessages([]);
                return;
            }

            setIsLoading(true);
            try {
                const data = await getChatMessages(chatId);
                setMessages(data.messages);
            } catch (error) {
                console.error('Error fetching messages:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMessages();
    }, [chatId]);

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const data = await sendMessage(input, selectedModel, chatId);
            const assistantMessage = { role: 'assistant', content: data.response };
            setMessages(prev => [...prev, assistantMessage]);
            
            // If this was a new chat, notify the parent to update selectedChatId
            if (!chatId && data.chat_id && onChatCreated) {
                onChatCreated(data.chat_id);
            }

        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };


    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="chat-interface-wrapper">
            <header className="chat-main-header">
                <h1 className="page-title">AI Chat</h1>
                <div className="header-actions">
                    <button className="new-chat-btn" title="New Chat" onClick={() => setMessages([])}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    </button>
                </div>
            </header>

            <div className="chat-messages-container">
                {messages.length === 0 ? (
                    <div className="welcome-container">
                        <div className="welcome-content">
                            <h2 className="welcome-heading">Welcome to Learnup</h2>
                            <p className="welcome-subtext">How can I help you today? Type a message below to start chatting.</p>
                        </div>
                    </div>
                ) : (
                    <div className="messages-list">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message-row ${msg.role}`}>
                                <div className="avatar-container">
                                    {msg.role === 'user' ? (
                                        <div className="user-avatar-circle mini">
                                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                    ) : (
                                        <div className="assistant-avatar">
                                            <svg viewBox="0 0 24 24" fill="currentColor">
                                                <rect width="24" height="24" rx="6" fill="url(#grad1)" />
                                                <path d="M6 18V6L12 9L18 6V18L12 15L6 18Z" fill="white" />
                                                <defs>
                                                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                                                        <stop offset="0%" stopColor="#667eea" />
                                                        <stop offset="100%" stopColor="#764ba2" />
                                                    </linearGradient>
                                                </defs>
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <div className="message-content-wrapper">
                                    <div className="message-text">
                                        {msg.content}
                                    </div>
                                    <div className="message-sender-name">
                                        {msg.role === 'user' ? (user?.username || 'You') : 'Learnup AI'}
                                    </div>
                                </div>

                            </div>
                        ))}
                        {isLoading && (
                            <div className="message-row assistant">
                                <div className="avatar-container">
                                    <div className="assistant-avatar">
                                        <svg viewBox="0 0 24 24" fill="currentColor">
                                            <rect width="24" height="24" rx="6" fill="#667eea" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="message-content-wrapper">
                                    <div className="message-text">
                                        <div className="typing-indicator">
                                            <span></span><span></span><span></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            <div className="chat-input-area">
                <form className="chat-input-container" onSubmit={handleSend}>
                    <div className="input-main-row">
                        <textarea
                            className="chat-textarea"
                            placeholder="Type a message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            rows="1"
                        />
                        <button 
                            type="submit" 
                            className="send-button"
                            disabled={!input.trim() || isLoading}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </div>
                    
                    <div className="input-actions-row">
                        <div className="left-actions">
                            <div className="model-selector-inline no-border">
                                <span className="model-label">Model:</span>
                                <select 
                                    value={selectedModel} 
                                    onChange={(e) => setSelectedModel(e.target.value)}
                                    disabled={isLoading}
                                    className="inline-model-select"
                                >
                                    {models.map(model => (
                                        <option key={model} value={model}>{model}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="right-info">
                            <span className="char-count">{input.length} / 3,000</span>
                        </div>
                    </div>
                </form>
                <div className="input-footer-note">
                    Learnup AI may generate inaccurate information.
                </div>
            </div>
        </div>
    );
}

export default ChatInterface;


