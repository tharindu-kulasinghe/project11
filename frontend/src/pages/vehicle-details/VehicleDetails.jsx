import React, { useState, useEffect } from 'react'
import './vehicle-details.css'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import Review from '../../components/review/Review'
import DatePicker from '../../components/date-picker/DatePicker'
import '../../components/date-picker/date-picker.css'

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000'

export default (function VehicleDetails() {
    const { slug, id } = useParams()
    const navigate = useNavigate()
    const vehicleParam = slug || id
    const isSlug = !!slug && slug !== 'undefined'

    // State for vehicle data
    const [vehicle, setVehicle] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // State for booking form
    const [pickupDate, setPickupDate] = useState('')
    const [dropoffDate, setDropoffDate] = useState('')
    const [pickupTime, setPickupTime] = useState(undefined)
    const [paymentMethod, setPaymentMethod] = useState('')
    const [selectedAddons, setSelectedAddons] = useState({})

    // State for booking process
    const [bookingLoading, setBookingLoading] = useState(false)

    // State for vehicle reviews
    const [vehicleReviews, setVehicleReviews] = useState([])

    // State for booked dates
    const [bookedDates, setBookedDates] = useState([])

    // State for today's availability
    const [availableToday, setAvailableToday] = useState(true)

    // Fetch vehicle data and booked dates from backend
    useEffect(() => {
        const fetchVehicleAndBookings = async () => {
            try {
                setLoading(true)
                setError('')

                // Fetch vehicle
                let vehicleUrl = `${API_BASE}/api/vehicles`
                if (isSlug) {
                    vehicleUrl += `/slug/${vehicleParam}`
                } else {
                    vehicleUrl += `/${vehicleParam}`
                }

                // Fetch bookings for this vehicle
                const bookingsUrl = `${API_BASE}/api/bookings?vehicleId=${vehicleParam}`
                
                const token = localStorage.getItem('token')
                const headers = {
                    'Content-Type': 'application/json'
                }

                if (token) headers['Authorization'] = `Bearer ${token}`

                const [vehicleRes, bookingsRes] = await Promise.all([
                    fetch(vehicleUrl, { method: 'GET', headers }),
                    fetch(bookingsUrl, { method: 'GET', headers })
                ])

                if (!vehicleRes.ok) throw new Error('Failed to fetch vehicle details')
                const vehicleData = await vehicleRes.json()
                setVehicle(vehicleData)

                if (bookingsRes.ok) {
                    const bookingsData = await bookingsRes.json()
                    setBookedDates(bookingsData.map(b => ({
                        startDate: b.startDate,
                        endDate: b.endDate
                    })))
                }
            } catch (error) {
                setError(error.message || 'Failed to load vehicle details')
            } finally {
                setLoading(false)
            }
        }

        fetchVehicleAndBookings()
    }, [vehicleParam, isSlug])

    // Fetch reviews for this vehicle once vehicle is loaded
    useEffect(() => {
        const fetchReviews = async () => {
            if (!vehicle?._id) return
            try {
                const token = localStorage.getItem('token')
                const headers = { 'Content-Type': 'application/json' }
                if (token) headers['Authorization'] = `Bearer ${token}`
                const res = await fetch(`${API_BASE}/api/reviews?vehicleId=${vehicle._id}`, { headers })
                if (res.ok) {
                    const reviews = await res.json()
                    setVehicleReviews(Array.isArray(reviews) ? reviews : [])
                } else {
                    setVehicleReviews([])
                }
            } catch {
                setVehicleReviews([])
            }
        }
        fetchReviews()
    }, [vehicle?._id])

    // Check today's availability when vehicle loads
    useEffect(() => {
        if (!vehicle?._id) return
        
        const checkAvailability = async () => {
            try {
                const today = new Date().toISOString().split('T')[0]
                const url = `${API_BASE}/api/bookings?vehicleId=${vehicle._id}&startDate=${today}&endDate=${today}`
                
                const token = localStorage.getItem('token')
                const headers = {
                    'Content-Type': 'application/json'
                }
                if (token) headers['Authorization'] = `Bearer ${token}`
                
                const res = await fetch(url, { headers })
                if (res.ok) {
                    const bookings = await res.json()
                    setAvailableToday(bookings.length === 0)
                }
            } catch (error) {
                console.error('Availability check failed:', error)
            }
        }
        
        checkAvailability()
    }, [vehicle?._id])

    if (loading) {
        return (
            <div className='vehicle-details mt-64'>
                <div className="container">
                    <div className="vehicle-details-container">
                        <p>Loading...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className='vehicle-details mt-64'>
                <div className="container">
                    <div className="vehicle-details-container">
                        <p>{error}</p>
                    </div>
                </div>
            </div>
        )
    }

    if (!vehicle) {
        return (
            <div className='vehicle-details mt-64'>
                <div className="container">
                    <div className="vehicle-details-container">
                        <p>Vehicle not found</p>
                    </div>
                </div>
            </div>
        )
    }

    // reviews come from API via state

    // Get add-ons for this vehicle (with safety check)
    const vehicleAddons = Array.isArray(vehicle.addons) ? vehicle.addons : []

    // Calculate days and validate against booked dates
    const calculateDays = () => {
        if (!pickupDate || !dropoffDate) return 0
        
        const pickup = new Date(pickupDate)
        const dropoff = new Date(dropoffDate)
        
        // Check if dates overlap with any booked range
        const isBooked = bookedDates.some(({startDate, endDate}) => {
            const bookedStart = new Date(startDate)
            const bookedEnd = new Date(endDate)
            return (pickup <= bookedEnd && dropoff >= bookedStart)
        })
        
        if (isBooked) return 0
        
        const daysDiff = Math.ceil((dropoff - pickup) / (1000 * 3600 * 24))
        return daysDiff > 0 ? daysDiff : 0
    }

    const days = calculateDays()
    const basePrice = days * vehicle.pricePerDay

    // Calculate add-ons price (with safety checks)
    const addonsPrice = vehicleAddons.reduce((total, addon) => {
        if (!addon || typeof addon.pricePerDay !== 'number') return total
        return total + (selectedAddons[addon.id] ? addon.pricePerDay : 0)
    }, 0)

    const totalPrice = basePrice + (addonsPrice * days)

    // Calculate review statistics from fetched reviews
    const reviewCount = vehicleReviews.length
    const averageRating = reviewCount > 0 
        ? vehicleReviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviewCount 
        : vehicle.averageRating || 4.9

    const handleCashBooking = async (bookingData) => {
        console.log('Processing cash booking:', bookingData)
        return bookingData
    }

    const handleCardBooking = async (bookingData) => {
        try {
            // Get current user information
            const token = localStorage.getItem('token')
            const userResponse = await fetch(`${API_BASE}/api/users/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (!userResponse.ok) {
                throw new Error('Unable to get user information')
            }

            const user = await userResponse.json()

            // Generate unique order ID
            const orderId = `BK${Date.now()}${Math.random().toString(36).substr(2, 9)}`

            // iPay configuration
            const ipayConfig = {
                merchantWebToken: 'eyJhbGciOiJIUzUxMiJ9.eyJtaWQiOiIwMDAwMDMwNSJ9.3_XOmqpXcg_8YYUEQNBl3N6N8oCTRI9x_BZ0-g6_pHUhJ1Iv9bR7WnmqKQ6iPyn-U1wuQwm_N6BfotCpnkH_3A',
                orderId: orderId,
                orderDescription: `Vehicle booking: ${vehicle.title}`,
                returnUrl: `${window.location.origin}/payment/success?orderId=${orderId}`,
                cancelUrl: `${window.location.origin}/payment/cancel?orderId=${orderId}`,
                totalAmount: bookingData.totalPrice.toString(),
                customerName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email.split('@')[0],
                customerPhone: user.phone || '0700000000',
                customerEmail: user.email
            }

            // Store booking data for later processing
            localStorage.setItem(`ipay_booking_${orderId}`, JSON.stringify(bookingData))

            // Create and submit iPay form
            const form = document.createElement('form')
            form.method = 'POST'
            form.action = 'https://sandbox.ipay.lk/ipg/checkout'
            form.style.display = 'none'

            // Add form fields
            Object.entries(ipayConfig).forEach(([key, value]) => {
                const input = document.createElement('input')
                input.type = 'hidden'
                input.name = key
                input.value = value
                form.appendChild(input)
            })

            // Add form to body and submit
            document.body.appendChild(form)
            form.submit()

            // Note: This will redirect to iPay, so the function won't return normally
            // The success/cancel will be handled by the return/cancel URLs

        } catch (error) {
            console.error('iPay integration error:', error)
            throw new Error('Failed to initiate card payment')
        }
    }

    // Date picker props - simplified
    const datePickerProps = {
        min: new Date().toISOString().split('T')[0],
        disabledDates: bookedDates
    }

    const handleBookingSubmit = async () => {
        if (!pickupDate || !dropoffDate || !pickupTime || !paymentMethod) {
            toast.error('Please fill in all required fields')
            return
        }

        try {
            setBookingLoading(true)

            const token = localStorage.getItem('token')
            if (!token) {
                toast.error('Please login to book a vehicle')
                return
            }

            const bookingData = {
                vehicleId: vehicle._id,
                startDate: pickupDate,
                endDate: dropoffDate,
                totalPrice: totalPrice,
                paymentMethod: paymentMethod,
                pickupLocation: {
                    type: 'Point',
                    coordinates: [80.7718, 7.8731] 
                },
                dropoffLocation: {
                    type: 'Point',
                    coordinates: [80.7718, 7.8731] 
                },
                deviceId: 'web-' + Date.now(), 
                addons: Object.keys(selectedAddons).filter(id => selectedAddons[id]).map(id => {
                    const addon = vehicleAddons.find(a => a.id === id)
                    return addon ? { id: addon.id, name: addon.name, pricePerDay: addon.pricePerDay } : null
                }).filter(Boolean),
                notes: `Pickup time: ${pickupTime}${selectedAddons && Object.keys(selectedAddons).length > 0 ? '. Add-ons: ' + Object.keys(selectedAddons).filter(id => selectedAddons[id]).map(id => {
                    const addon = vehicleAddons.find(a => a.id === id)
                    return addon ? addon.name : id
                }).join(', ') : ''}`
            }

            let processedBookingData
            if (paymentMethod === 'cash') {
                processedBookingData = await handleCashBooking(bookingData)
            } else if (paymentMethod === 'card') {
                processedBookingData = await handleCardBooking(bookingData)
            } else {
                toast.error('Invalid payment method selected')
                return
            }

            const response = await fetch(`${API_BASE}/api/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(processedBookingData)
            })

            if (response.ok) {
                const result = await response.json()
                toast.success(`Booking created successfully! Booking ID: ${result._id}`)
                navigate('/rental-history')
            } else {
                const error = await response.json()
                toast.error(error.message || 'Booking failed')
            }
        } catch (error) {
            console.error('Booking error:', error)
            toast.error('Failed to create booking. Please try again.')
        } finally {
            setBookingLoading(false)
        }
    }

    return (
        <div className='vehicle-details mt-64'>
            <div className="container">
                <div className="vehicle-details-container">
                    <div className="vehicle-details-body">
                        <div className="vehicle-details-image">
                            <img src={vehicle.image ? `${API_BASE}${vehicle.image}` : '/assets/icons/eco-car.svg'} alt={vehicle.title} />
                            <div className="vehicle-details-image-status">
                                <span className={availableToday ? 'available' : 'unavailable'}>
                                    {availableToday ? 'Available Today' : 'Booked Today'}
                                </span>
                            </div>
                        </div>
                        <div className="vehicle-details-1">
                            <div className="vehicle-deatils-1-item-1">
                                <div className='vehicle-details-1-name'>
                                    <h1>{vehicle.title}</h1>
                                    <p>Premium {vehicle.vehicleType?.name || 'Vehicle'} Vehicle</p>
                                </div>
                                <div className="vehicle-details-rate">
                                    <ul>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <li key={star} className={star <= Math.floor(averageRating) ? 'active' : ''}>
                                                <i className='ri-star-fill'></i>
                                            </li>
                                        ))}
                                    </ul>
                                    <p>({averageRating.toFixed(1)}) · {reviewCount} reviews</p>
                                </div>
                            </div>
                            <div className="vehicle-details-1-item-2">
                                <div className="vehicle-details-price">
                                    <h1>LKR {vehicle.pricePerDay?.toLocaleString()}</h1>
                                    <p>/per day</p>
                                </div>
                            </div>
                        </div>
                        <div className="vehicle-details-2">
                            <div className="vehicle-details-2-list">
                                <div className="vehicle-details-2-item">
                                    <div className="vehicle-details-2-item-icon">
                                        <img src="/assets/icons/users.svg" alt="" />
                                    </div>
                                    <div className="vehicle-details-2-item-content">
                                        <h1>{vehicle.seats} Passengers</h1>
                                        <p>Seating</p>
                                    </div>
                                </div>
                                <div className="vehicle-details-2-item">
                                    <div className="vehicle-details-2-item-icon">
                                        <img src="/assets/icons/settings.svg" alt="" />
                                    </div>
                                    <div className="vehicle-details-2-item-content">
                                        <h1>{vehicle.transmission === 'Auto' ? 'Automatic' : 'Manual'}</h1>
                                        <p>Transmission</p>
                                    </div>
                                </div>
                                <div className="vehicle-details-2-item">
                                    <div className="vehicle-details-2-item-icon">
                                        <img src="/assets/icons/luggage.svg" alt="" />
                                    </div>
                                    <div className="vehicle-details-2-item-content">
                                        <h1>{vehicle.bags} Large Bags</h1>
                                        <p>Luggage</p>
                                    </div>
                                </div>
                                <div className="vehicle-details-2-item">
                                    <div className="vehicle-details-2-item-icon">
                                        <img src="/assets/icons/gas.svg" alt="" />
                                    </div>
                                    <div className="vehicle-details-2-item-content">
                                        <h1>{vehicle.fuelType}</h1>
                                        <p>Fuel Type</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="vehicle-details-3">
                            <h1>Vehicle Features</h1>
                            <div className="vehicle-details-3-list">
                                {vehicle.features && Object.entries(vehicle.features)
                                    .filter(([key, value]) => value === true)
                                    .map(([key, value]) => (
                                        <div key={key} className="vehicle-details-3-item">
                                            <i className="ri-checkbox-circle-fill"></i>
                                            <p>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</p>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                        <div className="vehicle-details-4">
                            <h1>Vehicle Description</h1>
                            <p>{vehicle.description}</p>
                        </div>
                    </div>
                    <div className="vehicle-details-sidebar">
                        <div className="vehicle-details-sidebar-header">
                            <h1>Book This Vehicle</h1>
                        </div>
                        <div className="vehicle-details-sidebar-1">

                            <div className="vehicle-details-pickup">
                                <p>Pickup Date</p>
                                <DatePicker
                                    value={pickupDate}
                                    onChange={setPickupDate}
                                    placeholder="Select pickup date"
                                    {...datePickerProps}
                                />
                            </div>
                            <div className="vehicle-details-dropoff">
                                <p>Dropoff Date</p>
                                <DatePicker
                                    value={dropoffDate}
                                    onChange={setDropoffDate}
                                    placeholder="Select dropoff date"
                                    {...datePickerProps}
                                    min={pickupDate || datePickerProps.min}
                                />
                            </div>
                            <div className="vehicle-details-payment">
                                <h1>Payment Method</h1>
                                <p>Choose your preferred payment method</p>
                                <div className="payment-methods">
                                    <div className="payment-method-item">
                                        <input
                                            type="radio"
                                            id="payment-cash"
                                            name="paymentMethod"
                                            value="cash"
                                            checked={paymentMethod === 'cash'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <label htmlFor="payment-cash">
                                            <i className="ri-money-dollar-circle-line"></i>
                                            <span>Cash</span>
                                        </label>
                                    </div>
                                    <div className="payment-method-item">
                                        <input
                                            type="radio"
                                            id="payment-card"
                                            name="paymentMethod"
                                            value="card"
                                            checked={paymentMethod === 'card'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <label htmlFor="payment-card">
                                            <i className="ri-bank-card-line"></i>
                                            <span>Card</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="vehicle-details-pickup-t">
                                <p>Pickup Time</p>
                                <input
                                    type="time"
                                    value={pickupTime || ''}
                                    onChange={(e) => setPickupTime(e.target.value)}
                                />
                            </div>
                            {days > 0 && (
                                <>
                                    <hr />


                                </>
                            )}

                            {days > 0 && pickupTime && !paymentMethod && (
                                <div className="payment-method-required">
                                    <p>Please select a payment method to continue</p>
                                </div>
                            )}
                            <>
                                <hr />
                                <div className="vehicle-details-sidebar-2">
                                    <div className="vehicle-details-sidebar-2-list">
                                        <div className="vehicle-details-sidebar-2-item">
                                            <p>{days} days * LKR {vehicle.pricePerDay?.toLocaleString()}</p>
                                            <p>LKR {basePrice.toLocaleString()}</p>
                                        </div>
                                        {addonsPrice > 0 && (
                                            <div className="vehicle-details-sidebar-2-item">
                                                <p>Add-ons ({days} days)</p>
                                                <p>LKR {(addonsPrice * days).toLocaleString()}</p>
                                            </div>
                                        )}
                                        <div className="vehicle-details-sidebar-2-item">
                                            <h1>Total</h1>
                                            <h1>LKR {totalPrice.toLocaleString()}</h1>
                                        </div>
                                    </div>
                                </div>

                                <div className="vehicle-details-sidebar-3">
                                    <button
                                        onClick={handleBookingSubmit}
                                        disabled={bookingLoading || !pickupDate || !dropoffDate || !pickupTime || !paymentMethod || days === 0}
                                    >
                                        {bookingLoading ? 'Creating Booking...' : 'Book Now'}
                                    </button>
                                </div>
                            </>
                        </div>
                    </div>
                </div>
            </div>
            <div className='container'>
                <Review reviews={vehicleReviews} />
            </div>
        </div>
    )
})
