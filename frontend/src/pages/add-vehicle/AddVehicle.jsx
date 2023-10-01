import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import './add-vehicle.css'

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000'

const getAuthToken = () => {
    return localStorage.getItem('token')
}

const getAuthHeaders = () => {
    const token = getAuthToken()
    return {
        'Authorization': token ? `Bearer ${token}` : ''
    }
}

export default function AddVehicle() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const editId = searchParams.get('edit')

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        pricePerDay: '',
        vehicleType: '',
        seats: '',
        bags: '',
        transmission: '',
        fuelType: '',
        features: {
            gpsNavigation: false,
            bluetooth: false,
            backupCamera: false,
            leatherSeats: false,
            heatedSeats: false,
            sunroof: false,
            usbPorts: false,
            androidAuto: false,
            appleCarPlay: false,
            cruiseControl: false,
            parkingSensors: false,
            childSeat: false,
            airConditioning: false
        },
        image: null,
        available: true,
        location: '',
        pickupLocation: {
            type: 'Point',
            coordinates: ['', '']
        },
        year: '',
        model: '',
        brand: '',
        mileage: '',
        color: '',
        licensePlate: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const [loading, setLoading] = useState(false)
    const [imagePreviewUrl, setImagePreviewUrl] = useState('')
    const [originalImageUrl, setOriginalImageUrl] = useState('')
    const [vehicleTypes, setVehicleTypes] = useState([])

    // Map related state and refs
    const [coords, setCoords] = useState(null) // {lat, lng}
    const mapHostRef = useRef(null)
    const leafletMapRef = useRef(null)
    const markerRef = useRef(null)
    const watchIdRef = useRef(null)

    useEffect(() => {
        if (editId) {
            setLoading(true)

            fetch(`${API_BASE}/api/vehicles/${editId}`, {
                method: 'GET',
                headers: getAuthHeaders()
            })
                .then(async (res) => {
                    if (!res.ok) {
                        if (res.status === 401) {
                            throw new Error('Please log in to edit vehicles')
                        }
                        throw new Error('Failed to fetch vehicle data')
                    }
                    return res.json()
                })
                .then((vehicle) => {
                    setFormData({
                        title: vehicle.title || '',
                        description: vehicle.description || '',
                        pricePerDay: vehicle.pricePerDay || '',
                        vehicleType: vehicle.vehicleType?._id || vehicle.vehicleType || '',
                        seats: vehicle.seats || '',
                        bags: vehicle.bags || '',
                        transmission: vehicle.transmission || '',
                        fuelType: vehicle.fuelType || '',
                        features: {
                            gpsNavigation: vehicle.features?.gpsNavigation || false,
                            bluetooth: vehicle.features?.bluetooth || false,
                            backupCamera: vehicle.features?.backupCamera || false,
                            leatherSeats: vehicle.features?.leatherSeats || false,
                            heatedSeats: vehicle.features?.heatedSeats || false,
                            sunroof: vehicle.features?.sunroof || false,
                            usbPorts: vehicle.features?.usbPorts || false,
                            androidAuto: vehicle.features?.androidAuto || false,
                            appleCarPlay: vehicle.features?.appleCarPlay || false,
                            cruiseControl: vehicle.features?.cruiseControl || false,
                            parkingSensors: vehicle.features?.parkingSensors || false,
                            childSeat: vehicle.features?.childSeat || false,
                            airConditioning: vehicle.features?.airConditioning || false
                        },
                        image: null,
                        available: vehicle.available !== false,
                        location: vehicle.location || '',
                        pickupLocation: {
                            type: vehicle.pickupLocation?.type || 'Point',
                            coordinates: [
                                vehicle.pickupLocation?.coordinates?.[0]?.toString() || '',
                                vehicle.pickupLocation?.coordinates?.[1]?.toString() || ''
                            ]
                        },
                        year: vehicle.year || '',
                        model: vehicle.model || '',
                        brand: vehicle.brand || '',
                        mileage: vehicle.mileage || '',
                        color: vehicle.color || '',
                        licensePlate: vehicle.licensePlate || ''
                    })
                    // Set existing image preview
                    if (vehicle.image) {
                        const fullImageUrl = `${API_BASE}${vehicle.image}`
                        setImagePreviewUrl(fullImageUrl)
                        setOriginalImageUrl(fullImageUrl)
                    } else {
                        setImagePreviewUrl('')
                        setOriginalImageUrl('')
                    }

                    // Initialize map coordinates from existing data
                    if (vehicle.pickupLocation?.coordinates && vehicle.pickupLocation.coordinates.length === 2) {
                        const [lng, lat] = vehicle.pickupLocation.coordinates
                        setCoords({ lat: parseFloat(lat), lng: parseFloat(lng) })
                    }

                    setIsEditMode(true)
                })
                .catch((err) => {
                    toast.error(err.message || 'Failed to load vehicle data')
                    navigate('/my-vehicles')
                })
                .finally(() => {
                    setLoading(false)
                })
        }

        // Load vehicle types
        fetch(`${API_BASE}/api/vehicle-types`, {
            headers: getAuthHeaders()
        })
            .then(res => res.json())
            .then(data => {
                setVehicleTypes(Array.isArray(data) ? data : [])
            })
            .catch(err => {
                console.error('Failed to load vehicle types:', err)
                setVehicleTypes([])
            })

        // Cleanup object URLs on unmount
        return () => {
            if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreviewUrl)
            }
        }
    }, [editId, navigate, API_BASE])

    // Dynamically load Leaflet assets and init map for location pick
    useEffect(() => {
        const ensureLeaflet = () => new Promise((resolve) => {
            if (window.L) return resolve(window.L)
            const link = document.createElement('link')
            link.rel = 'stylesheet'
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
            document.head.appendChild(link)
            const script = document.createElement('script')
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
            script.onload = () => resolve(window.L)
            document.body.appendChild(script)
        })

        const initMapWhenReady = async () => {
            let tries = 0
            const L = await ensureLeaflet()
            const tryInit = () => {
                if (leafletMapRef.current) return // already inited
                const host = mapHostRef.current
                if (host && host.offsetWidth > 0 && host.offsetHeight > 0) {
                    const useCoords = coords
                    const center = useCoords ? [useCoords.lat, useCoords.lng] : [7.8731, 80.7718] // Sri Lanka center
                    const map = L.map(host).setView(center, useCoords ? 12 : 7)
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        maxZoom: 19,
                        attribution: '&copy; OpenStreetMap'
                    }).addTo(map)
                    // Create a draggable marker for selection; user must drag pin to choose location
                    const startPos = useCoords ? [useCoords.lat, useCoords.lng] : center
                    const m = L.marker(startPos, { draggable: true }).addTo(map)
                    m.on('dragend', () => {
                        const ll = m.getLatLng()
                        setCoords({ lat: ll.lat, lng: ll.lng })
                    })
                    markerRef.current = m
                    leafletMapRef.current = map
                    setTimeout(() => map.invalidateSize(), 200)

                    // Start realtime location updates if available
                    if (navigator.geolocation) {
                        watchIdRef.current = navigator.geolocation.watchPosition(
                            (pos) => {
                                const { latitude, longitude } = pos.coords
                                setCoords((prev) => {
                                    // Avoid excessive view jumps if unchanged
                                    if (!prev || Math.abs(prev.lat - latitude) > 1e-6 || Math.abs(prev.lng - longitude) > 1e-6) {
                                        return { lat: latitude, lng: longitude }
                                    }
                                    return prev
                                })
                            },
                            () => {/* ignore errors for silent UX */ },
                            { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
                        )
                    }
                } else if (tries < 20) {
                    tries += 1
                    setTimeout(tryInit, 150)
                }
            }
            tryInit()
        }

        initMapWhenReady()

        return () => {
            // stop geolocation watch on unmount
            if (watchIdRef.current && navigator.geolocation) {
                navigator.geolocation.clearWatch(watchIdRef.current)
                watchIdRef.current = null
            }
        }
    }, [])

    // Keep marker in sync with coords (when we programmatically change it)
    useEffect(() => {
        const L = window.L
        const map = leafletMapRef.current
        if (!L || !map || !coords) return
        if (markerRef.current) markerRef.current.setLatLng([coords.lat, coords.lng])
        map.setView([coords.lat, coords.lng], Math.max(map.getZoom(), 12))
    }, [coords])

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target

        if (type === 'checkbox') {
            if (name === 'available') {
                setFormData(prev => ({ ...prev, available: checked }))
            } else if (name.startsWith('features.')) {
                const featureName = name.split('.')[1]
                setFormData(prev => ({
                    ...prev,
                    features: {
                        ...prev.features,
                        [featureName]: checked
                    }
                }))
            } else {
                setFormData(prev => ({ ...prev, [name]: checked }))
            }
        } else if (name.startsWith('pickupLocation.coordinates.')) {
            const coordIndex = parseInt(name.split('.')[2])
            setFormData(prev => ({
                ...prev,
                pickupLocation: {
                    ...prev.pickupLocation,
                    coordinates: prev.pickupLocation.coordinates.map((coord, index) =>
                        index === coordIndex ? value : coord
                    )
                }
            }))
        } else {
            setFormData(prev => ({ ...prev, [name]: value }))
        }
    }

    const handleRemoveImage = () => {
        // Cleanup any blob URL (from new uploads)
        if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreviewUrl)
        }

        setFormData(prev => ({ ...prev, image: null }))

        // In edit mode, restore the original server URL if it exists
        if (isEditMode && originalImageUrl) {
            setImagePreviewUrl(originalImageUrl)
        } else {
            setImagePreviewUrl('')
        }

        // Clear file input
        const fileInput = document.getElementById('image')
        if (fileInput) {
            fileInput.value = ''
        }
    }

    const handleImageChange = (e) => {
        const imageFile = e.target.files[0]

        // Always cleanup any existing blob URL first
        if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreviewUrl)
        }

        setFormData(prev => ({ ...prev, image: imageFile }))

        // Create new preview URL or clear if no file
        if (imageFile) {
            setImagePreviewUrl(URL.createObjectURL(imageFile))
        } else {
            // Clear preview if no file selected (only in create mode)
            if (!isEditMode) {
                setImagePreviewUrl('')
            }
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const token = getAuthToken()
            if (!token) {
                throw new Error('Please log in to manage vehicles')
            }

            if (!formData.title.trim()) throw new Error('Vehicle name is required')
            if (!formData.vehicleType) throw new Error('Vehicle type is required')
            if (!formData.brand.trim()) throw new Error('Brand is required')
            if (!formData.model.trim()) throw new Error('Model is required')
            if (!formData.year || formData.year < 1900) throw new Error('Valid year is required')
            if (!formData.color.trim()) throw new Error('Color is required')
            if (!formData.licensePlate.trim()) throw new Error('License plate is required')
            if (!formData.mileage || formData.mileage < 0) throw new Error('Valid mileage is required')
            if (!formData.description.trim()) throw new Error('Description is required')
            if (!formData.pricePerDay || formData.pricePerDay <= 0) throw new Error('Valid price per day is required')
            if (!formData.seats || formData.seats <= 0) throw new Error('Valid seating capacity is required')
            if (!formData.bags || formData.bags < 0) throw new Error('Valid luggage capacity is required')
            if (!formData.transmission) throw new Error('Transmission is required')
            if (!formData.fuelType) throw new Error('Fuel type is required')
            if (!formData.location.trim()) throw new Error('Location is required')
            if (!coords || !coords.lat || !coords.lng) {
                throw new Error('Valid coordinates are required - please select a location on the map')
            }

            const longitude = coords.lng
            const latitude = coords.lat

            if (!isEditMode && !formData.image) {
                throw new Error('Vehicle image is required')
            }
            const formDataToSend = new FormData()

            formDataToSend.append('title', formData.title)
            formDataToSend.append('description', formData.description)
            formDataToSend.append('pricePerDay', formData.pricePerDay)
            formDataToSend.append('vehicleType', formData.vehicleType)
            formDataToSend.append('seats', formData.seats)
            formDataToSend.append('bags', formData.bags)
            formDataToSend.append('mileage', formData.mileage)
            formDataToSend.append('color', formData.color)
            formDataToSend.append('licensePlate', formData.licensePlate)

            Object.keys(formData.features).forEach(feature => {
                formDataToSend.append(`features.${feature}`, formData.features[feature] ? 'true' : 'false')
            })

            if (formData.image) {
                formDataToSend.append('image', formData.image)
            }

            // Add required fields
            formDataToSend.append('brand', formData.brand)
            formDataToSend.append('model', formData.model)
            formDataToSend.append('year', formData.year)
            formDataToSend.append('fuelType', formData.fuelType)
            formDataToSend.append('transmission', formData.transmission)
            formDataToSend.append('location', formData.location)
            formDataToSend.append('pickupAddress', formData.location) // Use location as pickupAddress
            formDataToSend.append('coordinates', `${longitude},${latitude}`)

            const url = isEditMode
                ? `${API_BASE}/api/vehicles/${editId}`
                : `${API_BASE}/api/vehicles`

            const response = await fetch(url, {
                method: isEditMode ? 'PUT' : 'POST',
                headers: getAuthHeaders(),
                body: formDataToSend
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || `Failed to ${isEditMode ? 'update' : 'create'} vehicle`)
            }

            if (isEditMode) {
                toast.success('Vehicle updated successfully!')
            } else {
                toast.success('Vehicle added successfully!')
            }

            navigate('/my-vehicles')

        } catch (error) {
            console.error('Vehicle submission error:', error)
            toast.error(error.message || 'Failed to save vehicle. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCancel = () => {
        navigate('/my-vehicles')
    }

    return (
        <div className="add-vehicle mt-64">
            <div className="container">
                <div className="add-vehicle-container">
                    <div className="add-vehicle-header">
                        <h1>{isEditMode ? 'Edit Vehicle' : 'Add New Vehicle'}</h1>
                        <p>{isEditMode ? 'Update the vehicle information below.' : 'Fill in the details below to add a new vehicle to your rental fleet.'}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="add-vehicle-form">

                        {loading && (
                            <div className="add-vehicle-loading">
                                <span>Loading vehicle data...</span>
                            </div>
                        )}
                        <div className="add-vehicle-form-section">
                            <h2>Basic Information</h2>
                            <div className="add-vehicle-form-row">
                                <div className="add-vehicle-form-group">
                                    <label htmlFor="title">Title <span className="add-vehicle-required">*</span></label>
                                    <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        placeholder="e.g., Toyota Camry"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                        disabled={loading || isSubmitting}
                                    />
                                </div>
                                <div className="add-vehicle-form-group">
                                    <label htmlFor="vehicleType">Vehicle Type <span className="add-vehicle-required">*</span></label>
                                    <select
                                        id="vehicleType"
                                        name="vehicleType"
                                        value={formData.vehicleType}
                                        onChange={handleChange}
                                        required
                                        disabled={loading || isSubmitting}
                                    >
                                        <option value="">Select Vehicle Type</option>
                                        {vehicleTypes.map(type => (
                                            <option key={type._id} value={type._id}>
                                                {type.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="add-vehicle-form-row">
                                <div className="add-vehicle-form-group">
                                    <label htmlFor="brand">Brand <span className="add-vehicle-required">*</span></label>
                                    <input
                                        type="text"
                                        id="brand"
                                        name="brand"
                                        placeholder="e.g., Toyota"
                                        value={formData.brand}
                                        onChange={handleChange}
                                        required
                                        disabled={loading || isSubmitting}
                                    />
                                </div>
                                <div className="add-vehicle-form-group">
                                    <label htmlFor="model">Model <span className="add-vehicle-required">*</span></label>
                                    <input
                                        type="text"
                                        id="model"
                                        name="model"
                                        placeholder="e.g., Camry"
                                        value={formData.model}
                                        onChange={handleChange}
                                        required
                                        disabled={loading || isSubmitting}
                                    />
                                </div>
                            </div>

                            <div className="add-vehicle-form-row">
                                <div className="add-vehicle-form-group">
                                    <label htmlFor="year">Year <span className="add-vehicle-required">*</span></label>
                                    <input
                                        type="number"
                                        id="year"
                                        name="year"
                                        placeholder="2020"
                                        min="1900"
                                        max={new Date().getFullYear()}
                                        value={formData.year}
                                        onChange={handleChange}
                                        required
                                        disabled={loading || isSubmitting}
                                    />
                                </div>
                                <div className="add-vehicle-form-group">
                                    <label htmlFor="color">Color <span className="add-vehicle-required">*</span></label>
                                    <input
                                        type="text"
                                        id="color"
                                        name="color"
                                        placeholder="e.g., White"
                                        value={formData.color}
                                        onChange={handleChange}
                                        required
                                        disabled={loading || isSubmitting}
                                    />
                                </div>
                            </div>

                            <div className="add-vehicle-form-row">
                                <div className="add-vehicle-form-group">
                                    <label htmlFor="licensePlate">License Plate <span className="add-vehicle-required">*</span></label>
                                    <input
                                        type="text"
                                        id="licensePlate"
                                        name="licensePlate"
                                        placeholder="e.g., ABC-1234"
                                        value={formData.licensePlate}
                                        onChange={handleChange}
                                        required
                                        disabled={loading || isSubmitting}
                                    />
                                </div>
                                <div className="add-vehicle-form-group">
                                    <label htmlFor="mileage">Mileage (km) <span className="add-vehicle-required">*</span></label>
                                    <input
                                        type="number"
                                        id="mileage"
                                        name="mileage"
                                        placeholder="50000"
                                        min="0"
                                        value={formData.mileage}
                                        onChange={handleChange}
                                        required
                                        disabled={loading || isSubmitting}
                                    />
                                </div>
                            </div>
                            <div className="add-vehicle-form-group">
                                <label htmlFor="description">Description <span className="add-vehicle-required">*</span></label>
                                <textarea
                                    id="description"
                                    name="description"
                                    placeholder="Describe the vehicle features and benefits..."
                                    rows="4"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                    disabled={loading || isSubmitting}
                                ></textarea>
                            </div>

                            <div className="add-vehicle-form-row">
                                <div className="add-vehicle-form-group">
                                    <label htmlFor="pricePerDay">Price per Day (LKR) <span className="add-vehicle-required">*</span></label>
                                    <input
                                        type="number"
                                        id="pricePerDay"
                                        name="pricePerDay"
                                        placeholder="150"
                                        value={formData.pricePerDay}
                                        onChange={handleChange}
                                        required
                                        disabled={loading || isSubmitting}
                                    />
                                </div>
                                <div className="add-vehicle-form-group">
                                    <label htmlFor="image">Vehicle Image {isEditMode ? '' : <span className="add-vehicle-required">*</span>}</label>

                                    {imagePreviewUrl ? (
                                        <div className="image-preview-container">
                                            <img
                                                src={imagePreviewUrl}
                                                alt="Vehicle Preview"
                                                className="image-preview"
                                            />
                                            {(!isEditMode || (isEditMode && imagePreviewUrl.startsWith('blob:'))) && (
                                                <button
                                                    type="button"
                                                    className="image-remove-btn"
                                                    onClick={handleRemoveImage}
                                                    title="Remove image"
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="image-preview-placeholder">
                                            {isEditMode ? 'No image - will keep current image' : 'No image selected'}
                                        </div>
                                    )}

                                    <input
                                        type="file"
                                        id="image"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        required={!isEditMode}
                                        disabled={loading || isSubmitting}
                                    />
                                    {isEditMode && <small className="form-help">Leave empty to keep current image, or select new image to replace</small>}
                                </div>
                            </div>
                        </div>

                        <div className="add-vehicle-form-section">
                            <h2>Vehicle Specifications</h2>
                            <div className="add-vehicle-form-row">
                                <div className="add-vehicle-form-group">
                                    <label htmlFor="seats">Seating Capacity <span className="add-vehicle-required">*</span></label>
                                    <input
                                        type="number"
                                        id="seats"
                                        name="seats"
                                        placeholder="5"
                                        value={formData.seats}
                                        onChange={handleChange}
                                        required
                                        disabled={loading || isSubmitting}
                                    />
                                </div>
                                <div className="add-vehicle-form-group">
                                    <label htmlFor="bags">Luggage Capacity <span className="add-vehicle-required">*</span></label>
                                    <input
                                        type="number"
                                        id="bags"
                                        name="bags"
                                        placeholder="3"
                                        value={formData.bags}
                                        onChange={handleChange}
                                        required
                                        disabled={loading || isSubmitting}
                                    />
                                </div>
                            </div>

                            <div className="add-vehicle-form-row">
                                <div className="add-vehicle-form-group">
                                    <label htmlFor="transmission">Transmission <span className="add-vehicle-required">*</span></label>
                                    <select
                                        id="transmission"
                                        name="transmission"
                                        value={formData.transmission}
                                        onChange={handleChange}
                                        required
                                        disabled={loading || isSubmitting}
                                    >
                                        <option value="">Select Transmission</option>
                                        <option value="Auto">Auto</option>
                                        <option value="Manual">Manual</option>
                                    </select>
                                </div>
                                <div className="add-vehicle-form-group">
                                    <label htmlFor="fuelType">Fuel Type <span className="add-vehicle-required">*</span></label>
                                    <select
                                        id="fuelType"
                                        name="fuelType"
                                        value={formData.fuelType}
                                        onChange={handleChange}
                                        required
                                        disabled={loading || isSubmitting}
                                    >
                                        <option value="">Select Fuel Type</option>
                                        <option value="Gasoline">Gasoline</option>
                                        <option value="Diesel">Diesel</option>
                                        <option value="Electric">Electric</option>
                                        <option value="Hybrid">Hybrid</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="add-vehicle-form-section">
                            <h2>Location Information</h2>
                            <div className="add-vehicle-form-group">
                                <label htmlFor="location">Address <span className="add-vehicle-required">*</span></label>
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    placeholder="e.g., Colombo, Sri Lanka"
                                    value={formData.location}
                                    onChange={handleChange}
                                    required
                                    disabled={loading || isSubmitting}
                                />
                            </div>

                            <div className="add-vehicle-form-group mt-16">
                                <label>Pickup Location <span className="add-vehicle-required">*</span></label>
                                <div className="map-wrapper">
                                    <div ref={mapHostRef} className="map-container" />
                                </div>
                                {coords && (
                                    <p style={{ marginTop: 8, color: 'var(--color-gray)' }}>
                                        Selected: {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                                        {' '}
                                        <a className="btn-link" target="_blank" rel="noreferrer" href={`https://www.google.com/maps?q=${coords.lat},${coords.lng}`}>
                                            View on Maps
                                        </a>
                                    </p>
                                )}
                                {!coords && <small>Click and drag the marker on the map to select the pickup location.</small>}
                            </div>
                        </div>

                        <div className="add-vehicle-form-section">
                            <h2>Vehicle Features</h2>
                            <div className="add-vehicle-features-grid">
                                <label className="add-vehicle-feature-item">
                                    <input
                                        type="checkbox"
                                        name="features.gpsNavigation"
                                        checked={formData.features.gpsNavigation}
                                        onChange={handleChange}
                                        disabled={loading || isSubmitting}
                                    />
                                    <span>GPS Navigation</span>
                                </label>
                                <label className="add-vehicle-feature-item">
                                    <input
                                        type="checkbox"
                                        name="features.bluetooth"
                                        checked={formData.features.bluetooth}
                                        onChange={handleChange}
                                        disabled={loading || isSubmitting}
                                    />
                                    <span>Bluetooth</span>
                                </label>
                                <label className="add-vehicle-feature-item">
                                    <input
                                        type="checkbox"
                                        name="features.backupCamera"
                                        checked={formData.features.backupCamera}
                                        onChange={handleChange}
                                        disabled={loading || isSubmitting}
                                    />
                                    <span>Backup Camera</span>
                                </label>
                                <label className="add-vehicle-feature-item">
                                    <input
                                        type="checkbox"
                                        name="features.leatherSeats"
                                        checked={formData.features.leatherSeats}
                                        onChange={handleChange}
                                        disabled={loading || isSubmitting}
                                    />
                                    <span>Leather Seats</span>
                                </label>
                                <label className="add-vehicle-feature-item">
                                    <input
                                        type="checkbox"
                                        name="features.heatedSeats"
                                        checked={formData.features.heatedSeats}
                                        onChange={handleChange}
                                        disabled={loading || isSubmitting}
                                    />
                                    <span>Heated Seats</span>
                                </label>
                                <label className="add-vehicle-feature-item">
                                    <input
                                        type="checkbox"
                                        name="features.sunroof"
                                        checked={formData.features.sunroof}
                                        onChange={handleChange}
                                        disabled={loading || isSubmitting}
                                    />
                                    <span>Sunroof</span>
                                </label>
                                <label className="add-vehicle-feature-item">
                                    <input
                                        type="checkbox"
                                        name="features.usbPorts"
                                        checked={formData.features.usbPorts}
                                        onChange={handleChange}
                                        disabled={loading || isSubmitting}
                                    />
                                    <span>USB Ports</span>
                                </label>
                                <label className="add-vehicle-feature-item">
                                    <input
                                        type="checkbox"
                                        name="features.androidAuto"
                                        checked={formData.features.androidAuto}
                                        onChange={handleChange}
                                        disabled={loading || isSubmitting}
                                    />
                                    <span>Android Auto</span>
                                </label>
                                <label className="add-vehicle-feature-item">
                                    <input
                                        type="checkbox"
                                        name="features.appleCarPlay"
                                        checked={formData.features.appleCarPlay}
                                        onChange={handleChange}
                                        disabled={loading || isSubmitting}
                                    />
                                    <span>Apple CarPlay</span>
                                </label>
                                <label className="add-vehicle-feature-item">
                                    <input
                                        type="checkbox"
                                        name="features.cruiseControl"
                                        checked={formData.features.cruiseControl}
                                        onChange={handleChange}
                                        disabled={loading || isSubmitting}
                                    />
                                    <span>Cruise Control</span>
                                </label>
                                <label className="add-vehicle-feature-item">
                                    <input
                                        type="checkbox"
                                        name="features.parkingSensors"
                                        checked={formData.features.parkingSensors}
                                        onChange={handleChange}
                                        disabled={loading || isSubmitting}
                                    />
                                    <span>Parking Sensors</span>
                                </label>
                                <label className="add-vehicle-feature-item">
                                    <input
                                        type="checkbox"
                                        name="features.childSeat"
                                        checked={formData.features.childSeat}
                                        onChange={handleChange}
                                        disabled={loading || isSubmitting}
                                    />
                                    <span>Child Seat</span>
                                </label>
                                <label className="add-vehicle-feature-item">
                                    <input
                                        type="checkbox"
                                        name="features.airConditioning"
                                        checked={formData.features.airConditioning}
                                        onChange={handleChange}
                                        disabled={loading || isSubmitting}
                                    />
                                    <span>Air Conditioning</span>
                                </label>
                            </div>
                        </div>

                        <div className="add-vehicle-form-section">
                            <h2>Availability</h2>
                            <div className="add-vehicle-form-group">
                                <label className="add-vehicle-checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="available"
                                        checked={formData.available}
                                        onChange={handleChange}
                                        disabled={loading || isSubmitting}
                                    />
                                    <span>Vehicle is available for rental</span>
                                </label>
                            </div>
                        </div>

                        <div className="add-vehicle-form-actions">
                            <button type="submit" className="add-vehicle-submit-btn" disabled={isSubmitting || loading}>
                                {isSubmitting ? (isEditMode ? 'Updating Vehicle...' : 'Adding Vehicle...') : (isEditMode ? 'Update Vehicle' : 'Add Vehicle')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}