import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import './add-vehicle-type.css'

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000'

export default function AddVehicleType() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const editId = searchParams.get('edit')

  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')

  useEffect(() => {
    if (!editId) return
    const load = async () => {
      try {
        const token = localStorage.getItem('token')
        const headers = { 'Content-Type': 'application/json' }
        if (token) headers['Authorization'] = `Bearer ${token}`
        const res = await fetch(`${API_BASE}/api/vehicle-types/${editId}`, { headers })
        if (!res.ok) throw new Error('Failed to load vehicle type')
        const t = await res.json()
        setFormData({ name: t.name || '', description: t.description || '' })
        if (t.image) {
          const src = String(t.image)
          setImagePreview(src.startsWith('http') ? src : `${API_BASE}${src}`)
        }
        setIsEditMode(true)
      } catch (_) {
        navigate('/admin/vehicle-types')
      }
    }
    load()
  }, [editId, navigate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setIsSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const headers = {}
      if (token) headers['Authorization'] = `Bearer ${token}`
      const url = isEditMode ? `${API_BASE}/api/vehicle-types/${editId}` : `${API_BASE}/api/vehicle-types`
      const method = isEditMode ? 'PUT' : 'POST'
      const body = new FormData()
      body.append('name', formData.name)
      body.append('description', formData.description)
      if (imageFile) body.append('image', imageFile)
      const res = await fetch(url, { method, headers, body })
      if (!res.ok) {
        const msg = await res.json().catch(() => ({}))
        throw new Error(msg?.message || 'Failed to save type')
      }
      navigate('/admin/vehicle-types')
    } catch (err) {
      setErrors(prev => ({ ...prev, submit: err.message || 'Failed to save' }))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => navigate('/admin/vehicle-types')

  return (
    <div className="admin-add-vehicle-type">
      <div className="admin-add-vehicle-type-container">
        <div className="admin-add-vehicle-type-header">
          <h1>{isEditMode ? 'Edit Vehicle Type' : 'Add Vehicle Type'}</h1>
          <p>{isEditMode ? 'Update the selected vehicle type' : 'Create a new vehicle type for categorizing vehicles'}</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-add-vehicle-type-form">
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? 'error' : ''}
                placeholder="e.g., Car, Van, Lorry, Bike"
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Optional description"
              />
            </div>

            <div className="form-group">
              <label htmlFor="image">Image</label>
              {imagePreview && (
                <div className="image-preview-container">
                  <img
                    src={imagePreview}
                    alt="Vehicle Preview"
                    className="image-preview"
                  />
                </div>
              )}
              <input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  setImageFile(file || null)
                  if (file) {
                    const reader = new FileReader()
                    reader.onload = () => setImagePreview(String(reader.result))
                    reader.readAsDataURL(file)
                  }
                }}
              />
              
            </div>
          </div>

          {errors.submit && (
            <div className="error-message">{errors.submit}</div>
          )}

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={handleCancel}>Cancel</button>
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Type' : 'Create Type')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

