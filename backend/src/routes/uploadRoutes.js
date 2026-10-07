const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { uploadImage } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');

// Upload requires authentication
router.post('/', protect, upload.single('image'), uploadImage);

module.exports = router;
