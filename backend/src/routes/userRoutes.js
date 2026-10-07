const express = require('express');
const router = express.Router();
const {
  getUsers,
  getResponders,
  updateUserRole
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All user management routes require admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/', getUsers);
router.get('/responders', getResponders);
router.patch('/:id/role', updateUserRole);

module.exports = router;
