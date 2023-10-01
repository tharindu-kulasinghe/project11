const User = require('../models/userModel')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// Register new user
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, role, licenseNumber, licenseClass, address, dateOfBirth } = req.body
    // Normalize address (may arrive as JSON string from multipart/form-data)
    let normalizedAddress
    if (address) {
      if (typeof address === 'string') {
        try {
          const parsed = JSON.parse(address)
          normalizedAddress = {
            street: parsed.street,
            city: parsed.city,
            province: parsed.province,
            postalCode: parsed.postalCode
          }
        } catch (e) {
          // fallback: store raw string into street if not JSON
          normalizedAddress = { street: address }
        }
      } else if (typeof address === 'object') {
        normalizedAddress = {
          street: address.street,
          city: address.city,
          province: address.province,
          postalCode: address.postalCode
        }
      }
    }
    const { licenseFrontImage, licenseBackImage } = req.files || {}

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' })
    } else if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' })
    } else if (!/^\+?[0-9]{10,15}$/.test(phone)) {
      return res.status(400).json({ message: 'Invalid phone number format' })
    }

    // Check if user exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      role: role || 'user',
      licenseNumber,
      licenseClass,
      licenseFrontImage: licenseFrontImage ? licenseFrontImage[0].filename : undefined,
      licenseBackImage: licenseBackImage ? licenseBackImage[0].filename : undefined,
      address: normalizedAddress,
      dateOfBirth
    })

    await user.save()

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message })
  }
}

// User login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Check if user exists
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message })
  }
}

// Get current user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password')
    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({ message: 'Failed to get user', error: error.message })
  }
}

// Update current user (non-file fields)
exports.updateMe = async (req, res) => {
  try {
    console.log('Update user - User ID:', req.user.userId)
    const { firstName, lastName, email, phone, licenseNumber, licenseClass, address, dateOfBirth, currentPassword, newPassword } = req.body

    // Handle password update first (needs current hash)
    if (newPassword) {
      const user = await User.findById(req.user.userId)
      if (!user) return res.status(404).json({ message: 'User not found' })
      if (!currentPassword) return res.status(400).json({ message: 'Current password is required to update password' })
      const isMatch = await bcrypt.compare(currentPassword, user.password)
      if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' })
      const hashedPassword = await bcrypt.hash(newPassword, 10)
      await User.findByIdAndUpdate(req.user.userId, { $set: { password: hashedPassword } })
    }

    // Build selective update object
    const update = {}
    if (firstName !== undefined) update.firstName = firstName
    if (lastName !== undefined) update.lastName = lastName
    if (email !== undefined) update.email = email
    if (phone !== undefined) update.phone = phone
    if (licenseNumber !== undefined) update.licenseNumber = licenseNumber
    if (licenseClass !== undefined) update.licenseClass = licenseClass
    if (dateOfBirth !== undefined) update.dateOfBirth = dateOfBirth
    if (address !== undefined) {
      update.address = {
        street: address?.street,
        city: address?.city,
        province: address?.province,
        postalCode: address?.postalCode
      }
    }

    const updated = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: update },
      { new: true, runValidators: true, context: 'query' }
    ).select('-password')

    if (!updated) return res.status(404).json({ message: 'User not found' })

    res.status(200).json({ message: 'Profile updated successfully', user: updated })
  } catch (error) {
    console.error('Update user error:', error)
    res.status(500).json({ message: 'Update failed', error: error.message })
  }
}

// Update license images (multipart/form-data)
exports.updateLicenseImages = async (req, res) => {
  try {
    const { licenseFrontImage, licenseBackImage } = req.files || {}
    const update = {}
    if (licenseFrontImage?.[0]) {
      update.licenseFrontImage = licenseFrontImage[0].filename
    }
    if (licenseBackImage?.[0]) {
      update.licenseBackImage = licenseBackImage[0].filename
    }
    if (Object.keys(update).length === 0) {
      return res.status(400).json({ message: 'No images provided' })
    }

    const updated = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: update },
      { new: true, runValidators: true, context: 'query' }
    ).select('-password')

    if (!updated) return res.status(404).json({ message: 'User not found' })

    res.status(200).json({ message: 'License images updated successfully', user: updated })
  } catch (error) {
    console.error('Update license images error:', error)
    res.status(500).json({ message: 'Image update failed', error: error.message })
  }
}

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password')
    res.status(200).json(users)
  } catch (error) {
    res.status(500).json({ message: 'Failed to get users', error: error.message })
  }
}

// Admin: get user by id
exports.getUserByIdAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({ message: 'Failed to get user', error: error.message })
  }
}

// Admin: create user (JSON)
exports.createUserAdmin = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, role, address, licenseNumber, licenseClass, dateOfBirth } = req.body
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'firstName, lastName, email and password are required' })
    }
    const exists = await User.findOne({ email })
    if (exists) return res.status(400).json({ message: 'User already exists' })
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      role: (role || 'user').toLowerCase() === 'admin' ? 'admin' : 'user',
      address: address ? {
        street: address.street,
        city: address.city,
        province: address.province,
        postalCode: address.postalCode,
      } : undefined,
      licenseNumber,
      licenseClass,
      dateOfBirth
    })
    await user.save()
    res.status(201).json({ message: 'User created', user: { id: user._id, firstName, lastName, email, role: user.role } })
  } catch (error) {
    res.status(500).json({ message: 'Failed to create user', error: error.message })
  }
}

// Admin: update user (JSON)
exports.updateUserAdmin = async (req, res) => {
  try {
    const { role, disabled, status, password, ...rest } = req.body
    const update = { ...rest }
    if (role !== undefined) update.role = (role || 'user').toLowerCase() === 'admin' ? 'admin' : 'user'
    // Map disabled/status to schema's status enum ('active'|'inactive')
    if (typeof disabled === 'boolean') {
      update.status = disabled ? 'inactive' : 'active'
    }
    if (status !== undefined) {
      const s = String(status).toLowerCase()
      update.status = (s === 'inactive' || s === 'disabled') ? 'inactive' : 'active'
    }
    if (rest.address) {
      update.address = {
        street: rest.address.street,
        city: rest.address.city,
        province: rest.address.province,
        postalCode: rest.address.postalCode,
      }
    }
    if (password) {
      update.password = await bcrypt.hash(password, 10)
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true, runValidators: true, context: 'query' }
    ).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.status(200).json({ message: 'User updated', user })
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user', error: error.message })
  }
}

// Admin: delete user
exports.deleteUserAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    await User.findByIdAndDelete(req.params.id)
    res.status(200).json({ message: 'User deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user', error: error.message })
  }
}