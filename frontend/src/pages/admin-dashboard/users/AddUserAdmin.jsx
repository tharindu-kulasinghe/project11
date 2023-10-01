import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import './add-user-admin.css'
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000'

export default function AdminAddUser() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const editId = searchParams.get('edit')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'User',
    password: '',
    confirmPassword: '',

    // Address Information
    address: '',
    city: '',
    province: '',
    postalCode: '',

    // License Information
    licenseNumber: '',
    licenseExpiry: '',
    licenseClass: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [errors, setErrors] = useState({})
  useEffect(() => {
    if (!editId) return
    const load = async () => {
      try {
        const token = localStorage.getItem('token')
        const headers = { 'Content-Type': 'application/json' }
        if (token) headers['Authorization'] = `Bearer ${token}`
        const res = await fetch(`${API_BASE}/api/users/admin/users/${editId}`, { headers })
        if (!res.ok) throw new Error('Failed to load user')
        const u = await res.json()
        setFormData({
          firstName: u.firstName || '',
          lastName: u.lastName || '',
          email: u.email || '',
          phone: u.phone || '',
          role: (u.role || 'user').replace(/^./, c => c.toUpperCase()),
          password: '',
          confirmPassword: '',
          address: u.address?.street || '',
          city: u.address?.city || '',
          province: u.address?.province || '',
          postalCode: u.address?.postalCode || '',
          licenseNumber: u.licenseNumber || '',
          licenseExpiry: u.licenseExpiry ? String(u.licenseExpiry).substring(0,10) : '',
          licenseClass: u.licenseClass || '',
        })
        setIsEditMode(true)
      } catch (_) {
        navigate('/admin/users')
      }
    }
    load()
  }, [editId, navigate])

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

  const validateForm = () => {
    const newErrors = {}

    // Required fields validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!isEditMode) {
      if (!formData.password) newErrors.password = 'Password is required'
      else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters'
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    }

    // Address validation
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.province.trim()) newErrors.province = 'Province is required'
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required'

    // License validation
    if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required'
    if (!formData.licenseExpiry) newErrors.licenseExpiry = 'License expiry date is required'
    if (!formData.licenseClass) newErrors.licenseClass = 'License class is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const token = localStorage.getItem('token')
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        role: (formData.role || 'User').toLowerCase() === 'admin' ? 'admin' : 'user',
        address: {
          street: formData.address,
          city: formData.city,
          province: formData.province,
          postalCode: formData.postalCode,
        },
        licenseNumber: formData.licenseNumber,
        licenseClass: formData.licenseClass,
        dateOfBirth: undefined // not collected here
      }

      if (!isEditMode) {
        payload.password = formData.password
      }

      const url = isEditMode ? `${API_BASE}/api/users/admin/users/${editId}` : `${API_BASE}/api/users/admin/users`
      const method = isEditMode ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers, body: JSON.stringify(payload) })
      if (!res.ok) {
        const msg = await res.json().catch(() => ({}))
        throw new Error(msg?.message || 'Failed to save user')
      }
      navigate('/admin/users')
    } catch (error) {
      console.error('Error saving user:', error)
      setErrors({ submit: 'Failed to save user. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate('/admin/users')
  }

  return (
    <div className="admin-add-user">
      <div className="admin-add-user-container">
        <div className="admin-add-user-header">
          <h1>{isEditMode ? 'Edit User' : 'Add New User'}</h1>
          <p>{isEditMode ? 'Update user information and settings' : 'Create a new user account with complete profile information'}</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-add-user-form">
          {/* Personal Information */}
          <div className="form-section">
            <h3>Personal Information</h3>
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
                />
                {errors.firstName && <span className="error-text">{errors.firstName}</span>}
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
                />
                {errors.lastName && <span className="error-text">{errors.lastName}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? 'error' : ''}
                  placeholder="user@example.com"
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
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
                  placeholder="+94 XX XXX XXXX"
                />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="role">User Role *</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                >
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>

            {!isEditMode && (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={errors.password ? 'error' : ''}
                  placeholder="Minimum 8 characters"
                />
                {errors.password && <span className="error-text">{errors.password}</span>}
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
                  placeholder="Re-enter password"
                />
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>
            </div>
          )}
          </div>

          {/* Address Information */}
          <div className="form-section">
            <h3>Address Information</h3>
            <div className="form-group">
              <label htmlFor="address">Street Address *</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className={errors.address ? 'error' : ''}
                placeholder="Enter full street address"
              />
              {errors.address && <span className="error-text">{errors.address}</span>}
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
                />
                {errors.city && <span className="error-text">{errors.city}</span>}
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
                  <option value="Western">Western</option>
                  <option value="Central">Central</option>
                  <option value="Southern">Southern</option>
                  <option value="Northern">Northern</option>
                  <option value="Eastern">Eastern</option>
                  <option value="North Western">North Western</option>
                  <option value="North Central">North Central</option>
                  <option value="Uva">Uva</option>
                  <option value="Sabaragamuwa">Sabaragamuwa</option>
                </select>
                {errors.province && <span className="error-text">{errors.province}</span>}
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
                placeholder="XXXXX"
              />
              {errors.postalCode && <span className="error-text">{errors.postalCode}</span>}
            </div>
          </div>

          {/* License Information */}
          <div className="form-section">
            <h3>License Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="licenseNumber">License Number *</label>
                <input
                  type="text"
                  id="licenseNumber"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleInputChange}
                  className={errors.licenseNumber ? 'error' : ''}
                  placeholder="Enter license number"
                />
                {errors.licenseNumber && <span className="error-text">{errors.licenseNumber}</span>}
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
                  <option value="">Select Class</option>
                  <option value="B1">B1</option>
                  <option value="B">B</option>
                  <option value="C1">C1</option>
                  <option value="C">C</option>
                  <option value="CE">CE</option>
                  <option value="D1">D1</option>
                  <option value="D">D</option>
                  <option value="DE">DE</option>
                </select>
                {errors.licenseClass && <span className="error-text">{errors.licenseClass}</span>}
              </div>
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
              />
              {errors.licenseExpiry && <span className="error-text">{errors.licenseExpiry}</span>}
            </div>
          </div>

          {errors.submit && (
            <div className="error-message">
              {errors.submit}
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting
                ? (isEditMode ? 'Updating User...' : 'Creating User...')
                : (isEditMode ? 'Update User' : 'Create User')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
