const { body, validationResult } = require('express-validator');

/**
 * Middleware to check validation results and return formatted response
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

/**
 * Validation rules for user registration
 */
const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail({ gmail_remove_dots: false, gmail_remove_subaddress: false }),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
];

/**
 * Validation rules for user login
 */
const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail({ gmail_remove_dots: false, gmail_remove_subaddress: false }),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

/**
 * Validation rules for incident reporting
 */
const validateIncident = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 150 })
    .withMessage('Title cannot exceed 150 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('type')
    .notEmpty()
    .withMessage('Incident type is required')
    .isIn([
      'landslide',
      'flood',
      'road_block',
      'fallen_tree',
      'infrastructure_damage',
      'other'
    ])
    .withMessage('Invalid incident type'),
  body('severity')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid severity level'),
  body('latitude')
    .notEmpty()
    .withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be a valid number between -90 and 90'),
  body('longitude')
    .notEmpty()
    .withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be a valid number between -180 and 180'),
  body('locationName')
    .trim()
    .notEmpty()
    .withMessage('Location landmark is required')
    .isLength({ max: 200 })
    .withMessage('Location landmark cannot exceed 200 characters'),
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateIncident,
  handleValidationErrors
};
