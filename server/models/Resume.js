/**
 * Resume Model
 * 
 * @description Resume storage with parsed content,
 * extracted skills, and AI analysis results.
 */

const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentProfile',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // File Information
  fileName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['pdf', 'doc', 'docx'],
    required: true
  },
  fileSize: {
    type: Number, // in bytes
    required: true
  },
  fileUrl: {
    type: String, // Cloudinary URL
    required: true
  },
  cloudinaryId: {
    type: String,
    required: true
  },

  // Parsed Content
  parsedContent: {
    rawText: {
      type: String
    },
    structuredData: {
      name: String,
      email: String,
      phone: String,
      linkedin: String,
      github: String,
      summary: String,
      education: [{
        institution: String,
        degree: String,
        field: String,
        startDate: String,
        endDate: String,
        grade: String
      }],
      experience: [{
        company: String,
        title: String,
        startDate: String,
        endDate: String,
        description: String,
        skills: [String]
      }],
      projects: [{
        name: String,
        description: String,
        technologies: [String],
        link: String
      }],
      certifications: [{
        name: String,
        issuer: String,
        date: String
      }]
    }
  },

  // Extracted Skills
  extractedSkills: {
    technical: [{
      skill: String,
      confidence: Number, // 0-1
      category: String // e.g., 'Programming Language', 'Framework', 'Database'
    }],
    soft: [{
      skill: String,
      confidence: Number
    }],
    tools: [{
      skill: String,
      confidence: Number
    }],
    domains: [{
      skill: String,
      confidence: Number
    }]
  },

  // AI Analysis
  aiAnalysis: {
    overallScore: {
      type: Number,
      min: 0,
      max: 100
    },
    skillsScore: {
      type: Number,
      min: 0,
      max: 100
    },
    experienceScore: {
      type: Number,
      min: 0,
      max: 100
    },
    educationScore: {
      type: Number,
      min: 0,
      max: 100
    },
    presentationScore: {
      type: Number,
      min: 0,
      max: 100
    },
    suggestions: [{
      type: String
    }],
    keywords: [{
      type: String
    }],
    summary: String,
    analyzedAt: Date
  },

  // Version Control
  version: {
    type: Number,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPrimary: {
    type: Boolean,
    default: false
  },

  // Parsing Status
  parsingStatus: {
    type: String,
    enum: ['Pending', 'Processing', 'Completed', 'Failed'],
    default: 'Pending'
  },
  parsingError: String,
  parsedAt: Date,

  // Usage Statistics
  viewCount: {
    type: Number,
    default: 0
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  lastViewedAt: Date,
  lastDownloadedAt: Date

}, {
  timestamps: true
});

// Indexes
resumeSchema.index({ student: 1, isActive: 1 });
resumeSchema.index({ user: 1 });
resumeSchema.index({ 'extractedSkills.technical.skill': 1 });
resumeSchema.index({ parsingStatus: 1 });

// Virtual for all skills
resumeSchema.virtual('allSkills').get(function() {
  const skills = [];
  
  if (this.extractedSkills) {
    if (this.extractedSkills.technical) {
      skills.push(...this.extractedSkills.technical.map(s => s.skill));
    }
    if (this.extractedSkills.soft) {
      skills.push(...this.extractedSkills.soft.map(s => s.skill));
    }
    if (this.extractedSkills.tools) {
      skills.push(...this.extractedSkills.tools.map(s => s.skill));
    }
  }
  
  return [...new Set(skills)];
});

// Static method to get student's active resume
resumeSchema.statics.getActiveResume = function(studentId) {
  return this.findOne({ student: studentId, isActive: true, isPrimary: true });
};

// Method to increment view count
resumeSchema.methods.incrementViewCount = async function() {
  this.viewCount += 1;
  this.lastViewedAt = new Date();
  await this.save();
};

// Method to increment download count
resumeSchema.methods.incrementDownloadCount = async function() {
  this.downloadCount += 1;
  this.lastDownloadedAt = new Date();
  await this.save();
};

resumeSchema.set('toJSON', { virtuals: true });
resumeSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Resume', resumeSchema);
