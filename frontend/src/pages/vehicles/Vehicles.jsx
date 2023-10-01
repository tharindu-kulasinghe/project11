import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import './vehicles.css'
import VehicleList from '../../components/vehicle-list/VehicleList'
import Pagination from '@mui/material/Pagination'

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

const Vehicles = () => {
    const location = useLocation()
    const searchParams = new URLSearchParams(location.search)
    const queryStart = searchParams.get('startDate') || ''
    const queryEnd = searchParams.get('endDate') || ''
    const queryType = searchParams.get('type') || ''

    const [page, setPage] = useState(1)
    const perPage = 8
    const [vehicles, setVehicles] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [currentUserId, setCurrentUserId] = useState(null)

    const [priceRange, setPriceRange] = useState([0, 50000])
    const [selectedTypes, setSelectedTypes] = useState([])
    const [selectedFeatures, setSelectedFeatures] = useState([])
    const [selectedTransmissions, setSelectedTransmissions] = useState([])
    const [sortBy, setSortBy] = useState('price-low')
    const [vehicleTypes, setVehicleTypes] = useState([])

    // Fetch vehicles from backend
    useEffect(() => {
        // Get current user ID from token
        const token = localStorage.getItem('token')
        if (token) {
            const decoded = decodeToken(token)
            if (decoded) {
                setCurrentUserId(decoded.userId)
            }
        }

        const fetchVehicles = async () => {
            try {
                setLoading(true)
                setError('')

                const headers = {
                    'Content-Type': 'application/json'
                }

                if (token) {
                    headers['Authorization'] = `Bearer ${token}`
                }

                const qs = new URLSearchParams()
                if (queryStart && queryEnd) {
                    qs.set('startDate', queryStart)
                    qs.set('endDate', queryEnd)
                }

                const response = await fetch(`${API_BASE}/api/vehicles${qs.toString() ? `?${qs.toString()}` : ''}`, {
                    method: 'GET',
                    headers: headers
                })

                if (!response.ok) {
                    throw new Error('Failed to fetch vehicles')
                }

                const data = await response.json()
                setVehicles(data)
            } catch (error) {
                console.error('Error fetching vehicles:', error)
                setError(error.message || 'Failed to load vehicles. Please try again.')
            } finally {
                setLoading(false)
            }
        }

        fetchVehicles()
    }, [location.search])

    // Handle type query parameter and fetch vehicle types
    useEffect(() => {
        const fetchVehicleTypes = async () => {
            try {
                const response = await fetch(`${API_BASE}/api/vehicle-types`)
                if (response.ok) {
                    const types = await response.json()
                    setVehicleTypes(types)
                }
            } catch (error) {
                console.error('Error fetching vehicle types:', error)
            }
        }

        fetchVehicleTypes()

        // If type is specified in query, auto-select it
        if (queryType) {
            setSelectedTypes([queryType])
            setPage(1)
        }
    }, [queryType])

    const filteredAndSortedVehicles = useMemo(() => {
        let filtered = vehicles.filter(vehicle => {
            const vehiclePrice = vehicle.pricePerDayLKR
            if (vehiclePrice < priceRange[0] || vehiclePrice > priceRange[1]) return false
            if (selectedTypes.length > 0 && !selectedTypes.includes(vehicle.vehicleType?.name || vehicle.category)) return false
            if (selectedFeatures.length > 0) {
                const hasAllFeatures = selectedFeatures.every(feature =>
                    vehicle.features && Object.keys(vehicle.features).some(key =>
                        key.toLowerCase().includes(feature.toLowerCase().replace(/\s+/g, '')) &&
                        vehicle.features[key] === true
                    )
                )
                if (!hasAllFeatures) return false
            }
            if (selectedTransmissions.length > 0 && !selectedTransmissions.includes(vehicle.transmission)) return false
            // If date range is provided via query, only show vehicles available in that range
            if (queryStart && queryEnd) {
                if (vehicle.availableInRange === false) return false
            }
            return true
        })

        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return a.pricePerDayLKR - b.pricePerDayLKR
                case 'price-high':
                    return b.pricePerDayLKR - a.pricePerDayLKR
                case 'popular':
                    return (b.favorite || 0) - (a.favorite || 0)
                case 'name':
                    return a.title.localeCompare(b.title)
                default:
                    return 0
            }
        })

        return filtered
    }, [vehicles, priceRange, selectedTypes, selectedFeatures, selectedTransmissions, sortBy])

    const total = filteredAndSortedVehicles.length
    const pageCount = Math.ceil(total / perPage)

    const currentData = useMemo(() => {
        const start = (page - 1) * perPage
        return filteredAndSortedVehicles.slice(start, start + perPage)
    }, [filteredAndSortedVehicles, page, perPage])

    const handlePageChange = useCallback((_, value) => {
        setPage(value)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [])

    const handlePriceChange = (e) => {
        setPriceRange([0, parseInt(e.target.value)])
        setPage(1)
    }

    const handleTypeChange = (type) => {
        setSelectedTypes(prev =>
            prev.includes(type)
                ? prev.filter(t => t !== type)
                : [...prev, type]
        )
        setPage(1)
    }

    const handleFeatureChange = (feature) => {
        setSelectedFeatures(prev =>
            prev.includes(feature)
                ? prev.filter(f => f !== feature)
                : [...prev, feature]
        )
        setPage(1)
    }

    const handleTransmissionChange = (transmission) => {
        setSelectedTransmissions(prev =>
            prev.includes(transmission)
                ? prev.filter(t => t !== transmission)
                : [...prev, transmission]
        )
        setPage(1)
    }

    const handleSortChange = (e) => {
        setSortBy(e.target.value)
        setPage(1)
    }

    const clearFilters = () => {
        setPriceRange([0, 25000])
        setSelectedTypes([])
        setSelectedFeatures([])
        setSelectedTransmissions([])
        setSortBy('price-low')
        setPage(1)
    }

    return (
        <div className="vehicles mt-64">
                <div className="container">
                    <div className="vehicles-container">
                        <div className="vehicle-filter">
                            <div className="vehicle-filter-header">
                                <h1 className="vehicle-filter-title">Vehicle Filter</h1>
                            </div>
                            <div className="vehicle-filter-body">
                                <div className="filter-price">
                                    <h1 className="vehicle-filter-title">Price Range</h1>
                                    <input
                                        type="range"
                                        min="0"
                                        max="25000"
                                        step="500"
                                        value={priceRange[1]}
                                        onChange={handlePriceChange}
                                    />
                                    <div className="price-range-display">
                                        Rs. {priceRange[0].toLocaleString()} - Rs. {priceRange[1].toLocaleString()}
                                    </div>
                                </div>
                                <div className="filter-car-type">
                                    <h1 className="vehicle-filter-title">Vehicle Type</h1>
                                    {vehicleTypes.map(type => (
                                        <div key={type._id} className="filter-car-type-item">
                                            <input
                                                type="checkbox"
                                                id={`type-${type._id}`}
                                                checked={selectedTypes.includes(type.name)}
                                                onChange={() => handleTypeChange(type.name)}
                                            />
                                            <label htmlFor={`type-${type._id}`}>{type.name}</label>
                                        </div>
                                    ))}
                                </div>
                                <div className="filter-features">
                                    <h1 className="vehicle-filter-title">Features</h1>
                                    {[
                                        { key: 'gpsNavigation', label: 'GPS Navigation' },
                                        { key: 'bluetooth', label: 'Bluetooth' },
                                        { key: 'backupCamera', label: 'Backup Camera' },
                                        { key: 'leatherSeats', label: 'Leather Seats' },
                                        { key: 'heatedSeats', label: 'Heated Seats' }
                                    ].map(feature => (
                                        <div key={feature.key} className="filter-features-item">
                                            <input
                                                type="checkbox"
                                                id={`feature-${feature.key}`}
                                                checked={selectedFeatures.includes(feature.key)}
                                                onChange={() => handleFeatureChange(feature.key)}
                                            />
                                            <label htmlFor={`feature-${feature.key}`}>
                                                {feature.label}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                <div className="filter-transmission">
                                    <h1 className="vehicle-filter-title">Transmission</h1>
                                    <div className="filter-transmission-item">
                                        <input
                                            type="checkbox"
                                            id="transmission-auto"
                                            checked={selectedTransmissions.includes('Auto')}
                                            onChange={() => handleTransmissionChange('Auto')}
                                        />
                                        <label htmlFor="transmission-auto">Auto</label>
                                    </div>
                                    <div className="filter-transmission-item">
                                        <input
                                            type="checkbox"
                                            id="transmission-manual"
                                            checked={selectedTransmissions.includes('Manual')}
                                            onChange={() => handleTransmissionChange('Manual')}
                                        />
                                        <label htmlFor="transmission-manual">Manual</label>
                                    </div>
                                </div>
                                <button className="clear-filters-btn" onClick={clearFilters}>
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                        <div className="vehicle-list">
                            <div className="vehicle-list-header">
                                <div className="vehicle-list-header-title">
                                    <h1>Vehicles</h1>
                                    <p>Showing {Math.min(page * perPage, total)} of {total} vehicles</p>
                                </div>
                                <div className="vehicle-list-header-actions">
                                    <select value={sortBy} onChange={handleSortChange}>
                                        <option value="price-low">Price (Low to High)</option>
                                        <option value="price-high">Price (High to Low)</option>
                                        <option value="popular">Popular</option>
                                        <option value="name">Name (A-Z)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="vehicle-list-body">
                                {loading ? (
                                    <div className="loading-state">
                                        <p>Loading vehicles...</p>
                                    </div>
                                ) : error ? (
                                    <div className="error-state">
                                        <p>{error}</p>
                                        <button onClick={() => window.location.reload()} className="btn-primary">
                                            Try Again
                                        </button>
                                    </div>
                                ) : currentData.length === 0 ? (
                                    <div className="no-vehicles">
                                        <p>No vehicles match your current filters. Try adjusting your criteria.</p>
                                    </div>
                                ) : (
                                    <>
                                        <VehicleList data={currentData.map(vehicle => ({
                                            ...vehicle,
                                            // Show all vehicles regardless of ownership
                                            isOwnVehicle: currentUserId && vehicle.userId === currentUserId,
                                            userId: vehicle.userId
                                        }))} currentUserId={currentUserId} />
                                        <div className="vehicle-pagination">
                                            <Pagination
                                                count={pageCount}
                                                page={page}
                                                onChange={handlePageChange}
                                                color="primary"
                                                shape="rounded"
                                                siblingCount={1}
                                                boundaryCount={1}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    )
}

export default Vehicles;
