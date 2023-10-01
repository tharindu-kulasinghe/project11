const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const { protect, authorize } = require('../middleware/auth')
const { uploadImageFields } = require('../middleware/uploadImage')

// Public routes
router.post('/register', uploadImageFields([
  { name: 'licenseFrontImage', maxCount: 1 },
  { name: 'licenseBackImage', maxCount: 1 }
]), userController.register)
router.post('/login', userController.login)

// Protected routes
router.get('/me', protect, userController.getMe)
router.put('/me', protect, userController.updateMe)
router.put('/me/license-images', protect, uploadImageFields([
  { name: 'licenseFrontImage', maxCount: 1 },
  { name: 'licenseBackImage', maxCount: 1 }
]), userController.updateLicenseImages)

// Admin routes 
router.get('/admin/users', protect, authorize('admin'), userController.getAllUsers)
router.get('/admin/users/:id', protect, authorize('admin'), userController.getUserByIdAdmin)
router.post('/admin/users', protect, authorize('admin'), userController.createUserAdmin)
router.put('/admin/users/:id', protect, authorize('admin'), userController.updateUserAdmin)
router.delete('/admin/users/:id', protect, authorize('admin'), userController.deleteUserAdmin)

module.exports = router
