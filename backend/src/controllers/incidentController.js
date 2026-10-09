const Incident = require('../models/Incident');
const User = require('../models/User');
const storageService = require('../services/storageService');

const severityWeights = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1
};

/**
 * @desc    Create a new emergency incident report
 * @route   POST /api/incidents
 * @access  Private (Citizen, Responder, Admin)
 */
const createIncident = async (req, res, next) => {
  try {
    const {
      title,
      description,
      type,
      severity = 'medium',
      latitude,
      longitude,
      locationName,
      imageUrl
    } = req.body;

    const incident = await Incident.create({
      title,
      description,
      type,
      severity,
      severityWeight: severityWeights[severity] || 2,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      locationName,
      imageUrl: imageUrl || null,
      reportedBy: req.user._id,
      status: 'reported'
    });

    const populatedIncident = await Incident.findById(incident._id)
      .populate('reportedBy', 'name email role')
      .lean();

    res.status(201).json({
      success: true,
      message: 'Incident reported successfully. Emergency response teams have been notified.',
      data: populatedIncident
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all incidents with pagination, search, filter, and sorting
 * @route   GET /api/incidents
 * @access  Public (filtered view) / Private
 */
const getIncidents = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const query = {};

    // Filter by status
    if (req.query.status) {
      if (req.query.status === 'active') {
        query.status = { $nin: ['resolved', 'rejected'] };
      } else if (req.query.status !== 'all') {
        query.status = req.query.status;
      }
    }

    // Filter by severity
    if (req.query.severity) {
      if (req.query.severity !== 'all') {
        query.severity = req.query.severity;
      }
    }

    // Filter by type
    if (req.query.type) {
      if (req.query.type !== 'all') {
        query.type = req.query.type;
      }
    }

    // Filter by my reports (for logged-in citizens)
    if (req.query.mine === 'true') {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required to filter personal reports'
        });
      }
      query.reportedBy = req.user._id;
    }

    // Filter by assigned to me (for logged-in responders)
    if (req.query.assignedToMe === 'true') {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required to filter assigned incidents'
        });
      }
      query.assignedTo = req.user._id;
    }

    // Text search on title, description, or locationName
    if (req.query.search && req.query.search.trim()) {
      const searchTerm = req.query.search.trim();
      const searchRegex = new RegExp(searchTerm, 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { locationName: searchRegex }
      ];
    }

    // Sorting
    let sortOption = { createdAt: -1 };
    if (req.query.sortBy) {
      if (req.query.sortBy === 'oldest') {
        sortOption = { createdAt: 1 };
      } else if (req.query.sortBy === 'severity') {
        // High to low severity sorting priority using numeric weight
        sortOption = { severityWeight: -1, createdAt: -1 };
      }
    }

    const [incidents, total] = await Promise.all([
      Incident.find(query)
        .populate('reportedBy', 'name email')
        .populate('assignedTo', 'name email')
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),
      Incident.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: incidents,
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
 * @desc    Get single incident by ID
 * @route   GET /api/incidents/:id
 * @access  Public / Private
 */
const getIncidentById = async (req, res, next) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate('reportedBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .lean();

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident not found'
      });
    }

    res.status(200).json({
      success: true,
      data: incident
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update incident details, status, responder assignment, or response notes
 * @route   PATCH /api/incidents/:id
 * @access  Private (Role-based rules)
 */
const updateIncident = async (req, res, next) => {
  try {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident not found'
      });
    }

    const userRole = req.user.role;
    const userId = req.user._id.toString();

    const allowedUpdates = {};
    const {
      status,
      severity,
      assignedTo,
      responseNotes,
      title,
      description,
      locationName,
      latitude,
      longitude,
      imageUrl
    } = req.body;

    // ADMIN PERMISSIONS: full control
    if (userRole === 'admin') {
      const validStatuses = ['reported', 'verified', 'assigned', 'in_progress', 'resolved', 'rejected'];
      const validSeverities = ['low', 'medium', 'high', 'critical'];

      if (status !== undefined) {
        if (!validStatuses.includes(status)) {
          return res.status(400).json({
            success: false,
            message: `'${status}' is not a valid incident status`
          });
        }
        allowedUpdates.status = status;
      }

      if (severity !== undefined) {
        if (!validSeverities.includes(severity)) {
          return res.status(400).json({
            success: false,
            message: `'${severity}' is not a valid severity level`
          });
        }
        allowedUpdates.severity = severity;
        allowedUpdates.severityWeight = severityWeights[severity] || 2;
      }

      if (responseNotes !== undefined) allowedUpdates.responseNotes = responseNotes;
      if (title !== undefined) allowedUpdates.title = title;
      if (description !== undefined) allowedUpdates.description = description;
      if (locationName !== undefined) allowedUpdates.locationName = locationName;
      if (latitude !== undefined) allowedUpdates.latitude = parseFloat(latitude);
      if (longitude !== undefined) allowedUpdates.longitude = parseFloat(longitude);
      if (imageUrl !== undefined) allowedUpdates.imageUrl = imageUrl;

      // Handle responder assignment
      if (assignedTo !== undefined) {
        if (assignedTo === null || assignedTo === '') {
          allowedUpdates.assignedTo = null;
          // If status was 'assigned', move back to verified
          if (incident.status === 'assigned') {
            allowedUpdates.status = 'verified';
          }
        } else {
          // Verify assigned user is indeed a responder
          const responder = await User.findById(assignedTo);
          if (!responder || responder.role !== 'responder') {
            return res.status(400).json({
              success: false,
              message: 'Assigned user must exist and have the responder role'
            });
          }
          allowedUpdates.assignedTo = assignedTo;
          // Automatically set status to assigned if currently reported or verified
          if (['reported', 'verified'].includes(incident.status)) {
            allowedUpdates.status = 'assigned';
          }
        }
      }
    }
    // RESPONDER PERMISSIONS: can update status to in_progress or resolved, and update responseNotes
    else if (userRole === 'responder') {
      const isAssigned = incident.assignedTo && incident.assignedTo.toString() === userId;
      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message: 'You are only authorized to update incidents assigned to you'
        });
      }

      if (status !== undefined) {
        const allowedResponderStatuses = ['in_progress', 'resolved'];
        if (!allowedResponderStatuses.includes(status)) {
          return res.status(400).json({
            success: false,
            message: 'Responders can only set status to in_progress or resolved'
          });
        }
        allowedUpdates.status = status;
      }

      if (responseNotes !== undefined) {
        allowedUpdates.responseNotes = responseNotes;
      }
    }
    // CITIZEN PERMISSIONS: can edit title/description/image only if report is still in 'reported' state
    else if (userRole === 'citizen') {
      const isOwner = incident.reportedBy.toString() === userId;
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'You can only edit incidents that you reported'
        });
      }

      if (incident.status !== 'reported') {
        return res.status(400).json({
          success: false,
          message: 'Cannot edit an incident after emergency responders or admins have verified it'
        });
      }

      if (title !== undefined) allowedUpdates.title = title;
      if (description !== undefined) allowedUpdates.description = description;
      if (locationName !== undefined) allowedUpdates.locationName = locationName;
      if (latitude !== undefined) allowedUpdates.latitude = parseFloat(latitude);
      if (longitude !== undefined) allowedUpdates.longitude = parseFloat(longitude);
      if (imageUrl !== undefined) allowedUpdates.imageUrl = imageUrl;
    }

    if (Object.keys(allowedUpdates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid or permitted fields provided for update'
      });
    }

    const updatedIncident = await Incident.findByIdAndUpdate(
      req.params.id,
      allowedUpdates,
      { new: true, runValidators: true }
    )
      .populate('reportedBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .lean();

    res.status(200).json({
      success: true,
      message: 'Incident updated successfully',
      data: updatedIncident
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete incident permanently
 * @route   DELETE /api/incidents/:id
 * @access  Private / Admin
 */
const deleteIncident = async (req, res, next) => {
  try {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident not found'
      });
    }

    if (incident.imageUrl) {
      await storageService.deleteFile(incident.imageUrl);
    }

    await Incident.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Incident record permanently deleted'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get real aggregation statistics for role-specific dashboards
 * @route   GET /api/incidents/stats
 * @access  Private
 */
const getIncidentStats = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    const userId = req.user._id;

    if (userRole === 'admin') {
      const [
        totalIncidents,
        criticalIncidents,
        pendingVerification,
        assignedIncidents,
        inProgressIncidents,
        resolvedIncidents,
        totalUsers,
        byType
      ] = await Promise.all([
        Incident.countDocuments(),
        Incident.countDocuments({ severity: 'critical', status: { $ne: 'resolved' } }),
        Incident.countDocuments({ status: 'reported' }),
        Incident.countDocuments({ status: 'assigned' }),
        Incident.countDocuments({ status: 'in_progress' }),
        Incident.countDocuments({ status: 'resolved' }),
        User.countDocuments(),
        Incident.aggregate([
          { $group: { _id: '$type', count: { $sum: 1 } } }
        ])
      ]);

      return res.status(200).json({
        success: true,
        stats: {
          totalIncidents,
          criticalIncidents,
          pendingVerification,
          assignedIncidents,
          inProgressIncidents,
          resolvedIncidents,
          totalUsers,
          byType: byType.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {})
        }
      });
    }

    if (userRole === 'responder') {
      const [
        assignedIncidents,
        criticalAssigned,
        inProgressIncidents,
        resolvedIncidents
      ] = await Promise.all([
        Incident.countDocuments({ assignedTo: userId }),
        Incident.countDocuments({ assignedTo: userId, severity: 'critical', status: { $ne: 'resolved' } }),
        Incident.countDocuments({ assignedTo: userId, status: 'in_progress' }),
        Incident.countDocuments({ assignedTo: userId, status: 'resolved' })
      ]);

      return res.status(200).json({
        success: true,
        stats: {
          assignedIncidents,
          criticalAssigned,
          inProgressIncidents,
          resolvedIncidents
        }
      });
    }

    // Citizen stats
    const [totalReports, activeReports, resolvedReports] = await Promise.all([
      Incident.countDocuments({ reportedBy: userId }),
      Incident.countDocuments({ reportedBy: userId, status: { $nin: ['resolved', 'rejected'] } }),
      Incident.countDocuments({ reportedBy: userId, status: 'resolved' })
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalReports,
        activeReports,
        resolvedReports
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createIncident,
  getIncidents,
  getIncidentById,
  updateIncident,
  deleteIncident,
  getIncidentStats
};
