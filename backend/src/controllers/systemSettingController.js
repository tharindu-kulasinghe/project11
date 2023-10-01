const SystemSettings = require('../models/systemSettingsModel')
const asyncHandler = require('express-async-handler')

// @desc    Get system settings
// @route   GET /api/system
// @access  Private/Admin
const getSettings = asyncHandler(async (req, res) => {
  // Try to find existing settings, create default if none exist
  let settings = await SystemSettings.findOne()

  if (!settings) {
    settings = await SystemSettings.create({})
  }

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
})

// @desc    Update system settings
// @route   PUT /api/system
// @access  Private/Admin
const updateSettings = asyncHandler(async (req, res) => {
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
    res.status(400)
    throw new Error('Please provide all required settings')
  }

  // Find or create settings document
  let settings = await SystemSettings.findOne()

  if (!settings) {
    settings = new SystemSettings()
  }

  // Update fields
  settings.siteName = siteName
  settings.contactEmail = contactEmail
  settings.contactPhone = contactPhone
  settings.address = address
  settings.currency = currency
  settings.timezone = timezone

  if (bookingSettings) {
    settings.bookingSettings = {
      ...settings.bookingSettings,
      ...bookingSettings
    }
  }

  const updatedSettings = await settings.save()

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
})

// @desc    Reset settings to defaults
// @route   PUT /api/system/reset
// @access  Private/Admin
const resetSettings = asyncHandler(async (req, res) => {
  // Delete existing settings to create fresh defaults
  await SystemSettings.deleteMany({})

  // Create new settings with defaults
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
})

module.exports = {
  getSettings,
  updateSettings,
  resetSettings
}