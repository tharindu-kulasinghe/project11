import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './dashboard.css'
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [vehicles, setVehicles] = useState([])
  const [users, setUsers] = useState([])
  const [bookings, setBookings] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`
    const fetchAll = async () => {
      try {
        setLoading(true)
        setError('')
        const [v, u, b] = await Promise.all([
          fetch(`${API_BASE}/api/vehicles`, { headers }),
          fetch(`${API_BASE}/api/users/admin/users`, { headers }),
          fetch(`${API_BASE}/api/bookings`, { headers })
        ])
        if (!v.ok) throw new Error('Failed to load vehicles')
        if (!u.ok) throw new Error('Failed to load users')
        if (!b.ok) throw new Error('Failed to load bookings')
        const [vj, uj, bj] = await Promise.all([v.json(), u.json(), b.json()])
        setVehicles(Array.isArray(vj) ? vj : [])
        setUsers(Array.isArray(uj) ? uj : [])
        setBookings(Array.isArray(bj) ? bj : [])
      } catch (e) {
        setError(e.message || 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAddVehicle = () => {
    navigate('/admin/add-vehicle')
  }

  const handleAddUser = () => {
    navigate('/admin/add-user')
  }

  const handleViewBookings = () => {
    navigate('/admin/bookings')
  }

  const handleViewSettings = () => {
    navigate('/admin/settings')
  }

  // Calculate statistics from backend data
  const totalVehicles = vehicles.length
  const totalUsers = users.length
  const activeBookings = bookings.filter(b => !['completed', 'cancelled'].includes((b.status || '').toLowerCase())).length

  // Calculate monthly revenue (current month bookings)
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const monthlyRevenue = bookings
    .filter(b => {
      const d = new Date(b.startDate || b.createdAt)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })
    .reduce((sum, b) => sum + Number(b.totalPrice || 0), 0)

  // Recent activity from bookings
  const recentActivity = useMemo(() => {
    const byDate = [...bookings].sort((a, b) => new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate))
    return byDate.slice(0, 4).map(b => ({
      type: (b.status || '').toLowerCase() === 'completed' ? 'booking_completed' : 'booking_update',
      message: (b.status || '').toLowerCase() === 'completed' ? `Booking completed: ${b.vehicle?.title || 'Vehicle'}` : `Booking updated: ${b.vehicle?.title || 'Vehicle'}`,
      user: b.user?.firstName && b.user?.lastName ? `${b.user.firstName} ${b.user.lastName}` : (b.userEmail || 'User'),
      vehicle: b.vehicle?.title || 'Vehicle',
      time: b.createdAt || b.startDate,
      amount: b.totalPrice || 0
    }))
  }, [bookings])

  // Vehicle categories (count by declared category)
  const vehicleCategories = useMemo(() => {
    return vehicles.reduce((acc, v) => {
      const c = v.category || 'Uncategorized'
      acc[c] = (acc[c] || 0) + 1
      return acc
    }, {})
  }, [vehicles])

  // Booking status breakdown
  const bookingStatus = useMemo(() => {
    return bookings.reduce((acc, b) => {
      const s = (b.status || 'pending')
      const k = s.charAt(0).toUpperCase() + s.slice(1)
      acc[k] = (acc[k] || 0) + 1
      return acc
    }, {})
  }, [bookings])

  return (
    <div className="admin-dashboard-content">
      {error && (
        <div className="error-state"><p>{error}</p></div>
      )}
      {loading && (
        <div className="loading-state"><p>Loading dashboard...</p></div>
      )}
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome to the Gamanata Vehicle Rental Admin Panel</p>
      </div>
      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="ri-car-line"></i>
          </div>
          <div className="stat-info">
            <h3>{totalVehicles}</h3>
            <p>Total Vehicles</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="ri-user-line"></i>
          </div>
          <div className="stat-info">
            <h3>{totalUsers.toLocaleString()}</h3>
            <p>Total Users</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="ri-calendar-check-line"></i>
          </div>
          <div className="stat-info">
            <h3>{activeBookings}</h3>
            <p>Active Bookings</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="ri-money-dollar-circle-line"></i>
          </div>
          <div className="stat-info">
            <h3>Rs. {monthlyRevenue.toLocaleString()}</h3>
            <p>Monthly Revenue</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="admin-quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-grid">
          <button className="action-btn primary" onClick={handleAddVehicle}>
            <i className="ri-add-circle-line"></i>
            Add New Vehicle
          </button>
          <button className="action-btn secondary" onClick={handleAddUser}>
            <i className="ri-user-add-line"></i>
            Register New User
          </button>
          <button className="action-btn tertiary" onClick={handleViewBookings}>
            <i className="ri-file-list-3-line"></i>
            View All Bookings
          </button>
          <button className="action-btn quaternary" onClick={handleViewSettings}>
            <i className="ri-settings-3-line"></i>
            Settings
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="admin-recent-activity">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          {recentActivity.map((activity, index) => (
            <div className="activity-item" key={index}>
              <div className="activity-icon">
                {activity.type === 'booking_completed' ? (
                  <i className="ri-calendar-check-line"></i>
                ) : (
                  <i className="ri-car-line"></i>
                )}
              </div>
              <div className="activity-content">
                <p><strong>{activity.user}:</strong> {activity.message}</p>
                <span>{new Date(activity.time).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Overview */}
      <div className="admin-system-overview">
        <h2>System Overview</h2>
        <div className="overview-grid">
          <div className="overview-card">
            <h4>Vehicle Categories</h4>
            <div className="category-stats">
              {Object.entries(vehicleCategories).map(([category, count]) => (
                <div className="category-item" key={category}>
                  <span className="category-name">{category}</span>
                  <span className="category-count">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="overview-card">
            <h4>Booking Status</h4>
            <div className="status-stats">
              {Object.entries(bookingStatus).map(([status, count]) => (
                <div className="status-item" key={status}>
                  <span className={`status-dot ${status.toLowerCase()}`}></span>
                  <span>{status}: {count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}