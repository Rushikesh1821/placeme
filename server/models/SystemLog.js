/**
 * System Log Model
 * 
 * @description Tracks all administrative actions and system events
 * for audit trail and monitoring purposes.
 */

const mongoose = require('mongoose');

const systemLogSchema = new mongoose.Schema({
  // Action Information
  action: {
    type: String,
    required: true,
    enum: [
      // User Actions
      'USER_CREATED',
      'USER_UPDATED',
      'USER_DELETED',
      'USER_APPROVED',
      'USER_REJECTED',
      'USER_BLOCKED',
      'USER_UNBLOCKED',
      'ROLE_CHANGED',
      
      // Student Actions
      'STUDENT_APPROVED',
      'STUDENT_REJECTED',
      'STUDENT_PROFILE_UPDATED',
      'ELIGIBILITY_OVERRIDE',
      'PLACEMENT_STATUS_UPDATED',
      
      // Company Actions
      'COMPANY_APPROVED',
      'COMPANY_REJECTED',
      'COMPANY_BLOCKED',
      'COMPANY_UNBLOCKED',
      
      // Job Actions
      'JOB_APPROVED',
      'JOB_REJECTED',
      'JOB_CLOSED',
      'JOB_REOPENED',
      'APPLICATION_LOCKED',
      'APPLICATION_UNLOCKED',
      
      // Application Actions
      'APPLICATION_STATUS_UPDATED',
      'APPLICATION_SHORTLISTED',
      'APPLICATION_REJECTED',
      'OFFER_EXTENDED',
      'PLACEMENT_CONFIRMED',
      
      // Drive Actions
      'DRIVE_CREATED',
      'DRIVE_UPDATED',
      'DRIVE_STARTED',
      'DRIVE_COMPLETED',
      'DRIVE_CANCELLED',
      
      // System Actions
      'SETTINGS_UPDATED',
      'BULK_ACTION',
      'REPORT_GENERATED',
      'DATA_EXPORTED',
      'SYSTEM_CONFIG_CHANGED',
      
      // AI Actions
      'AI_SCORE_OVERRIDE',
      'AI_ENABLED',
      'AI_DISABLED',
      
      // Login/Session
      'ADMIN_LOGIN',
      'ADMIN_LOGOUT'
    ]
  },
  
  // Who performed the action
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Target of the action
  targetType: {
    type: String,
    enum: ['User', 'StudentProfile', 'Company', 'JobPosting', 'Application', 'PlacementDrive', 'Settings', 'System']
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId
  },
  targetName: {
    type: String // Human readable target name
  },
  
  // Action Details
  description: {
    type: String,
    required: true
  },
  
  // Before/After state (for tracking changes)
  previousState: {
    type: mongoose.Schema.Types.Mixed
  },
  newState: {
    type: mongoose.Schema.Types.Mixed
  },
  
  // Additional metadata
  metadata: {
    ipAddress: String,
    userAgent: String,
    reason: String,
    remarks: String,
    affectedCount: Number,
    additionalInfo: mongoose.Schema.Types.Mixed
  },
  
  // Severity level
  severity: {
    type: String,
    enum: ['INFO', 'WARNING', 'CRITICAL'],
    default: 'INFO'
  },
  
  // Category for filtering
  category: {
    type: String,
    enum: ['USER_MANAGEMENT', 'STUDENT_MANAGEMENT', 'COMPANY_MANAGEMENT', 'JOB_MANAGEMENT', 'APPLICATION_MANAGEMENT', 'PLACEMENT_DRIVE', 'SYSTEM', 'ANALYTICS'],
    required: true
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
systemLogSchema.index({ createdAt: -1 });
systemLogSchema.index({ action: 1, createdAt: -1 });
systemLogSchema.index({ performedBy: 1, createdAt: -1 });
systemLogSchema.index({ targetType: 1, targetId: 1 });
systemLogSchema.index({ category: 1, createdAt: -1 });
systemLogSchema.index({ severity: 1 });

// Static method to create a log entry
systemLogSchema.statics.log = async function(logData) {
  return await this.create(logData);
};

// Static method to get recent activity
systemLogSchema.statics.getRecentActivity = async function(limit = 50) {
  return await this.find()
    .populate('performedBy', 'firstName lastName email role')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get logs by user
systemLogSchema.statics.getByUser = async function(userId, options = {}) {
  const query = { performedBy: userId };
  const { startDate, endDate, action, limit = 100 } = options;
  
  if (startDate) query.createdAt = { $gte: startDate };
  if (endDate) query.createdAt = { ...query.createdAt, $lte: endDate };
  if (action) query.action = action;
  
  return await this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get logs by target
systemLogSchema.statics.getByTarget = async function(targetType, targetId) {
  return await this.find({ targetType, targetId })
    .populate('performedBy', 'firstName lastName email')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('SystemLog', systemLogSchema);
