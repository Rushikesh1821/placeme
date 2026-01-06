/**
 * Placement Drive Model
 * 
 * @description Manages placement drives/recruitment events
 * with scheduling, company assignments, and tracking.
 */

const mongoose = require('mongoose');

const placementDriveSchema = new mongoose.Schema({
  // Drive Information
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    maxlength: 2000
  },
  academicYear: {
    type: String,
    required: true // e.g., "2025-2026"
  },
  batch: {
    type: String,
    required: true // e.g., "2022-2026"
  },
  driveType: {
    type: String,
    enum: ['Campus', 'Pool Campus', 'Off Campus', 'Virtual'],
    default: 'Campus'
  },
  
  // Companies participating
  companies: [{
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company'
    },
    status: {
      type: String,
      enum: ['Invited', 'Confirmed', 'Declined', 'Completed'],
      default: 'Invited'
    },
    invitedAt: Date,
    confirmedAt: Date,
    jobs: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobPosting'
    }]
  }],
  
  // Eligible Branches
  eligibleBranches: [{
    type: String
  }],
  
  // Eligibility Criteria
  eligibilityCriteria: {
    minCgpa: {
      type: Number,
      default: 0
    },
    maxBacklogs: {
      type: Number,
      default: 0
    },
    activeBacklogsAllowed: {
      type: Boolean,
      default: false
    }
  },
  
  // Drive Schedule
  schedule: {
    registrationStart: {
      type: Date,
      required: true
    },
    registrationEnd: {
      type: Date,
      required: true
    },
    driveStartDate: {
      type: Date,
      required: true
    },
    driveEndDate: {
      type: Date
    },
    resultDate: Date
  },
  
  // Venue Details
  venue: {
    name: String,
    address: String,
    isVirtual: {
      type: Boolean,
      default: false
    },
    meetingLink: String,
    instructions: String
  },
  
  // Drive Status
  status: {
    type: String,
    enum: ['Draft', 'Scheduled', 'Registration Open', 'Registration Closed', 'Ongoing', 'Completed', 'Cancelled'],
    default: 'Draft'
  },
  
  // Registered Students
  registeredStudents: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentProfile'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    eligibilityStatus: {
      type: String,
      enum: ['Eligible', 'Not Eligible', 'Override'],
      default: 'Eligible'
    }
  }],
  
  // Statistics
  stats: {
    totalRegistrations: {
      type: Number,
      default: 0
    },
    totalShortlisted: {
      type: Number,
      default: 0
    },
    totalSelected: {
      type: Number,
      default: 0
    },
    totalOffersAccepted: {
      type: Number,
      default: 0
    },
    averagePackage: {
      type: Number,
      default: 0
    },
    highestPackage: {
      type: Number,
      default: 0
    }
  },
  
  // Management
  coordinators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['Primary', 'Secondary', 'Support']
    }
  }],
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Notifications
  notifications: [{
    title: String,
    message: String,
    sentAt: Date,
    sentTo: {
      type: String,
      enum: ['All', 'Registered', 'Shortlisted', 'Selected']
    }
  }],
  
  // Documents
  documents: [{
    name: String,
    url: String,
    type: {
      type: String,
      enum: ['Schedule', 'Guidelines', 'Eligibility', 'Other']
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Notes
  notes: String,
  
  // Flags
  isActive: {
    type: Boolean,
    default: true
  },
  isLocked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
placementDriveSchema.index({ academicYear: 1, status: 1 });
placementDriveSchema.index({ 'schedule.driveStartDate': 1 });
placementDriveSchema.index({ status: 1, isActive: 1 });

// Update stats method
placementDriveSchema.methods.updateStats = async function() {
  const Application = mongoose.model('Application');
  const JobPosting = mongoose.model('JobPosting');
  
  // Get all jobs in this drive
  const jobIds = this.companies.flatMap(c => c.jobs);
  
  if (jobIds.length === 0) return;
  
  const stats = await Application.aggregate([
    { $match: { job: { $in: jobIds } } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        shortlisted: {
          $sum: { $cond: [{ $in: ['$status', ['Shortlisted', 'Interview Scheduled', 'In Progress', 'Selected', 'Offer Accepted']] }, 1, 0] }
        },
        selected: {
          $sum: { $cond: [{ $in: ['$status', ['Selected', 'Offer Accepted']] }, 1, 0] }
        },
        accepted: {
          $sum: { $cond: [{ $eq: ['$status', 'Offer Accepted'] }, 1, 0] }
        }
      }
    }
  ]);
  
  if (stats.length > 0) {
    this.stats.totalRegistrations = stats[0].total;
    this.stats.totalShortlisted = stats[0].shortlisted;
    this.stats.totalSelected = stats[0].selected;
    this.stats.totalOffersAccepted = stats[0].accepted;
  }
  
  // Calculate package stats
  const packageStats = await JobPosting.aggregate([
    { $match: { _id: { $in: jobIds } } },
    {
      $group: {
        _id: null,
        avgPackage: { $avg: '$package.ctc' },
        maxPackage: { $max: '$package.ctc' }
      }
    }
  ]);
  
  if (packageStats.length > 0) {
    this.stats.averagePackage = packageStats[0].avgPackage || 0;
    this.stats.highestPackage = packageStats[0].maxPackage || 0;
  }
  
  await this.save();
};

module.exports = mongoose.model('PlacementDrive', placementDriveSchema);
