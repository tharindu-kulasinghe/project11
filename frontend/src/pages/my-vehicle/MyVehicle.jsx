import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './my-vehicle.css'
import Title from '../../components/title/Title'

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000'

// Function to get auth token
const getAuthToken = () => {
    return localStorage.getItem('token')
}

// Function to get auth headers
const getAuthHeaders = () => {
    const token = getAuthToken()
    return {
        'Authorization': token ? `Bearer ${token}` : ''
    }
}

export default function MyVehicle() {
    const [userVehicles, setUserVehicles] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [deviceByVehicle, setDeviceByVehicle] = useState({})

    useEffect(() => {
        fetchVehicles()
    }, [])

    const decodeJwt = (token) => {
        try {
            const base64Url = token.split('.')[1]
            if (!base64Url) return null
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
                '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            ).join(''))
            return JSON.parse(jsonPayload)
        } catch {
            return null
        }
    }

    const fetchVehicles = async () => {
        try {
            setLoading(true)
            setError('')

            const token = getAuthToken()
            if (!token) {
                setError('Please log in to view your vehicles')
                setLoading(false)
                return
            }

            const response = await fetch(`${API_BASE}/api/vehicles`, {
                method: 'GET',
                headers: getAuthHeaders()
            })

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Please log in to view your vehicles')
                }
                throw new Error('Failed to fetch vehicles')
            }

            const data = await response.json()

            const payload = decodeJwt(token)
            const myUserId = payload?.userId || payload?._id || payload?.id

            const onlyMine = (Array.isArray(data) ? data : []).filter(v => {
                const owner = v?.userId
                const uid = typeof owner === 'object' ? owner?._id : owner
                return uid && myUserId && String(uid) === String(myUserId)
            })

            setUserVehicles(onlyMine)

            const headers2 = { 'Content-Type': 'application/json', ...getAuthHeaders() }
            const ids = onlyMine.map(v => String(v._id)).filter(Boolean)
            const results = {}
            for (const vid of ids) {
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
        } catch (error) {
            console.error('Error fetching vehicles:', error)
            setError(error.message || 'Failed to load vehicles. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (vehicleId) => {
        if (!window.confirm('Are you sure you want to delete this vehicle?')) {
            return
        }

        try {
            const response = await fetch(`${API_BASE}/api/vehicles/${vehicleId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            })

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Please log in to delete vehicles')
                }
                throw new Error('Failed to delete vehicle')
            }

            // Remove vehicle from local state
            setUserVehicles(prevVehicles => prevVehicles.filter(vehicle => vehicle._id !== vehicleId))
            alert('Vehicle deleted successfully!')

        } catch (error) {
            console.error('Error deleting vehicle:', error)
            alert(error.message || 'Failed to delete vehicle. Please try again.')
        }
    }

    const handleTrack = async (vehicle) => {
        try {
            const headers = { 'Content-Type': 'application/json', ...getAuthHeaders() }

            const vehicleId = String(vehicle._id)

            // First get the device for this vehicle
            const deviceRes = await fetch(`${API_BASE}/api/tracking-devices/by-vehicle/${vehicleId}`, { headers })
            if (!deviceRes.ok) throw new Error('Failed to get device info')

            const deviceData = await deviceRes.json()
            if (!deviceData.hasDevice || !deviceData.deviceId) {
                throw new Error('No tracking device found for this vehicle')
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
                alert('Invalid location data format')
            }
        } catch (e) {
            alert(e.message || 'Failed to get location data')
        }
    }

    if (loading) {
        return (
            <div className="my-vehicle mt-64">
                <div className="container">
                    <div className="loading">Loading your vehicles...</div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="my-vehicle mt-64">
                <div className="container">
                    <div className="error-message">
                        <p>{error}</p>
                        <button onClick={fetchVehicles} className="btn-primary">
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="my-vehicle mt-64">
            <div className="container">
                <div className="my-vehicle-container">
                    <div className="my-vehicle-header">
                        <div className="my-vehicle-header-text">
                            <Title title="My Vehicles" />
                        </div>
                        <Link to="/add-vehicle" className="btn-primary add-vehicle-btn">
                            <i className="ri-add-line"></i> Add New Vehicle
                        </Link>
                    </div>

                    {userVehicles.length === 0 ? (
                        <div className="no-vehicles">
                            <i className="ri-car-line"></i>
                            <h2>No vehicles found</h2>
                            <p>You haven't added any vehicles yet. Start by adding your first vehicle!</p>
                            <Link to="/add-vehicle" className="btn-primary">
                                Add Your First Vehicle
                            </Link>
                        </div>
                    ) : (
                        <div className="vehicles-grid">
                            {userVehicles.map(vehicle => (
                                <div key={vehicle._id} className="vehicle-card">
                                    <div className="vehicle-image">
                                        <img
                                            src={vehicle.image ? `${API_BASE}${vehicle.image}` : '/assets/placeholder-car.jpg'}
                                            alt={vehicle.title}
                                        />
                                        {vehicle.available === false && <span className="unavailable-badge">Unavailable</span>}
                                    </div>

                                    <div className="vehicle-info">
                                        <h3>{vehicle.title}</h3>
                                        <p className="vehicle-description">{vehicle.description}</p>

                                        <div className="vehicle-details">
                                            <div className="detail-item">
                                                <i className="ri-money-dollar-circle-line"></i>
                                                <span>LKR {vehicle.pricePerDay}/day</span>
                                            </div>
                                            <div className="detail-item">
                                                <i className="ri-user-line"></i>
                                                <span>{vehicle.seats} seats</span>
                                            </div>
                                            <div className="detail-item">
                                                <i className="ri-suitcase-line"></i>
                                                <span>{vehicle.bags} bags</span>
                                            </div>
                                            <div className="detail-item">
                                                <i className="ri-settings-line"></i>
                                                <span>{vehicle.transmission}</span>
                                            </div>
                                        </div>

                                        <div className="vehicle-features">
                                            {vehicle.features && Object.entries(vehicle.features)
                                                .filter(([key, value]) => value === true)
                                                .slice(0, 2)
                                                .map(([key, value]) => (
                                                    <span key={key} className="feature-tag">
                                                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                                    </span>
                                                ))
                                            }
                                        </div>

                                        <div className="vehicle-actions">
                                            <Link
                                                to={`/add-vehicle?edit=${vehicle._id}`}
                                                className="btn-secondary edit-btn"
                                            >
                                                <i className="ri-edit-line"></i> Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(vehicle._id)}
                                                className="btn-primary delete-btn"
                                            >
                                                <i className="ri-delete-bin-line"></i> Delete
                                            </button>
                                        </div>
                                        <div className="vehicle-actions mt-8">
                                            {(() => {
                                                const deviceInfo = deviceByVehicle[String(vehicle._id)]
                                                if (deviceInfo?.hasDevice) {
                                                    if (deviceInfo.status === 'active') {
                                                        return (
                                                            <button
                                                                onClick={() => handleTrack(vehicle)}
                                                                className="btn-secondary"
                                                            >
                                                                <i className="ri-map-pin-line"></i> Location Track
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
                                                                href={`/tracking-device?vehicleId=${encodeURIComponent(String(vehicle._id))}`}
                                                                className="btn-secondary"
                                                            >
                                                                <i className="ri-refresh-line"></i> Renew Device
                                                            </a>
                                                        )
                                                    } else {
                                                        return (
                                                            <a
                                                                href={`/tracking-device?vehicleId=${encodeURIComponent(String(vehicle._id))}`}
                                                                className="btn-secondary"
                                                            >
                                                                <i className="ri-add-line"></i> Buy Device
                                                            </a>
                                                        )
                                                    }
                                                } else {
                                                    return (
                                                        <a
                                                            href={`/tracking-device?vehicleId=${encodeURIComponent(String(vehicle._id))}`}
                                                            className="btn-secondary"
                                                        >
                                                            Buy Tracking Device
                                                        </a>
                                                    )
                                                }
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}