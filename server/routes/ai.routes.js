/**
 * AI Routes
 * 
 * @description AI-powered eligibility scoring and matching
 */

const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const axios = require('axios');
const { requireAuth, requireStudent, requireRole, requireAdmin } = require('../middleware/auth');
const { validateMongoId } = require('../middleware/validation');
const AIScore = require('../models/AIScore');
const JobPosting = require('../models/JobPosting');
const StudentProfile = require('../models/StudentProfile');
const Resume = require('../models/Resume');
const Application = require('../models/Application');

/**
 * Calculate eligibility score using the formula:
 * (Skill Match × 0.4) + (CGPA × 0.3) + (Branch Match × 0.2) + (Experience × 0.1)
 */
async function calculateEligibilityScore(student, job, resume) {
  const scoreBreakdown = {
    skillMatch: { score: 0, weight: 0.4, weightedScore: 0, details: {} },
    cgpaScore: { score: 0, weight: 0.3, weightedScore: 0, details: {} },
    branchMatch: { score: 0, weight: 0.2, weightedScore: 0, details: {} },
    experienceScore: { score: 0, weight: 0.1, weightedScore: 0, details: {} }
  };

  // 1. Skill Match Score (40%)
  const requiredMandatory = job.requiredSkills?.mandatory?.map(s => s.skill.toLowerCase()) || [];
  const requiredPreferred = job.requiredSkills?.preferred?.map(s => s.skill.toLowerCase()) || [];
  
  const studentSkills = [
    ...(student.skills?.technical || []),
    ...(student.skills?.tools || []),
    ...(resume?.extractedSkills?.technical?.map(s => s.skill) || [])
  ].map(s => s.toLowerCase());

  const uniqueStudentSkills = [...new Set(studentSkills)];

  const mandatoryMatched = requiredMandatory.filter(skill => 
    uniqueStudentSkills.some(ss => ss.includes(skill) || skill.includes(ss))
  );
  const mandatoryMissing = requiredMandatory.filter(skill => 
    !uniqueStudentSkills.some(ss => ss.includes(skill) || skill.includes(ss))
  );
  const preferredMatched = requiredPreferred.filter(skill =>
    uniqueStudentSkills.some(ss => ss.includes(skill) || skill.includes(ss))
  );

  const mandatoryScore = requiredMandatory.length > 0 
    ? (mandatoryMatched.length / requiredMandatory.length) * 100 
    : 100;
  const preferredScore = requiredPreferred.length > 0 
    ? (preferredMatched.length / requiredPreferred.length) * 50 
    : 50;

  scoreBreakdown.skillMatch.score = Math.min(100, mandatoryScore * 0.7 + preferredScore * 0.3);
  scoreBreakdown.skillMatch.details = {
    mandatorySkillsMatched: mandatoryMatched,
    mandatorySkillsMissing: mandatoryMissing,
    preferredSkillsMatched: preferredMatched,
    mandatoryMatchPercentage: mandatoryScore,
    preferredMatchPercentage: preferredScore / 50 * 100,
    totalSkillsRequired: requiredMandatory.length + requiredPreferred.length,
    totalSkillsMatched: mandatoryMatched.length + preferredMatched.length
  };
  scoreBreakdown.skillMatch.weightedScore = scoreBreakdown.skillMatch.score * 0.4;

  // 2. CGPA Score (30%)
  const studentCgpa = student.academicInfo?.cgpa || 0;
  const requiredCgpa = job.eligibility?.minCgpa || 0;
  
  if (studentCgpa >= requiredCgpa) {
    // Score based on how much above minimum
    const excessCgpa = studentCgpa - requiredCgpa;
    scoreBreakdown.cgpaScore.score = Math.min(100, 60 + (excessCgpa / (10 - requiredCgpa)) * 40);
  } else {
    // Below minimum - penalize
    scoreBreakdown.cgpaScore.score = (studentCgpa / requiredCgpa) * 50;
  }
  
  scoreBreakdown.cgpaScore.details = {
    studentCgpa,
    requiredCgpa,
    cgpaDifference: studentCgpa - requiredCgpa,
    meetsRequirement: studentCgpa >= requiredCgpa
  };
  scoreBreakdown.cgpaScore.weightedScore = scoreBreakdown.cgpaScore.score * 0.3;

  // 3. Branch Match Score (20%)
  const studentBranch = student.academicInfo?.branch || '';
  const eligibleBranches = job.eligibility?.branches || [];
  
  const branchMatch = eligibleBranches.some(b => 
    b.toLowerCase() === studentBranch.toLowerCase() ||
    b.toLowerCase().includes(studentBranch.toLowerCase()) ||
    studentBranch.toLowerCase().includes(b.toLowerCase())
  );
  
  scoreBreakdown.branchMatch.score = branchMatch ? 100 : 0;
  scoreBreakdown.branchMatch.details = {
    studentBranch,
    requiredBranches: eligibleBranches,
    isMatch: branchMatch
  };
  scoreBreakdown.branchMatch.weightedScore = scoreBreakdown.branchMatch.score * 0.2;

  // 4. Experience Score (10%)
  const experiences = student.experience || [];
  const projects = student.projects || [];
  
  let experienceMonths = 0;
  let internshipCount = 0;
  
  experiences.forEach(exp => {
    if (exp.startDate && exp.endDate) {
      const months = Math.ceil(
        (new Date(exp.endDate) - new Date(exp.startDate)) / (1000 * 60 * 60 * 24 * 30)
      );
      experienceMonths += months;
    }
    if (exp.type === 'Internship') internshipCount++;
  });

  const requiredExperience = job.experience?.minYears ? job.experience.minYears * 12 : 0;
  
  let expScore = 50; // Base score
  if (experienceMonths >= requiredExperience) {
    expScore += 25;
  }
  if (internshipCount > 0) {
    expScore += Math.min(15, internshipCount * 5);
  }
  if (projects.length > 0) {
    expScore += Math.min(10, projects.length * 3);
  }
  
  scoreBreakdown.experienceScore.score = Math.min(100, expScore);
  scoreBreakdown.experienceScore.details = {
    totalExperienceMonths: experienceMonths,
    internshipCount,
    projectCount: projects.length,
    relevantExperience: experienceMonths,
    meetsRequirement: experienceMonths >= requiredExperience
  };
  scoreBreakdown.experienceScore.weightedScore = scoreBreakdown.experienceScore.score * 0.1;

  // Calculate overall score
  const overallScore = Math.round(
    scoreBreakdown.skillMatch.weightedScore +
    scoreBreakdown.cgpaScore.weightedScore +
    scoreBreakdown.branchMatch.weightedScore +
    scoreBreakdown.experienceScore.weightedScore
  );

  // Determine eligibility status
  let eligibilityStatus = 'Not Eligible';
  if (overallScore >= 70 && scoreBreakdown.branchMatch.score === 100 && scoreBreakdown.cgpaScore.details.meetsRequirement) {
    eligibilityStatus = 'Eligible';
  } else if (overallScore >= 50 && scoreBreakdown.branchMatch.score === 100) {
    eligibilityStatus = 'Partially Eligible';
  }

  // Generate recommendations
  const recommendations = generateRecommendations(scoreBreakdown, student, job);

  return {
    overallScore,
    eligibilityStatus,
    scoreBreakdown,
    recommendations
  };
}

