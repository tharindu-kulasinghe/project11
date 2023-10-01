const mongoose = require('mongoose')

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  }
}, {
  timestamps: true
})

// Compound index to ensure a user can't add the same vehicle twice
wishlistSchema.index({ userId: 1, vehicleId: 1 }, { unique: true })

// Index for efficient querying
wishlistSchema.index({ userId: 1 })
wishlistSchema.index({ vehicleId: 1 })

module.exports = mongoose.model('Wishlist', wishlistSchema)
