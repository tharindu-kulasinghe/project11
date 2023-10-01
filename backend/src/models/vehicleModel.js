const mongoose = require('mongoose')

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

const vehicleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  vehicleType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VehicleType',
    required: false
  },
  pricePerDay: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  seats: {
    type: Number,
    required: true,
    min: 1
  },
  bags: {
    type: Number,
    required: true,
    min: 0
  },
  transmission: {
    type: String,
    enum: ['Auto', 'Manual'],
    required: true
  },
  fuelType: {
    type: String,
    enum: ['Gasoline', 'Diesel', 'Hybrid', 'Electric'],
    required: true
  },
  features: {
    gpsNavigation: { type: Boolean, default: false },
    bluetooth: { type: Boolean, default: false },
    backupCamera: { type: Boolean, default: false },
    leatherSeats: { type: Boolean, default: false },
    heatedSeats: { type: Boolean, default: false },
    sunroof: { type: Boolean, default: false },
    usbPorts: { type: Boolean, default: false },
    androidAuto: { type: Boolean, default: false },
    appleCarPlay: { type: Boolean, default: false },
    cruiseControl: { type: Boolean, default: false },
    parkingSensors: { type: Boolean, default: false },
    childSeat: { type: Boolean, default: false },
    airConditioning: { type: Boolean, default: false },
  },
  available: {
    type: Boolean,
    default: true
  },
  location: {
    type: String,
    required: true
  },
  pickupLocation: {
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
  pickupAddress: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear()
  },
  model: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  mileage: {
    type: Number,
    required: true,
    min: 0
  },
  color: {
    type: String,
    required: true
  },
  licensePlate: {
    type: String,
    required: true,
    unique: true
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
  }
}, {
  timestamps: true
})

vehicleSchema.index({ pickupLocation: '2dsphere' })

vehicleSchema.index({
  title: 'text',
  description: 'text',
  brand: 'text',
  model: 'text'
})

vehicleSchema.virtual('wishlistStatus', {
  ref: 'Wishlist',
  localField: '_id',
  foreignField: 'vehicleId',
  justOne: true
})

vehicleSchema.virtual('wishlistCount', {
  ref: 'Wishlist',
  localField: '_id',
  foreignField: 'vehicleId',
  count: true
})

vehicleSchema.set('toJSON', { virtuals: true })
vehicleSchema.set('toObject', { virtuals: true })

vehicleSchema.pre('save', async function(next) {
  if (this.isModified('title') || this.isNew) {
    let slug = generateSlug(this.title)
    let counter = 1
    let originalSlug = slug

    while (await mongoose.models.Vehicle.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${originalSlug}-${counter}`
      counter++
    }

    this.slug = slug
  }
  next()
})

module.exports = mongoose.model('Vehicle', vehicleSchema)
