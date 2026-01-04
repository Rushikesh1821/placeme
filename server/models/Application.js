/**
 * Application Model
 * 
 * @description Student job applications with status tracking,
 * AI scores, and interview progress.
 */

const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentProfile',
    required: true
  },
  studentUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobPosting',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },

  // Application Status
  status: {
    type: String,
    enum: [
      'Applied',
      'Under Review',
      'Shortlisted',
      'Interview Scheduled',
      'In Progress',
      'Selected',
      'Waitlisted',
      'Rejected',
      'Withdrawn',
      'Offer Accepted',
      'Offer Declined'
    ],
    default: 'Applied'
  },

  // AI Eligibility Score
  aiScore: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AIScore'
  },
  eligibilityScore: {
    type: Number,
    min: 0,
    max: 100
  },
  eligibilityStatus: {
    type: String,
    enum: ['Eligible', 'Partially Eligible', 'Not Eligible'],
    default: 'Eligible'
  },

  // Resume used for application
  resumeUsed: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume'
  },

  // Cover Letter (optional)
  coverLetter: {
    type: String,
    maxlength: 3000
  },

  // Additional Questions/Answers
  additionalAnswers: [{
    question: String,
    answer: String
  }],

  // Interview Progress
  interviewProgress: [{
    round: {
      type: Number,
      required: true
    },
    roundName: String,
    scheduledAt: Date,
    completedAt: Date,
    mode: {
      type: String,
      enum: ['Online', 'Offline']
    },
    venue: String, // For offline
    meetingLink: String, // For online
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Passed', 'Failed', 'No Show', 'Rescheduled'],
      default: 'Scheduled'
    },
    feedback: String,
    score: Number,
    interviewerNotes: String
  }],

  // Offer Details (if selected)
  offerDetails: {
    ctc: Number,
    joiningDate: Date,
    location: String,
    designation: String,
    offerLetterUrl: String,
    offerSentAt: Date,
    offerExpiresAt: Date,
    offerResponseAt: Date,
    offerResponse: {
      type: String,
      enum: ['Pending', 'Accepted', 'Declined', 'Negotiating']
    }
  },

  // Status History
  statusHistory: [{
    status: String,
    changedAt: {
      type: Date,
      default: Date.now
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    remarks: String
  }],

  // Recruiter Notes
  recruiterNotes: [{
    note: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Rejection Details
  rejectionDetails: {
    reason: String,
    stage: String,
    feedback: String,
    rejectedAt: Date,
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },

  // Withdrawal Details
  withdrawalDetails: {
    reason: String,
    withdrawnAt: Date
  },

  // Flags
  isShortlistedByAI: {
    type: Boolean,
    default: false
  },
  isManuallyShortlisted: {
    type: Boolean,
    default: false
  },
  isPriorityCandidate: {
    type: Boolean,
    default: false
  },

  // Timestamps for tracking
  appliedAt: {
    type: Date,
    default: Date.now
  },
  lastUpdatedAt: {
    type: Date,
    default: Date.now
  }

}, {
  timestamps: true
});

// Compound indexes
applicationSchema.index({ student: 1, job: 1 }, { unique: true }); // Prevent duplicate applications
applicationSchema.index({ job: 1, status: 1 });
applicationSchema.index({ company: 1, status: 1 });
applicationSchema.index({ student: 1, status: 1 });
applicationSchema.index({ eligibilityScore: -1 });
applicationSchema.index({ appliedAt: -1 });

// Pre-save hook to update status history
applicationSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date()
    });
    this.lastUpdatedAt = new Date();
  }
  next();
});

// Static method to get applications by status
applicationSchema.statics.getByStatus = function(jobId, status) {
  const query = { job: jobId };
  if (status) {
    query.status = status;
  }
  return this.find(query)
    .populate('student')
    .populate('studentUser', 'firstName lastName email')
    .sort({ eligibilityScore: -1 });
};

// Static method to get student's applications
applicationSchema.statics.getStudentApplications = function(studentId) {
  return this.find({ student: studentId })
    .populate({
      path: 'job',
      select: 'title jobType package status dates',
      populate: {
        path: 'company',
        select: 'companyName companyLogo'
      }
    })
    .sort({ appliedAt: -1 });
};

// Method to update status
applicationSchema.methods.updateStatus = async function(newStatus, userId, remarks) {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    changedAt: new Date(),
    changedBy: userId,
    remarks
  });
  this.lastUpdatedAt = new Date();
  await this.save();

  // Update job stats
  const JobPosting = mongoose.model('JobPosting');
  const job = await JobPosting.findById(this.job);
  if (job) {
    await job.updateApplicationStats();
  }
};

// Method to schedule interview
applicationSchema.methods.scheduleInterview = async function(roundDetails) {
  this.interviewProgress.push({
    round: roundDetails.round,
    roundName: roundDetails.roundName,
    scheduledAt: roundDetails.scheduledAt,
    mode: roundDetails.mode,
    venue: roundDetails.venue,
    meetingLink: roundDetails.meetingLink,
    status: 'Scheduled'
  });
  this.status = 'Interview Scheduled';
  await this.save();
};

module.exports = mongoose.model('Application', applicationSchema);
