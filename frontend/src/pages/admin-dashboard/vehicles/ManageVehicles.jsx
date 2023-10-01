import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './manage-vehicles.css'

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000'

export default function ManageVehicles() {
  const navigate = useNavigate()

  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')

  const loadVehicles = async () => {
    try {
      setLoading(true)
      setError('')
      const token = localStorage.getItem('token')
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      // Fetch vehicles
      const vehiclesRes = await fetch(`${API_BASE}/api/vehicles`, { headers })
      if (!vehiclesRes.ok) throw new Error('Failed to load vehicles')
      const vehiclesData = await vehiclesRes.json()

      // Fetch all bookings to determine rental status
      const bookingsRes = await fetch(`${API_BASE}/api/bookings`, { headers })
      const bookingsData = bookingsRes.ok ? await bookingsRes.json() : []

      // Group bookings by vehicle ID
      const bookingsByVehicle = {}
      if (Array.isArray(bookingsData)) {
        bookingsData.forEach(booking => {
          const vehicleId = String(booking.vehicleId?._id || booking.vehicleId)
          if (!bookingsByVehicle[vehicleId]) {
            bookingsByVehicle[vehicleId] = []
          }
          bookingsByVehicle[vehicleId].push(booking)
        })
      }

      const list = (vehiclesData || []).map(v => {
        // Determine status based on availability and current bookings
        let status = 'Maintenance' // default for unavailable vehicles
        if (v.available) {
          // Check if vehicle has any active bookings
          const vehicleBookings = bookingsByVehicle[String(v._id)] || []
          const now = new Date()
          const hasActiveBooking = vehicleBookings.some(booking =>
            (booking.status === 'active' || booking.status === 'confirmed') &&
            new Date(booking.startDate) <= now && new Date(booking.endDate) >= now
          )
          status = hasActiveBooking ? 'Rented' : 'Available'
        }

        return {
          id: v._id || v.id,
          name: v.title || v.name || 'Untitled',
          category: v.vehicleType?.name || v.category || 'Unknown',
          price: v.pricePerDay ?? 0,
          status: status,
          bookings: bookingsByVehicle[String(v._id)]?.length || 0
        }
      })

      setVehicles(list)
    } catch (e) {
      setError(e.message || 'Failed to load vehicles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadVehicles() }, [])

  const filteredVehicles = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return vehicles.filter(vehicle => {
      const matchesSearch = !term || vehicle.name.toLowerCase().includes(term) ||
        vehicle.category.toLowerCase().includes(term)
      const matchesFilter = filterStatus === 'All' || vehicle.status === filterStatus
      return matchesSearch && matchesFilter
    })
  }, [vehicles, searchTerm, filterStatus])

  const handleStatusChange = async (id, newStatus) => {
    const vehicle = vehicles.find(v => v.id === id)
    if (!vehicle) return

    // Prevent changing status if vehicle is currently rented
    if (vehicle.status === 'Rented') {
      setError('Cannot change status of a currently rented vehicle')
      setTimeout(() => setError(''), 3000)
      return
    }

    // Update frontend state immediately
    const updatedVehicles = vehicles.map(v =>
      v.id === id ? { ...v, status: newStatus } : v
    )
    setVehicles(updatedVehicles)

    try {
      // Map frontend status to backend available field
      const available = newStatus === 'Available'
      const token = localStorage.getItem('token')
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const response = await fetch(`${API_BASE}/api/vehicles/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ available })
      })

      if (!response.ok) {
        throw new Error('Failed to update vehicle status')
      }
    } catch (error) {
      console.error('Status update failed:', error)
      // Revert the change on frontend
      setVehicles(vehicles)
      setError('Failed to update vehicle status')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleDelete = (id) => {
    if (!window.confirm('Delete this vehicle?')) return
    const token = localStorage.getItem('token')
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`
    fetch(`${API_BASE}/api/vehicles/${id}`, { method: 'DELETE', headers })
      .then(res => { if (!res.ok) throw new Error() })
      .then(() => loadVehicles())
      .catch(() => setError('Failed to delete vehicle'))
  }

  const handleAddNewVehicle = () => {
    navigate('/admin/add-vehicle')
  }

  const handleEdit = (id) => {
    navigate(`/admin/add-vehicle?id=${id}`)
  }

  return (
    <div className="manage-vehicles">
      <div className="manage-vehicles-container">
        <div className="manage-vehicles-header">
          <h1>Manage Vehicles</h1>
          <p>Manage your vehicle inventory and availability</p>
        </div>

        <div className="manage-vehicles-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search vehicles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="ri-search-line"></i>
          </div>

          <div className="filter-dropdown">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="All">All Status</option>
              <option value="Available">Available</option>
              <option value="Rented">Rented</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>

          <button className="add-vehicle-btn" onClick={handleAddNewVehicle}>
            <i className="ri-add-circle-line"></i>
            Add New Vehicle
          </button>
        </div>

        {error && (
          <div className="error-state"><p>{error}</p></div>
        )}
        <div className="vehicles-table-container">
          <table className="vehicles-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Vehicle Type</th>
                <th>Price/Day (Rs.)</th>
                <th>Status</th>
                <th>Total Bookings</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6">Loading...</td></tr>
              ) : filteredVehicles.map(vehicle => (
                <tr key={vehicle.id}>
                  <td>
                    <div className="vehicle-info">
                      <div className="vehicle-name">{vehicle.name}</div>
                    </div>
                  </td>
                  <td>
                    <span className={`category-badge ${vehicle.category.toLowerCase()}`}>
                      {vehicle.category}
                    </span>
                  </td>
                  <td className="price-cell">Rs. {Number(vehicle.price || 0).toLocaleString()}</td>
                  <td>
                    <select
                      className={`status-select ${vehicle.status.toLowerCase()}`}
                      value={vehicle.status}
                      onChange={(e) => handleStatusChange(vehicle.id, e.target.value)}
                      disabled={vehicle.status === 'Rented'}
                    >
                      <option value="Available">Available</option>
                      <option value="Maintenance">Maintenance</option>
                      {vehicle.status === 'Rented' && <option value="Rented">Rented</option>}
                    </select>
                  </td>
                  <td>{vehicle.bookings}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="edit-btn" onClick={() => handleEdit(vehicle.id)}>
                        <i className="ri-edit-line"></i>
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(vehicle.id)}>
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && filteredVehicles.length === 0 && (
          <div className="no-vehicles">
            <p>No vehicles found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}