/**
 * Generate recommendations based on score breakdown
 */
function generateRecommendations(scoreBreakdown, student, job) {
  const forStudent = [];
  const forRecruiter = [];
  const improvementAreas = [];

  // Skill recommendations
  if (scoreBreakdown.skillMatch.details.mandatorySkillsMissing.length > 0) {
    forStudent.push(
      `Consider learning: ${scoreBreakdown.skillMatch.details.mandatorySkillsMissing.slice(0, 3).join(', ')}`
    );
    improvementAreas.push({
      area: 'Technical Skills',
      currentLevel: `${scoreBreakdown.skillMatch.details.mandatoryMatchPercentage.toFixed(0)}% match`,
      suggestedLevel: '80% match',
      priority: 'High'
    });
  }

  // CGPA recommendations
  if (!scoreBreakdown.cgpaScore.details.meetsRequirement) {
    forStudent.push('Focus on improving academic performance to meet minimum CGPA requirement');
    improvementAreas.push({
      area: 'Academics',
      currentLevel: `${scoreBreakdown.cgpaScore.details.studentCgpa} CGPA`,
      suggestedLevel: `${scoreBreakdown.cgpaScore.details.requiredCgpa} CGPA`,
      priority: 'High'
    });
  }

  // Experience recommendations
  if (scoreBreakdown.experienceScore.details.internshipCount === 0) {
    forStudent.push('Gain practical experience through internships');
    improvementAreas.push({
      area: 'Experience',
      currentLevel: 'No internships',
      suggestedLevel: 'At least 1 internship',
      priority: 'Medium'
    });
  }

  // Recruiter recommendations
  if (scoreBreakdown.skillMatch.score >= 70) {
    forRecruiter.push('Strong skill match - consider for technical rounds');
  }
  if (scoreBreakdown.cgpaScore.score >= 80) {
    forRecruiter.push('Excellent academic record');
  }
  if (scoreBreakdown.experienceScore.details.projectCount >= 3) {
    forRecruiter.push('Has multiple relevant projects');
  }

  return { forStudent, forRecruiter, improvementAreas };
}

