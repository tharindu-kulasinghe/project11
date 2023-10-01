const DevicePurchase = require('../models/trackingDeviceModel')
const createDevice = async (req, res) => {
  try {
    let { deviceId } = req.body
    if (deviceId) {
      if (!/^[A-Z0-9]{8,20}$/i.test(deviceId)) {
        return res.status(400).json({ message: 'Device ID must be 8-20 alphanumeric chars' })
      }
      deviceId = deviceId.toUpperCase()
    } else {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      const len = 12
      let gen = ''
      for (let i = 0; i < len; i++) gen += chars[Math.floor(Math.random() * chars.length)]
      deviceId = gen
    }

    const payloadUserId = req.user?.userId || req.user?._id || req.user?.id

    // normalize field names from client
    const bodyAddress = req.body.address || req.body.installAddress || null
    const bodyLocation = req.body.location || req.body.installLocation || null

    const device = new DevicePurchase({
      deviceId,
      userId: payloadUserId || req.body.userId,
      vehicleId: req.body.vehicleId,
      paymentMethod: req.body.paymentMethod,
      address: bodyAddress || req.user?.address || undefined,
      location: bodyLocation || undefined,
      price: req.body.price, // optional
    })

    const createdDevice = await device.save()
    res.status(201).json(createdDevice)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getDevices = async (req, res) => {
  try {
    const devices = await DevicePurchase.find({})
      .populate('userId', 'name email')
      .populate('vehicleId', 'title licensePlate')
    res.json(devices)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getDeviceById = async (req, res) => {
  try {
    const device = await DevicePurchase.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('vehicleId', 'title licensePlate')
    if (!device) {
      return res.status(404).json({ message: 'Device not found' })
    }
    res.json(device)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const updateDevice = async (req, res) => {
  try {
    const { deviceId, price, status } = req.body
    if (deviceId && !/^[A-Z0-9]{8,20}$/.test(deviceId)) {
      return res.status(400).json({ message: 'Device ID must be 8-20 alphanumeric chars' })
    } else if (price && price <= 0) {
      return res.status(400).json({ message: 'Price must be greater than 0' })
    }
    const device = await DevicePurchase.findById(req.params.id)
    if (!device) {
      return res.status(404).json({ message: 'Device not found' })
    }

    // Allow admins to update any device, restrict regular users from updating cancelled devices
    if (req.user.role !== 'admin' && status && device.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot update cancelled device' })
    }
    // Normalize updates for address/location fields
    const next = { ...req.body }
    if (req.body.installAddress && !req.body.address) {
      next.address = req.body.installAddress
    }
    if (req.body.installLocation && !req.body.location) {
      next.location = req.body.installLocation
    }
    Object.assign(device, next)
    const updatedDevice = await device.save()
    res.json(updatedDevice)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const deleteDevice = async (req, res) => {
  try {
    const device = await DevicePurchase.findById(req.params.id)
    if (!device) {
      return res.status(404).json({ message: 'Device not found' })
    }
    await device.remove()
    res.json({ message: 'Device removed' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getDeviceByVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params
    if (!vehicleId) return res.status(400).json({ message: 'vehicleId is required' })
    const device = await DevicePurchase.findOne({ vehicleId, status: { $ne: 'cancelled' } })
    if (!device) return res.json({ hasDevice: false })
    res.json({ hasDevice: true, deviceId: device.deviceId, status: device.status })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = {
  createDevice,
  getDevices,
  getDeviceById,
  updateDevice,
  deleteDevice,
  getDeviceByVehicle
}