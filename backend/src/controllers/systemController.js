const SystemSettings = require('../models/systemSettingsModel')

// Get or create system settings
const getSystemSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne({})
    if (!settings) {
      settings = new SystemSettings({})
      await settings.save()
    }

    // Return only UI-facing fields
    res.json({
      siteName: settings.siteName,
      contactEmail: settings.contactEmail,
      contactPhone: settings.contactPhone,
      address: settings.address,
      currency: settings.currency,
      timezone: settings.timezone,
      bookingSettings: {
        minBookingHours: settings.bookingSettings.minBookingHours,
        maxBookingDays: settings.bookingSettings.maxBookingDays,
        cancellationHours: settings.bookingSettings.cancellationHours,
        requireDeposit: settings.bookingSettings.requireDeposit,
        depositPercentage: settings.bookingSettings.depositPercentage
      }
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Update system settings
const updateSystemSettings = async (req, res) => {
  try {
    const {
      siteName,
      contactEmail,
      contactPhone,
      address,
      currency,
      timezone,
      bookingSettings
    } = req.body

    // Validate required fields
    if (!siteName || !contactEmail || !contactPhone || !address) {
      return res.status(400).json({ message: 'Please provide all required settings' })
    }

    let settings = await SystemSettings.findOne({})
    if (!settings) {
      settings = new SystemSettings()
    }

    // Update only UI-facing fields
    settings.siteName = siteName
    settings.contactEmail = contactEmail
    settings.contactPhone = contactPhone
    settings.address = address
    settings.currency = currency
    settings.timezone = timezone

    if (bookingSettings) {
      settings.bookingSettings = {
        ...settings.bookingSettings.toObject(),
        ...bookingSettings
      }
    }

    const updatedSettings = await settings.save()

    // Return only UI-facing fields
    res.json({
      siteName: updatedSettings.siteName,
      contactEmail: updatedSettings.contactEmail,
      contactPhone: updatedSettings.contactPhone,
      address: updatedSettings.address,
      currency: updatedSettings.currency,
      timezone: updatedSettings.timezone,
      bookingSettings: {
        minBookingHours: updatedSettings.bookingSettings.minBookingHours,
        maxBookingDays: updatedSettings.bookingSettings.maxBookingDays,
        cancellationHours: updatedSettings.bookingSettings.cancellationHours,
        requireDeposit: updatedSettings.bookingSettings.requireDeposit,
        depositPercentage: updatedSettings.bookingSettings.depositPercentage
      }
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Get device price (public endpoint)
const getDevicePrice = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne({})
    if (!settings) {
      settings = new SystemSettings({})
      await settings.save()
    }
    res.json({ devicePrice: settings.devicePrice, currency: settings.currency })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Reset settings to defaults
const resetSystemSettings = async (req, res) => {
  try {
    await SystemSettings.deleteMany({})
    const defaultSettings = await SystemSettings.create({})

    res.json({
      message: 'Settings reset to defaults',
      settings: {
        siteName: defaultSettings.siteName,
        contactEmail: defaultSettings.contactEmail,
        contactPhone: defaultSettings.contactPhone,
        address: defaultSettings.address,
        currency: defaultSettings.currency,
        timezone: defaultSettings.timezone,
        bookingSettings: {
          minBookingHours: defaultSettings.bookingSettings.minBookingHours,
          maxBookingDays: defaultSettings.bookingSettings.maxBookingDays,
          cancellationHours: defaultSettings.bookingSettings.cancellationHours,
          requireDeposit: defaultSettings.bookingSettings.requireDeposit,
          depositPercentage: defaultSettings.bookingSettings.depositPercentage
        }
      }
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = {
  getSystemSettings,
  updateSystemSettings,
  getDevicePrice,
  resetSystemSettings
}