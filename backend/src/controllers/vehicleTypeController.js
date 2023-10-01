const VehicleType = require('../models/vehicleTypeModel')

exports.listTypes = async (req, res) => {
  try {
    let items = await VehicleType.find({}).sort({ name: 1 })
    if (items.length === 0) {
      const defaults = [
        { name: 'Car' },
        { name: 'Van' },
        { name: 'Lorry' },
        { name: 'Bike' },
        { name: 'SUV' },
        { name: 'Bus' }
      ]
      try {
        await VehicleType.insertMany(defaults, { ordered: false })
      } catch (_) {
        // ignore duplicate errors due to race conditions
      }
      items = await VehicleType.find({}).sort({ name: 1 })
    }
    res.json(items)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch types', error: err.message })
  }
}

exports.createType = async (req, res) => {
  try {
    const { name, description } = req.body
    if (!name) return res.status(400).json({ message: 'Name is required' })
    const exists = await VehicleType.findOne({ name: new RegExp(`^${name}$`, 'i') })
    if (exists) return res.status(409).json({ message: 'Type already exists' })
    const image = req.file ? `/uploads/${req.file.filename}` : undefined
    const doc = await VehicleType.create({ name, description, ...(image ? { image } : {}) })
    res.status(201).json(doc)
  } catch (err) {
    res.status(500).json({ message: 'Failed to create type', error: err.message })
  }
}

exports.getTypeById = async (req, res) => {
  try {
    const doc = await VehicleType.findById(req.params.id)
    if (!doc) return res.status(404).json({ message: 'Not found' })
    res.json(doc)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch type', error: err.message })
  }
}

exports.updateType = async (req, res) => {
  try {
    const { name, description } = req.body
    const update = {}
    if (name) update.name = name
    if (description !== undefined) update.description = description
    if (req.file) update.image = `/uploads/${req.file.filename}`
    const doc = await VehicleType.findByIdAndUpdate(req.params.id, { $set: update }, { new: true, runValidators: true })
    if (!doc) return res.status(404).json({ message: 'Not found' })
    res.json(doc)
  } catch (err) {
    res.status(500).json({ message: 'Failed to update type', error: err.message })
  }
}

exports.deleteType = async (req, res) => {
  try {
    const doc = await VehicleType.findByIdAndDelete(req.params.id)
    if (!doc) return res.status(404).json({ message: 'Not found' })
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete type', error: err.message })
  }
}

