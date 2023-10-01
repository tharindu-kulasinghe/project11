import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './manage-users.css'

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000'

export default function ManageUsers() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('All')

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError('')
      const token = localStorage.getItem('token')
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch(`${API_BASE}/api/users/admin/users`, { headers })
      if (!res.ok) throw new Error('Failed to load users')
      const data = await res.json()
      const list = (data || []).map(u => ({
        id: u._id || u.id,
        name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || (u.name || ''),
        email: u.email,
        role: (u.role || 'user').replace(/^./, c => c.toUpperCase()),
        status: u.status || (u.disabled ? 'Disabled' : 'Active'),
        joinDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '',
        bookings: u.bookingCount ?? 0
      }))
      setUsers(list)
    } catch (e) {
      setError(e.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadUsers() }, [])

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return users.filter(user => {
      const matchesSearch = !term || user.name.toLowerCase().includes(term) ||
                           (user.email || '').toLowerCase().includes(term)
      const matchesFilter = filterRole === 'All' || user.role === filterRole
      return matchesSearch && matchesFilter
    })
  }, [users, searchTerm, filterRole])

  const handleStatusToggle = (id) => {
    setUsers(users.map(user =>
      user.id === id
        ? { ...user, status: user.status === 'Active' ? 'Disabled' : 'Active' }
        : user
    ))
    const u = users.find(x => x.id === id)
    if (!u) return
    const disabled = u.status === 'Active' // toggled to Disabled
    const token = localStorage.getItem('token')
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`
    fetch(`${API_BASE}/api/users/admin/users/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ disabled })
    }).then(res => { if (!res.ok) throw new Error() }).catch(() => loadUsers())
  }

  const handleRoleChange = (id, newRole) => {
    setUsers(users.map(user =>
      user.id === id ? { ...user, role: newRole } : user
    ))
    const u = users.find(x => x.id === id)
    if (!u) return
    const token = localStorage.getItem('token')
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`
    const apiRole = (newRole || '').toLowerCase() === 'admin' ? 'admin' : 'user'
    fetch(`${API_BASE}/api/users/admin/users/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ role: apiRole })
    }).then(res => { if (!res.ok) throw new Error() }).catch(() => loadUsers())
  }

  const handleDelete = (id) => {
    if (!window.confirm('Delete this user?')) return
    const token = localStorage.getItem('token')
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`
    fetch(`${API_BASE}/api/users/admin/users/${id}`, { method: 'DELETE', headers })
      .then(res => { if (!res.ok) throw new Error() })
      .then(() => loadUsers())
      .catch(() => setError('Failed to delete user'))
  }

  const handleAddNewUser = () => {
    navigate('/admin/add-user')
  }

  const handleEdit = (id) => {
    navigate(`/admin/add-user?edit=${id}`)
  }

  return (
    <div className="manage-users">
      <div className="manage-users-container">
        <div className="manage-users-header">
          <h1>Manage Users</h1>
          <p>Manage user accounts, roles, and permissions</p>
        </div>

        <div className="manage-users-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="ri-search-line"></i>
          </div>

          <div className="filter-dropdown">
            <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
              <option value="All">All Roles</option>
              <option value="User">User</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <button className="add-user-btn" onClick={handleAddNewUser}>
            <i className="ri-user-add-line"></i>
            Add New User
          </button>
        </div>

        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Join Date</th>
                <th>Total Bookings</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">
                        <i className="ri-user-line"></i>
                      </div>
                      <div className="user-details">
                        <div className="user-name">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="email-cell">{user.email}</td>
                  <td>
                    <select
                      className={`role-select ${user.role.toLowerCase()}`}
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    >
                      <option value="User">User</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    <span className={`status-badge ${user.status.toLowerCase()}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>{user.joinDate}</td>
                  <td>{user.bookings}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="edit-btn" onClick={() => handleEdit(user.id)}>
                        <i className="ri-edit-line"></i>
                      </button>
                      <button
                        className={`status-toggle-btn ${user.status.toLowerCase()}`}
                        onClick={() => handleStatusToggle(user.id)}
                      >
                        {user.status === 'Active' ? 'Suspend' : 'Activate'}
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(user.id)}>
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="no-users">
            <p>No users found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}
