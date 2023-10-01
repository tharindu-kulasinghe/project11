const mongoose = require('mongoose')

const contactSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  subject: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  agreeToMarketing: { type: Boolean, default: false },
  status: { type: String, enum: ['new', 'in_progress', 'resolved'], default: 'new' }
}, { timestamps: true })

contactSchema.index({ email: 1, createdAt: -1 })

module.exports = mongoose.model('Contact', contactSchema)

