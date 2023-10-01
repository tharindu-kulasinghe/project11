import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './device-purchase-manage.css'

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000'

// Function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token')
}

// Function to get auth headers
const getAuthHeaders = () => {
  const token = getAuthToken()
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json'
  }
}

export default function DevicePurchaseManage() {
  const navigate = useNavigate()
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const loadDevices = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await fetch(`${API_BASE}/api/tracking-devices`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error('Failed to load device purchases')
      }

      const data = await response.json()
      setDevices(data || [])
    } catch (e) {
      console.error('Error loading devices:', e)
      setError(e.message || 'Failed to load device purchases')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadDevices() }, [])

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return devices.filter(device =>
      !term ||
      device.deviceId?.toLowerCase().includes(term) ||
      device.userId?.name?.toLowerCase().includes(term) ||
      device.userId?.email?.toLowerCase().includes(term) ||
      device.vehicleId?.title?.toLowerCase().includes(term) ||
      device.vehicleId?.licensePlate?.toLowerCase().includes(term) ||
      device.status?.toLowerCase().includes(term)
    )
  }, [devices, searchTerm])

  const handleStatusUpdate = async (deviceId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE}/api/tracking-devices/${deviceId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        throw new Error('Failed to update device status')
      }

      // Reload devices to get updated data
      await loadDevices()
    } catch (e) {
      console.error('Error updating status:', e)
      setError(e.message || 'Failed to update device status')
    }
  }

  const handleDelete = async (deviceId) => {
    if (!window.confirm('Are you sure you want to delete this device purchase?')) {
      return
    }

    try {
      const response = await fetch(`${API_BASE}/api/tracking-devices/${deviceId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error('Failed to delete device purchase')
      }

      // Reload devices to get updated data
      await loadDevices()
    } catch (e) {
      console.error('Error deleting device:', e)
      setError(e.message || 'Failed to delete device purchase')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10b981'
      case 'pending': return '#f59e0b'
      case 'expired': return '#ef4444'
      case 'cancelled': return '#6b7280'
      default: return '#6b7280'
    }
  }

  return (
    <div className="device-purchase-manage">
      <div className="device-purchase-manage-container">
        <div className="device-purchase-manage-header">
          <h1>Manage Device Purchases</h1>
          <p>View and manage tracking device purchases and their statuses</p>
        </div>

        <div className="device-purchase-manage-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search devices, users, vehicles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="ri-search-line"></i>
          </div>
        </div>

        {error && <div className="error-state"><p>{error}</p></div>}
        {loading && <div className="loading-state"><p>Loading device purchases...</p></div>}

        {!loading && (
          <div className="devices-table-container">
            <table className="devices-table">
              <thead>
                <tr>
                  <th>Device ID</th>
                  <th>User</th>
                  <th>Vehicle</th>
                  <th>Status</th>
                  <th>Purchase Date</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(device => (
                  <tr key={device._id}>
                    <td className="device-id">{device.deviceId}</td>
                    <td>
                      <div className="user-info">
                        <div className="user-name">{device.userId?.name || device.userId?.email || 'Unknown'}</div>
                        <div className="user-email">{device.userId?.email}</div>
                      </div>
                    </td>
                    <td>
                      <div className="vehicle-info">
                        <div className="vehicle-title">{device.vehicleId?.title || 'Unknown Vehicle'}</div>
                        <div className="vehicle-plate">{device.vehicleId?.licensePlate}</div>
                      </div>
                    </td>
                    <td>
                      <select
                        value={device.status}
                        onChange={(e) => handleStatusUpdate(device._id, e.target.value)}
                        className={`status-select ${device.status.toLowerCase()}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="active">Active</option>
                        <option value="expired">Expired</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>{new Date(device.purchaseDate).toLocaleDateString()}</td>
                    <td>LKR {device.price ? device.price.toLocaleString() : 'N/A'}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="delete-btn" onClick={() => handleDelete(device._id)}>
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="no-devices">
            <p>No device purchases found.</p>
          </div>
        )}
      </div>
    </div>
  )
}