const express = require('express')
const router = express.Router()
const wishlistController = require('../controllers/wishlistController')
const { protect } = require('../middleware/auth')

// All wishlist routes require authentication
router.post('/', protect, wishlistController.addToWishlist)
router.get('/', protect, wishlistController.getWishlist)
router.get('/count', protect, wishlistController.getWishlistCount)
router.get('/check/:vehicleId', protect, wishlistController.checkWishlistStatus)
router.delete('/:vehicleId', protect, wishlistController.removeFromWishlist)

module.exports = router
