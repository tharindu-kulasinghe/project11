const Wishlist = require('../models/wishlistModel')
const Vehicle = require('../models/vehicleModel')

const addToWishlist = async (req, res) => {
  try {
    const { vehicleId } = req.body

    if (!vehicleId) {
      return res.status(400).json({ message: 'Vehicle ID is required' })
    }

    // Check if vehicle exists
    const vehicle = await Vehicle.findById(vehicleId)
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' })
    }

    // Check if already in wishlist
    const existingWishlistItem = await Wishlist.findOne({
      userId: req.user.userId,
      vehicleId: vehicleId
    })

    if (existingWishlistItem) {
      return res.status(400).json({ message: 'Vehicle already in wishlist' })
    }

    // Add to wishlist
    const wishlistItem = new Wishlist({
      userId: req.user.userId,
      vehicleId: vehicleId
    })

    const savedWishlistItem = await wishlistItem.save()

    // Populate vehicle details for response
    await savedWishlistItem.populate('vehicleId', 'title pricePerDayLKR image description seats bags transmission available favorite slug userId')

    // Add availability status to the vehicle in response
    if (savedWishlistItem.vehicleId) {
      // Check current availability for today
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      // Find all bookings that overlap with today
      const Booking = require('../models/bookingModel')
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

      const isBookedToday = bookedVehicleIds.includes(savedWishlistItem.vehicleId._id.toString())
      savedWishlistItem.vehicleId._doc.availableToday = !isBookedToday && savedWishlistItem.vehicleId.available
    }

    res.status(201).json({
      message: 'Vehicle added to wishlist',
      wishlistItem: savedWishlistItem
    })
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Vehicle already in wishlist' })
    }
    res.status(500).json({ message: err.message })
  }
}

const removeFromWishlist = async (req, res) => {
  try {
    const { vehicleId } = req.params

    if (!vehicleId) {
      return res.status(400).json({ message: 'Vehicle ID is required' })
    }

    const wishlistItem = await Wishlist.findOneAndDelete({
      userId: req.user.userId,
      vehicleId: vehicleId
    })

    if (!wishlistItem) {
      return res.status(404).json({ message: 'Vehicle not found in wishlist' })
    }

    res.json({ message: 'Vehicle removed from wishlist' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getWishlist = async (req, res) => {
  try {
    // Check current availability for today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Find all bookings that overlap with today
    const Booking = require('../models/bookingModel')
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

    const wishlistItems = await Wishlist.find({
      userId: req.user.userId
    })
    .populate('vehicleId', 'title pricePerDayLKR image description seats bags transmission available favorite slug userId')
    .sort({ createdAt: -1 }) // Most recently added first

    // Add availability status to wishlist items
    wishlistItems.forEach(item => {
      if (item.vehicleId) {
        const isBookedToday = bookedVehicleIds.includes(item.vehicleId._id.toString())
        item.vehicleId._doc.availableToday = !isBookedToday && item.vehicleId.available
      }
    })

    res.json(wishlistItems)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const checkWishlistStatus = async (req, res) => {
  try {
    const { vehicleId } = req.params

    if (!vehicleId) {
      return res.status(400).json({ message: 'Vehicle ID is required' })
    }

    const wishlistItem = await Wishlist.findOne({
      userId: req.user.userId,
      vehicleId: vehicleId
    })

    res.json({
      inWishlist: !!wishlistItem,
      wishlistItem: wishlistItem || null
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getWishlistCount = async (req, res) => {
  try {
    const count = await Wishlist.countDocuments({
      userId: req.user.userId
    })

    res.json({ count })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  checkWishlistStatus,
  getWishlistCount
}
