const User = require('../models/User');

/**
 * @desc    Get all users with filtering, pagination, and role search
 * @route   GET /api/users
 * @access  Private / Admin
 */
const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.role) {
      query.role = req.query.role;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get list of responders for assignment dropdown
 * @route   GET /api/users/responders
 * @access  Private / Admin
 */
const getResponders = async (req, res, next) => {
  try {
    const responders = await User.find({ role: 'responder' })
      .select('name email role')
      .sort({ name: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: responders
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user role (promote to responder or admin)
 * @route   PATCH /api/users/:id/role
 * @access  Private / Admin
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const { id } = req.params;

    if (!['citizen', 'responder', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be citizen, responder, or admin.'
      });
    }

    // Prevent admin from accidentally demoting themselves if they are the only admin
    if (req.user._id.toString() === id && role !== 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot demote the only administrator in the system.'
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `User role successfully updated to ${role}`,
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, getResponders, updateUserRole };
