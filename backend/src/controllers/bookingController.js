const Booking = require('../models/bookingModel')
const createBooking = async (req, res) => {
  try {
    const { startDate, endDate, totalPrice, paymentMethod, pickupLocation, dropoffLocation, deviceId, notes, vehicleId, addons } = req.body

    if (!startDate || !endDate || !totalPrice || !paymentMethod || !vehicleId) {
      return res.status(400).json({ message: 'Missing required fields: startDate, endDate, totalPrice, paymentMethod, vehicleId' })
    }

    if (!['cash', 'card'].includes(paymentMethod)) {
      return res.status(400).json({ message: 'Invalid payment method. Must be either "cash" or "card"' })
    }

    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({ message: 'End date must be after start date' })
    } else if (totalPrice <= 0) {
      return res.status(400).json({ message: 'Total price must be greater than 0' })
    }

    const bookingData = {
      userId: req.user.userId,
      vehicleId: vehicleId,
      deviceId: deviceId || 'web-' + Date.now(),
      startDate,
      endDate,
      totalPrice,
      paymentMethod,
      status: 'active',
      paymentStatus: 'pending'
    }

    if (pickupLocation) bookingData.pickupLocation = pickupLocation
    if (dropoffLocation) bookingData.dropoffLocation = dropoffLocation
    if (notes) bookingData.notes = notes
    if (addons && Array.isArray(addons)) bookingData.addons = addons

    let processedBookingData = bookingData
    if (bookingData.paymentMethod === 'cash') {
      processedBookingData = await processCashBooking(bookingData)
    } else if (bookingData.paymentMethod === 'card') {
      processedBookingData = await processCardBooking(bookingData)
    }

    const booking = new Booking(processedBookingData)
    const createdBooking = await booking.save()
    res.status(201).json(createdBooking)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate('userId', 'firstName lastName fullName name email phone mobile')
      .populate('vehicleId', 'title pricePerDay pricePerDayLKR image category')
    res.json(bookings)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'firstName lastName fullName name email phone mobile')
      .populate('vehicleId', 'title pricePerDay pricePerDayLKR image category userId')
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' })
    }
    res.json(booking)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const updateBooking = async (req, res) => {
  try {
    const { startDate, endDate, totalPrice, status, paymentMethod, paymentStatus } = req.body

    if (paymentMethod && !['cash', 'card'].includes(paymentMethod)) {
      return res.status(400).json({ message: 'Invalid payment method. Must be either "cash" or "card"' })
    }

    if (paymentStatus && !['pending', 'paid', 'failed', 'refunded'].includes(paymentStatus)) {
      return res.status(400).json({ message: 'Invalid payment status. Must be one of: pending, paid, failed, refunded' })
    }
    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({ message: 'End date must be after start date' })
    } else if (totalPrice && totalPrice <= 0) {
      return res.status(400).json({ message: 'Total price must be greater than 0' })
    }

    const booking = await Booking.findById(req.params.id)
      .populate('vehicleId', 'userId')
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' })
    } else if (status && booking.status === 'completed') {
      return res.status(400).json({ message: 'Cannot update completed booking' })
    }

    const requesterId = req.user?.userId
    const requesterRole = req.user?.role
    const ownerId = booking?.vehicleId?.userId?.toString?.() || booking?.vehicleId?.userId
    if (!(requesterRole === 'admin' || (requesterId && ownerId && String(ownerId) === String(requesterId)))) {
      return res.status(403).json({ message: 'Not authorized to update this booking' })
    }

    Object.assign(booking, req.body)
    const updatedBooking = await booking.save()
    res.json(updatedBooking)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' })
    }
    await booking.remove()
    res.json({ message: 'Booking removed' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const processCashBooking = async (bookingData) => {
  console.log('Processing cash booking in backend:', bookingData)
  return bookingData
}

const processCardBooking = async (bookingData) => {
  console.log('Processing card booking in backend:', bookingData)
  return bookingData
}

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  processCashBooking,
  processCardBooking
}