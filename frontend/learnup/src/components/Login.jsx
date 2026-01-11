import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import Navbar from './Navbar';
import './Login.css';

function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Email validation
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage('');

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await login(formData.email, formData.password);

            // Redirect to homepage with success message
            navigate('/', {
                state: {
                    message: `Welcome back, ${response.user.username}! 🎉`
                }
            });
        } catch (error) {
            setErrors({
                submit: error.message || 'An error occurred during login. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <h1 className="login-title">Welcome Back</h1>
                        <p className="login-subtitle">Sign in to continue your learning journey</p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        {/* Email Field */}
                        <div className="form-group">
                            <label htmlFor="email" className="form-label">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`form-input ${errors.email ? 'input-error' : ''}`}
                                placeholder="you@example.com"
                                disabled={isLoading}
                            />
                            {errors.email && <p className="error-message">{errors.email}</p>}
                        </div>

                        {/* Password Field */}
                        <div className="form-group">
                            <label htmlFor="password" className="form-label">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`form-input ${errors.password ? 'input-error' : ''}`}
                                placeholder="Enter your password"
                                disabled={isLoading}
                            />
                            {errors.password && <p className="error-message">{errors.password}</p>}
                        </div>

                        {/* Forgot Password Link */}
                        <div className="forgot-password-container">
                            <a href="#" className="forgot-password-link">
                                Forgot password?
                            </a>
                        </div>

                        {/* Submit Error */}
                        {errors.submit && (
                            <div className="alert alert-error">
                                <svg className="alert-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {errors.submit}
                            </div>
                        )}

                        {/* Success Message */}
                        {successMessage && (
                            <div className="alert alert-success">
                                <svg className="alert-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {successMessage}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button type="submit" className="submit-button" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <span className="spinner"></span>
                                    Signing In...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="login-footer">
                        <p className="footer-text">
                            Don't have an account?{' '}
                            <Link to="/signup" className="footer-link">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Login;
