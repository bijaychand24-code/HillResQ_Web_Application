const express = require('express');
const router = express.Router();
const {
  createIncident,
  getIncidents,
  getIncidentById,
  updateIncident,
  deleteIncident,
  getIncidentStats
} = require('../controllers/incidentController');
const {
  protect,
  authorize,
  optionalAuth
} = require('../middleware/authMiddleware');
const { validateIncident } = require('../middleware/validator');

// Stats endpoint
router.get('/stats', protect, getIncidentStats);

// Incident listing with optionalAuth to personalize if user is logged in
router.get('/', optionalAuth, getIncidents);

// Incident creation
router.post('/', protect, validateIncident, createIncident);

// Single incident retrieval
router.get('/:id', optionalAuth, getIncidentById);

// Incident update (role-protected within controller)
router.patch('/:id', protect, updateIncident);

// Incident deletion (Admin only)
router.delete('/:id', protect, authorize('admin'), deleteIncident);

module.exports = router;
