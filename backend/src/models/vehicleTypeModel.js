const mongoose = require('mongoose')

const vehicleTypeSchema = new mongoose.Schema({
  name: {
    type: String, 
    required: true, 
    trim: true, 
    unique: true
  },
  description: {
    type: String, 
    trim: true
  },
  image: {
    type: String,
    trim: true,
  }
}, { timestamps: true })

vehicleTypeSchema.index({ name: 1 }, { unique: true })

module.exports = mongoose.model('VehicleType', vehicleTypeSchema)

