const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an incident title'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    description: {
      type: String,
      required: [true, 'Please provide a detailed description of the incident'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    type: {
      type: String,
      required: [true, 'Please specify the incident type'],
      enum: {
        values: [
          'landslide',
          'flood',
          'road_block',
          'fallen_tree',
          'infrastructure_damage',
          'other'
        ],
        message: '{VALUE} is not a valid incident type'
      }
    },
    severity: {
      type: String,
      required: [true, 'Please specify severity level'],
      enum: {
        values: ['low', 'medium', 'high', 'critical'],
        message: '{VALUE} is not a valid severity level'
      },
      default: 'medium'
    },
    latitude: {
      type: Number,
      required: [true, 'Please provide latitude coordinate'],
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    longitude: {
      type: Number,
      required: [true, 'Please provide longitude coordinate'],
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    },
    locationName: {
      type: String,
      required: [true, 'Please provide a descriptive location name / landmark'],
      trim: true,
      maxlength: [200, 'Location name cannot exceed 200 characters']
    },
    imageUrl: {
      type: String,
      default: null
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Incident must be linked to reporting citizen']
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    status: {
      type: String,
      enum: {
        values: [
          'reported',
          'verified',
          'assigned',
          'in_progress',
          'resolved',
          'rejected'
        ],
        message: '{VALUE} is not a valid incident status'
      },
      default: 'reported'
    },
    responseNotes: {
      type: String,
      default: '',
      trim: true,
      maxlength: [2000, 'Response notes cannot exceed 2000 characters']
    }
  },
  {
    timestamps: true
  }
);

// Indexes for query performance and filtering
incidentSchema.index({ status: 1 });
incidentSchema.index({ severity: 1 });
incidentSchema.index({ type: 1 });
incidentSchema.index({ reportedBy: 1 });
incidentSchema.index({ assignedTo: 1 });
incidentSchema.index({ createdAt: -1 });
incidentSchema.index({ latitude: 1, longitude: 1 });

// Full-text search index across title, description, and locationName
incidentSchema.index({
  title: 'text',
  description: 'text',
  locationName: 'text'
});

const Incident = mongoose.model('Incident', incidentSchema);

module.exports = Incident;
