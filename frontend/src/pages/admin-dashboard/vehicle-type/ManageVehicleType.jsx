import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './manage-vehicle-type.css'

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000'

export default function ManageVehicleType() {
  const navigate = useNavigate()
  const [types, setTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const loadTypes = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await fetch(`${API_BASE}/api/vehicle-types`)
      if (!res.ok) throw new Error('Failed to load vehicle types')
      const data = await res.json()
      setTypes((data || []).map(t => ({ id: t._id || t.id, name: t.name, description: t.description || '', image: t.image })))
    } catch (e) {
      setError(e.message || 'Failed to load vehicle types')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadTypes() }, [])

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return types.filter(t => !term || t.name.toLowerCase().includes(term) || t.description.toLowerCase().includes(term))
  }, [types, searchTerm])

  const handleAdd = () => navigate('/admin/add-vehicle-type')
  const handleEdit = (id) => navigate(`/admin/add-vehicle-type?edit=${id}`)

  const handleDelete = (id) => {
    if (!window.confirm('Delete this vehicle type?')) return
    const token = localStorage.getItem('token')
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`
    fetch(`${API_BASE}/api/vehicle-types/${id}`, { method: 'DELETE', headers })
      .then(res => { if (!res.ok) throw new Error() })
      .then(() => loadTypes())
      .catch(() => setError('Failed to delete type'))
  }

  return (
    <div className="manage-vehicle-type">
      <div className="manage-vehicle-type-container">
        <div className="manage-vehicle-type-header">
          <h1>Manage Vehicle Types</h1>
          <p>Create and manage categories like Car, Van, Lorry, Bike</p>
        </div>

        <div className="manage-vehicle-type-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search vehicle types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="ri-search-line"></i>
          </div>

          <button className="add-type-btn" onClick={handleAdd}>
            <i className="ri-add-line"></i>
            Add Vehicle Type
          </button>
        </div>

        {error && <div className="error-state"><p>{error}</p></div>}
        {loading && <div className="loading-state"><p>Loading...</p></div>}

        <div className="types-table-container">
          <table className="types-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id}>
                  <td>
                    <div className="type-thumb">
                      {t.image ? (
                        <img src={t.image.startsWith('http') ? t.image : `${API_BASE}${t.image}`} alt={t.name} />
                      ) : (
                        <div className="type-thumb-fallback">
                          <i className="ri-image-line"></i>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="type-name">{t.name}</td>
                  <td className="type-desc">{t.description}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="edit-btn" onClick={() => handleEdit(t.id)}>
                        <i className="ri-edit-line"></i>
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(t.id)}>
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length === 0 && (
          <div className="no-types">
            <p>No vehicle types found.</p>
          </div>
        )}
      </div>
    </div>
  )
}

