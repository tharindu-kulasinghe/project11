const express = require('express')
const router = express.Router()
const trackingDeviceController = require('../controllers/trackingDeviceController')
const { protect, authorize } = require('../middleware/auth')

router.post('/', protect, trackingDeviceController.createDevice)
router.get('/', protect, authorize('admin'), trackingDeviceController.getDevices)
router.get('/:id', protect, trackingDeviceController.getDeviceById)
router.get('/by-vehicle/:vehicleId', protect, trackingDeviceController.getDeviceByVehicle)
router.put('/:id', protect, authorize('admin'), trackingDeviceController.updateDevice)
router.delete('/:id', protect, authorize('admin'), trackingDeviceController.deleteDevice)

module.exports = router