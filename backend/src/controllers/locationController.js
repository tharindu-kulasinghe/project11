const Location = require('../models/locationModel')

// Public endpoint for Arduino devices
const createLocationFromDevice = async (req, res) => {
  console.log("hello")
  try {
    const { deviceId, latitude, longitude, timestamp } = req.body

    // Validate required fields
    if (!deviceId) {
      return res.status(400).json({ message: 'Device ID is required' })
    }
    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude are required' })
    }

    // Create location object with proper GeoJSON format
    const locationData = {
      deviceId: deviceId,
      coordinates: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)] // [longitude, latitude]
      },
      timestamp: timestamp ? new Date(timestamp) : new Date()
    }

    const location = new Location(locationData)
    const createdLocation = await location.save()

    console.log(`Location saved for device ${deviceId}: ${latitude}, ${longitude}`)
    res.status(201).json({
      success: true,
      message: 'Location saved successfully',
      data: createdLocation
    })
  } catch (err) {
    console.error('Error saving location:', err)
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
}

const createLocation = async (req, res) => {
  try {
    const { coordinates, timestamp } = req.body
    if (!coordinates || coordinates.coordinates.length !== 2) {
      return res.status(400).json({ message: 'Invalid coordinates format' })
    } else if (new Date(timestamp) > new Date()) {
      return res.status(400).json({ message: 'Timestamp cannot be in the future' })
    }
    const location = new Location(req.body)
    const createdLocation = await location.save()
    res.status(201).json(createdLocation)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getLocations = async (req, res) => {
  try {
    const locations = await Location.find({}).populate('bookingId', 'startDate endDate')
    res.json(locations)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getLocationById = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id).populate('bookingId', 'startDate endDate')
    if (!location) {
      return res.status(404).json({ message: 'Location not found' })
    }
    res.json(location)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getLatestLocationByDevice = async (req, res) => {
  try {
    const { deviceId } = req.params
    console.log('getLatestLocationByDevice called with deviceId:', deviceId)

    if (!deviceId) {
      return res.status(400).json({ message: 'Device ID is required' })
    }

    const location = await Location.findOne({ deviceId })
      .sort({ timestamp: -1 }) // Get the most recent location

    console.log('Found location:', location)

    if (!location) {
      return res.status(404).json({ message: 'No location found for this device' })
    }

    res.json(location)
  } catch (err) {
    console.error('Error in getLatestLocationByDevice:', err)
    res.status(500).json({ message: err.message })
  }
}

const updateLocation = async (req, res) => {
  try {
    const { coordinates, timestamp } = req.body
    if (coordinates && coordinates.coordinates.length !== 2) {
      return res.status(400).json({ message: 'Invalid coordinates format' })
    } else if (timestamp && new Date(timestamp) > new Date()) {
      return res.status(400).json({ message: 'Timestamp cannot be in the future' })
    }
    const location = await Location.findById(req.params.id)
    if (!location) {
      return res.status(404).json({ message: 'Location not found' })
    }
    Object.assign(location, req.body)
    const updatedLocation = await location.save()
    res.json(updatedLocation)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const deleteLocation = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id)
    if (!location) {
      return res.status(404).json({ message: 'Location not found' })
    }
    await location.remove()
    res.json({ message: 'Location removed' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = {
  createLocationFromDevice,
  createLocation,
  getLocations,
  getLocationById,
  getLatestLocationByDevice,
  updateLocation,
  deleteLocation
}