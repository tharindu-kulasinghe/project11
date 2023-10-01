import React, { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import './payment.css'

export default function PaymentCancel() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    useEffect(() => {
        const handlePaymentCancel = () => {
            try {
                const orderId = searchParams.get('orderId')
                const type = searchParams.get('type') // 'booking' or 'device'

                if (orderId) {
                    // Clean up stored data based on type
                    const storageKey = type === 'device' ? `ipay_device_purchase_${orderId}` : `ipay_booking_${orderId}`
                    localStorage.removeItem(storageKey)
                }

                toast.info(`${type === 'device' ? 'Device purchase' : 'Booking'} was cancelled`)

                // Redirect back to appropriate page after a short delay
                setTimeout(() => {
                    navigate(type === 'device' ? '/tracking-device' : '/vehicle-details')
                }, 3000)

            } catch (error) {
                console.error('Payment cancel handling error:', error)
                toast.error('There was an issue processing the cancellation')

                setTimeout(() => {
                    navigate('/')
                }, 3000)
            }
        }

        handlePaymentCancel()
    }, [searchParams, navigate])

    return (
        <div className="payment-result mt-64">
            <div className="container">
                <div className="payment-result-container">
                    <div className="payment-result-icon">
                        <i className="ri-information-fill cancel"></i>
                    </div>

                    <h1>Payment Cancelled</h1>
                    <p>Your payment was cancelled</p>

                    <div className="payment-cancel">
                        <p>The booking process was not completed.</p>
                        <p>You will be redirected back shortly.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
