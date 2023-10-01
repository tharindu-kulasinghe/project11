import React, { useState, useEffect } from 'react'
import './profile.css'
import { toast } from 'react-toastify'
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000'

export default function Profile() {
    const [activeTab, setActiveTab] = useState('personal')
    const [formData, setFormData] = useState({
        // Personal Information
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',

        // Address Information
        address: '',
        city: '',
        province: '',
        postalCode: '',

        // License Information
        licenseNumber: '',
        licenseClass: '',

        // Security
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    const [errors, setErrors] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [licenseFrontFile, setLicenseFrontFile] = useState(null)
    const [licenseBackFile, setLicenseBackFile] = useState(null)
    const [licenseFrontUrl, setLicenseFrontUrl] = useState('')
    const [licenseBackUrl, setLicenseBackUrl] = useState('')
    const [licenseFrontPreview, setLicenseFrontPreview] = useState('')
    const [licenseBackPreview, setLicenseBackPreview] = useState('')

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem('token')
                const response = await fetch(`${API_BASE}/api/users/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                const user = await response.json()
                if (response.ok) {
                    setFormData({
                        firstName: user.firstName || '',
                        lastName: user.lastName || '',
                        email: user.email || '',
                        phone: user.phone || '',
                        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
                        address: user.address?.street || '',
                        city: user.address?.city || '',
                        province: user.address?.province || '',
                        postalCode: user.address?.postalCode || '',
                        licenseNumber: user.licenseNumber || '',
                        licenseClass: user.licenseClass || ''
                    })
                    // Existing license images
                    if (user.licenseFrontImage) setLicenseFrontUrl(`${API_BASE}/uploads/${user.licenseFrontImage}`)
                    if (user.licenseBackImage) setLicenseBackUrl(`${API_BASE}/uploads/${user.licenseBackImage}`)
                }
            } catch (error) {
                console.error('Fetch user error:', error)
            }
        }
        fetchUser()

        // Cleanup object URLs on unmount
        return () => {
            if (licenseFrontPreview && licenseFrontPreview.startsWith('blob:')) {
                URL.revokeObjectURL(licenseFrontPreview)
            }
            if (licenseBackPreview && licenseBackPreview.startsWith('blob:')) {
                URL.revokeObjectURL(licenseBackPreview)
            }
        }
    }, [])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const handleFileChange = (e) => {
        const { name, files } = e.target
        if (name === 'licenseFrontImage') {
            const f = files[0] || null
            setLicenseFrontFile(f)
            if (f) {
                setLicenseFrontPreview(URL.createObjectURL(f))
            } else {
                setLicenseFrontPreview('')
            }
        } else if (name === 'licenseBackImage') {
            const f = files[0] || null
            setLicenseBackFile(f)
            if (f) {
                setLicenseBackPreview(URL.createObjectURL(f))
            } else {
                setLicenseBackPreview('')
            }
        }
    }

    const handleRemoveLicenseImage = (imageType) => {
        if (imageType === 'front') {
            // Cleanup preview URL
            if (licenseFrontPreview && licenseFrontPreview.startsWith('blob:')) {
                URL.revokeObjectURL(licenseFrontPreview)
            }
            if (licenseFrontUrl && licenseFrontUrl.startsWith('blob:')) {
                URL.revokeObjectURL(licenseFrontUrl)
            }
            setLicenseFrontFile(null)
            setLicenseFrontPreview('')
            setLicenseFrontUrl('')
            // Clear file input
            const fileInput = document.getElementById('licenseFrontImage')
            if (fileInput) fileInput.value = ''
        } else if (imageType === 'back') {
            // Cleanup preview URL
            if (licenseBackPreview && licenseBackPreview.startsWith('blob:')) {
                URL.revokeObjectURL(licenseBackPreview)
            }
            if (licenseBackUrl && licenseBackUrl.startsWith('blob:')) {
                URL.revokeObjectURL(licenseBackUrl)
            }
            setLicenseBackFile(null)
            setLicenseBackPreview('')
            setLicenseBackUrl('')
            // Clear file input
            const fileInput = document.getElementById('licenseBackImage')
            if (fileInput) fileInput.value = ''
        }
    }

    const uploadSelectedLicenseImages = async () => {
        if (!licenseFrontFile && !licenseBackFile) return
        const token = localStorage.getItem('token')
        const fd = new FormData()
        if (licenseFrontFile) fd.append('licenseFrontImage', licenseFrontFile)
        if (licenseBackFile) fd.append('licenseBackImage', licenseBackFile)
        const response = await fetch(`${API_BASE}/api/users/me/license-images`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: fd
        })
        const data = await response.json()
        if (!response.ok) {
            throw new Error(data.message || 'Image upload failed')
        }
        toast.success('License images updated successfully')
        setLicenseFrontFile(null)
        setLicenseBackFile(null)
        // Refresh preview URLs from server response
        if (data?.user?.licenseFrontImage) {
            setLicenseFrontUrl(`${API_BASE}/uploads/${data.user.licenseFrontImage}`)
            setLicenseFrontPreview('')
        }
        if (data?.user?.licenseBackImage) {
            setLicenseBackUrl(`${API_BASE}/uploads/${data.user.licenseBackImage}`)
            setLicenseBackPreview('')
        }
    }

    const handleUploadImages = async (e) => {
        e.preventDefault()
        try {
            if (!licenseFrontFile && !licenseBackFile) {
                toast.warning('Please choose at least one image to upload')
                return
            }
            await uploadSelectedLicenseImages()
        } catch (err) {
            console.error('Upload images error:', err)
            toast.error('Failed to upload images. Please try again.')
        }
    }

    const validateTab = (tab) => {
        const newErrors = {}

        switch (tab) {
            case 'personal':
                if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
                if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
                if (!formData.email.trim()) newErrors.email = 'Email is required'
                else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
                if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
                break

            case 'address':
                if (!formData.address.trim()) newErrors.address = 'Address is required'
                if (!formData.city.trim()) newErrors.city = 'City is required'
                if (!formData.province.trim()) newErrors.province = 'Province is required'
                if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required'
                break

            case 'license':
                if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required'
                if (!formData.licenseClass) newErrors.licenseClass = 'License class is required'
                break

            case 'security':
                if (!formData.currentPassword) newErrors.currentPassword = 'Current password is required'
                if (!formData.newPassword) newErrors.newPassword = 'New password is required'
                else if (formData.newPassword.length < 8) newErrors.newPassword = 'Password must be at least 8 characters'
                if (formData.newPassword !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
                break

            default:
                break
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleTabChange = (tab) => {
        setActiveTab(tab)
        setErrors({})
    }

    const handleSubmit = async (tab) => {
        if (!validateTab(tab)) return

        setIsLoading(true)

        try {
            const token = localStorage.getItem('token')
            let updateData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                dateOfBirth: formData.dateOfBirth,
                licenseNumber: formData.licenseNumber,
                licenseClass: formData.licenseClass,
                address: {
                    street: formData.address,
                    city: formData.city,
                    province: formData.province,
                    postalCode: formData.postalCode
                }
            }

            // If security tab, add password fields
            if (tab === 'security') {
                updateData.currentPassword = formData.currentPassword
                updateData.newPassword = formData.newPassword
            }

            // If license tab and images selected, upload them first
            if (tab === 'license' && (licenseFrontFile || licenseBackFile)) {
                try {
                    await uploadSelectedLicenseImages()
                } catch (imgErr) {
                    // If image upload fails, stop the rest
                    throw imgErr
                }
            }

            const response = await fetch(`${API_BASE}/api/users/me`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            })

            const data = await response.json()
            if (!response.ok) {
                throw new Error(data.message || 'Update failed')
            }

            toast.success('Profile updated successfully')

            // Clear form for security tab after password change
            if (tab === 'security') {
                setFormData(prev => ({
                    ...prev,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                }))
            }

        } catch (error) {
            console.error('Update error:', error)
            toast.error('Failed to update information. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const renderPersonalTab = () => (
        <div className="profile-tab">
            <h2>Personal Information</h2>
            <form className="profile-form" onSubmit={(e) => { e.preventDefault(); handleSubmit('personal'); }}>
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="firstName">First Name *</label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className={errors.firstName ? 'error' : ''}
                            placeholder="Enter first name"
                            disabled={isLoading}
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
                            placeholder="Enter last name"
                            disabled={isLoading}
                        />
                        {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                    </div>
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
                        placeholder="Enter email address"
                        disabled={isLoading}
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
                        placeholder="Enter phone number"
                        disabled={isLoading}
                    />
                    {errors.phone && <span className="error-message">{errors.phone}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="dateOfBirth">Date of Birth</label>
                    <input
                        type="date"
                        id="dateOfBirth"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        disabled={isLoading}
                    />
                </div>

                <button type="submit" className="btn-primary" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </div>
    )

    const renderAddressTab = () => (
        <div className="profile-tab">
            <h2>Address Information</h2>
            <form className="profile-form" onSubmit={(e) => { e.preventDefault(); handleSubmit('address'); }}>
                <div className="form-group">
                    <label htmlFor="address">Street Address *</label>
                    <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className={errors.address ? 'error' : ''}
                        placeholder="Enter street address"
                        disabled={isLoading}
                    />
                    {errors.address && <span className="error-message">{errors.address}</span>}
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="city">City *</label>
                        <input
                            type="text"
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className={errors.city ? 'error' : ''}
                            placeholder="Enter city"
                            disabled={isLoading}
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
                            disabled={isLoading}
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
                        placeholder="Enter postal code"
                        disabled={isLoading}
                    />
                    {errors.postalCode && <span className="error-message">{errors.postalCode}</span>}
                </div>

                <button type="submit" className="btn-primary" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </div>
    )

    const renderLicenseTab = () => (
        <div className="profile-tab">
            <h2>License Information</h2>
            <form className="profile-form" onSubmit={(e) => { e.preventDefault(); handleSubmit('license'); }}>
                <div className="form-group">
                    <label htmlFor="licenseNumber">License Number *</label>
                    <input
                        type="text"
                        id="licenseNumber"
                        name="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={handleInputChange}
                        className={errors.licenseNumber ? 'error' : ''}
                        placeholder="Enter license number (e.g., B1234567)"
                        disabled={isLoading}
                    />
                    {errors.licenseNumber && <span className="error-message">{errors.licenseNumber}</span>}
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="licenseClass">License Class *</label>
                        <select
                            id="licenseClass"
                            name="licenseClass"
                            value={formData.licenseClass}
                            onChange={handleInputChange}
                            className={errors.licenseClass ? 'error' : ''}
                            disabled={isLoading}
                        >
                            <option value="">Select Class</option>
                            <option value="A">A - Light Vehicles</option>
                            <option value="B">B - All Vehicles</option>
                            <option value="C">C - Heavy Buses</option>
                        </select>
                        {errors.licenseClass && <span className="error-message">{errors.licenseClass}</span>}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="licenseFrontImage">License Front Image</label>
                        {licenseFrontPreview || licenseFrontUrl ? (
                            <div className="image-preview-container">
                                <img
                                    src={licenseFrontPreview || licenseFrontUrl}
                                    alt="License Front"
                                    className="image-preview"
                                />
                                {(licenseFrontPreview || licenseFrontFile) && (
                                    <button
                                        type="button"
                                        className="image-remove-btn"
                                        onClick={() => handleRemoveLicenseImage('front')}
                                        title="Remove image"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="image-preview-placeholder">
                                No image uploaded
                            </div>
                        )}

                        <input
                            type="file"
                            id="licenseFrontImage"
                            name="licenseFrontImage"
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={isLoading}
                        />

                    </div>
                    <div className="form-group">
                        <label htmlFor="licenseBackImage">License Back Image</label>
                        {licenseBackPreview || licenseBackUrl ? (
                            <div className="image-preview-container">
                                <img
                                    src={licenseBackPreview || licenseBackUrl}
                                    alt="License Back"
                                    className="image-preview"
                                />
                                {(licenseBackPreview || licenseBackFile) && (
                                    <button
                                        type="button"
                                        className="image-remove-btn"
                                        onClick={() => handleRemoveLicenseImage('back')}
                                        title="Remove image"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="image-preview-placeholder">
                                No image uploaded
                            </div>
                        )}

                        <input
                            type="file"
                            id="licenseBackImage"
                            name="licenseBackImage"
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={isLoading}
                        />

                    </div>
                </div>

                <button type="submit" className="btn-primary" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </div>
    )

    const renderSecurityTab = () => (
        <div className="profile-tab">
            <h2>Security Settings</h2>
            <form className="profile-form" onSubmit={(e) => { e.preventDefault(); handleSubmit('security'); }}>
                <div className="form-group">
                    <label htmlFor="currentPassword">Current Password *</label>
                    <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        className={errors.currentPassword ? 'error' : ''}
                        placeholder="Enter current password"
                        disabled={isLoading}
                    />
                    {errors.currentPassword && <span className="error-message">{errors.currentPassword}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="newPassword">New Password *</label>
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
                    <label htmlFor="confirmPassword">Confirm New Password *</label>
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

                <button type="submit" className="btn-primary" disabled={isLoading}>
                    {isLoading ? 'Updating Password...' : 'Update Password'}
                </button>
            </form>
        </div>
    )

    return (
        <div className="profile mt-64">
            <div className="container">
                <div className="profile-container">
                    <div className="profile-header">
                        <h1>Profile Settings</h1>
                        <p>Manage your account information and preferences</p>
                    </div>

                    <div className="profile-body">
                        <div className="profile-sidebar">
                            <div className="profile-nav">
                                <button
                                    className={`profile-nav-item ${activeTab === 'personal' ? 'active' : ''}`}
                                    onClick={() => handleTabChange('personal')}
                                >
                                    <i className="ri-user-line"></i> Personal Info
                                </button>
                                <button
                                    className={`profile-nav-item ${activeTab === 'address' ? 'active' : ''}`}
                                    onClick={() => handleTabChange('address')}
                                >
                                    <i className="ri-map-pin-line"></i> Address
                                </button>
                                <button
                                    className={`profile-nav-item ${activeTab === 'license' ? 'active' : ''}`}
                                    onClick={() => handleTabChange('license')}
                                >
                                    <i className="ri-shield-line"></i> License Info
                                </button>
                                <button
                                    className={`profile-nav-item ${activeTab === 'security' ? 'active' : ''}`}
                                    onClick={() => handleTabChange('security')}
                                >
                                    <i className="ri-lock-line"></i> Security
                                </button>
                            </div>
                        </div>

                        <div className="profile-content">
                            {activeTab === 'personal' && renderPersonalTab()}
                            {activeTab === 'address' && renderAddressTab()}
                            {activeTab === 'license' && renderLicenseTab()}
                            {activeTab === 'security' && renderSecurityTab()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