/**
 * @route   GET /api/ai/eligibility/:jobId
 * @desc    Get AI eligibility score for a job
 * @access  Private/Student
 */
router.get('/eligibility/:jobId', requireAuth, requireStudent, validateMongoId('jobId'), asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  // Get student profile
  const profile = await StudentProfile.findOne({ user: req.user._id });
  if (!profile) {
    return res.status(404).json({
      success: false,
      message: 'Profile not found'
    });
  }

  // Get job
  const job = await JobPosting.findById(jobId);
  if (!job) {
    return res.status(404).json({
      success: false,
      message: 'Job not found'
    });
  }

  // Get resume
  const resume = await Resume.findOne({ student: profile._id, isPrimary: true, isActive: true });

  // Check for existing score
  let aiScore = await AIScore.findOne({ student: profile._id, job: jobId });

  if (!aiScore || (Date.now() - new Date(aiScore.calculatedAt)) > 24 * 60 * 60 * 1000) {
    // Calculate new score
    const scoreData = await calculateEligibilityScore(profile, job, resume);

    // Build skill analysis
    const skillAnalysis = {
      matchedSkills: scoreData.scoreBreakdown.skillMatch.details.mandatorySkillsMatched.map(s => ({
        skill: s,
        type: 'Mandatory',
        confidence: 0.9
      })).concat(
        scoreData.scoreBreakdown.skillMatch.details.preferredSkillsMatched.map(s => ({
          skill: s,
          type: 'Preferred',
          confidence: 0.85
        }))
      ),
      missingSkills: scoreData.scoreBreakdown.skillMatch.details.mandatorySkillsMissing.map(s => ({
        skill: s,
        type: 'Mandatory',
        importance: 'Critical'
      }))
    };

    if (aiScore) {
      // Update existing
      await aiScore.recalculate({
        ...scoreData,
        skillAnalysis
      });
    } else {
      // Create new
      aiScore = await AIScore.create({
        student: profile._id,
        job: jobId,
        resume: resume?._id,
        ...scoreData,
        skillAnalysis,
        aiModelInfo: {
          modelUsed: 'internal',
          modelVersion: '1.0',
          processingTime: 100,
          confidence: 0.85
        }
      });
    }
  }

  res.json({
    success: true,
    data: { aiScore }
  });
}));

/**
 * @route   POST /api/ai/batch-eligibility/:jobId
 * @desc    Calculate eligibility for all students for a job
 * @access  Private/Admin or Recruiter
 */
router.post('/batch-eligibility/:jobId', requireAuth, requireRole('ADMIN', 'RECRUITER'), asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  const job = await JobPosting.findById(jobId);
  if (!job) {
    return res.status(404).json({
      success: false,
      message: 'Job not found'
    });
  }

  // Get eligible candidates based on basic criteria
  const candidates = await StudentProfile.findEligibleForJob({
    branches: job.eligibility.branches,
    minCgpa: job.eligibility.minCgpa,
    graduationYear: job.eligibility.graduationYear,
    maxBacklogs: job.eligibility.maxBacklogs
  });

  const results = [];

  for (const student of candidates) {
    const resume = await Resume.findOne({ student: student._id, isPrimary: true, isActive: true });
    const scoreData = await calculateEligibilityScore(student, job, resume);

    // Upsert AI score
    const aiScore = await AIScore.findOneAndUpdate(
      { student: student._id, job: jobId },
      {
        student: student._id,
        job: jobId,
        resume: resume?._id,
        ...scoreData,
        calculatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    results.push({
      studentId: student._id,
      name: student.user?.fullName,
      score: aiScore.overallScore,
      status: aiScore.eligibilityStatus
    });
  }

  // Sort by score
  results.sort((a, b) => b.score - a.score);

  res.json({
    success: true,
    message: `Calculated eligibility for ${results.length} candidates`,
    data: { 
      results,
      summary: {
        total: results.length,
        eligible: results.filter(r => r.status === 'Eligible').length,
        partiallyEligible: results.filter(r => r.status === 'Partially Eligible').length,
        notEligible: results.filter(r => r.status === 'Not Eligible').length
      }
    }
  });
}));

