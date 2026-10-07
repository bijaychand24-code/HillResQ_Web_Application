const storageService = require('../services/storageService');

/**
 * @desc    Upload an incident evidence image
 * @route   POST /api/upload
 * @access  Private
 */
const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded'
      });
    }

    const fileResult = await storageService.saveFile(req.file);

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      url: fileResult.url,
      filename: fileResult.filename,
      size: fileResult.size,
      mimetype: fileResult.mimetype
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadImage };
