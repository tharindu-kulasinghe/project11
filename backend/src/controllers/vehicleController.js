const Vehicle = require('../models/vehicleModel')
const Booking = require('../models/bookingModel')

// Helper function to decode JWT token
function decodeToken(token) {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload))
    return decoded
  } catch (e) {
    return null
  }
}

// Helper function to get user from request
function getUserFromRequest(req) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  return decodeToken(token)
}

const getVehicles = async (req, res) => {
  try {
    const user = getUserFromRequest(req)

    // Determine target interval (today by default, or from query)
    const { startDate: qStart, endDate: qEnd } = req.query
    let interval = null
    if (qStart && qEnd) {
      const s = new Date(qStart)
      const e = new Date(qEnd)
      if (!isNaN(s) && !isNaN(e) && e > s) {
        // inclusive of start, exclusive of end for overlap logic
        interval = { start: new Date(s), end: new Date(e) }
        interval.start.setHours(0, 0, 0, 0)
        interval.end.setHours(23, 59, 59, 999)
      }
    }
    if (!interval) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      interval = { start: today, end: tomorrow }
    }

    // Find all bookings that overlap with interval
    const overlappingBookings = await Booking.find({
      status: { $in: ['confirmed', 'active'] },
      $or: [
        {
          startDate: { $lte: interval.start },
          endDate: { $gt: interval.start }
        },
        {
          startDate: { $lt: interval.end },
          endDate: { $gte: interval.end }
        },
        {
          startDate: { $gte: interval.start },
          endDate: { $lte: interval.end }
        }
      ]
    }).select('vehicleId')

    // Get IDs of booked vehicles for today
    const bookedVehicleIds = overlappingBookings.map(booking => booking.vehicleId.toString())

    let vehiclesQuery = Vehicle.find({}).populate('vehicleType', 'name image')

    // If user is authenticated, include wishlist status
    if (user) {
      vehiclesQuery = vehiclesQuery.populate({
        path: 'wishlistStatus',
        match: { userId: user.userId },
        select: '_id'
      })
    }

    const docs = await vehiclesQuery

    const bookedSet = new Set(bookedVehicleIds)
    const result = docs.map(doc => {
      const v = doc.toObject()
      if (user) {
        v.inWishlist = !!v.wishlistStatus
        delete v.wishlistStatus
      }
      v.availableInRange = !bookedSet.has(String(v._id))
      v.availableToday = !bookedSet.has(String(v._id)) && v.available
      return v
    })

    res.json(result)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getVehicleBySlug = async (req, res) => {
  try {
    const user = getUserFromRequest(req)

    // Check current availability for today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Find all bookings that overlap with today
    const overlappingBookings = await Booking.find({
      status: { $in: ['confirmed', 'active'] },
      $or: [
        {
          startDate: { $lte: today },
          endDate: { $gt: today }
        },
        {
          startDate: { $gte: today },
          startDate: { $lt: tomorrow }
        }
      ]
    }).select('vehicleId')

    // Get IDs of booked vehicles for today
    const bookedVehicleIds = overlappingBookings.map(booking => booking.vehicleId.toString())

    let vehicleQuery = Vehicle.findOne({ slug: req.params.slug }).populate('vehicleType', 'name image')

    // If user is authenticated, include wishlist status
    if (user) {
      vehicleQuery = vehicleQuery.populate({
        path: 'wishlistStatus',
        match: { userId: user.userId },
        select: '_id'
      })
    }

    const vehicle = await vehicleQuery
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' })
    }

    // Get all bookings for this vehicle (for calendar disabled dates)
    const vehicleBookings = await Booking.find({
      vehicleId: vehicle._id,
      status: { $in: ['confirmed', 'active'] }
    })
      .select('startDate endDate')
      .sort({ startDate: 1 })

    // Add wishlist status and current availability to response
    if (user) {
      vehicle._doc.inWishlist = !!vehicle.wishlistStatus
      delete vehicle._doc.wishlistStatus
    }

    // Add availability status for requested interval (only by overlap, ignore vehicle.available)
    const isBookedInInterval = bookedVehicleIds.includes(vehicle._id.toString())
    vehicle._doc.availableInRange = !isBookedInInterval

    // Add booking dates for calendar
    vehicle._doc.bookedDates = vehicleBookings.map(booking => ({
      startDate: booking.startDate,
      endDate: booking.endDate
    }))

    res.json(vehicle)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getVehicleById = async (req, res) => {
  try {
    const user = getUserFromRequest(req)

    // Check current availability for today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Find all bookings that overlap with today
    const overlappingBookings = await Booking.find({
      status: { $in: ['confirmed', 'active'] },
      $or: [
        {
          startDate: { $lte: today },
          endDate: { $gt: today }
        },
        {
          startDate: { $gte: today },
          startDate: { $lt: tomorrow }
        }
      ]
    }).select('vehicleId')

    // Get IDs of booked vehicles for today
    const bookedVehicleIds = overlappingBookings.map(booking => booking.vehicleId.toString())

    let vehicleQuery = Vehicle.findById(req.params.id).populate('vehicleType', 'name image')

    // If user is authenticated, include wishlist status
    if (user) {
      vehicleQuery = vehicleQuery.populate({
        path: 'wishlistStatus',
        match: { userId: user.userId },
        select: '_id'
      })
    }

    const vehicle = await vehicleQuery
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' })
    }

    // Get all bookings for this vehicle (for calendar disabled dates)
    const vehicleBookings = await Booking.find({
      vehicleId: vehicle._id,
      status: { $in: ['confirmed', 'active'] }
    })
      .select('startDate endDate')
      .sort({ startDate: 1 })

    // Add wishlist status and current availability to response
    if (user) {
      vehicle._doc.inWishlist = !!vehicle.wishlistStatus
      delete vehicle._doc.wishlistStatus
    }

    // Add current availability status for today
    const isBookedToday = bookedVehicleIds.includes(vehicle._id.toString())
    vehicle._doc.availableToday = !isBookedToday && vehicle.available

    // Add booking dates for calendar
    vehicle._doc.bookedDates = vehicleBookings.map(booking => ({
      startDate: booking.startDate,
      endDate: booking.endDate
    }))

    res.json(vehicle)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const createVehicle = async (req, res) => {
  try {
    const { pricePerDay, year, licensePlate } = req.body
    if (pricePerDay <= 0) {
      return res.status(400).json({ message: 'Price per day must be greater than 0' })
    } else if (year < 1900 || year > new Date().getFullYear()) {
      return res.status(400).json({ message: 'Invalid vehicle year' })
    } else if (!/^[A-Z0-9-]{4,10}$/.test(licensePlate)) {
      return res.status(400).json({ message: 'Invalid license plate format' })
    }
    if (req.file && req.file.filename) req.body.image = `/uploads/${req.file.filename}`
    // vehicleType: sanitize and validate (single block)
    if (req.body.vehicleType === '' || req.body.vehicleType === 'null' || req.body.vehicleType === 'undefined') {
      delete req.body.vehicleType
    }
    if (req.body.vehicleType && !require('mongoose').Types.ObjectId.isValid(req.body.vehicleType)) {
      return res.status(400).json({ message: 'Invalid vehicleType id' })
    }

    if (req.body.coordinates) {
      try {
        if (typeof req.body.coordinates === 'string' && req.body.coordinates.startsWith('[')) {
          req.body.pickupLocation = {
            type: 'Point',
            coordinates: JSON.parse(req.body.coordinates)
          }
        }
        else if (typeof req.body.coordinates === 'string' && req.body.coordinates.includes(',')) {
          const coords = req.body.coordinates.split(',').map(c => parseFloat(c.trim()))
          req.body.pickupLocation = {
            type: 'Point',
            coordinates: coords
          }
        }
      } catch (err) {
        return res.status(400).json({ message: 'Invalid coordinates format' })
      }
    }

    if (req.body['features.gpsNavigation'] !== undefined) {
      req.body.features = {}
      Object.keys(req.body).forEach(key => {
        if (key.startsWith('features.')) {
          const feature = key.replace('features.', '')
          req.body.features[feature] = req.body[key] === 'true'
        }
      })
    }

    req.body.userId = req.user.userId

    const vehicle = new Vehicle(req.body)
    const createdVehicle = await vehicle.save()
    res.status(201).json(createdVehicle)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const updateVehicle = async (req, res) => {
  try {
    const { pricePerDay, year, licensePlate } = req.body
    if (pricePerDay && pricePerDay <= 0) {
      return res.status(400).json({ message: 'Price per day must be greater than 0' })
    } else if (year && (year < 1900 || year > new Date().getFullYear())) {
      return res.status(400).json({ message: 'Invalid vehicle year' })
    } else if (licensePlate && !/^[A-Z0-9-]{4,10}$/.test(licensePlate)) {
      return res.status(400).json({ message: 'Invalid license plate format' })
    }
    const vehicle = await Vehicle.findById(req.params.id)
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' })
    }
    if (req.file && req.file.filename) req.body.image = `/uploads/${req.file.filename}`

    if (req.body.coordinates) {
      try {
        if (typeof req.body.coordinates === 'string' && req.body.coordinates.startsWith('[')) {
          req.body.pickupLocation = {
            type: 'Point',
            coordinates: JSON.parse(req.body.coordinates)
          }
        }
        else if (typeof req.body.coordinates === 'string' && req.body.coordinates.includes(',')) {
          const coords = req.body.coordinates.split(',').map(c => parseFloat(c.trim()))
          req.body.pickupLocation = {
            type: 'Point',
            coordinates: coords
          }
        }
      } catch (err) {
        return res.status(400).json({ message: 'Invalid coordinates format' })
      }
    }

    if (req.body['features.gpsNavigation'] !== undefined) {
      req.body.features = {}
      Object.keys(req.body).forEach(key => {
        if (key.startsWith('features.')) {
          const feature = key.replace('features.', '')
          req.body.features[feature] = req.body[key] === 'true'
        }
      })
    }

    Object.assign(vehicle, req.body)
    const updatedVehicle = await vehicle.save()
    res.json(updatedVehicle)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' })
    }

    // Use deleteOne() instead of deprecated remove()
    await Vehicle.findByIdAndDelete(req.params.id)
    res.json({ message: 'Vehicle removed' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getAvailableVehicles = async (req, res) => {
  try {
    const user = getUserFromRequest(req)
    // Determine target interval (today by default, or from query)
    const { startDate: qStart, endDate: qEnd } = req.query
    let interval = null
    if (qStart && qEnd) {
      const s = new Date(qStart)
      const e = new Date(qEnd)
      if (!isNaN(s) && !isNaN(e) && e > s) {
        interval = { start: new Date(s), end: new Date(e) }
        interval.start.setHours(0, 0, 0, 0)
        interval.end.setHours(23, 59, 59, 999)
      }
    }
    if (!interval) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      interval = { start: today, end: tomorrow }
    }

    // Find all bookings that overlap with interval
    const overlappingBookings = await Booking.find({
      status: { $in: ['confirmed', 'active'] },
      $or: [
        {
          startDate: { $lte: interval.start },
          endDate: { $gt: interval.start }
        },
        {
          startDate: { $lt: interval.end },
          endDate: { $gte: interval.end }
        },
        {
          startDate: { $gte: interval.start },
          endDate: { $lte: interval.end }
        }
      ]
    }).select('vehicleId')

    // Get IDs of booked vehicles
    const bookedVehicleIds = overlappingBookings.map(booking => booking.vehicleId)

    // Build query for available vehicles
    let vehiclesQuery = Vehicle.find({
      _id: { $nin: bookedVehicleIds },
      available: true
    }).populate('vehicleType', 'name image')
      .sort({ pricePerDay: 1 }) // Sort by price low to high
      .limit(16) // Show up to 16 vehicles for home page

    // If user is authenticated, include wishlist status
    if (user) {
      vehiclesQuery = vehiclesQuery.populate({
        path: 'wishlistStatus',
        match: { userId: user.userId },
        select: '_id'
      })
    }

    const availableVehicles = await vehiclesQuery

    // Add wishlist status to response
    if (user) {
      availableVehicles.forEach(vehicle => {
        vehicle._doc.inWishlist = !!vehicle.wishlistStatus
        delete vehicle._doc.wishlistStatus
      })
    }

    res.json(availableVehicles)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = {
  getVehicles,
  getVehicleById,
  getVehicleBySlug,
  getAvailableVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle
}