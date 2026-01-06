/**
 * Placement Settings Model
 * 
 * @description System-wide settings for placement rules,
 * eligibility criteria, and configuration.
 */

const mongoose = require('mongoose');

const placementSettingsSchema = new mongoose.Schema({
  // Settings Key (singleton document)
  key: {
    type: String,
    default: 'PLACEMENT_SETTINGS',
    unique: true
  },
  
  // College Information
  collegeInfo: {
    name: {
      type: String,
      default: 'Engineering College'
    },
    code: String,
    address: String,
    website: String,
    tpoEmail: String,
    tpoPhone: String
  },
  
  // Academic Configuration
  academic: {
    currentAcademicYear: {
      type: String,
      default: '2025-2026'
    },
    activeBatches: [{
      type: String // e.g., "2022-2026", "2023-2027"
    }],
    branches: [{
      code: String,
      name: String,
      isActive: {
        type: Boolean,
        default: true
      }
    }]
  },
  
  // Default Eligibility Rules
  eligibilityRules: {
    minCgpa: {
      type: Number,
      default: 6.0
    },
    maxBacklogs: {
      type: Number,
      default: 0
    },
    activeBacklogsAllowed: {
      type: Boolean,
      default: false
    },
    minTenthPercentage: {
      type: Number,
      default: 60
    },
    minTwelfthPercentage: {
      type: Number,
      default: 60
    },
    gapYearsAllowed: {
      type: Number,
      default: 1
    },
    higherStudiesAllowed: {
      type: Boolean,
      default: false
    }
  },
  
  // Placement Rules
  placementRules: {
    maxOffersAllowed: {
      type: Number,
      default: 2
    },
    dreamCompanyThreshold: {
      type: Number,
      default: 10 // LPA
    },
    superDreamThreshold: {
      type: Number,
      default: 20 // LPA
    },
    allowMultipleOffers: {
      type: Boolean,
      default: true
    },
    blockedAfterPlacement: {
      type: Boolean,
      default: false
    },
    canApplyAfterSelection: {
      type: Boolean,
      default: true // Can apply to dream companies after selection
    }
  },
  
  // AI Configuration
  aiSettings: {
    enabled: {
      type: Boolean,
      default: true
    },
    autoShortlist: {
      type: Boolean,
      default: false
    },
    shortlistThreshold: {
      type: Number,
      default: 70 // Minimum AI score for auto-shortlist
    },
    skillMatchWeight: {
      type: Number,
      default: 0.4
    },
    cgpaWeight: {
      type: Number,
      default: 0.3
    },
    branchMatchWeight: {
      type: Number,
      default: 0.2
    },
    experienceWeight: {
      type: Number,
      default: 0.1
    }
  },
  
  // Application Settings
  applicationSettings: {
    requireResume: {
      type: Boolean,
      default: true
    },
    requireCoverLetter: {
      type: Boolean,
      default: false
    },
    allowWithdrawal: {
      type: Boolean,
      default: true
    },
    withdrawalDeadlineHours: {
      type: Number,
      default: 24 // Hours before deadline
    },
    maxApplicationsPerStudent: {
      type: Number,
      default: 0 // 0 = unlimited
    }
  },
  
  // Notification Settings
  notifications: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    smsNotifications: {
      type: Boolean,
      default: false
    },
    notifyOnNewJob: {
      type: Boolean,
      default: true
    },
    notifyOnStatusChange: {
      type: Boolean,
      default: true
    },
    notifyOnDeadline: {
      type: Boolean,
      default: true
    },
    deadlineReminderDays: {
      type: Number,
      default: 2
    }
  },
  
  // Report Settings
  reportSettings: {
    defaultReportFormat: {
      type: String,
      enum: ['PDF', 'CSV', 'EXCEL'],
      default: 'PDF'
    },
    includePhotos: {
      type: Boolean,
      default: false
    },
    includeContactInfo: {
      type: Boolean,
      default: true
    }
  },
  
  // Maintenance Mode
  maintenance: {
    enabled: {
      type: Boolean,
      default: false
    },
    message: String,
    allowedRoles: [{
      type: String,
      enum: ['ADMIN']
    }]
  },
  
  // Feature Flags
  features: {
    studentRegistration: {
      type: Boolean,
      default: true
    },
    companyRegistration: {
      type: Boolean,
      default: true
    },
    jobApplications: {
      type: Boolean,
      default: true
    },
    resumeUpload: {
      type: Boolean,
      default: true
    },
    aiScoring: {
      type: Boolean,
      default: true
    }
  },
  
  // Last Updated By
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Static method to get settings (singleton)
placementSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne({ key: 'PLACEMENT_SETTINGS' });
  
  if (!settings) {
    // Create default settings
    settings = await this.create({
      key: 'PLACEMENT_SETTINGS',
      academic: {
        branches: [
          { code: 'CSE', name: 'Computer Science', isActive: true },
          { code: 'IT', name: 'Information Technology', isActive: true },
          { code: 'ECE', name: 'Electronics & Communication', isActive: true },
          { code: 'EE', name: 'Electrical Engineering', isActive: true },
          { code: 'ME', name: 'Mechanical Engineering', isActive: true },
          { code: 'CE', name: 'Civil Engineering', isActive: true },
          { code: 'CHEM', name: 'Chemical Engineering', isActive: true },
          { code: 'BT', name: 'Biotechnology', isActive: true }
        ],
        activeBatches: ['2022-2026', '2023-2027']
      }
    });
  }
  
  return settings;
};

// Static method to update settings
placementSettingsSchema.statics.updateSettings = async function(updates, userId) {
  return await this.findOneAndUpdate(
    { key: 'PLACEMENT_SETTINGS' },
    { 
      ...updates,
      lastUpdatedBy: userId
    },
    { new: true, upsert: true }
  );
};

module.exports = mongoose.model('PlacementSettings', placementSettingsSchema);
