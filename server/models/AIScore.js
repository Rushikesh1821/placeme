/**
 * AI Score Model
 * 
 * @description Stores AI-calculated eligibility scores
 * with detailed breakdown and matching analysis.
 */

const mongoose = require('mongoose');

const aiScoreSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentProfile',
    required: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobPosting',
    required: true
  },
  resume: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true
  },
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  },

  // Overall Eligibility
  overallScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  eligibilityStatus: {
    type: String,
    enum: ['Eligible', 'Partially Eligible', 'Not Eligible'],
    required: true
  },

  // Score Breakdown
  scoreBreakdown: {
    skillMatch: {
      score: {
        type: Number,
        min: 0,
        max: 100
      },
      weight: {
        type: Number,
        default: 0.4 // 40%
      },
      weightedScore: Number,
      details: {
        mandatorySkillsMatched: [String],
        mandatorySkillsMissing: [String],
        preferredSkillsMatched: [String],
        mandatoryMatchPercentage: Number,
        preferredMatchPercentage: Number,
        totalSkillsRequired: Number,
        totalSkillsMatched: Number
      }
    },
    cgpaScore: {
      score: {
        type: Number,
        min: 0,
        max: 100
      },
      weight: {
        type: Number,
        default: 0.3 // 30%
      },
      weightedScore: Number,
      details: {
        studentCgpa: Number,
        requiredCgpa: Number,
        cgpaDifference: Number,
        meetsRequirement: Boolean
      }
    },
    branchMatch: {
      score: {
        type: Number,
        min: 0,
        max: 100
      },
      weight: {
        type: Number,
        default: 0.2 // 20%
      },
      weightedScore: Number,
      details: {
        studentBranch: String,
        requiredBranches: [String],
        isMatch: Boolean
      }
    },
    experienceScore: {
      score: {
        type: Number,
        min: 0,
        max: 100
      },
      weight: {
        type: Number,
        default: 0.1 // 10%
      },
      weightedScore: Number,
      details: {
        totalExperienceMonths: Number,
        internshipCount: Number,
        projectCount: Number,
        relevantExperience: Number,
        meetsRequirement: Boolean
      }
    }
  },

  // Skill Analysis
  skillAnalysis: {
    matchedSkills: [{
      skill: String,
      type: {
        type: String,
        enum: ['Mandatory', 'Preferred']
      },
      confidence: Number,
      sourceInResume: String // Where the skill was found
    }],
    missingSkills: [{
      skill: String,
      type: {
        type: String,
        enum: ['Mandatory', 'Preferred']
      },
      importance: {
        type: String,
        enum: ['Critical', 'Important', 'Nice to have']
      }
    }],
    additionalSkills: [{
      skill: String,
      relevance: {
        type: String,
        enum: ['Highly Relevant', 'Relevant', 'Somewhat Relevant', 'Not Relevant']
      }
    }]
  },

  // Recommendations
  recommendations: {
    forStudent: [{
      type: String
    }],
    forRecruiter: [{
      type: String
    }],
    improvementAreas: [{
      area: String,
      currentLevel: String,
      suggestedLevel: String,
      priority: {
        type: String,
        enum: ['High', 'Medium', 'Low']
      }
    }]
  },

  // AI Model Information
  aiModelInfo: {
    modelUsed: {
      type: String,
      default: 'internal'
    },
    modelVersion: String,
    processingTime: Number, // in milliseconds
    confidence: Number // Overall confidence in the score
  },

  // Flags
  isOverridden: {
    type: Boolean,
    default: false
  },
  overriddenScore: Number,
  overriddenBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  overrideReason: String,
  overriddenAt: Date,

  // Recalculation tracking
  calculatedAt: {
    type: Date,
    default: Date.now
  },
  lastRecalculatedAt: Date,
  recalculationCount: {
    type: Number,
    default: 0
  }

}, {
  timestamps: true
});

// Compound index to ensure unique score per student-job combination
aiScoreSchema.index({ student: 1, job: 1 }, { unique: true });
aiScoreSchema.index({ job: 1, overallScore: -1 });
aiScoreSchema.index({ eligibilityStatus: 1 });

// Static method to get top candidates for a job
aiScoreSchema.statics.getTopCandidates = function(jobId, limit = 10) {
  return this.find({ job: jobId, eligibilityStatus: { $ne: 'Not Eligible' } })
    .sort({ overallScore: -1 })
    .limit(limit)
    .populate('student')
    .populate('resume', 'fileName fileUrl');
};

// Static method to get score distribution for a job
aiScoreSchema.statics.getScoreDistribution = async function(jobId) {
  const distribution = await this.aggregate([
    { $match: { job: new mongoose.Types.ObjectId(jobId) } },
    {
      $bucket: {
        groupBy: '$overallScore',
        boundaries: [0, 25, 50, 75, 90, 101],
        default: 'Other',
        output: {
          count: { $sum: 1 },
          students: { $push: '$student' }
        }
      }
    }
  ]);
  
  return distribution;
};

// Method to recalculate score
aiScoreSchema.methods.recalculate = async function(newScoreData) {
  this.overallScore = newScoreData.overallScore;
  this.eligibilityStatus = newScoreData.eligibilityStatus;
  this.scoreBreakdown = newScoreData.scoreBreakdown;
  this.skillAnalysis = newScoreData.skillAnalysis;
  this.recommendations = newScoreData.recommendations;
  this.lastRecalculatedAt = new Date();
  this.recalculationCount += 1;
  await this.save();
};

// Virtual for effective score (considering override)
aiScoreSchema.virtual('effectiveScore').get(function() {
  return this.isOverridden ? this.overriddenScore : this.overallScore;
});

aiScoreSchema.set('toJSON', { virtuals: true });
aiScoreSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('AIScore', aiScoreSchema);
