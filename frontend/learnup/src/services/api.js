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
