/**
 * Job Posting Routes
 * 
 * @description CRUD operations for job postings
 */

const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { requireAuth, requireRecruiter, requireAdmin, requireRole, requireApproved } = require('../middleware/auth');
const { jobRules, validateMongoId, paginationRules } = require('../middleware/validation');
const JobPosting = require('../models/JobPosting');
const Company = require('../models/Company');
const StudentProfile = require('../models/StudentProfile');

/**
 * @route   POST /api/jobs
 * @desc    Create job posting
 * @access  Private/Recruiter
 */
router.post('/', requireAuth, requireRecruiter, requireApproved, jobRules.create, asyncHandler(async (req, res) => {
  // Get company
  const company = await Company.findOne({ user: req.user._id });
  
  if (!company) {
    return res.status(404).json({
      success: false,
      message: 'Company profile not found. Please create your company profile first.'
    });
  }

  if (!company.isApproved) {
    return res.status(403).json({
      success: false,
      message: 'Company must be approved to post jobs'
    });
  }

  const jobData = {
    ...req.body,
    company: company._id,
    postedBy: req.user._id,
    status: 'Pending Approval'
  };

  const job = await JobPosting.create(jobData);

  // Populate company info
  await job.populate('company', 'companyName companyLogo');

  res.status(201).json({
    success: true,
    message: 'Job posted successfully. Pending admin approval.',
    data: { job }
  });
}));

/**
 * @route   GET /api/jobs
 * @desc    Get all jobs (with filters) - ROLE-BASED VISIBILITY
 * @access  Private
 * 
 * VISIBILITY RULES:
 * - STUDENT: Only sees Active jobs with valid application deadline
 * - RECRUITER: Only sees jobs from their own company
 * - ADMIN: Sees ALL jobs regardless of status or company
 * 
 * This ensures proper data isolation while giving TPO complete visibility.
 */
