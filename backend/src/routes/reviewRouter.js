const express = require('express')
const router = express.Router()
const { createReview, getReviews } = require('../controllers/reviewController')
const { protect } = require('../middleware/auth')

router.get('/', protect, getReviews)
router.post('/', protect, createReview)

module.exports = router

