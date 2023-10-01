const mongoose = require('mongoose')

const devicePurchaseSchema = new mongoose.Schema({
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
    required: true,
    unique: true
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  activationDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'expired', 'cancelled'],
    default: 'pending'
  },
  price: {
    type: Number,
    required: false
  },
  address: {
    street: String,
    city: String,
    province: String,
    postalCode: String
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: undefined
    }
  },
  paymentMethod: {
    type: String,
    enum: ['credit', 'debit', 'bank', 'cash'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('DevicePurchase', devicePurchaseSchema)