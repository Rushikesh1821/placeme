/**
 * Application Routes
 * 
 * @description Routes for job applications
 */

const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { requireAuth, requireStudent, requireRecruiter, requireAdmin, requireRole } = require('../middleware/auth');
const { applicationRules, validateMongoId, paginationRules } = require('../middleware/validation');
const Application = require('../models/Application');
const JobPosting = require('../models/JobPosting');
const StudentProfile = require('../models/StudentProfile');
const Company = require('../models/Company');
const Resume = require('../models/Resume');
const AIScore = require('../models/AIScore');

/**
 * @route   POST /api/applications
 * @desc    Apply for a job
 * @access  Private/Student
 */
router.post('/', requireAuth, requireStudent, applicationRules.create, asyncHandler(async (req, res) => {
  const { jobId, coverLetter, additionalAnswers } = req.body;

  // Get student profile
  const profile = await StudentProfile.findOne({ user: req.user._id });
  
  if (!profile) {
    return res.status(400).json({
      success: false,
      message: 'Please complete your profile before applying'
    });
  }

  if (!profile.isVerified) {
    return res.status(400).json({
      success: false,
      message: 'Your profile must be verified before applying'
    });
  }

  // Get job
  const job = await JobPosting.findById(jobId).populate('company');
  
  if (!job) {
    return res.status(404).json({
      success: false,
      message: 'Job not found'
    });
  }

  if (job.status !== 'Active') {
    return res.status(400).json({
      success: false,
      message: 'This job is not accepting applications'
    });
  }

  if (new Date(job.dates.applicationDeadline) < new Date()) {
    return res.status(400).json({
      success: false,
      message: 'Application deadline has passed'
    });
  }

  // Check if already applied
  const existingApplication = await Application.findOne({
    student: profile._id,
    job: jobId
  });

  if (existingApplication) {
    return res.status(400).json({
      success: false,
      message: 'You have already applied for this job'
    });
  }

  // Check basic eligibility
  const eligibilityCheck = job.checkBasicEligibility(profile);
  
  if (!eligibilityCheck.eligible && !profile.eligibilityOverride?.isOverridden) {
    return res.status(400).json({
      success: false,
      message: `Not eligible: ${eligibilityCheck.reason}`
    });
  }

  // Get active resume
  const resume = await Resume.findOne({ student: profile._id, isPrimary: true, isActive: true });

  // Create application
  const application = await Application.create({
    student: profile._id,
    studentUser: req.user._id,
    job: jobId,
    company: job.company._id,
    coverLetter,
    additionalAnswers,
    resumeUsed: resume?._id,
    status: 'Applied',
    appliedAt: new Date()
  });

  // Update job application count
  await job.updateApplicationStats();

  // Populate and return
  await application.populate([
    { path: 'job', select: 'title company' },
    { path: 'company', select: 'companyName' }
  ]);

  res.status(201).json({
    success: true,
    message: 'Application submitted successfully',
    data: { application }
  });
}));

/**
 * @route   GET /api/applications/my
 * @desc    Get current student's applications
 * @access  Private/Student
 */
router.get('/my', requireAuth, requireStudent, asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findOne({ user: req.user._id });
  
  if (!profile) {
    return res.status(404).json({
      success: false,
      message: 'Profile not found'
    });
  }

  const applications = await Application.getStudentApplications(profile._id);

  res.json({
    success: true,
    data: { applications }
  });
}));

/**
 * @route   GET /api/applications/job/:jobId
 * @desc    Get applications for a specific job
 * @access  Private/Recruiter or Admin
 */
