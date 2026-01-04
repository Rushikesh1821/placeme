/**
 * Student Profile Model
 * 
 * @description Comprehensive student profile with academic details,
 * skills, and placement-related information.
 */

const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Personal Information
  personalInfo: {
    phone: {
      type: String,
      trim: true
    },
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say']
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' }
    },
    linkedIn: String,
    github: String,
    portfolio: String
  },

  // Academic Information
  academicInfo: {
    rollNumber: {
      type: String,
      required: true,
      unique: true
    },
    department: {
      type: String,
      required: true,
      enum: [
        'Computer Science',
        'Information Technology',
        'Electronics',
        'Electrical',
        'Mechanical',
        'Civil',
        'Chemical',
        'Biotechnology',
        'Other'
      ]
    },
    branch: {
      type: String,
      required: true
    },
    batch: {
      type: String,
      required: true // e.g., "2022-2026"
    },
    graduationYear: {
      type: Number,
      required: true
    },
    cgpa: {
      type: Number,
      min: 0,
      max: 10,
      required: true
    },
    backlogs: {
      type: Number,
      default: 0,
      min: 0
    },
    activeBacklogs: {
      type: Number,
      default: 0,
      min: 0
    }
  },

  // Previous Education
  education: {
    tenth: {
      board: String,
      school: String,
      percentage: Number,
      yearOfPassing: Number
    },
    twelfth: {
      board: String,
      school: String,
      percentage: Number,
      yearOfPassing: Number,
      stream: String
    },
    diploma: {
      institution: String,
      percentage: Number,
      yearOfPassing: Number,
      branch: String
    }
  },

  // Skills
  skills: {
    technical: [{
      type: String,
      trim: true
    }],
    soft: [{
      type: String,
      trim: true
    }],
    languages: [{
      type: String,
      trim: true
    }],
    tools: [{
      type: String,
      trim: true
    }]
  },

  // Experience
  experience: [{
    type: {
      type: String,
      enum: ['Internship', 'Full-time', 'Part-time', 'Freelance', 'Project']
    },
    company: String,
    role: String,
    description: String,
    startDate: Date,
    endDate: Date,
    isCurrent: Boolean,
    skills: [String]
  }],

  // Projects
  projects: [{
    title: String,
    description: String,
    technologies: [String],
    link: String,
    github: String,
    startDate: Date,
    endDate: Date
  }],

  // Certifications
  certifications: [{
    name: String,
    issuer: String,
    issueDate: Date,
    expiryDate: Date,
    credentialId: String,
    credentialUrl: String
  }],

  // Achievements
  achievements: [{
    title: String,
    description: String,
    date: Date
  }],

  // Resume
  resume: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume'
  },

  // Placement Status
  placementStatus: {
    type: String,
    enum: ['Not Placed', 'Placed', 'Not Interested', 'Higher Studies'],
    default: 'Not Placed'
  },
  
  placedCompany: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  
  placedPackage: {
    type: Number // LPA
  },

  // Eligibility override by admin
  eligibilityOverride: {
    isOverridden: {
      type: Boolean,
      default: false
    },
    reason: String,
    overriddenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    overriddenAt: Date
  },

  // Profile completion percentage
  profileCompletion: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },

  // Verification status
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date

}, {
  timestamps: true
});

// Indexes
studentProfileSchema.index({ 'academicInfo.department': 1, 'academicInfo.graduationYear': 1 });
studentProfileSchema.index({ 'academicInfo.cgpa': -1 });
studentProfileSchema.index({ placementStatus: 1 });
studentProfileSchema.index({ 'skills.technical': 1 });

// Calculate profile completion
studentProfileSchema.methods.calculateProfileCompletion = function() {
  let completion = 0;
  const weights = {
    personalInfo: 15,
    academicInfo: 25,
    education: 15,
    skills: 20,
    experience: 10,
    projects: 10,
    resume: 5
  };

  // Personal Info
  if (this.personalInfo?.phone) completion += weights.personalInfo * 0.5;
  if (this.personalInfo?.linkedIn || this.personalInfo?.github) completion += weights.personalInfo * 0.5;

  // Academic Info (required fields)
  if (this.academicInfo?.rollNumber && this.academicInfo?.cgpa) {
    completion += weights.academicInfo;
  }

  // Education
  if (this.education?.tenth?.percentage) completion += weights.education * 0.5;
  if (this.education?.twelfth?.percentage) completion += weights.education * 0.5;

  // Skills
  if (this.skills?.technical?.length > 0) completion += weights.skills * 0.7;
  if (this.skills?.soft?.length > 0) completion += weights.skills * 0.3;

  // Experience
  if (this.experience?.length > 0) completion += weights.experience;

  // Projects
  if (this.projects?.length > 0) completion += weights.projects;

  // Resume
  if (this.resume) completion += weights.resume;

  this.profileCompletion = Math.round(completion);
  return this.profileCompletion;
};

// Pre-save hook to calculate profile completion
studentProfileSchema.pre('save', function(next) {
  this.calculateProfileCompletion();
  next();
});

// Virtual to get all skills as flat array
studentProfileSchema.virtual('allSkills').get(function() {
  return [
    ...(this.skills?.technical || []),
    ...(this.skills?.soft || []),
    ...(this.skills?.languages || []),
    ...(this.skills?.tools || [])
  ];
});

// Static method to find eligible students for a job
studentProfileSchema.statics.findEligibleForJob = async function(jobCriteria) {
  const query = {
    'academicInfo.cgpa': { $gte: jobCriteria.minCgpa || 0 },
    'academicInfo.graduationYear': jobCriteria.graduationYear,
    'academicInfo.activeBacklogs': { $lte: jobCriteria.maxBacklogs || 0 },
    placementStatus: 'Not Placed',
    isVerified: true
  };

  if (jobCriteria.branches && jobCriteria.branches.length > 0) {
    query['academicInfo.branch'] = { $in: jobCriteria.branches };
  }

  return this.find(query).populate('user', 'firstName lastName email');
};

studentProfileSchema.set('toJSON', { virtuals: true });
studentProfileSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