router.get('/', requireAuth, paginationRules, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build filter based on ROLE (NOT email or any other identifier)
  const filter = {};

  // Role-based filtering - ADMIN sees everything, others have restrictions
  if (req.user.role === 'STUDENT') {
    // Students only see active jobs with valid deadlines
    filter.status = 'Active';
    filter['dates.applicationDeadline'] = { $gt: new Date() };
  } else if (req.user.role === 'RECRUITER') {
    // Recruiters only see their own company's jobs
    const company = await Company.findOne({ user: req.user._id });
    if (company) {
      filter.company = company._id;
    } else {
      // If no company, return empty (recruiter hasn't set up company yet)
      filter.company = null;
    }
  }
  // ADMIN: No filter applied - sees ALL jobs from ALL companies

  // Additional filters
  if (req.query.status && req.user.role !== 'STUDENT') {
    filter.status = req.query.status;
  }

  if (req.query.jobType) {
    filter.jobType = req.query.jobType;
  }

  if (req.query.branch) {
    filter['eligibility.branches'] = req.query.branch;
  }

  if (req.query.minPackage) {
    filter['package.ctc'] = { $gte: parseFloat(req.query.minPackage) };
  }

  if (req.query.graduationYear) {
    filter['eligibility.graduationYear'] = parseInt(req.query.graduationYear);
  }

  if (req.query.company) {
    filter.company = req.query.company;
  }

  if (req.query.search) {
    filter.$text = { $search: req.query.search };
  }

  const [jobs, total] = await Promise.all([
    JobPosting.find(filter)
      .populate('company', 'companyName companyLogo industry companyType')
      .skip(skip)
      .limit(limit)
      .sort({ isFeatured: -1, createdAt: -1 }),
    JobPosting.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: {
      jobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

/**
 * @route   GET /api/jobs/eligible
 * @desc    Get jobs eligible for current student
 * @access  Private/Student
 */
router.get('/eligible', requireAuth, requireRole('STUDENT'), asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findOne({ user: req.user._id });
  
  if (!profile) {
    return res.status(404).json({
      success: false,
      message: 'Please complete your profile to see eligible jobs'
    });
  }

  const filter = {
    status: 'Active',
    'dates.applicationDeadline': { $gt: new Date() },
    'eligibility.graduationYear': profile.academicInfo.graduationYear,
    'eligibility.branches': profile.academicInfo.branch,
    'eligibility.minCgpa': { $lte: profile.academicInfo.cgpa }
  };

  // Check backlogs
  if (profile.academicInfo.activeBacklogs > 0) {
    filter['eligibility.activeBacklogsAllowed'] = true;
  }

  const jobs = await JobPosting.find(filter)
    .populate('company', 'companyName companyLogo industry')
    .sort({ isFeatured: -1, 'package.ctc': -1 });

  res.json({
    success: true,
    data: { 
      jobs,
      studentProfile: {
        cgpa: profile.academicInfo.cgpa,
        branch: profile.academicInfo.branch,
        graduationYear: profile.academicInfo.graduationYear
      }
    }
  });
}));

/**
 * @route   GET /api/jobs/:id
 * @desc    Get job by ID
 * @access  Private
 */
router.get('/:id', requireAuth, validateMongoId('id'), asyncHandler(async (req, res) => {
  const job = await JobPosting.findById(req.params.id)
    .populate('company', 'companyName companyLogo industry companyType website description contact');

  if (!job) {
    return res.status(404).json({
      success: false,
      message: 'Job not found'
    });
  }

  // Increment view count
  job.viewsCount += 1;
  await job.save();

  // Check eligibility for students
  let eligibilityCheck = null;
  if (req.user.role === 'STUDENT') {
    const profile = await StudentProfile.findOne({ user: req.user._id });
    if (profile) {
      eligibilityCheck = job.checkBasicEligibility(profile);
    }
  }

  res.json({
    success: true,
    data: { 
      job,
      eligibilityCheck
    }
  });
}));

/**
 * @route   PUT /api/jobs/:id
 * @desc    Update job posting
 * @access  Private/Recruiter (own) or Admin
 */
router.put('/:id', requireAuth, validateMongoId('id'), asyncHandler(async (req, res) => {
  let job = await JobPosting.findById(req.params.id);

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
  } else if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  const updateData = { ...req.body };

  // Prevent non-admins from changing certain fields
  if (req.user.role !== 'ADMIN') {
    delete updateData.status;
    delete updateData.approvedBy;
  }

  job = await JobPosting.findByIdAndUpdate(
    req.params.id,
    { $set: updateData },
    { new: true, runValidators: true }
  ).populate('company', 'companyName companyLogo');

  res.json({
    success: true,
    message: 'Job updated successfully',
    data: { job }
  });
}));

/**
 * @route   PATCH /api/jobs/:id/status
 * @desc    Update job status
 * @access  Private/Recruiter (own) or Admin
 */
router.patch('/:id/status', requireAuth, asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  const allowedStatuses = ['Draft', 'Pending Approval', 'Active', 'Closed', 'Cancelled', 'Completed'];
  
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status'
    });
  }

  const job = await JobPosting.findById(req.params.id);

  if (!job) {
    return res.status(404).json({
      success: false,
      message: 'Job not found'
    });
  }

  // Only admin can approve
  if (status === 'Active' && job.status === 'Pending Approval' && req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Only admin can approve jobs'
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

  job.status = status;
  
  if (status === 'Active' && req.user.role === 'ADMIN') {
    job.approvedBy = req.user._id;
    job.approvedAt = new Date();
  }

  await job.save();

  res.json({
    success: true,
    message: `Job status updated to ${status}`,
    data: { job }
  });
}));

/**
 * @route   GET /api/jobs/:id/candidates
 * @desc    Get candidates for a job (with AI scores)
 * @access  Private/Recruiter (own) or Admin
 */
router.get('/:id/candidates', requireAuth, requireRole('RECRUITER', 'ADMIN'), asyncHandler(async (req, res) => {
  const job = await JobPosting.findById(req.params.id);

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

  // Get eligible candidates
  const candidates = await StudentProfile.findEligibleForJob({
    branches: job.eligibility.branches,
    minCgpa: job.eligibility.minCgpa,
    graduationYear: job.eligibility.graduationYear,
    maxBacklogs: job.eligibility.maxBacklogs
  });

  res.json({
    success: true,
    data: { 
      candidates,
      total: candidates.length
    }
  });
}));

/**
 * @route   DELETE /api/jobs/:id
 * @desc    Delete job posting
 * @access  Private/Admin
 */
router.delete('/:id', requireAuth, requireAdmin, validateMongoId('id'), asyncHandler(async (req, res) => {
  const job = await JobPosting.findByIdAndDelete(req.params.id);

  if (!job) {
    return res.status(404).json({
      success: false,
      message: 'Job not found'
    });
  }

  res.json({
    success: true,
    message: 'Job deleted successfully'
  });
}));

module.exports = router;
