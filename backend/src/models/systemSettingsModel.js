const mongoose = require('mongoose')

const systemSettingsSchema = new mongoose.Schema({
    // General
    siteName: { type: String, default: 'Gamanata Vehicle Rental', trim: true },
    contactEmail: { type: String, default: 'info@gamanata.com', trim: true, lowercase: true },
    contactPhone: { type: String, default: '+94 11 234 5678', trim: true },
    address: { type: String, default: '123 Main Street, Colombo, Sri Lanka', trim: true },
    currency: { type: String, default: 'LKR' },
    timezone: { type: String, default: 'Asia/Colombo' },

    // Booking settings (UI-facing)
    bookingSettings: {
        minBookingHours: { type: Number, min: 1, default: 1 },
        maxBookingDays: { type: Number, min: 1, default: 30 },
        cancellationHours: { type: Number, min: 0, default: 24 },
        requireDeposit: { type: Boolean, default: true },
        depositPercentage: { type: Number, min: 0, max: 100, default: 20 },
    },

    // Existing backend fields
    devicePrice: { type: Number, required: true, min: 0, default: 1000 },
    taxRate: { type: Number, min: 0, max: 100, default: 15 },
    minimumRentalDays: { type: Number, min: 1, default: 1 },
    maxVehicleImages: { type: Number, min: 1, default: 5 },
    systemMaintenance: { type: Boolean, default: false },
    maintenanceMessage: String
}, {
    timestamps: true
})

systemSettingsSchema.path('currency').validate({
  validator: function(v) {
    return ['LKR', 'USD', 'EUR'].includes(v)
  },
  message: 'Currency must be LKR, USD or EUR'
})

module.exports = mongoose.model('SystemSettings', systemSettingsSchema)
