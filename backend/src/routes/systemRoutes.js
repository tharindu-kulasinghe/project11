const express = require('express')
const router = express.Router()
const systemController = require('../controllers/systemController')
const { protect, authorize } = require('../middleware/auth')

router.get('/', protect, authorize('admin'), systemController.getSystemSettings)
router.put('/', protect, authorize('admin'), systemController.updateSystemSettings)
router.put('/reset', protect, authorize('admin'), systemController.resetSystemSettings)

// Public route for getting device price (accessible to all users)
router.get('/device-price', systemController.getDevicePrice)

module.exports = router