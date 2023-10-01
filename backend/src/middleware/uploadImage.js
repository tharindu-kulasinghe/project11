const multer = require('multer')
const path = require('path')
const fs = require('fs')

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads/images')
    fs.mkdirSync(uploadPath, { recursive: true })
    cb(null, uploadPath)
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase()
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}`
    cb(null, `${uniqueName}${ext}`)
  }
})

function fileFilter(req, file, cb) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
  if (allowed.includes(file.mimetype)) return cb(null, true)
  cb(new Error('Invalid image type'))
}

const limits = { fileSize: 5 * 1024 * 1024 }

const upload = multer({ storage, fileFilter, limits })

module.exports = {
  uploadImageSingle: (fieldName) => upload.single(fieldName),
  uploadImageArray: (fieldName, maxCount) => upload.array(fieldName, maxCount),
  uploadImageFields: (fields) => upload.fields(fields)
}
