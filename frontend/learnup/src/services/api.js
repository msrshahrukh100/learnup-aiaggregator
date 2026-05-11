// API service for backend communication

const API_BASE_URL = 'http://localhost:8000';

/**
 * Signup a new user
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<Object>} Response data from the API
 */
export const signup = async (email, password) => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/signup/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
            credentials: 'include', // Include cookies for session management
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Signup failed');
        }

        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Login an existing user
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<Object>} Response data from the API
 */
export const login = async (email, password) => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
            credentials: 'include', // Include cookies for session management
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }

        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Get currently authenticated user
 * @returns {Promise<Object>} User data
 */
export const getCurrentUser = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/me/`, {
            method: 'GET',
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch user');
        }

        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Logout the current user
 * @returns {Promise<Object>} Response data
 */
export const logout = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/logout/`, {
            method: 'POST',
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Logout failed');
        }

        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Get available LLM models
 * @returns {Promise<Object>} List of models
 */
export const getModels = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/chat/models/`, {
            method: 'GET',
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch models');
        }

        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Send a message to the chat API
 * @param {string} message - User's message
 * @param {string} modelName - Selected model name
 * @param {string} [chatId] - Optional chat session ID
 * @returns {Promise<Object>} Response from the assistant
 */
export const sendMessage = async (message, modelName, chatId = null) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/chat/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message, model_name: modelName, chat_id: chatId }),
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to send message');
        }

        return data;
    } catch (error) {
        throw error;
    }
};
