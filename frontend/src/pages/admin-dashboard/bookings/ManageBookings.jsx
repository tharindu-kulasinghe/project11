import React, { useEffect, useMemo, useState } from 'react'
import './manage-bookings.css'
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000'

export default function ManageBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadBookings = async () => {
    try {
      setLoading(true)
      setError('')
      const token = localStorage.getItem('token')
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch(`${API_BASE}/api/bookings`, { headers })
      if (!res.ok) throw new Error('Failed to load bookings')
      const data = await res.json()
      const list = (data || []).map(b => ({
        id: b._id || b.id,
        userName: b.user?.firstName || (b.userName || 'User'),
        vehicleName: b.vehicle?.title || b.vehicleName || 'Vehicle',
        startDate: b.startDate,
        endDate: b.endDate,
        totalPrice: b.totalPrice,
        bookingStatus: (b.status || 'pending').replace(/^./, c => c.toUpperCase()),
        paymentStatus: (b.paymentStatus || 'pending').replace(/^./, c => c.toUpperCase())
      }))
      setBookings(list)
    } catch (e) {
      setError(e.message || 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadBookings() }, [])

  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')

  const filteredBookings = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return bookings.filter(booking => {
      const matchesSearch = !term || booking.userName.toLowerCase().includes(term) ||
        booking.vehicleName.toLowerCase().includes(term)
      const matchesFilter = filterStatus === 'All' || booking.bookingStatus === filterStatus
      return matchesSearch && matchesFilter
    })
  }, [bookings, searchTerm, filterStatus])

  const handleStatusChange = (id, newStatus) => {
    setBookings(bookings.map(booking => booking.id === id ? { ...booking, bookingStatus: newStatus } : booking))
    const token = localStorage.getItem('token')
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`
    // Map display back to API enum
    const apiStatus = (newStatus || '').toLowerCase()
    fetch(`${API_BASE}/api/bookings/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ status: apiStatus })
    }).then(res => { if (!res.ok) throw new Error() }).catch(() => loadBookings())
  }

  const handleDelete = (id) => {
    if (!window.confirm('Delete this booking?')) return
    const token = localStorage.getItem('token')
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`
    fetch(`${API_BASE}/api/bookings/${id}`, { method: 'DELETE', headers })
      .then(res => { if (!res.ok) throw new Error() })
      .then(() => loadBookings())
      .catch(() => setError('Failed to delete booking'))
  }

  // (Optional) View details can be added later with a modal

  return (
    <div className="manage-bookings">
      <div className="manage-bookings-container">
        <div className="manage-bookings-header">
          <h1>Manage Bookings</h1>
          <p>View, update, and manage all customer bookings</p>
        </div>

        <div className="manage-bookings-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="ri-search-line"></i>
          </div>

          <div className="filter-dropdown">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="error-state"><p>{error}</p></div>
        )}
        <div className="bookings-table-container">
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Vehicle</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Total Price (Rs.)</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8">Loading...</td></tr>
              ) : filteredBookings.map(booking => (
                <tr key={booking.id}>
                  <td>{booking.userName}</td>
                  <td>{booking.vehicleName}</td>
                  <td>{booking.startDate ? new Date(booking.startDate).toLocaleDateString() : '-'}</td>
                  <td>{booking.endDate ? new Date(booking.endDate).toLocaleDateString() : '-'}</td>
                  <td>Rs. {Number(booking.totalPrice || 0).toLocaleString()}</td>
                  <td>
                    <select
                      value={booking.bookingStatus}
                      onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                      className={`status-select ${booking.bookingStatus.toLowerCase()}`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Active">Active</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <span className={`payment-badge ${booking.paymentStatus.toLowerCase()}`}>
                      {booking.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="delete-btn" onClick={() => handleDelete(booking.id)}>
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && filteredBookings.length === 0 && (
          <div className="no-bookings">
            <p>No bookings found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}
