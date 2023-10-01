import React, { useState, useEffect } from 'react'
import './wishlist.css'
import Title from '../../components/title/Title'
import VehicleList from '../../components/vehicle-list/VehicleList'

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000'

function decodeToken(token) {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload))
    return decoded
  } catch (e) {
    return null
  }
}

export default function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUserId, setCurrentUserId] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      const decoded = decodeToken(token)
      if (decoded) {
        setIsAuthenticated(true)
        setCurrentUserId(decoded.userId)
      }
    }

    const fetchWishlist = async () => {
      try {
        setLoading(true)
        setError('')

        if (!token) {
          setIsAuthenticated(false)
          setError('Please login to view your wishlist')
          return
        }

        const decoded = decodeToken(token)
        if (!decoded) {
          setIsAuthenticated(false)
          setError('Invalid authentication. Please login again.')
          localStorage.removeItem('token')
          return
        }

        setIsAuthenticated(true)

        const response = await fetch(`${API_BASE}/api/wishlist`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          if (response.status === 401) {
            setIsAuthenticated(false)
            setError('Authentication expired. Please login again.')
            localStorage.removeItem('token')
            return
          }
          throw new Error('Failed to fetch wishlist')
        }

        const data = await response.json()
        setWishlistItems(data)
      } catch (error) {
        console.error('Error fetching wishlist:', error)
        setError(error.message || 'Failed to load wishlist. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchWishlist()
  }, [])

  const handleWishlistRemove = (vehicleId) => {
    setWishlistItems(prev => prev.filter(item => String(item?.vehicleId?._id || item?.vehicleId) !== String(vehicleId)))
  }

  if (!isAuthenticated) {
    return (
      <div className="wishlist mt-64">
        <div className="container">
          <div className="wishlist-container">
            <Title title="My Wishlist" subtitle="Save your favorite vehicles for quick access" justifyContent="center" />
            <div className="wishlist-content">
              <div className="auth-required">
                <div className="auth-message">
                  <i className="ri-heart-line"></i>
                  <h3>Login Required</h3>
                  <p>You need to be logged in to view your wishlist</p>
                  <a href="/login" className="btn-primary">Login Now</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="wishlist mt-64">
      <div className="container">
        <div className="wishlist-container">
          <Title title="My Wishlist" subtitle={`You have ${wishlistItems.length} favorite ${wishlistItems.length === 1 ? 'vehicle' : 'vehicles'}`} justifyContent="center" />
          <div className="wishlist-content">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading your favorite vehicles...</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <i className="ri-error-warning-line"></i>
                <h3>Oops! Something went wrong</h3>
                <p>{error}</p>
                <button onClick={() => window.location.reload()} className="btn-primary">
                  Try Again
                </button>
              </div>
            ) : wishlistItems.length === 0 ? (
              <div className="empty-wishlist">
                <div className="empty-message">
                  <i className="ri-heart-line"></i>
                  <h3>Your wishlist is empty</h3>
                  <p>Start exploring vehicles and add them to your wishlist for quick access</p>
                  <a href="/vehicles" className="btn-primary">Browse Vehicles</a>
                </div>
              </div>
            ) : (
              <VehicleList
                data={wishlistItems.map(item => ({
                  ...item.vehicleId,
                  favorite: true,
                  inWishlist: true,
                  isOwnVehicle: currentUserId && (String(item.vehicleId.userId?._id || item.vehicleId.userId) === String(currentUserId)),
                  userId: item.vehicleId.userId
                }))}
                currentUserId={currentUserId}
                onWishlistRemove={handleWishlistRemove}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
