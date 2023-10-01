const express = require('express')
const router = express.Router()
const locationController = require('../controllers/locationController')
const { protect, authorize } = require('../middleware/auth')

// Public endpoint for Arduino devices
router.post('/device', locationController.createLocationFromDevice)

router.post('/', protect, locationController.createLocation)
router.get('/', protect, locationController.getLocations)
router.get('/:id', protect, locationController.getLocationById)
router.get('/device/:deviceId', protect, locationController.getLatestLocationByDevice)
router.put('/:id', protect, locationController.updateLocation)
router.delete('/:id', protect, locationController.deleteLocation)

module.exports = router