/**
 * @route   GET /api/ai/top-candidates/:jobId
 * @desc    Get top candidates for a job based on AI score
 * @access  Private/Admin or Recruiter
 */
router.get('/top-candidates/:jobId', requireAuth, requireRole('ADMIN', 'RECRUITER'), asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const limit = parseInt(req.query.limit) || 20;

  const topCandidates = await AIScore.getTopCandidates(jobId, limit);

  res.json({
    success: true,
    data: { candidates: topCandidates }
  });
}));

/**
 * @route   GET /api/ai/score-distribution/:jobId
 * @desc    Get score distribution for a job
 * @access  Private/Admin or Recruiter
 */
router.get('/score-distribution/:jobId', requireAuth, requireRole('ADMIN', 'RECRUITER'), asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  const distribution = await AIScore.getScoreDistribution(jobId);

  // Format distribution
  const formattedDistribution = distribution.map(bucket => ({
    range: bucket._id === 0 ? '0-25' :
           bucket._id === 25 ? '25-50' :
           bucket._id === 50 ? '50-75' :
           bucket._id === 75 ? '75-90' : '90-100',
    count: bucket.count
  }));

  res.json({
    success: true,
    data: { distribution: formattedDistribution }
  });
}));

/**
 * @route   PATCH /api/ai/override/:scoreId
 * @desc    Override AI score (Admin only)
 * @access  Private/Admin
 */
router.patch('/override/:scoreId', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const { scoreId } = req.params;
  const { overriddenScore, reason } = req.body;

  if (overriddenScore < 0 || overriddenScore > 100) {
    return res.status(400).json({
      success: false,
      message: 'Score must be between 0 and 100'
    });
  }

  const aiScore = await AIScore.findByIdAndUpdate(
    scoreId,
    {
      isOverridden: true,
      overriddenScore,
      overriddenBy: req.user._id,
      overrideReason: reason,
      overriddenAt: new Date()
    },
    { new: true }
  );

  if (!aiScore) {
    return res.status(404).json({
      success: false,
      message: 'Score not found'
    });
  }

  res.json({
    success: true,
    message: 'Score overridden successfully',
    data: { aiScore }
  });
}));

/**
 * @route   POST /api/ai/analyze-resume
 * @desc    Analyze resume and extract information
 * @access  Private/Student
 */
router.post('/analyze-resume', requireAuth, requireStudent, asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findOne({ user: req.user._id });
  if (!profile) {
    return res.status(404).json({
      success: false,
      message: 'Profile not found'
    });
  }

  const resume = await Resume.findOne({ student: profile._id, isPrimary: true, isActive: true });
  if (!resume) {
    return res.status(404).json({
      success: false,
      message: 'No resume found. Please upload a resume first.'
    });
  }

  // Try to call AI service for analysis
  try {
    const response = await axios.post(`${process.env.AI_SERVICE_URL}/analyze-resume`, {
      resumeId: resume._id.toString(),
      text: resume.parsedContent?.rawText || ''
    }, { timeout: 30000 });

    if (response.data.success) {
      // Update resume with analysis
      resume.aiAnalysis = response.data.analysis;
      await resume.save();

      return res.json({
        success: true,
        data: { analysis: response.data.analysis }
      });
    }
  } catch (error) {
    console.error('AI analysis error:', error.message);
  }

  // Return existing analysis or basic analysis
  res.json({
    success: true,
    data: {
      analysis: resume.aiAnalysis || {
        overallScore: resume.extractedSkills?.technical?.length > 0 ? 60 : 40,
        skillsScore: resume.extractedSkills?.technical?.length * 10 || 30,
        suggestions: ['Add more technical skills', 'Include project details', 'Add work experience'],
        summary: 'Resume needs more details for accurate analysis'
      }
    }
  });
}));

module.exports = router;
