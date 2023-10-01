import React, { useEffect, useMemo, useState } from 'react'
import './rentout.css'
import { toast } from 'react-toastify'

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000'

export default function RentoutPage() {
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [deviceByVehicle, setDeviceByVehicle] = useState({})

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

                const payload = token ? decodeJwt(token) : null
                const ownerId = payload?.userId || payload?._id || payload?.id || null

                const vRes = await fetch(`${API_BASE}/api/vehicles`)
                if (!vRes.ok) throw new Error('Failed to load vehicles')
                const vehicles = await vRes.json()
                const ownerVehicleIds = new Set(
                    (Array.isArray(vehicles) ? vehicles : [])
                        .filter(v => String(v?.userId?._id || v?.userId) === String(ownerId))
                        .map(v => String(v._id))
                )

                const list = allBookings.filter(b => ownerVehicleIds.has(String(b?.vehicleId?._id || b?.vehicleId)))

                setBookings(list)

                // Fetch device status for each unique vehicle in list
                const headers2 = { 'Content-Type': 'application/json' }
                if (token) headers2['Authorization'] = `Bearer ${token}`
                const uniqueVehIds = Array.from(new Set(list.map(b => String(b?.vehicleId?._id || b?.vehicleId)).filter(Boolean)))
                const results = {}
                for (const vid of uniqueVehIds) {
                    try {
                        const r = await fetch(`${API_BASE}/api/tracking-devices/by-vehicle/${vid}`, { headers: headers2 })
                        if (r.ok) {
                            const j = await r.json()
                            results[vid] = j // Store full device info instead of just boolean
                        } else {
                            results[vid] = { hasDevice: false }
                        }
                    } catch {
                        results[vid] = { hasDevice: false }
                    }
                }
                setDeviceByVehicle(results)
            } catch (e) {
                setError(e.message || 'Failed to load bookings')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const filtered = useMemo(() => {
        if (statusFilter === 'all') return bookings
        return bookings.filter(b => (b.status || '').toLowerCase() === statusFilter)
    }, [bookings, statusFilter])

    const updateStatus = async (bookingId, nextStatus) => {
        try {
            const token = localStorage.getItem('token')
            const headers = { 'Content-Type': 'application/json' }
            if (token) headers['Authorization'] = `Bearer ${token}`
            const res = await fetch(`${API_BASE}/api/bookings/${bookingId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ status: nextStatus })
            })
            if (!res.ok) throw new Error('Failed to update booking')
            const updated = await res.json()
            setBookings(prev => prev.map(b => {
                if (b._id !== bookingId) return b
                const next = { ...b, ...updated }
                const updatedVeh = updated?.vehicleId
                const updatedUser = updated?.userId
                const hasVehObject = updatedVeh && typeof updatedVeh === 'object'
                const hasUserObject = updatedUser && typeof updatedUser === 'object'
                next.vehicleId = hasVehObject ? updatedVeh : (b.vehicleId || updatedVeh)
                next.userId = hasUserObject ? updatedUser : (b.userId || updatedUser)
                return next
            }))
        } catch (e) {
            toast.error(e.message || 'Update failed')
        }
    }

    const handleConfirm = (id) => updateStatus(id, 'confirmed')
    const handleCancel = (id) => updateStatus(id, 'cancelled')
    const handleMarkPaymentSuccess = async (bookingId) => {
        try {
            const token = localStorage.getItem('token')
            const headers = { 'Content-Type': 'application/json' }
            if (token) headers['Authorization'] = `Bearer ${token}`
            const res = await fetch(`${API_BASE}/api/bookings/${bookingId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ paymentStatus: 'paid', status: 'completed' })
            })
            if (!res.ok) throw new Error('Failed to mark payment as successful')
            const updated = await res.json()
            setBookings(prev => prev.map(b => {
                if (b._id !== bookingId) return b
                const next = { ...b, ...updated }
                const updatedVeh = updated?.vehicleId
                const updatedUser = updated?.userId
                const hasVehObject = updatedVeh && typeof updatedVeh === 'object'
                const hasUserObject = updatedUser && typeof updatedUser === 'object'
                next.vehicleId = hasVehObject ? updatedVeh : (b.vehicleId || updatedVeh)
                next.userId = hasUserObject ? updatedUser : (b.userId || updatedUser)
                return next
            }))
            toast.success('Payment marked as successful!')
        } catch (e) {
            toast.error(e.message || 'Failed to update payment status')
        }
    }
    const handleTrack = async (b) => {
        try {
            const token = localStorage.getItem('token')
            const headers = { 'Content-Type': 'application/json' }
            if (token) headers['Authorization'] = `Bearer ${token}`

            const vehicleId = String(b?.vehicleId?._id || b?.vehicleId)
            
            // First get the device for this vehicle
            const deviceRes = await fetch(`${API_BASE}/api/tracking-devices/by-vehicle/${vehicleId}`, { headers })
            if (!deviceRes.ok) throw new Error('Failed to get device info')
            
            const deviceData = await deviceRes.json()
            if (!deviceData.hasDevice || !deviceData.deviceId) {
                throw new Error('No tracking device found for this vehicle')
            }

            if (deviceData.status !== 'active') {
                throw new Error(`Device is ${deviceData.status}. Tracking is only available for active devices.`)
            }
            
            // Then get the latest location for this device
            const locationRes = await fetch(`${API_BASE}/api/locations/device/${deviceData.deviceId}`, { headers })
            if (!locationRes.ok) {
                if (locationRes.status === 404) {
                    throw new Error('No location data available yet')
                }
                throw new Error('Failed to get location data')
            }
            
            const locationData = await locationRes.json()
            const coords = locationData?.coordinates?.coordinates
            
            if (Array.isArray(coords) && coords.length === 2) {
                const [lng, lat] = coords
                window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank')
            } else {
                toast.error('Invalid location data format')
            }
        } catch (e) {
            toast.error(e.message || 'Failed to get location data')
        }
    }

    const isTodayWithin = (start, end) => {
        try {
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const s = new Date(start)
            s.setHours(0, 0, 0, 0)
            const e = new Date(end)
            e.setHours(23, 59, 59, 999)
            return today >= s && today <= e
        } catch {
            return false
        }
    }

    const isTodayAfterEndDate = (end) => {
        try {
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const e = new Date(end)
            e.setHours(23, 59, 59, 999)
            return today > e
        } catch {
            return false
        }
    }

    return (
        <div className="rentout mt-64">
            <div className="container">
                <div className="rentout-container">
                    <div className="rentout-header">
                        <h1>Vehicle Rentouts</h1>
                        <p>Manage bookings for your vehicles</p>
                    </div>

                    <div className="rentout-controls">
                        <div className="rentout-filters">
                            <label htmlFor="status">Filter:</label>
                            <select id="status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                <option value="all">All</option>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="active">Active</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>

                    {error && (
                        <div className="rentout-error"><p>{error}</p></div>
                    )}

                    {loading ? (
                        <div className="rentout-loading"><p>Loading...</p></div>
                    ) : (
                        <div className="rentout-list">
                            {filtered.length === 0 ? (
                                <div className="rentout-empty"><p>No bookings found.</p></div>
                            ) : (
                                filtered.map(b => {
                                    const veh = b?.vehicleId || {}
                                    const imgSrc = veh?.image ? `${API_BASE}${veh.image}` : '/assets/icons/eco-car.svg'
                                    return (
                                        <div key={b._id} className="rentout-item">
                                            <div className="rentout-item-main">
                                                <div className="rentout-item-head">
                                                    <img className="rentout-thumb" src={imgSrc} alt={veh?.title || 'Vehicle'} />
                                                    <div className="rentout-head-meta">
                                                        <div className="rentout-item-title">
                                                            <h2>{veh?.title || 'Vehicle'}</h2>
                                                            <span className={`status ${String(b.status || 'pending').toLowerCase()}`}>{b.status}</span>
                                                        </div>
                                                        <div className="rentout-vehicle-meta">
                                                            <span>{veh?.vehicleType?.name || veh?.category || 'Unknown'}</span>
                                                            <span> · </span>
                                                            <span>LKR {Number(veh?.pricePerDayLKR || veh?.pricePerDay || 0).toLocaleString()} / day</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="rentout-item-info mt-16">
                                                    <div>
                                                        <p>Start</p>
                                                        <h3>{new Date(b.startDate).toLocaleDateString()}</h3>
                                                    </div>
                                                    <div>
                                                        <p>End</p>
                                                        <h3>{new Date(b.endDate).toLocaleDateString()}</h3>
                                                    </div>
                                                    <div>
                                                        <p>Total</p>
                                                        <h3>LKR {Number(b.totalPrice || 0).toLocaleString()}</h3>
                                                    </div>
                                                    <div>
                                                        <p>Payment</p>
                                                        <h3>{b.paymentMethod} · {b.paymentStatus}</h3>
                                                    </div>
                                                </div>
                                                <div className="rentout-item-info mt-8">
                                                    <div>
                                                        <p>Renter</p>
                                                        <h3>{([b?.userId?.firstName, b?.userId?.lastName].filter(Boolean).join(' ') || b?.userId?.fullName || b?.userId?.name || '—')}</h3>
                                                    </div>
                                                    <div>
                                                        <p>Email</p>
                                                        <h3>{b?.userId?.email || '—'}</h3>
                                                    </div>
                                                    <div>
                                                        <p>Phone</p>
                                                        <h3>{b?.userId?.phone || b?.userId?.mobile || '—'}</h3>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="rentout-item-actions mt-16">
                                                {isTodayWithin(b.startDate, b.endDate) && (
                                                    (() => {
                                                        const deviceInfo = deviceByVehicle[String(b?.vehicleId?._id || b?.vehicleId)]
                                                        if (deviceInfo?.hasDevice) {
                                                            if (deviceInfo.status === 'active') {
                                                                return (
                                                                    <button className="btn-secondary" onClick={() => handleTrack(b)}>
                                                                        Location Track
                                                                    </button>
                                                                )
                                                            } else if (deviceInfo.status === 'pending') {
                                                                return (
                                                                    <button
                                                                        disabled
                                                                        className="btn-secondary btn-disabled"
                                                                    >
                                                                        <i className="ri-time-line"></i> Device Pending
                                                                    </button>
                                                                )
                                                            } else if (deviceInfo.status === 'expired') {
                                                                return (
                                                                    <a
                                                                        className="btn-secondary"
                                                                        href={`/tracking-device?vehicleId=${encodeURIComponent(String(b?.vehicleId?._id || b?.vehicleId))}`}
                                                                    >
                                                                        <i className="ri-refresh-line"></i> Renew Device
                                                                    </a>
                                                                )
                                                            } else {
                                                                return (
                                                                    <a
                                                                        className="btn-secondary"
                                                                        href={`/tracking-device?vehicleId=${encodeURIComponent(String(b?.vehicleId?._id || b?.vehicleId))}`}
                                                                    >
                                                                        <i className="ri-add-line"></i> Buy Device
                                                                    </a>
                                                                )
                                                            }
                                                        } else {
                                                            return (
                                                                <a
                                                                    className="btn-secondary"
                                                                    href={`/tracking-device?vehicleId=${encodeURIComponent(String(b?.vehicleId?._id || b?.vehicleId))}`}
                                                                >
                                                                    Buy Tracking Device
                                                                </a>
                                                            )
                                                        }
                                                    })()
                                                )}

                                                {isTodayAfterEndDate(b.endDate) && b.paymentMethod === 'cash' && b.paymentStatus === 'pending' && (
                                                    <button
                                                        className="btn-primary"
                                                        onClick={() => handleMarkPaymentSuccess(b._id)}
                                                    >
                                                        <i className="ri-check-line"></i> Mark Payment Success
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

