const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  licenseNumber: {
    type: String,
    required: function () {
      return this.role === 'user';
    }
  },
  licenseClass: {
    type: String,
    enum: ['A', 'B', 'C'],
    required: function () {
      return this.role === 'user';
    }
  },
  licenseFrontImage: {
    type: String,
    required: function () {
      return this.role === 'user';
    }
  },
  licenseBackImage: {
    type: String,
    required: function () {
      return this.role === 'user';
    }
  },
  address: {
    street: String,
    city: String,
    province: String,
    postalCode: String
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  averageRating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

// Add index for frequently queried fields
userSchema.index({ role: 1, status: 1 })

module.exports = mongoose.model('User', userSchema);
