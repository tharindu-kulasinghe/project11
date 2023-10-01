const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  deviceId: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card'],
    required: true
  },
  pickupLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  dropoffLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  notes: String,
  addons: [{
    id: String,
    name: String,
    pricePerDay: Number
  }],
  review: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }
}, {
  timestamps: true
})

bookingSchema.index({ userId: 1 })
bookingSchema.index({ vehicleId: 1 })
bookingSchema.index({ status: 1 })
bookingSchema.index({ paymentMethod: 1 })
bookingSchema.index({ startDate: 1, endDate: 1 })
bookingSchema.index({ pickupLocation: '2dsphere' })
bookingSchema.index({ dropoffLocation: '2dsphere' })

module.exports = mongoose.model('Booking', bookingSchema)
