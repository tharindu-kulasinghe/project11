const express = require('express')
const router = express.Router()
const {
  getSettings,
  updateSettings,
  resetSettings
} = require('../controllers/systemSettingController')

const { protect, admin } = require('../middleware/authMiddleware')

// All routes require authentication and admin privileges
router.use(protect)
router.use(admin)

// @route   GET /api/system
// @desc    Get system settings
// @access  Private/Admin
router.get('/', getSettings)

// @route   PUT /api/system
// @desc    Update system settings
// @access  Private/Admin
router.put('/', updateSettings)

// @route   PUT /api/system/reset
// @desc    Reset settings to defaults
// @access  Private/Admin
router.put('/reset', resetSettings)

module.exports = router