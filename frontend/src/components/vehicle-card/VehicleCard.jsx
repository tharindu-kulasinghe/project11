import React, { useState, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './vehicleCard.css'

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

const VehicleCard = ({
  id,
  slug,
  title,
  pricePerDay,
  image,
  description,
  seats,
  bags,
  transmission,
  available,
  availableToday = true,
  favorite,
  inWishlist: initialWishlistStatus,
  isOwnVehicle = false,
  userId,
  bookLink = '#',
  detailsLink = '#',
  onWishlistRemove
}) => {
  const [isFavorite, setIsFavorite] = useState(!!(favorite || initialWishlistStatus))
  const [wishlistLoading, setWishlistLoading] = useState(false)
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
  }, [])

  useEffect(() => {
    setIsFavorite(!!(favorite || initialWishlistStatus))
  }, [favorite, initialWishlistStatus])

  useEffect(() => {
    if (isAuthenticated && initialWishlistStatus === undefined) {
      const token = localStorage.getItem('token')
      if (token) {
        checkWishlistStatus(token)
      }
    }
  }, [id, isAuthenticated, initialWishlistStatus, isOwnVehicle])

  const checkWishlistStatus = async (token) => {
    try {
      const response = await fetch(`${API_BASE}/api/wishlist/check/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setIsFavorite(data.inWishlist)
      }
    } catch (error) {
      console.error('Error checking wishlist status:', error)
    }
  }

  const toggleFavorite = useCallback(async () => {
    if (!isAuthenticated) {
      window.location.href = '/login'
      return
    }

    if (wishlistLoading) return

    setWishlistLoading(true)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        window.location.href = '/login'
        return
      }

      let response
      const wasFavorite = isFavorite
      if (wasFavorite) {
        response = await fetch(`${API_BASE}/api/wishlist/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      } else {
        response = await fetch(`${API_BASE}/api/wishlist`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ vehicleId: id })
        })
      }

      if (response.ok || response.status === 404) {
        setIsFavorite(!isFavorite)
        if (wasFavorite && typeof onWishlistRemove === 'function') {
          try { onWishlistRemove(id) } catch { }
        }
      } else if (response.status === 401) {
        localStorage.removeItem('token')
        window.location.href = '/login'
      } else {
        const errorData = await response.json()
        console.error('Wishlist error:', errorData.message)
        alert(errorData.message || 'Failed to update wishlist')
      }
    } catch (error) {
      console.error('Error updating wishlist:', error)
      alert('Failed to update wishlist. Please try again.')
    } finally {
      setWishlistLoading(false)
    }
  }, [isFavorite, isAuthenticated, id, wishlistLoading])

  const linkParam = slug && slug !== 'undefined' ? slug : id

  const isVehicleOwner = isOwnVehicle || (userId && currentUserId && userId === currentUserId)

  const currentAvailability = availableToday !== undefined ? availableToday : available

  return (
    <div className="vehicle-card-1">
      <div className='vehicle-card-1-img'>
        <div className='vehicle-card-1-img-button'>
          <span className={currentAvailability ? 'available' : 'unavailable'}>
            {currentAvailability ? 'Available' : 'Unavailable'}
          </span>
          <span
            className={`${isFavorite ? 'active' : ''} ${wishlistLoading ? 'loading' : ''}`}
            onClick={toggleFavorite}
            role="button"
            aria-pressed={isFavorite}
            title={isAuthenticated ? (isFavorite ? 'Remove from wishlist' : 'Add to wishlist') : 'Login to add to wishlist'}
            style={{ cursor: wishlistLoading ? 'not-allowed' : 'pointer' }}
          >
            <i className={`ri-heart-${wishlistLoading ? 'line' : 'fill'}`}></i>
            {wishlistLoading && <span className="wishlist-loading-spinner"></span>}
          </span>
        </div>
        <img src={image ? `${API_BASE}${image}` : '/assets/icons/eco-car.svg'} alt={title} loading="lazy" />
      </div>
      <div className='vehicle-card-1-content'>
        <div className='vehicle-card-1-content-title'>
          <h2>{title}</h2>
          <h1>Rs. {pricePerDay?.toLocaleString()}<span>/day</span></h1>
        </div>
        <div className='vehicle-card-1-content-description'>
          <p>{description}</p>
        </div>
        <div className='vehicle-card-1-facilities'>
          <div className='vehicle-card-1-facilities-item'>
            <p><i className="ri-user-line"></i> {seats} seats</p>
          </div>
          <div className='vehicle-card-1-facilities-item'>
            <p><i className="ri-briefcase-line"></i> {bags} bags</p>
          </div>
          <div className='vehicle-card-1-facilities-item'>
            <p><i className="ri-car-line"></i> {transmission}</p>
          </div>
        </div>
        <div className='vehicle-card-1-footer'>
          {isVehicleOwner ? (
            <Link to={`/add-vehicle?edit=${id}`} className="edit-vehicle-btn">
              <i className="ri-edit-line"></i> Edit Vehicle
            </Link>
          ) : (
            <Link
              to={`/vehicle/${linkParam}`}
              className="book-now-btn"
              onClick={(e) => {
                if (!isAuthenticated) {
                  e.preventDefault()
                  window.location.href = '/login'
                }
              }}
              title={isAuthenticated ? 'Proceed to booking' : 'Login to book this vehicle'}
            >
              Book Now
            </Link>
          )}
          {/* <Link to={`/vehicle/${id}`} className="details-btn">Details</Link> */}
        </div>
      </div>
    </div>
  )
}

export default React.memo(VehicleCard);

