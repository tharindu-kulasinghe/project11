const express = require('express')
const router = express.Router()
const vehicleController = require('../controllers/vehicleController')
const { protect, authorize } = require('../middleware/auth')
const { uploadImageSingle } = require('../middleware/uploadImage')

// Public routes
router.get('/', vehicleController.getVehicles)
router.get('/available', vehicleController.getAvailableVehicles)
router.get('/slug/:slug', vehicleController.getVehicleBySlug)
router.get('/:id', vehicleController.getVehicleById)

// Admin routes
router.post('/', protect, uploadImageSingle('image'), vehicleController.createVehicle)
router.put('/:id', protect, uploadImageSingle('image'), vehicleController.updateVehicle)
router.delete('/:id', protect, vehicleController.deleteVehicle)

module.exports = router
