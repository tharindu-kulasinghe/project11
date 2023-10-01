import React, { useState, useEffect } from 'react'
import Title from '../title/Title'
import './available-vehicle.css'
import VehicleList from '../vehicle-list/VehicleList'

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000'

// Function to decode JWT token
function decodeToken(token) {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload))
    return decoded
  } catch (e) {
    return null
  }
}

export default function AvailableVehicle() {
    const [vehicles, setVehicles] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [currentUserId, setCurrentUserId] = useState(null)

    useEffect(() => {
        // Get current user ID from token
        const token = localStorage.getItem('token')
        if (token) {
            const decoded = decodeToken(token)
            if (decoded) {
                setCurrentUserId(decoded.userId)
            }
        }

        const fetchAvailableVehicles = async () => {
            try {
                setLoading(true)
                setError('')

                const headers = {
                    'Content-Type': 'application/json'
                }

                if (token) {
                    headers['Authorization'] = `Bearer ${token}`
                }

                const response = await fetch(`${API_BASE}/api/vehicles/available`, {
                    method: 'GET',
                    headers: headers
                })

                if (!response.ok) {
                    throw new Error('Failed to fetch available vehicles')
                }

                const data = await response.json()
                setVehicles(data)
            } catch (error) {
                console.error('Error fetching available vehicles:', error)
                setError(error.message || 'Failed to load available vehicles. Please try again.')
            } finally {
                setLoading(false)
            }
        }

        fetchAvailableVehicles()
    }, [])

    return (
        <>
            <div className='available-vehicle mt-64'>
                <div className='container'>
                    <Title title="Available Vehicles" subtitle="Top vehicles currently available for rental (sorted by price)" justifyContent="center"/>
                    <div className="available-vehicle-container">
                        {loading ? (
                            <div className="loading-state">
                                <p>Loading available vehicles...</p>
                            </div>
                        ) : error ? (
                            <div className="error-state">
                                <p>{error}</p>
                                <button onClick={() => window.location.reload()} className="btn-primary">
                                    Try Again
                                </button>
                            </div>
                        ) : vehicles.length === 0 ? (
                            <div className="no-vehicles">
                                <p>No vehicles available today. Please check back later.</p>
                            </div>
                        ) : (
                            <VehicleList data={vehicles.map(vehicle => ({
                                ...vehicle,
                                isOwnVehicle: currentUserId && vehicle.userId === currentUserId,
                                userId: vehicle.userId
                            }))} currentUserId={currentUserId} />
                        )}
                        <div className="available-vehicle-container__btn">
                            <a href="/vehicles" className="btn">View More Vehicles &nbsp;<i className="ri-arrow-right-long-line"></i></a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
