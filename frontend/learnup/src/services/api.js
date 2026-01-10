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
