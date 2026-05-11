import { useState, useEffect, useRef } from 'react';
import { getModels, sendMessage } from '../services/api';
import './ChatInterface.css';

function ChatInterface() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [models, setModels] = useState([]);
    const [selectedModel, setSelectedModel] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [chatId, setChatId] = useState(null);
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
            if (data.chat_id) {
                setChatId(data.chat_id);
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
            <div className="chat-header">
                <div className="model-selector">
                    <label htmlFor="model-select">Model:</label>
                    <select 
                        id="model-select"
                        value={selectedModel} 
                        onChange={(e) => setSelectedModel(e.target.value)}
                        disabled={isLoading}
                    >
                        {models.map(model => (
                            <option key={model} value={model}>{model}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="chat-messages-container">
                {messages.length === 0 && (
                    <div className="empty-chat-state">
                        <p>Start a conversation with Learnup AI</p>
                    </div>
                )}
                {messages.map((msg, index) => (
                    <div key={index} className={`message-bubble ${msg.role}`}>
                        <div className="message-content">
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="message-bubble assistant loading">
                        <div className="typing-indicator">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-container" onSubmit={handleSend}>
                <textarea
                    className="chat-textarea"
                    placeholder="Type your message here..."
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
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
            </form>
        </div>
    );
}

export default ChatInterface;
