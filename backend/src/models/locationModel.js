const mongoose = require('mongoose')

const locationSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Create 2dsphere index for geospatial queries
locationSchema.index({ coordinates: '2dsphere' })

module.exports = mongoose.model('Location', locationSchema)