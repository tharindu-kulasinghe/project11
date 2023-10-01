import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './purchase-device.css'

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000'

function useQuery() {
  const { search } = useLocation()
  return useMemo(() => new URLSearchParams(search), [search])
}

function decodeJwt(token) {
  try {
    const base64Url = token.split('.')[1]
    if (!base64Url) return null
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

export default function PurchaseDevice() {
  const query = useQuery()
  const vehicleId = query.get('vehicleId') || ''

  const [paymentMethod, setPaymentMethod] = useState('card')
  const [loading, setLoading] = useState(false)
  const [hasDevice, setHasDevice] = useState(false)
  const [address, setAddress] = useState({ street: '', city: '', province: '', postalCode: '' })
  const [coords, setCoords] = useState(null) // {lat, lng}
  const [devicePrice, setDevicePrice] = useState(0)
  const [currency, setCurrency] = useState('LKR')
  const mapHostRef = useRef(null)
  const leafletMapRef = useRef(null)
  const markerRef = useRef(null)
  const watchIdRef = useRef(null)

  useEffect(() => {
    const checkExisting = async () => {
      if (!vehicleId) return
      try {
        const token = localStorage.getItem('token')
        const headers = { 'Content-Type': 'application/json' }
        if (token) headers['Authorization'] = `Bearer ${token}`
        const r = await fetch(`${API_BASE}/api/tracking-devices/by-vehicle/${vehicleId}`, { headers })
        if (r.ok) {
          const j = await r.json()
          setHasDevice(!!j?.hasDevice)
        }
      } catch { }
    }
    checkExisting()
  }, [vehicleId])

  useEffect(() => {
    const loadMe = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return
        const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        const res = await fetch(`${API_BASE}/api/users/me`, { headers })
        if (res.ok) {
          const me = await res.json()
          if (me?.address) setAddress({
            street: me.address.street || '',
            city: me.address.city || '',
            province: me.address.province || '',
            postalCode: me.address.postalCode || ''
          })
        }
      } catch { }
    }
    loadMe()
  }, [])

  // Fetch device price from system settings
  useEffect(() => {
    const fetchDevicePrice = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/system/device-price`)
        if (response.ok) {
          const data = await response.json()
          setDevicePrice(data.devicePrice || 1000)
          setCurrency(data.currency || 'LKR')
        }
      } catch (error) {
        console.error('Failed to fetch device price:', error)
        // Keep default values if fetch fails
      }
    }
    fetchDevicePrice()
  }, [])

  // Dynamically load Leaflet assets (no npm dependency) and init map for location pick
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

    if (!hasDevice) {
      initMapWhenReady()
    }

    return () => {
      // stop geolocation watch on unmount
      if (watchIdRef.current && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
    }
  }, [hasDevice])

  // Keep marker in sync with coords (when we programmatically change it)
  useEffect(() => {
    const L = window.L
    const map = leafletMapRef.current
    if (!L || !map || !coords) return
    if (markerRef.current) markerRef.current.setLatLng([coords.lat, coords.lng])
    map.setView([coords.lat, coords.lng], Math.max(map.getZoom(), 12))
  }, [coords])

  const handleCashPurchase = async (purchaseData) => {
    console.log('Processing cash purchase:', purchaseData)
    return purchaseData
  }

  const handleCardPurchase = async (purchaseData) => {
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
      const orderId = `DP${Date.now()}${Math.random().toString(36).substr(2, 9)}`

      // iPay configuration
      const ipayConfig = {
        merchantWebToken: 'eyJhbGciOiJIUzUxMiJ9.eyJtaWQiOiIwMDAwMDMwNSJ9.3_XOmqpXcg_8YYUEQNBl3N6N8oCTRI9x_BZ0-g6_pHUhJ1Iv9bR7WnmqKQ6iPyn-U1wuQwm_N6BfotCpnkH_3A',
        orderId: orderId,
        orderDescription: `Tracking Device Purchase`,
        returnUrl: `${window.location.origin}/payment/success?orderId=${orderId}&type=device`,
        cancelUrl: `${window.location.origin}/payment/cancel?orderId=${orderId}&type=device`,
        totalAmount: devicePrice.toString(),
        customerName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email.split('@')[0],
        customerPhone: user.phone || '0700000000',
        customerEmail: user.email
      }

      // Store purchase data for later processing
      localStorage.setItem(`ipay_device_purchase_${orderId}`, JSON.stringify(purchaseData))

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)

      if (!vehicleId) {
        toast.error('Vehicle is required')
        return
      }

      const token = localStorage.getItem('token')
      const payload = token ? decodeJwt(token) : null
      const userId = payload?.userId || payload?._id || payload?.id

      const purchaseData = {
        userId,
        vehicleId,
        paymentMethod: paymentMethod === 'card' ? 'credit' : paymentMethod,
        installAddress: address,
        installLocation: coords ? { type: 'Point', coordinates: [coords.lng, coords.lat] } : undefined
      }

      let processedPurchaseData
      if (paymentMethod === 'cash') {
        processedPurchaseData = await handleCashPurchase(purchaseData)
      } else if (paymentMethod === 'card') {
        processedPurchaseData = await handleCardPurchase(purchaseData)
      } else {
        return
      }

      const headers = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch(`${API_BASE}/api/tracking-devices`, {
        method: 'POST',
        headers,
        body: JSON.stringify(processedPurchaseData)
      })
      if (!res.ok) {
        const msg = await res.json().catch(() => ({}))
        throw new Error(msg?.message || 'Failed to purchase device')
      }
      // Redirect to my-vehicles after successful purchase
      setTimeout(() => {
        window.location.href = '/my-vehicles'
      }, 2000)
    } catch (e) {
      console.error('Purchase error:', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="purchase-device mt-64">
      <div className="container">
        <div className="purchase-device-container">
          <div className="purchase-header">
            <h1>Purchase Tracking Device</h1>
            <p>Attach a tracking device to your vehicle for live location</p>
          </div>
          <div className="purchase-body">
            {hasDevice && (
              <div className="purchase-info">
                <p>This vehicle already has a tracking device.</p>
                <Link className="btn-secondary" to="/my-vehicles">Back to My Vehicles</Link>
              </div>
            )}

            {!hasDevice && (
              <form className="purchase-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="vehicleId">Vehicle</label>
                  <input id="vehicleId" value={vehicleId} readOnly />
                </div>
                {/* Device ID removed: auto-generated by backend */}
                <div className="form-group">
                  <label>Address</label>
                  <input placeholder="Street" value={address.street} onChange={(e) => setAddress(a => ({ ...a, street: e.target.value }))} />
                  <div className="purchase-form-grid">
                    <div className="form-group">
                      <label>City</label>
                      <input placeholder="City" value={address.city} onChange={(e) => setAddress(a => ({ ...a, city: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label>Province</label>
                      <input placeholder="Province" value={address.province} onChange={(e) => setAddress(a => ({ ...a, province: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label>Postal Code</label>
                      <input placeholder="Postal Code" value={address.postalCode} onChange={(e) => setAddress(a => ({ ...a, postalCode: e.target.value }))} />
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label>Install Location</label>
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
                  {!coords && <small>Click on the map to select an install location.</small>}
                </div>
                <div className="form-group">
                  <label htmlFor="paymentMethod">Payment Method</label>
                  <select id="paymentMethod" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                    <option value="card">Card Payment</option>
                    <option value="cash">Cash Payment</option>
                  </select>
                </div>

                {/* Device Price Display */}
                <div className="device-price-summary">
                  {/* <h3>Device Purchase Summary</h3> */}
                  <div className="price-item">
                    <span>Tracking Device</span>
                    <span>{currency} {devicePrice?.toLocaleString()}</span>
                  </div>
                  <div className="price-total">
                    <span>Total Amount</span>
                    <span>{currency} {devicePrice?.toLocaleString()}</span>
                  </div>
                </div>

                <button className="btn-primary purchase-device-btn" type="submit" disabled={loading}>
                  {loading ? 'Processing...' : `Purchase Device - ${currency} ${devicePrice?.toLocaleString()}`}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

