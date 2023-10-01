import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './register.css'
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000'

export default function Register() {
    const navigate = useNavigate()
    const [currentStep, setCurrentStep] = useState(1)
    const [formData, setFormData] = useState({
        // Personal Information
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        nicNumber: '',

        // Contact Information
        address: '',
        city: '',
        province: '',
        postalCode: '',

        // License Information
        licenseNumber: '',
        licenseClass: '',
        licenseFrontImage: null,
        licenseBackImage: null,

        // Account Information
        password: '',
        confirmPassword: '',
        agreeToTerms: false
    })

    const [errors, setErrors] = useState({})

    const handleInputChange = (e) => {
        const { name, value, type, checked, files } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
        }))

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const validateStep = (step) => {
        const newErrors = {}

        switch (step) {
            case 1:
                if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
                if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
                if (!formData.email.trim()) newErrors.email = 'Email is required'
                else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
                if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
                if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required'
                if (!formData.nicNumber.trim()) newErrors.nicNumber = 'NIC number is required'
                break

            case 2:
                if (!formData.address.trim()) newErrors.address = 'Address is required'
                if (!formData.city.trim()) newErrors.city = 'City is required'
                if (!formData.province.trim()) newErrors.province = 'Province is required'
                if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required'
                break

            case 3:
                if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required'
                if (!formData.licenseClass) newErrors.licenseClass = 'License class is required'
                if (!formData.licenseFrontImage) newErrors.licenseFrontImage = 'License front image is required'
                if (!formData.licenseBackImage) newErrors.licenseBackImage = 'License back image is required'
                break

            case 4:
                if (!formData.password) newErrors.password = 'Password is required'
                else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters'
                if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
                if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms and conditions'
                break

            default:
                break
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => prev + 1)
        }
    }

    const prevStep = () => {
        setCurrentStep(prev => prev - 1)
    }

    const handleSubmit = () => {
        if (validateStep(4)) {
            const normalizeLicenseClass = (val) => {
                if (['A', 'B', 'C'].includes(val)) return val
                if (typeof val === 'string') {
                    const up = val.toUpperCase()
                    if (up.startsWith('A')) return 'A'
                    if (up.startsWith('B')) return 'B'
                    if (up.startsWith('C')) return 'C'
                }
                return null
            }

            const normalizedClass = normalizeLicenseClass(formData.licenseClass)
            if (!normalizedClass) {
                alert('Invalid license class selected. Please choose a compatible class (A, B, or C).')
                return
            }

            // sanitize phone to match backend regex /^\+?[0-9]{10,15}$/
            const rawPhone = String(formData.phone || '')
            const sanitizedPhone = rawPhone.startsWith('+')
                ? '+' + rawPhone.slice(1).replace(/[^0-9]/g, '')
                : rawPhone.replace(/[^0-9]/g, '')
            const phoneIsValid = /^\+?[0-9]{10,15}$/.test(sanitizedPhone)
            if (!phoneIsValid) {
                alert('Phone must be 10–15 digits (you can include a leading +).')
                return
            }

            const payload = new FormData()
            payload.append('firstName', formData.firstName)
            payload.append('lastName', formData.lastName)
            payload.append('email', formData.email)
            payload.append('password', formData.password)
            payload.append('phone', sanitizedPhone)
            payload.append('licenseNumber', formData.licenseNumber)
            payload.append('licenseClass', normalizedClass)
            payload.append('address', JSON.stringify({
                street: formData.address,
                city: formData.city,
                province: formData.province,
                postalCode: formData.postalCode
            }))
            payload.append('dateOfBirth', formData.dateOfBirth)

            if (formData.licenseFrontImage) {
                payload.append('licenseFrontImage', formData.licenseFrontImage)
            }
            if (formData.licenseBackImage) {
                payload.append('licenseBackImage', formData.licenseBackImage)
            }

            fetch(`${API_BASE}/api/users/register`, {
                method: 'POST',
                body: payload
            })
                .then(async (res) => {
                    const data = await res.json().catch(() => ({}))
                    if (!res.ok) {
                        const msg = data?.message || 'Registration failed'
                        throw new Error(msg)
                    }
                    return data
                })
                .then((data) => {
                    // alert('Registration successful')
                    navigate('/login')
                })
                .catch((err) => {
                    alert(err.message)
                })
        }
    }

    const renderStepIndicator = () => (
        <div className="register-steps">
            {[1, 2, 3, 4].map(step => (
                <div key={step} className={`register-step ${currentStep >= step ? 'active' : ''}`}>
                    <div className="step-number">{step}</div>
                    <div className="step-label">
                        {step === 1 && 'Personal Info'}
                        {step === 2 && 'Contact Details'}
                        {step === 3 && 'License Info'}
                        {step === 4 && 'Account Setup'}
                    </div>
                </div>
            ))}
        </div>
    )

    const renderPersonalInfo = () => (
        <div className="register-step-content">
            <h2>Personal Information</h2>
            <div className="register-form-grid">
                <div className="form-group">
                    <label htmlFor="firstName">First Name *</label>
                    <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={errors.firstName ? 'error' : ''}
                    />
                    {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="lastName">Last Name *</label>
                    <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={errors.lastName ? 'error' : ''}
                    />
                    {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={errors.email ? 'error' : ''}
                    />
                    {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="phone">Phone Number *</label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={errors.phone ? 'error' : ''}
                    />
                    {errors.phone && <span className="error-message">{errors.phone}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="dateOfBirth">Date of Birth *</label>
                    <input
                        type="date"
                        id="dateOfBirth"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className={errors.dateOfBirth ? 'error' : ''}
                    />
                    {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="nicNumber">NIC Number *</label>
                    <input
                        type="text"
                        id="nicNumber"
                        name="nicNumber"
                        value={formData.nicNumber}
                        onChange={handleInputChange}
                        className={errors.nicNumber ? 'error' : ''}
                        placeholder="123456789V or 123456789012"
                    />
                    {errors.nicNumber && <span className="error-message">{errors.nicNumber}</span>}
                </div>
            </div>
        </div>
    )

    const renderContactDetails = () => (
        <div className="register-step-content">
            <h2>Contact Details</h2>
            <div className="register-form-grid">
                <div className="form-group full-width">
                    <label htmlFor="address">Address *</label>
                    <textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className={errors.address ? 'error' : ''}
                        rows="3"
                        placeholder="Street address"
                    />
                    {errors.address && <span className="error-message">{errors.address}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="city">City *</label>
                    <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={errors.city ? 'error' : ''}
                    />
                    {errors.city && <span className="error-message">{errors.city}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="province">Province *</label>
                    <select
                        id="province"
                        name="province"
                        value={formData.province}
                        onChange={handleInputChange}
                        className={errors.province ? 'error' : ''}
                    >
                        <option value="">Select Province</option>
                        <option value="western">Western Province</option>
                        <option value="central">Central Province</option>
                        <option value="southern">Southern Province</option>
                        <option value="northern">Northern Province</option>
                        <option value="eastern">Eastern Province</option>
                        <option value="north-western">North Western Province</option>
                        <option value="north-central">North Central Province</option>
                        <option value="uva">Uva Province</option>
                        <option value="sabaragamuwa">Sabaragamuwa Province</option>
                    </select>
                    {errors.province && <span className="error-message">{errors.province}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="postalCode">Postal Code *</label>
                    <input
                        type="text"
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className={errors.postalCode ? 'error' : ''}
                    />
                    {errors.postalCode && <span className="error-message">{errors.postalCode}</span>}
                </div>
            </div>
        </div>
    )

    const renderLicenseInfo = () => (
        <div className="register-step-content">
            <h2>License Information</h2>
            <div className="register-form-grid">
                <div className="form-group">
                    <label htmlFor="licenseNumber">License Number *</label>
                    <input
                        type="text"
                        id="licenseNumber"
                        name="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={handleInputChange}
                        className={errors.licenseNumber ? 'error' : ''}
                        placeholder="B1234567"
                    />
                    {errors.licenseNumber && <span className="error-message">{errors.licenseNumber}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="licenseExpiry">License Expiry Date *</label>
                    <input
                        type="date"
                        id="licenseExpiry"
                        name="licenseExpiry"
                        value={formData.licenseExpiry}
                        onChange={handleInputChange}
                        className={errors.licenseExpiry ? 'error' : ''}
                        min={new Date().toISOString().split('T')[0]}
                    />
                    {errors.licenseExpiry && <span className="error-message">{errors.licenseExpiry}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="licenseClass">License Class *</label>
                    <select
                        id="licenseClass"
                        name="licenseClass"
                        value={formData.licenseClass}
                        onChange={handleInputChange}
                        className={errors.licenseClass ? 'error' : ''}
                    >
                        <option value="">Select License Class</option>
                        <option value="A1">A1 - Motorcycles</option>
                        <option value="A">A - Light Vehicles</option>
                        <option value="B1">B1 - Heavy Vehicles</option>
                        <option value="B">B - All Vehicles</option>
                        <option value="C1">C1 - Light Buses</option>
                        <option value="C">C - Heavy Buses</option>
                        <option value="CE">CE - Articulated Vehicles</option>
                        <option value="D1">D1 - Light Trucks</option>
                        <option value="D">D - Heavy Trucks</option>
                        <option value="DE">DE - Heavy Articulated</option>
                    </select>
                    {errors.licenseClass && <span className="error-message">{errors.licenseClass}</span>}
                </div>

                <div className="form-group full-width">
                    <label htmlFor="licenseFrontImage">License Front Image *</label>
                    <input
                        type="file"
                        id="licenseFrontImage"
                        name="licenseFrontImage"
                        onChange={handleInputChange}
                        accept="image/*"
                        className={errors.licenseFrontImage ? 'error' : ''}
                    />
                    {errors.licenseFrontImage && <span className="error-message">{errors.licenseFrontImage}</span>}
                    <small>Upload a clear photo of the front of your driver's license</small>
                </div>

                <div className="form-group full-width">
                    <label htmlFor="licenseBackImage">License Back Image *</label>
                    <input
                        type="file"
                        id="licenseBackImage"
                        name="licenseBackImage"
                        onChange={handleInputChange}
                        accept="image/*"
                        className={errors.licenseBackImage ? 'error' : ''}
                    />
                    {errors.licenseBackImage && <span className="error-message">{errors.licenseBackImage}</span>}
                    <small>Upload a clear photo of the back of your driver's license</small>
                </div>
            </div>
        </div>
    )

    const renderAccountSetup = () => (
        <div className="register-step-content">
            <h2>Account Setup</h2>
            <div className="register-form-grid">
                <div className="form-group">
                    <label htmlFor="password">Password *</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={errors.password ? 'error' : ''}
                    />
                    {errors.password && <span className="error-message">{errors.password}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password *</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={errors.confirmPassword ? 'error' : ''}
                    />
                    {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                </div>

                <div className="form-group full-width">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            name="agreeToTerms"
                            checked={formData.agreeToTerms}
                            onChange={handleInputChange}
                        />
                        I agree to the <a href="#terms" target="_blank">Terms and Conditions</a> and <a href="#privacy" target="_blank">Privacy Policy</a> *
                    </label>
                    {errors.agreeToTerms && <span className="error-message">{errors.agreeToTerms}</span>}
                </div>
            </div>
        </div>
    )

    return (
        <div className="register mt-64">
            <div className="container">
                <div className="register-container">
                    <div className="register-header">
                        <h1>Create Your Account</h1>
                        <p>Join Gamanata for the best vehicle rental experience in Sri Lanka</p>
                    </div>

                    {renderStepIndicator()}

                    <div className="register-form">
                        {currentStep === 1 && renderPersonalInfo()}
                        {currentStep === 2 && renderContactDetails()}
                        {currentStep === 3 && renderLicenseInfo()}
                        {currentStep === 4 && renderAccountSetup()}

                        <div className="register-actions">
                            {currentStep > 1 && (
                                <button type="button" className="btn-secondary" onClick={prevStep}>
                                    Previous
                                </button>
                            )}

                            {currentStep < 4 ? (
                                <button type="button" className="btn-primary" onClick={nextStep}>
                                    Next
                                </button>
                            ) : (
                                <button type="button" className="btn-primary" onClick={handleSubmit}>
                                    Create Account
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
