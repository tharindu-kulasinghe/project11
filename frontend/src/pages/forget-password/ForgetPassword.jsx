import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import './forget-password.css'

export default function ForgetPassword() {
    const [currentStep, setCurrentStep] = useState(1)
    const [formData, setFormData] = useState({
        email: '',
        otp: '',
        newPassword: '',
        confirmPassword: ''
    })

    const [errors, setErrors] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [generatedOTP, setGeneratedOTP] = useState('')

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const validateStep = (step) => {
        const newErrors = {}

        switch (step) {
            case 1:
                if (!formData.email.trim()) {
                    newErrors.email = 'Email is required'
                } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
                    newErrors.email = 'Please enter a valid email address'
                }
                break

            case 2:
                if (!formData.otp.trim()) {
                    newErrors.otp = 'OTP is required'
                } else if (formData.otp.length !== 6) {
                    newErrors.otp = 'OTP must be 6 digits'
                }
                break

            case 3:
                if (!formData.newPassword) {
                    newErrors.newPassword = 'New password is required'
                } else if (formData.newPassword.length < 8) {
                    newErrors.newPassword = 'Password must be at least 8 characters'
                }

                if (formData.newPassword !== formData.confirmPassword) {
                    newErrors.confirmPassword = 'Passwords do not match'
                }
                break

            default:
                break
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const sendOTP = async () => {
        if (!validateStep(1)) return

        setIsLoading(true)

        try {
            await new Promise(resolve => setTimeout(resolve, 1500))

            setGeneratedOTP('123456')

            console.log('OTP sent to:', formData.email, 'OTP: 123456')

            setCurrentStep(2)
        } catch (error) {
            setErrors({ email: 'Failed to send OTP. Please try again.' })
        } finally {
            setIsLoading(false)
        }
    }

    const verifyOTP = () => {
        if (!validateStep(2)) return

        if (formData.otp !== generatedOTP) {
            setErrors({ otp: 'Invalid OTP. Please check and try again.' })
            return
        }

        setCurrentStep(3)
    }

    const resetPassword = async () => {
        if (!validateStep(3)) return

        setIsLoading(true)

        try {
            await new Promise(resolve => setTimeout(resolve, 1500))

            console.log('Password reset for:', formData.email)

            setCurrentStep(4)
        } catch (error) {
            setErrors({ general: 'Failed to reset password. Please try again.' })
        } finally {
            setIsLoading(false)
        }
    }

    const renderStepIndicator = () => (
        <div className="forget-password-steps">
            {[1, 2, 3].map(step => (
                <div key={step} className={`forget-password-step ${currentStep >= step ? 'active' : ''}`}>
                    <div className="step-number">{step}</div>
                    <div className="step-label">
                        {step === 1 && 'Email'}
                        {step === 2 && 'Verify OTP'}
                        {step === 3 && 'New Password'}
                    </div>
                </div>
            ))}
        </div>
    )

    const renderEmailStep = () => (
        <div className="forget-password-step-content">
            <h2>Reset Your Password</h2>
            <p>Enter your email address and we'll send you an OTP to reset your password.</p>

            <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={errors.email ? 'error' : ''}
                    placeholder="Enter your registered email address"
                    disabled={isLoading}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <button
                type="button"
                className="btn-primary"
                onClick={sendOTP}
                disabled={isLoading}
            >
                {isLoading ? 'Sending OTP...' : 'Send OTP'}
            </button>
        </div>
    )

    const renderOTPStep = () => (
        <div className="forget-password-step-content">
            <h2>Verify OTP</h2>
            <p>We've sent a 6-digit OTP to <strong>{formData.email}</strong></p>

            <div className="form-group">
                <label htmlFor="otp">Enter OTP</label>
                <input
                    type="text"
                    id="otp"
                    name="otp"
                    value={formData.otp}
                    onChange={handleInputChange}
                    className={errors.otp ? 'error' : ''}
                    placeholder="Enter 6-digit OTP"
                    maxLength="6"
                    disabled={isLoading}
                />
                {errors.otp && <span className="error-message">{errors.otp}</span>}
            </div>

            <div className="otp-actions">
                <button
                    type="button"
                    className="btn-primary"
                    onClick={verifyOTP}
                    disabled={isLoading}
                >
                    Verify OTP
                </button>

                <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setCurrentStep(1)}
                    disabled={isLoading}
                >
                    Back
                </button>
            </div>

            <p className="otp-resend">
                Didn't receive the OTP?{' '}
                <button
                    type="button"
                    className="link-button"
                    onClick={sendOTP}
                    disabled={isLoading}
                >
                    Resend OTP
                </button>
            </p>
        </div>
    )

    const renderPasswordStep = () => (
        <div className="forget-password-step-content">
            <h2>Set New Password</h2>
            <p>Create a strong password for your account.</p>

            <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className={errors.newPassword ? 'error' : ''}
                    placeholder="Enter new password"
                    disabled={isLoading}
                />
                {errors.newPassword && <span className="error-message">{errors.newPassword}</span>}
            </div>

            <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={errors.confirmPassword ? 'error' : ''}
                    placeholder="Confirm new password"
                    disabled={isLoading}
                />
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>

            <div className="password-actions">
                <button
                    type="button"
                    className="btn-primary"
                    onClick={resetPassword}
                    disabled={isLoading}
                >
                    {isLoading ? 'Resetting Password...' : 'Reset Password'}
                </button>

                <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setCurrentStep(2)}
                    disabled={isLoading}
                >
                    Back
                </button>
            </div>
        </div>
    )

    const renderSuccessStep = () => (
        <div className="forget-password-step-content success">
            <div className="success-icon">
                <i className="ri-check-circle-fill"></i>
            </div>
            <h2>Password Reset Successful!</h2>
            <p>Your password has been successfully updated. You can now sign in with your new password.</p>

            <Link to="/login" className="btn-primary">
                Go to Login
            </Link>
        </div>
    )

    return (
        <div className="forget-password mt-64">
            <div className="container">
                <div className="forget-password-container">
                    <div className="forget-password-header">
                        <h1>Reset Password</h1>
                        <p>Follow the steps below to reset your password</p>
                    </div>

                    {currentStep < 4 && renderStepIndicator()}

                    <div className="forget-password-form">
                        {currentStep === 1 && renderEmailStep()}
                        {currentStep === 2 && renderOTPStep()}
                        {currentStep === 3 && renderPasswordStep()}
                        {currentStep === 4 && renderSuccessStep()}
                    </div>

                    <div className="forget-password-footer">
                        <p>Remember your password? <Link to="/login" className="login-link">Sign in here</Link></p>
                    </div>
                </div>
            </div>
        </div>
    )
}