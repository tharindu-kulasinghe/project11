const express = require('express')
const router = express.Router()
const bookingController = require('../controllers/bookingController')
const { protect, authorize } = require('../middleware/auth')

router.post('/', protect, bookingController.createBooking)
router.get('/', protect, bookingController.getBookings)
router.get('/:id', protect, bookingController.getBookingById)
router.put('/:id', protect, bookingController.updateBooking)
router.delete('/:id', protect, authorize('admin'), bookingController.deleteBooking)

module.exports = router