import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import './add-vehicle-admin.css'
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000'
export default function AdminAddVehicle() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const editId = searchParams.get('id')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [vehicleTypes, setVehicleTypes] = useState([])

  const [formData, setFormData] = useState({
    title: '',
    vehicleType: '',
    pricePerDay: '',
    year: '',
    licensePlate: '',
    description: '',
    features: '',
    seats: '',
    transmission: '',
    fuelType: '',
    available: true,
    image: null
  })
  useEffect(() => {
    if (editId) {
      const load = async () => {
        try {
          const token = localStorage.getItem('token')
          const headers = { 'Content-Type': 'application/json' }
          if (token) headers['Authorization'] = `Bearer ${token}`
          const res = await fetch(`${API_BASE}/api/vehicles/${editId}`, { headers })
          if (!res.ok) throw new Error('Failed to load vehicle')
          const v = await res.json()
          setFormData({
            title: v.title || '',
            vehicleType: v.vehicleType?._id || v.vehicleType || '',
            pricePerDay: v.pricePerDayLKR ?? v.pricePerDay ?? '',
            year: v.year ?? '',
            licensePlate: v.licensePlate ?? '',
            description: v.description || '',
            features: Array.isArray(v.features) ? v.features.join(', ') : (typeof v.features === 'object' && v.features ? Object.keys(v.features).filter(k => v.features[k]).join(', ') : ''),
            seats: v.seats ?? '',
            transmission: v.transmission ?? '',
            fuelType: v.fuelType ?? '',
            available: !!v.available,
            image: null
          })
          setIsEditMode(true)
        } catch (_) {
          navigate('/admin/vehicles')
        }
      }
      load()
    }
  }, [editId, navigate])

  // Load vehicle types
  useEffect(() => {
    const loadVehicleTypes = async () => {
      try {
        const token = localStorage.getItem('token')
        const headers = { 'Content-Type': 'application/json' }
        if (token) headers['Authorization'] = `Bearer ${token}`
        const res = await fetch(`${API_BASE}/api/vehicle-types`, { headers })
        if (res.ok) {
          const data = await res.json()
          setVehicleTypes(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        console.error('Failed to load vehicle types:', err)
      }
    }
    loadVehicleTypes()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageChange = (e) => {
    setFormData(prev => ({
      ...prev,
      image: e.target.files[0]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const token = localStorage.getItem('token')
      const headers = {}
      if (token) headers['Authorization'] = `Bearer ${token}`

      const fd = new FormData()
      fd.append('title', formData.title)
      fd.append('vehicleType', formData.vehicleType)
      fd.append('pricePerDay', String(formData.pricePerDay))
      if (formData.year) fd.append('year', String(formData.year))
      if (formData.licensePlate) fd.append('licensePlate', formData.licensePlate.toUpperCase())
      if (formData.description) fd.append('description', formData.description)
      if (formData.seats) fd.append('seats', String(formData.seats))
      if (formData.transmission) fd.append('transmission', formData.transmission)
      if (formData.fuelType) fd.append('fuelType', formData.fuelType)
      fd.append('available', String(!!formData.available))
      if (formData.features) {
        // Send simple features list as comma string; backend may ignore if different format
        fd.append('featuresList', formData.features)
      }
      if (formData.image) fd.append('image', formData.image)

      const url = isEditMode ? `${API_BASE}/api/vehicles/${editId}` : `${API_BASE}/api/vehicles`
      const method = isEditMode ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers, body: fd })
      if (!res.ok) {
        const msg = await res.json().catch(() => ({}))
        throw new Error(msg?.message || 'Failed to save vehicle')
      }
      navigate('/admin/vehicles')
    } catch (error) {
      console.error('Error saving vehicle:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate('/admin/vehicles')
  }

  return (
    <div className="admin-add-vehicle">
      <div className="admin-add-vehicle-container">
        <div className="admin-add-vehicle-header">
          <h1>{isEditMode ? 'Edit Vehicle' : 'Add New Vehicle'}</h1>
          <p>{isEditMode ? 'Update vehicle information and settings' : 'Add a new vehicle to your rental fleet'}</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-add-vehicle-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="e.g. Toyota Camry 2023"
              />
            </div>

            <div className="form-group">
              <label htmlFor="vehicleType">Vehicle Type *</label>
              <select
                id="vehicleType"
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Vehicle Type</option>
                {vehicleTypes.map(type => (
                  <option key={type._id} value={type._id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pricePerDay">Price per Day (Rs.) *</label>
              <input
                type="number"
                id="pricePerDay"
                name="pricePerDay"
                value={formData.pricePerDay}
                onChange={handleInputChange}
                required
                min="1000"
                placeholder="5000"
              />
            </div>

            <div className="form-group">
              <label htmlFor="year">Year *</label>
              <input
                type="number"
                id="year"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                required
                min="1990"
                max={new Date().getFullYear()}
                placeholder="2020"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="licensePlate">License Plate *</label>
              <input
                type="text"
                id="licensePlate"
                name="licensePlate"
                value={formData.licensePlate}
                onChange={handleInputChange}
                required
                placeholder="ABC-1234"
              />
            </div>

            <div className="form-group">
              <label htmlFor="seats">Number of Seats</label>
              <input
                type="number"
                id="seats"
                name="seats"
                value={formData.seats}
                onChange={handleInputChange}
                min="2"
                max="12"
                placeholder="5"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="transmission">Transmission</label>
              <select
                id="transmission"
                name="transmission"
                value={formData.transmission}
                onChange={handleInputChange}
              >
                <option value="">Select Transmission</option>
                <option value="Manual">Manual</option>
                <option value="Automatic">Automatic</option>
                <option value="CVT">CVT</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="fuelType">Fuel Type</label>
              <select
                id="fuelType"
                name="fuelType"
                value={formData.fuelType}
                onChange={handleInputChange}
              >
                <option value="">Select Fuel Type</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              placeholder="Describe the vehicle features, condition, and any special notes..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="features">Features (comma separated)</label>
            <input
              type="text"
              id="features"
              name="features"
              value={formData.features}
              onChange={handleInputChange}
              placeholder="e.g. Air Conditioning, GPS, Bluetooth, Backup Camera"
            />
          </div>

          <div className="form-group">
            <label htmlFor="image">Vehicle Image</label>
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleImageChange}
              accept="image/*"
            />
            <small className="form-hint">Upload a high-quality image of the vehicle</small>
          </div>

          <div className="form-group">
            <label htmlFor="available">Status</label>
            <select id="available" name="available" value={formData.available ? 'Available' : 'Maintenance'} onChange={(e) => setFormData(s => ({ ...s, available: e.target.value === 'Available' }))}>
              <option value="Available">Available</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting
                ? (isEditMode ? 'Updating...' : 'Adding...')
                : (isEditMode ? 'Update Vehicle' : 'Add Vehicle')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
