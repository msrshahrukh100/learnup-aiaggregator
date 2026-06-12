// API service for backend communication

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Helper to get cookie value by name
 * @param {string} name - Cookie name
 * @returns {string|null} Cookie value
 */
const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
};

/**
 * Helper to get default headers for POST requests
 * @returns {Object} Headers including CSRF token
 */
const getPostHeaders = () => {
    const headers = {
        'Content-Type': 'application/json',
    };
    const csrfToken = getCookie('csrftoken');
    if (csrfToken) {
        headers['X-CSRFToken'] = csrfToken;
    }
    return headers;
};

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
            headers: getPostHeaders(),
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
            headers: getPostHeaders(),
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
            headers: getPostHeaders(),
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
            headers: getPostHeaders(),
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

/**
 * Get all chats for the current user with pagination
 * @param {number} limit - Number of chats to fetch
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Object>} List of chats and pagination info
 */
export const getUserChats = async (limit = 10, offset = 0) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/chat/list/?limit=${limit}&offset=${offset}`, {
            method: 'GET',
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch chats');
        }

        return data;
    } catch (error) {
        throw error;
    }
};


/**
 * Get messages for a specific chat
 * @param {number} chatId - Chat ID
 * @returns {Promise<Object>} List of messages
 */
export const getChatMessages = async (chatId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/chat/${chatId}/messages/`, {
            method: 'GET',
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch messages');
        }

        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Get available products
 * @returns {Promise<Object>} List of products
 */
export const getProducts = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/payments/products/`, {
            method: 'GET',
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch products');
        }

        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Create a new Razorpay order
 * @param {number} productId - Product ID
 * @returns {Promise<Object>} Order data
 */
export const createOrder = async (productId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/payments/create-order/`, {
            method: 'POST',
            headers: getPostHeaders(),
            body: JSON.stringify({ product_id: productId }),
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to create order');
        }

        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Verify a Razorpay payment
 * @param {Object} paymentData - Payment data from Razorpay
 * @returns {Promise<Object>} Verification status
 */
export const verifyPayment = async (paymentData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/payments/verify-payment/`, {
            method: 'POST',
            headers: getPostHeaders(),
            body: JSON.stringify(paymentData),
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Payment verification failed');
        }

        return data;
    } catch (error) {
        throw error;
    }
};
