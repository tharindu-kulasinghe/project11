import React, { useState, useCallback } from 'react'
import './contact.css'
import Title from '../../components/title/Title'
import { toast } from 'react-toastify'
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000'

const Contact = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        subject: 'General Inquiry',
        message: '',
        agreeToMarketing: false
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch(`${API_BASE}/api/contacts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            if (!res.ok) {
                const msg = await res.json().catch(() => ({}))
                throw new Error(msg?.message || 'Failed to send message')
            }
            toast.success('Message sent successfully! We\'ll get back to you soon.')
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                subject: 'General Inquiry',
                message: '',
                agreeToMarketing: false
            })
        } catch (error) {
            toast.error(error.message || 'Something went wrong. Please try again.')
        } finally {
            setIsSubmitting(false);
        }
    }, [formData]);

    return (
        <div className="contact">
            <div className="container">
                <div className="contact-container  mt-64">

                </div>
                <Title title="Get In Touch" subtitle="Ready to start your journey? Send us a message and we'll respond within 24 hours." justifyContent="center" />
                <div className="contact-wrapper mt-32">

                    <div className="contact-form-section">
                        <h2>Send Us a Message</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="firstName">First Name <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        placeholder="John"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="lastName">Last Name <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        placeholder="Doe"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email Address <span className="required">*</span></label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="phone">Phone Number</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    placeholder="+94 77 123 4567"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="subject">Subject <span className="required">*</span></label>
                                <select
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="General Inquiry">General Inquiry</option>
                                    <option value="Booking Support">Booking Support</option>
                                    <option value="Vehicle Information">Vehicle Information</option>
                                    <option value="Feedback">Feedback</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="message">Message <span className="required">*</span></label>
                                <textarea
                                    id="message"
                                    name="message"
                                    placeholder="Tell us how we can help you..."
                                    rows="5"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                ></textarea>
                            </div>

                            <button type="submit" className="submit-btn" disabled={isSubmitting}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" fill="currentColor" />
                                </svg>
                                {isSubmitting ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </div>

                    <div className="contact-info-section">
                        <div className="contact-info-card">
                            <h2>Contact Information</h2>

                            <div className="info-item">
                                <div className="info-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" fill="currentColor" />
                                    </svg>
                                </div>
                                <div className="info-content">
                                    <h4>Address</h4>
                                    <p>123 Fuchsius Avenue<br />Colombo 07, Sri Lanka</p>
                                </div>
                            </div>

                            <div className="info-item">
                                <div className="info-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.27 11.36 11.36 0 004.48.9 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.19a1 1 0 011 1 11.36 11.36 0 00.9 4.48 1 1 0 01-.27 1.11l-2.2 2.2z" fill="currentColor" />
                                    </svg>
                                </div>
                                <div className="info-content">
                                    <h4>Phone</h4>
                                    <p>+94 77 123 4567</p>
                                </div>
                            </div>

                            <div className="info-item">
                                <div className="info-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" fill="none" />
                                        <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="2" fill="none" />
                                    </svg>
                                </div>
                                <div className="info-content">
                                    <h4>Email</h4>
                                    <p>support@fuchsiusrentals.com</p>
                                </div>
                            </div>

                            <div className="info-item">
                                <div className="info-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                                        <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" fill="none" />
                                    </svg>
                                </div>
                                <div className="info-content">
                                    <h4>Business Hours</h4>
                                    <p>Mon – Sat: 8:00 AM – 8:00 PM<br />Sunday: 9:00 AM – 6:00 PM</p>
                                </div>
                            </div>
                        </div>

                        <div className="emergency-card">
                            <h3>24/7 Emergency Support</h3>
                            <p>Need immediate assistance? Our emergency hotline is available round the clock.</p>
                            <div className="emergency-info">
                                <div>
                                    <p className="emergency-label">Emergency Hotline</p>
                                    <p className="emergency-number">+94 77 999 8888</p>
                                </div>
                                <button className="call-btn" onClick={() => window.location.href = 'tel:+94779998888'}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.27 11.36 11.36 0 004.48.9 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.19a1 1 0 011 1 11.36 11.36 0 00.9 4.48 1 1 0 01-.27 1.11l-2.2 2.2z" fill="currentColor" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="social-card">
                            <h3>Follow Us</h3>
                            <div className="social-icons">
                                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                </a>
                                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                    </svg>
                                </a>
                                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                    </svg>
                                </a>
                                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Contact;
