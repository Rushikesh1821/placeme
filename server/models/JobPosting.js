/**
 * Job Posting Model
 * 
 * @description Job postings by companies with eligibility criteria,
 * required skills, and package details.
 */

const mongoose = require('mongoose');

const jobPostingSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Job Details
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 5000
  },
  jobType: {
    type: String,
    required: true,
    enum: ['Full-time', 'Internship', 'Part-time', 'Contract']
  },
  workMode: {
    type: String,
    enum: ['On-site', 'Remote', 'Hybrid'],
    default: 'On-site'
  },
  location: [{
    city: String,
    state: String,
    country: { type: String, default: 'India' }
  }],

  // Role Details
  department: {
    type: String,
    required: true
  },
  roles: [{
    type: String,
    trim: true
  }],
  responsibilities: [{
    type: String
  }],

  // Eligibility Criteria
  eligibility: {
    branches: [{
      type: String,
      required: true
    }],
    minCgpa: {
      type: Number,
      required: true,
      min: 0,
      max: 10
    },
    maxBacklogs: {
      type: Number,
      default: 0
    },
    activeBacklogsAllowed: {
      type: Boolean,
      default: false
    },
    graduationYear: {
      type: Number,
      required: true
    },
    minTenthPercentage: {
      type: Number,
      default: 0
    },
    minTwelfthPercentage: {
      type: Number,
      default: 0
    },
    gapAllowed: {
      type: Boolean,
      default: true
    },
    maxGapYears: {
      type: Number,
      default: 1
    }
  },

  // Required Skills
  requiredSkills: {
    mandatory: [{
      skill: String,
      proficiency: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
      }
    }],
    preferred: [{
      skill: String,
      proficiency: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
      }
    }]
  },

  // Experience Requirements
  experience: {
    minYears: {
      type: Number,
      default: 0
    },
    maxYears: {
      type: Number
    },
    internshipRequired: {
      type: Boolean,
      default: false
    }
  },

  // Package Details
  package: {
    ctc: {
      type: Number, // In LPA
      required: true
    },
    baseSalary: Number,
    bonus: Number,
    stocks: Number,
    joiningBonus: Number,
    relocation: Boolean,
    currency: {
      type: String,
      default: 'INR'
    }
  },

  // Selection Process
  selectionProcess: [{
    round: {
      type: Number,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    description: String,
    duration: String, // e.g., "1 hour"
    mode: {
      type: String,
      enum: ['Online', 'Offline', 'Both']
    }
  }],

  // Important Dates
  dates: {
    applicationDeadline: {
      type: Date,
      required: true
    },
    driveDate: Date,
    joiningDate: Date,
    resultDate: Date
  },

  // Job Status
  status: {
    type: String,
    enum: ['Draft', 'Pending Approval', 'Active', 'Closed', 'Cancelled', 'Completed'],
    default: 'Draft'
  },

  // Vacancies
  vacancies: {
    total: {
      type: Number,
      default: 1
    },
    filled: {
      type: Number,
      default: 0
    }
  },

  // Approval Details
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  rejectionReason: String,

  // Application Statistics
  applicationStats: {
    totalApplications: {
      type: Number,
      default: 0
    },
    shortlisted: {
      type: Number,
      default: 0
    },
    selected: {
      type: Number,
      default: 0
    },
    rejected: {
      type: Number,
      default: 0
    }
  },

  // AI Matching Settings
  aiSettings: {
    useAiMatching: {
      type: Boolean,
      default: true
    },
    minEligibilityScore: {
      type: Number,
      default: 50
    },
    autoShortlist: {
      type: Boolean,
      default: false
    },
    autoShortlistThreshold: {
      type: Number,
      default: 75
    }
  },

  // Additional Information
  additionalInfo: {
    bond: {
      hasBond: Boolean,
      duration: Number, // In months
      amount: Number
    },
    serviceAgreement: String,
    benefits: [String],
    perks: [String]
  },

  // Attachments
  attachments: [{
    name: String,
    url: String,
    type: String
  }],

  // Tags
  tags: [{
    type: String,
    trim: true
  }],

  // Views count
  viewsCount: {
    type: Number,
    default: 0
  },

  // Featured job
  isFeatured: {
    type: Boolean,
    default: false
  }

}, {
  timestamps: true
});

// Indexes
jobPostingSchema.index({ company: 1, status: 1 });
jobPostingSchema.index({ 'eligibility.branches': 1 });
jobPostingSchema.index({ 'eligibility.minCgpa': 1 });
jobPostingSchema.index({ 'eligibility.graduationYear': 1 });
jobPostingSchema.index({ 'dates.applicationDeadline': 1 });
jobPostingSchema.index({ status: 1, 'dates.applicationDeadline': 1 });
jobPostingSchema.index({ title: 'text', description: 'text' });

// Virtual to check if job is open for applications
jobPostingSchema.virtual('isOpen').get(function() {
  const now = new Date();
  return (
    this.status === 'Active' &&
    this.dates.applicationDeadline > now &&
    this.vacancies.filled < this.vacancies.total
  );
});

// Static method to find active jobs
jobPostingSchema.statics.findActiveJobs = function(filters = {}) {
  const query = {
    status: 'Active',
    'dates.applicationDeadline': { $gt: new Date() }
  };

  if (filters.branch) {
    query['eligibility.branches'] = filters.branch;
  }

  if (filters.minCgpa) {
    query['eligibility.minCgpa'] = { $lte: filters.minCgpa };
  }

  if (filters.graduationYear) {
    query['eligibility.graduationYear'] = filters.graduationYear;
  }

  return this.find(query).populate('company', 'companyName companyLogo industry');
};

// Method to update application stats
jobPostingSchema.methods.updateApplicationStats = async function() {
  const Application = mongoose.model('Application');
  
  const stats = await Application.aggregate([
    { $match: { job: this._id } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const statMap = {};
  stats.forEach(s => {
    statMap[s._id] = s.count;
  });

  this.applicationStats = {
    totalApplications: Object.values(statMap).reduce((a, b) => a + b, 0),
    shortlisted: statMap['Shortlisted'] || 0,
    selected: statMap['Selected'] || 0,
    rejected: statMap['Rejected'] || 0
  };

  this.vacancies.filled = statMap['Selected'] || 0;

  await this.save();
};

// Method to check if student meets basic eligibility
jobPostingSchema.methods.checkBasicEligibility = function(studentProfile) {
  const eligibility = this.eligibility;
  const academic = studentProfile.academicInfo;

  // Check CGPA
  if (academic.cgpa < eligibility.minCgpa) {
    return { eligible: false, reason: 'CGPA below minimum requirement' };
  }

  // Check branch
  if (!eligibility.branches.includes(academic.branch)) {
    return { eligible: false, reason: 'Branch not eligible' };
  }

  // Check graduation year
  if (academic.graduationYear !== eligibility.graduationYear) {
    return { eligible: false, reason: 'Graduation year mismatch' };
  }

  // Check backlogs
  if (academic.activeBacklogs > 0 && !eligibility.activeBacklogsAllowed) {
    return { eligible: false, reason: 'Active backlogs not allowed' };
  }

  if (academic.backlogs > eligibility.maxBacklogs) {
    return { eligible: false, reason: 'Too many backlogs' };
  }

  return { eligible: true, reason: 'Meets all basic criteria' };
};

jobPostingSchema.set('toJSON', { virtuals: true });
jobPostingSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('JobPosting', jobPostingSchema);
