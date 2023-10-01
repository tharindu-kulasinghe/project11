const express = require('express')
const router = express.Router()
const controller = require('../controllers/vehicleTypeController')
const { uploadImageSingle } = require('../middleware/uploadImage')
const { protect, authorize } = require('../middleware/auth')

// Public
router.get('/', controller.listTypes)

// Admin only
router.post('/', protect, authorize('admin'), uploadImageSingle('image'), controller.createType)
router.get('/:id', protect, authorize('admin'), controller.getTypeById)
router.put('/:id', protect, authorize('admin'), uploadImageSingle('image'), controller.updateType)
router.delete('/:id', protect, authorize('admin'), controller.deleteType)

module.exports = router

