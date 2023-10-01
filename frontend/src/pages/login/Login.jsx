import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './login.css'
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000'

// Function to decode JWT token
function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (e) {
    return null;
  }
}

export default function Login() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    })

    const [errors, setErrors] = useState({})
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = decodeToken(token);
            if (decoded) {
                // Redirect based on role
                if (decoded.role === 'admin') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/');
                }
            } else {
                localStorage.removeItem('token');
            }
        }
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required'
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address'
        }

        if (!formData.password) {
            newErrors.password = 'Password is required'
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch(`${API_BASE}/api/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Login failed')
            }

            // Store token
            if (data.token) {
                try {
                    localStorage.setItem('token', data.token)
                    window.dispatchEvent(new CustomEvent('tokenUpdated')); // Notify other components
                } catch (e) {
                    console.warn('Could not store token:', e)
                }
            }

            // Validate token role for redirect
            const decoded = JSON.parse(atob(data.token.split('.')[1]))
            const userRole = decoded.role

            // Redirect based on role
            if (userRole === 'admin') {
                navigate('/admin/dashboard')
            } else {
                navigate('/')
            }

            // Reset form
            setFormData({
                email: '',
                password: '',
                rememberMe: false
            })

        } catch (error) {
            console.error('Login error:', error)
            setErrors({ general: error.message || 'Login failed. Please try again.' })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="login mt-64">
            <div className="container">
                <div className="login-container">
                    <div className="login-header">
                        <h1>Welcome Back</h1>
                        <p>Sign in to your Gamanata account</p>
                    </div>

                    <div className="login-form">
                        <form onSubmit={handleSubmit}>
                            {errors.general && (
                                <div className="error-message general-error">
                                    {errors.general}
                                </div>
                            )}

                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={errors.email ? 'error' : ''}
                                    placeholder="Enter your email address"
                                    disabled={isLoading}
                                />
                                {errors.email && <span className="error-message">{errors.email}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className={errors.password ? 'error' : ''}
                                    placeholder="Enter your password"
                                    disabled={isLoading}
                                />
                                {errors.password && <span className="error-message">{errors.password}</span>}
                            </div>

                            <div className="form-options">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="rememberMe"
                                        checked={formData.rememberMe}
                                        onChange={handleInputChange}
                                        disabled={isLoading}
                                    />
                                    Remember me
                                </label>

                                <Link to="/forgot-password" className="forgot-password-link">
                                    Forgot password?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                className="btn-primary login-btn"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Signing In...' : 'Sign In'}
                            </button>
                        </form>

                        <div className="login-footer">
                            <p>Don't have an account? <Link to="/register" className="register-link">Sign up here</Link></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
