const express = require('express');
const multer = require('multer');
const { uploadImage } = require('../services/cloudinaryService');
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const apiResponse = require('../utils/apiResponse');

const storage = multer.memoryStorage();
const upload = multer({ storage });
const router = express.Router();

router.post('/reports', authenticate, authorize('admin', 'doctor', 'patient', 'receptionist'), upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json(apiResponse({ success: false, message: 'File is required' }));
    const result = await uploadImage(req.file.path || req.file.buffer);
    res.status(201).json(apiResponse({ success: true, message: 'File uploaded', data: { url: result } }));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
