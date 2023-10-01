import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import './payment.css'

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000'

export default function PaymentSuccess() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const [processing, setProcessing] = useState(true)
    const [status, setStatus] = useState('Processing payment...')

    useEffect(() => {
        const handlePaymentSuccess = async () => {
            try {
                const orderId = searchParams.get('orderId')
                const type = searchParams.get('type') // 'booking' or 'device'

                if (!orderId) {
                    throw new Error('Order ID not found')
                }

                // Get stored data based on type
                const storageKey = type === 'device' ? `ipay_device_purchase_${orderId}` : `ipay_booking_${orderId}`
                const storedDataStr = localStorage.getItem(storageKey)

                if (!storedDataStr) {
                    throw new Error(`${type === 'device' ? 'Purchase' : 'Booking'} data not found`)
                }

                const data = JSON.parse(storedDataStr)

                // Get authentication token
                const token = localStorage.getItem('token')
                if (!token) {
                    throw new Error('Authentication required')
                }

                setStatus(`Creating ${type === 'device' ? 'device purchase' : 'booking'}...`)

                let response, result
                if (type === 'device') {
                    // Create device purchase
                    response = await fetch(`${API_BASE}/api/tracking-devices`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(data)
                    })
                } else {
                    // Create booking
                    response = await fetch(`${API_BASE}/api/bookings`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(data)
                    })
                }

                if (!response.ok) {
                    const error = await response.json()
                    throw new Error(error.message || `Failed to create ${type === 'device' ? 'device purchase' : 'booking'}`)
                }

                result = await response.json()

                // Clean up stored data
                localStorage.removeItem(storageKey)

                setStatus(`Payment successful! ${type === 'device' ? 'Device purchase' : 'Booking'} created.`)
                toast.success(`${type === 'device' ? 'Device purchase' : 'Booking'} created successfully! ${type === 'booking' ? `Booking ID: ${result._id}` : ''}`)

                // Redirect to appropriate page after a short delay
                setTimeout(() => {
                    navigate(type === 'device' ? '/my-vehicles' : '/rental-history')
                }, 2000)

            } catch (error) {
                console.error('Payment processing error:', error)
                setStatus('Payment processing failed')
                toast.error(error.message || 'Failed to process payment')

                setTimeout(() => {
                    navigate('/vehicle-details')
                }, 3000)
            } finally {
                setProcessing(false)
            }
        }

        handlePaymentSuccess()
    }, [searchParams, navigate])

    return (
        <div className="payment-result mt-64">
            <div className="container">
                <div className="payment-result-container">
                    <div className="payment-result-icon">
                        {processing ? (
                            <div className="loading-spinner"></div>
                        ) : status.includes('successful') ? (
                            <i className="ri-check-circle-fill success"></i>
                        ) : (
                            <i className="ri-error-warning-fill error"></i>
                        )}
                    </div>

                    <h1>Payment Result</h1>
                    <p>{status}</p>

                    {processing && (
                        <div className="payment-processing">
                            <p>Please wait while we process your booking...</p>
                        </div>
                    )}

                    {!processing && status.includes('successful') && (
                        <div className="payment-success">
                            <p>Your booking has been confirmed!</p>
                            <p>You will be redirected to your rental history shortly.</p>
                        </div>
                    )}

                    {!processing && !status.includes('successful') && (
                        <div className="payment-error">
                            <p>There was an issue processing your payment.</p>
                            <p>You will be redirected back shortly.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
