/**
 * Company Model
 * 
 * @description Company/Recruiter profile with company details,
 * verification status, and recruiter information.
 */

const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  // Company Information
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  companyLogo: {
    type: String // Cloudinary URL
  },
  industry: {
    type: String,
    required: true,
    enum: [
      'Information Technology',
      'Finance & Banking',
      'Consulting',
      'Manufacturing',
      'Healthcare',
      'E-commerce',
      'Education',
      'Telecommunications',
      'Automotive',
      'Energy',
      'FMCG',
      'Media & Entertainment',
      'Real Estate',
      'Other'
    ]
  },
  companyType: {
    type: String,
    enum: ['MNC', 'Startup', 'SME', 'Government', 'PSU', 'Other'],
    required: true
  },
  companySize: {
    type: String,
    enum: ['1-50', '51-200', '201-500', '501-1000', '1000+']
  },
  foundedYear: {
    type: Number
  },
  website: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    maxlength: 2000
  },

  // Contact Information
  contact: {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' }
    }
  },

  // Recruiter/HR Details
  recruiterInfo: {
    name: {
      type: String,
      required: true
    },
    designation: String,
    email: {
      type: String,
      required: true
    },
    phone: String
  },

  // Social Links
  socialLinks: {
    linkedIn: String,
    twitter: String,
    facebook: String
  },

  // Verification & Approval
  verificationStatus: {
    type: String,
    enum: ['Pending', 'Verified', 'Rejected'],
    default: 'Pending'
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  rejectionReason: String,

  // Company Documents (for verification)
  documents: [{
    type: {
      type: String,
      enum: ['Registration Certificate', 'GST Certificate', 'Other']
    },
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Placement Statistics
  placementStats: {
    totalJobsPosted: {
      type: Number,
      default: 0
    },
    totalStudentsHired: {
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

  // Partnership Details
  partnership: {
    type: {
      type: String,
      enum: ['Regular', 'Premium', 'Dream', 'Super Dream']
    },
    startDate: Date,
    endDate: Date,
    notes: String
  },

  // Tags for categorization
  tags: [{
    type: String,
    trim: true
  }],

  // Active status
  isActive: {
    type: Boolean,
    default: true
  }

}, {
  timestamps: true
});

// Indexes
companySchema.index({ companyName: 'text', description: 'text' });
companySchema.index({ industry: 1, isApproved: 1 });
companySchema.index({ verificationStatus: 1 });

// Static method to find approved companies
companySchema.statics.findApproved = function() {
  return this.find({ isApproved: true, isActive: true });
};

// Method to update placement stats
companySchema.methods.updatePlacementStats = async function() {
  const Job = mongoose.model('JobPosting');
  const Application = mongoose.model('Application');

  // Count total jobs
  const totalJobs = await Job.countDocuments({ company: this._id });

  // Count selected applications
  const selectedApps = await Application.find({
    company: this._id,
    status: 'Selected'
  });

  const totalHired = selectedApps.length;
  
  let totalPackage = 0;
  let highestPackage = 0;
  
  for (const app of selectedApps) {
    const job = await Job.findById(app.job);
    if (job) {
      totalPackage += job.package.ctc || 0;
      if (job.package.ctc > highestPackage) {
        highestPackage = job.package.ctc;
      }
    }
  }

  this.placementStats = {
    totalJobsPosted: totalJobs,
    totalStudentsHired: totalHired,
    averagePackage: totalHired > 0 ? totalPackage / totalHired : 0,
    highestPackage
  };

  await this.save();
};

module.exports = mongoose.model('Company', companySchema);