router.get('/job/:jobId', requireAuth, requireRole('RECRUITER', 'ADMIN'), validateMongoId('jobId'), asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const { status, sortBy = 'appliedAt', order = 'desc' } = req.query;

  const job = await JobPosting.findById(jobId);
  
  if (!job) {
    return res.status(404).json({
      success: false,
      message: 'Job not found'
    });
  }

  // Check ownership for recruiters
  if (req.user.role === 'RECRUITER') {
    const company = await Company.findOne({ user: req.user._id });
    if (!company || job.company.toString() !== company._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
  }

  // Build query
  const query = { job: jobId };
  if (status) {
    query.status = status;
  }

  // Build sort
  const sortOrder = order === 'asc' ? 1 : -1;
  const sort = {};
  
  if (sortBy === 'score') {
    sort.eligibilityScore = sortOrder;
  } else {
    sort[sortBy] = sortOrder;
  }

  const applications = await Application.find(query)
    .populate({
      path: 'student',
      select: 'academicInfo skills personalInfo profileCompletion',
      populate: {
        path: 'user',
        select: 'firstName lastName email profileImage'
      }
    })
    .populate('studentUser', 'firstName lastName email')
    .populate('resumeUsed', 'fileName fileUrl')
    .populate('aiScore')
    .sort(sort);

  // Get stats
  const stats = await Application.aggregate([
    { $match: { job: job._id } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const statsMap = {};
  stats.forEach(s => {
    statsMap[s._id] = s.count;
  });

  res.json({
    success: true,
    data: {
      applications,
      stats: statsMap,
      total: applications.length
    }
  });
}));

/**
 * @route   GET /api/applications/:id
 * @desc    Get application by ID
 * @access  Private
 */
router.get('/:id', requireAuth, validateMongoId('id'), asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate({
      path: 'student',
      populate: { path: 'user', select: 'firstName lastName email profileImage' }
    })
    .populate({
      path: 'job',
      populate: { path: 'company', select: 'companyName companyLogo' }
    })
    .populate('resumeUsed')
    .populate('aiScore');

  if (!application) {
    return res.status(404).json({
      success: false,
      message: 'Application not found'
    });
  }

  // Check access
  if (req.user.role === 'STUDENT') {
    if (application.studentUser.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
  } else if (req.user.role === 'RECRUITER') {
    const company = await Company.findOne({ user: req.user._id });
    if (!company || application.company.toString() !== company._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
  }

  res.json({
    success: true,
    data: { application }
  });
}));

/**
 * @route   PATCH /api/applications/:id/status
 * @desc    Update application status
 * @access  Private/Recruiter or Admin
 */
router.patch('/:id/status', requireAuth, requireRole('RECRUITER', 'ADMIN'), applicationRules.updateStatus, asyncHandler(async (req, res) => {
  const { status, remarks } = req.body;

  const application = await Application.findById(req.params.id);

  if (!application) {
    return res.status(404).json({
      success: false,
      message: 'Application not found'
    });
  }

  // Check ownership for recruiters
  if (req.user.role === 'RECRUITER') {
    const company = await Company.findOne({ user: req.user._id });
    if (!company || application.company.toString() !== company._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
  }

  // Update status with history
  await application.updateStatus(status, req.user._id, remarks);

  // If selected, update student's placement status
  if (status === 'Selected' || status === 'Offer Accepted') {
    const job = await JobPosting.findById(application.job);
    await StudentProfile.findByIdAndUpdate(application.student, {
      placementStatus: 'Placed',
      placedCompany: application.company,
      placedPackage: job?.package?.ctc
    });
  }

  // Handle rejection
  if (status === 'Rejected') {
    application.rejectionDetails = {
      reason: remarks,
      rejectedAt: new Date(),
      rejectedBy: req.user._id
    };
    await application.save();
  }

  await application.populate([
    { path: 'job', select: 'title' },
    { path: 'company', select: 'companyName' }
  ]);

  res.json({
    success: true,
    message: `Application status updated to ${status}`,
    data: { application }
  });
}));

/**
 * @route   POST /api/applications/:id/interview
 * @desc    Schedule interview
 * @access  Private/Recruiter or Admin
 */
router.post('/:id/interview', requireAuth, requireRole('RECRUITER', 'ADMIN'), asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);

  if (!application) {
    return res.status(404).json({
      success: false,
      message: 'Application not found'
    });
  }

  const { round, roundName, scheduledAt, mode, venue, meetingLink } = req.body;

  await application.scheduleInterview({
    round,
    roundName,
    scheduledAt,
    mode,
    venue,
    meetingLink
  });

  res.json({
    success: true,
    message: 'Interview scheduled successfully',
    data: { application }
  });
}));

/**
 * @route   PATCH /api/applications/:id/withdraw
 * @desc    Withdraw application
 * @access  Private/Student
 */
router.patch('/:id/withdraw', requireAuth, requireStudent, asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const application = await Application.findById(req.params.id);

  if (!application) {
    return res.status(404).json({
      success: false,
      message: 'Application not found'
    });
  }

  if (application.studentUser.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  if (['Selected', 'Offer Accepted', 'Withdrawn'].includes(application.status)) {
    return res.status(400).json({
      success: false,
      message: 'Cannot withdraw this application'
    });
  }

  application.status = 'Withdrawn';
  application.withdrawalDetails = {
    reason,
    withdrawnAt: new Date()
  };
  await application.save();

  // Update job stats
  const job = await JobPosting.findById(application.job);
  if (job) {
    await job.updateApplicationStats();
  }

  res.json({
    success: true,
    message: 'Application withdrawn successfully'
  });
}));

/**
 * @route   POST /api/applications/:id/note
 * @desc    Add recruiter note to application
 * @access  Private/Recruiter or Admin
 */
router.post('/:id/note', requireAuth, requireRole('RECRUITER', 'ADMIN'), asyncHandler(async (req, res) => {
  const { note } = req.body;

  const application = await Application.findById(req.params.id);

  if (!application) {
    return res.status(404).json({
      success: false,
      message: 'Application not found'
    });
  }

  application.recruiterNotes.push({
    note,
    addedBy: req.user._id,
    addedAt: new Date()
  });

  await application.save();

  res.json({
    success: true,
    message: 'Note added successfully',
    data: { notes: application.recruiterNotes }
  });
}));

module.exports = router;
