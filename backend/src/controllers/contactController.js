const Contact = require('../models/contactModel')

// Public: create a new contact message
exports.createContact = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, subject, message, agreeToMarketing } = req.body
    if (!firstName || !lastName || !email || !subject || !message) {
      return res.status(400).json({ message: 'Missing required fields' })
    }
    const doc = await Contact.create({ firstName, lastName, email, phone, subject, message, agreeToMarketing: !!agreeToMarketing })
    res.status(201).json({ message: 'Message received', id: doc._id })
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit message', error: err.message })
  }
}

// Admin: list all contact messages
exports.getAllContacts = async (req, res) => {
  try {
    const items = await Contact.find().sort({ createdAt: -1 })
    res.json(items)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch contacts', error: err.message })
  }
}

// Admin: get one by id
exports.getContactById = async (req, res) => {
  try {
    const item = await Contact.findById(req.params.id)
    if (!item) return res.status(404).json({ message: 'Not found' })
    res.json(item)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch contact', error: err.message })
  }
}

// Admin: update status or fields
exports.updateContact = async (req, res) => {
  try {
    const update = {}
    if (req.body.status) {
      const s = String(req.body.status).toLowerCase()
      update.status = ['new', 'in_progress', 'resolved'].includes(s) ? s : 'new'
    }
    if (req.body.agreeToMarketing !== undefined) update.agreeToMarketing = !!req.body.agreeToMarketing
    const item = await Contact.findByIdAndUpdate(req.params.id, { $set: update }, { new: true, runValidators: true })
    if (!item) return res.status(404).json({ message: 'Not found' })
    res.json({ message: 'Updated', contact: item })
  } catch (err) {
    res.status(500).json({ message: 'Failed to update contact', error: err.message })
  }
}

// Admin: delete
exports.deleteContact = async (req, res) => {
  try {
    const item = await Contact.findById(req.params.id)
    if (!item) return res.status(404).json({ message: 'Not found' })
    await Contact.findByIdAndDelete(req.params.id)
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete contact', error: err.message })
  }
}

