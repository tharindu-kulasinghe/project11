const express = require('express')
const router = express.Router()
const contactController = require('../controllers/contactController')
const { protect, authorize } = require('../middleware/auth')

// Public
router.post('/', contactController.createContact)

// Admin
router.get('/', protect, authorize('admin'), contactController.getAllContacts)
router.get('/:id', protect, authorize('admin'), contactController.getContactById)
router.put('/:id', protect, authorize('admin'), contactController.updateContact)
router.delete('/:id', protect, authorize('admin'), contactController.deleteContact)

module.exports = router

