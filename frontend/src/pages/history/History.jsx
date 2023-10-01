import React, { useEffect, useMemo, useState } from 'react'
import './history.css'
import HistoryCard from '../../components/history-card/HistoryCard'

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000'

export default function History() {
    const [filter, setFilter] = useState('all')
    const [sortBy, setSortBy] = useState('date')
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const decodeJwt = (token) => {
        try {
            const base64Url = token.split('.')[1]
            if (!base64Url) return null
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            }).join(''))
            return JSON.parse(jsonPayload)
        } catch {
            return null
        }
    }

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true)
                setError('')
                const token = localStorage.getItem('token')
                const headers = { 'Content-Type': 'application/json' }
                if (token) headers['Authorization'] = `Bearer ${token}`
                const res = await fetch(`${API_BASE}/api/bookings`, { headers })
                if (!res.ok) throw new Error('Failed to load bookings')
                const data = await res.json()
                const allBookings = Array.isArray(data) ? data : []

                // Filter to show only current user's bookings
                const payload = token ? decodeJwt(token) : null
                const currentUserId = payload?.userId || payload?._id || payload?.id || null
                const userBookings = currentUserId ? allBookings.filter(b =>
                    String(b?.userId?._id || b?.userId) === String(currentUserId)
                ) : []

                setBookings(userBookings)
            } catch (e) {
                setError(e.message || 'Failed to load history')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const filteredHistory = useMemo(() => {
        return bookings.filter(item => {
            if (filter === 'all') return true
            const status = String(item.status || '').toLowerCase()
            if (filter === 'ongoing') {
                const today = new Date()
                today.setHours(0,0,0,0)
                const s = new Date(item.startDate); s.setHours(0,0,0,0)
                const e = new Date(item.endDate); e.setHours(23,59,59,999)
                return today >= s && today <= e
            }
            return status === filter
        })
    }, [bookings, filter])

    const sortedHistory = useMemo(() => {
        const arr = [...filteredHistory]
        return arr.sort((a, b) => {
            if (sortBy === 'date') return new Date(b.startDate) - new Date(a.startDate)
            if (sortBy === 'cost') return (b.totalPrice || 0) - (a.totalPrice || 0)
            if (sortBy === 'name') return (a?.vehicleId?.title || '').localeCompare(b?.vehicleId?.title || '')
            return 0
        })
    }, [filteredHistory, sortBy])

    return (
        <div className="history mt-64">
            <div className="container">
                <div className="history-container">
                    <div className="history-header">
                        <h1>My Rental History</h1>
                        <p>View and manage your past vehicle rentals</p>
                    </div>

                    <div className="history-controls">
                        <div className="history-filters">
                            <label htmlFor="status-filter">Filter by Status:</label>
                            <select
                                id="status-filter"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            >
                                <option value="all">All Rentals</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="ongoing">Ongoing</option>
                            </select>
                        </div>

                        <div className="history-sorts">
                            <label htmlFor="sort-by">Sort by:</label>
                            <select
                                id="sort-by"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="date">Date</option>
                                <option value="cost">Cost</option>
                                <option value="name">Title</option>
                            </select>
                        </div>
                    </div>

                    {error && (
                        <div className="history-empty"><p>{error}</p></div>
                    )}
                    {loading ? (
                        <div className="history-empty"><p>Loading...</p></div>
                    ) : (
                        <div className="history-list">
                            {sortedHistory.length === 0 ? (
                                <div className="history-empty">
                                    <p>No rental history found for the selected filter.</p>
                                </div>
                            ) : (
                                sortedHistory.map(rental => (
                                    <HistoryCard key={rental._id} rental={rental} />
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
