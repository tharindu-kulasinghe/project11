import React, { useEffect, useState } from 'react'
import './history-card.css'

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000'

export default function HistoryCard({ rental }) {
    const [showRatingForm, setShowRatingForm] = useState(false)
    const [newRating, setNewRating] = useState(0)
    const [newReview, setNewReview] = useState('')
    const [existingReview, setExistingReview] = useState(null)

    const vehicle = rental?.vehicleId || {}

    useEffect(() => {
        const loadReview = async () => {
            try {
                const token = localStorage.getItem('token')
                const headers = { 'Content-Type': 'application/json' }
                if (token) headers['Authorization'] = `Bearer ${token}`
                const res = await fetch(`${API_BASE}/api/reviews?bookingId=${rental._id}`, { headers })
                if (res.ok) {
                    const data = await res.json()
                    // Assume one review per booking by user
                    setExistingReview(Array.isArray(data) ? data.find(r => r?.userId?._id) || data[0] : null)
                }
            } catch { /* ignore */ }
        }
        if (rental?._id) loadReview()
    }, [rental?._id])

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const getStatusBadge = (status) => {
        switch (String(status || '').toLowerCase()) {
            case 'completed':
                return <span className="history-status-badge completed">Completed</span>
            case 'cancelled':
                return <span className="history-status-badge cancelled">Cancelled</span>
            case 'active':
                return <span className="history-status-badge ongoing">Active</span>
            case 'confirmed':
                return <span className="history-status-badge ongoing">Confirmed</span>
            case 'pending':
                return <span className="history-status-badge unknown">Pending</span>
            default: {
                // compute ongoing based on dates for any unknown status
                const today = new Date(); today.setHours(0,0,0,0)
                const s = new Date(rental.startDate); s.setHours(0,0,0,0)
                const e = new Date(rental.endDate); e.setHours(23,59,59,999)
                const ongoing = today >= s && today <= e
                return <span className={`history-status-badge ${ongoing ? 'ongoing' : 'unknown'}`}>{ongoing ? 'Ongoing' : 'Unknown'}</span>
            }
        }
    }

    const submitReview = async () => {
        if (newRating <= 0) return
        try {
            const token = localStorage.getItem('token')
            const headers = { 'Content-Type': 'application/json' }
            if (token) headers['Authorization'] = `Bearer ${token}`
            const res = await fetch(`${API_BASE}/api/reviews`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ bookingId: rental._id, rating: newRating, comment: newReview })
            })
            if (res.ok) {
                const created = await res.json()
                setExistingReview(created)
                setShowRatingForm(false)
                setNewRating(0)
                setNewReview('')
            } else {
                const err = await res.json().catch(() => ({}))
                alert(err.message || 'Failed to submit review')
            }
        } catch (e) {
            alert('Failed to submit review')
        }
    }

    const renderStars = (rating, interactive = false, onClick = null) => (
        <div className="history-rating">
            {[...Array(5)].map((_, index) => (
                <i
                    key={index}
                    className={`ri-star-${index < rating ? 'fill' : 'line'} ${interactive ? 'interactive' : ''}`}
                    onClick={interactive ? () => onClick(index + 1) : undefined}
                    style={interactive ? { cursor: 'pointer' } : undefined}
                ></i>
            ))}
            {rating > 0 && <span>({rating})</span>}
        </div>
    )

    return (
        <div className="history-card">
            <div className="history-card-image">
                <img src={vehicle?.image ? `${API_BASE}${vehicle.image}` : '/assets/icons/eco-car.svg'} alt={vehicle?.title || 'Vehicle'} />
                <div className="history-card-overlay">
                    {getStatusBadge(rental.status)}
                </div>
            </div>

            <div className="history-card-content">
                <div className="history-card-header">
                    <h3>{vehicle?.title || 'Vehicle'}</h3>
                    <p className="history-category">{vehicle?.fuelType || 'Standard'}</p>
                </div>

                <div className="history-card-details">
                    {/* <div className="history-detail-item">
                        <i className="ri-map-pin-line"></i>
                        <div>
                            <p>Pickup Location</p>
                            <p>{rental?.pickupAddress || (vehicle?.pickupAddress) || '—'}</p>
                        </div>
                    </div> */}

                    <div className="history-detail-item">
                        <i className="ri-calendar-line"></i>
                        <div>
                            <p>Rental Period</p>
                            <p>{formatDate(rental.startDate)} - {formatDate(rental.endDate)}</p>
                        </div>
                    </div>

                    <div className="history-detail-item">
                        <i className="ri-money-dollar-circle-line"></i>
                        <div>
                            <p>Total Cost</p>
                            <p>LKR {Number(rental.totalPrice || 0).toLocaleString()}</p>
                        </div>
                    </div>

                    {existingReview ? (
                        <div className="history-detail-item">
                            <i className="ri-star-line"></i>
                            <div>
                                <p>Your Rating</p>
                                {renderStars(existingReview.rating)}
                            </div>
                        </div>
                    ) : String(rental.status || '').toLowerCase() === 'completed' && (
                        <div className="history-detail-item">
                            <i className="ri-star-line"></i>
                            <div>
                                <p>Add Rating</p>
                                {!showRatingForm ? (
                                    <button className="history-add-rating-btn" onClick={() => setShowRatingForm(true)}>
                                        Add Rating
                                    </button>
                                ) : (
                                    <div className="history-rating-form">
                                        <div className="history-rating-input">
                                            {renderStars(newRating, true, setNewRating)}
                                        </div>
                                        <textarea
                                            placeholder="Add a review (optional)"
                                            value={newReview}
                                            onChange={(e) => setNewReview(e.target.value)}
                                            rows="2"
                                        />
                                        <div className="history-rating-actions">
                                            <button onClick={submitReview} className="history-submit-rating">
                                                Submit
                                            </button>
                                            <button onClick={() => setShowRatingForm(false)} className="history-cancel-rating">
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {existingReview?.comment && (
                    <div className="history-card-review">
                        <p>"{existingReview.comment}"</p>
                    </div>
                )}
            </div>
        </div>
    )
}
