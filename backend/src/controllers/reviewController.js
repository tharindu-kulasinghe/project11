const Review = require('../models/reviewModel')

const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment, photos } = req.body
    if (!bookingId || !rating) {
      return res.status(400).json({ message: 'bookingId and rating are required' })
    }

    const review = new Review({
      bookingId,
      userId: req.user.userId,
      rating,
      comment: comment || '',
      photos: Array.isArray(photos) ? photos : []
    })
    const created = await review.save()
    res.status(201).json(created)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getReviews = async (req, res) => {
  try {
    const { bookingId, vehicleId } = req.query
    let query = {}
    if (bookingId) {
      query.bookingId = bookingId
    } else if (vehicleId) {
      const Booking = require('../models/bookingModel')
      const bookings = await Booking.find({ vehicleId }).select('_id')
      const ids = bookings.map(b => b._id)
      query.bookingId = { $in: ids }
    }
    const reviews = await Review.find(query)
      .populate('userId', 'firstName lastName name email')
    res.json(reviews)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { createReview, getReviews }

