/**
 * TPO (Training & Placement Officer) Routes
 * 
 * @description Comprehensive admin routes for TPO module
 * Including student management, company management, job management,
 * eligibility override, application tracking, and system controls.
 */

const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { paginationRules, validateMongoId } = require('../middleware/validation');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Company = require('../models/Company');
const JobPosting = require('../models/JobPosting');
const Application = require('../models/Application');
const Resume = require('../models/Resume');
const AIScore = require('../models/AIScore');
const SystemLog = require('../models/SystemLog');
const PlacementDrive = require('../models/PlacementDrive');
const PlacementSettings = require('../models/PlacementSettings');
const mongoose = require('mongoose');

// Helper to log admin actions
const logAction = async (action, performedBy, targetType, targetId, description, metadata = {}, category = 'SYSTEM') => {
  try {
    await SystemLog.create({
      action,
      performedBy,
      targetType,
      targetId,
      description,
      metadata,
      category
    });
  } catch (error) {
    console.error('Failed to log action:', error);
  }
};

// ===========================================
// DASHBOARD & OVERVIEW
// ===========================================

/**
 * @route   GET /api/tpo/dashboard
 * @desc    Get comprehensive TPO dashboard data
 * @access  Private/Admin
 */
router.get('/dashboard', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const [
    totalStudents,
    verifiedStudents,
    placedStudents,
    notPlacedStudents,
    totalCompanies,
    approvedCompanies,
    totalJobs,
    activeJobs,
    totalApplications,
    pendingApprovals
  ] = await Promise.all([
    StudentProfile.countDocuments(),
    StudentProfile.countDocuments({ isVerified: true }),
    StudentProfile.countDocuments({ placementStatus: 'Placed' }),
    StudentProfile.countDocuments({ placementStatus: 'Not Placed', isVerified: true }),
    Company.countDocuments(),
    Company.countDocuments({ isApproved: true }),
    JobPosting.countDocuments(),
    JobPosting.countDocuments({ status: 'Active' }),
    Application.countDocuments(),
    Promise.all([
      StudentProfile.countDocuments({ isVerified: false }),
      Company.countDocuments({ isApproved: false }),
      JobPosting.countDocuments({ status: 'Pending Approval' })
    ])
  ]);

  // Package statistics
  const packageStats = await Application.aggregate([
    { $match: { status: { $in: ['Selected', 'Offer Accepted'] } } },
    {
      $lookup: {
        from: 'jobpostings',
        localField: 'job',
        foreignField: '_id',
        as: 'jobDetails'
      }
    },
    { $unwind: { path: '$jobDetails', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: null,
        avgPackage: { $avg: '$jobDetails.package.ctc' },
        maxPackage: { $max: '$jobDetails.package.ctc' },
        minPackage: { $min: '$jobDetails.package.ctc' },
        totalOffers: { $sum: 1 }
      }
    }
  ]);

  // Branch-wise placement summary
  const branchWisePlacement = await StudentProfile.aggregate([
    { $match: { isVerified: true } },
    {
      $group: {
        _id: '$academicInfo.branch',
        total: { $sum: 1 },
        placed: {
          $sum: { $cond: [{ $eq: ['$placementStatus', 'Placed'] }, 1, 0] }
        }
      }
    },
    {
      $project: {
        branch: '$_id',
        total: 1,
        placed: 1,
        percentage: {
          $cond: [
            { $gt: ['$total', 0] },
            { $multiply: [{ $divide: ['$placed', '$total'] }, 100] },
            0
          ]
        }
      }
    },
    { $sort: { placed: -1 } }
  ]);

  // Recent activity
  const recentActivity = await SystemLog.find()
    .populate('performedBy', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(10);

  // Active placement drives
  const activeDrives = await PlacementDrive.find({
    status: { $in: ['Scheduled', 'Registration Open', 'Ongoing'] }
  })
    .select('title status schedule stats')
    .limit(5);

  // Application status distribution
  const applicationDistribution = await Application.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      overview: {
        students: {
          total: totalStudents,
          verified: verifiedStudents,
          placed: placedStudents,
          notPlaced: notPlacedStudents,
          placementRate: verifiedStudents > 0 ? ((placedStudents / verifiedStudents) * 100).toFixed(1) : 0
        },
        companies: {
          total: totalCompanies,
          approved: approvedCompanies
        },
        jobs: {
          total: totalJobs,
          active: activeJobs
        },
        applications: {
          total: totalApplications
        },
        pendingApprovals: {
          students: pendingApprovals[0],
          companies: pendingApprovals[1],
          jobs: pendingApprovals[2],
          total: pendingApprovals[0] + pendingApprovals[1] + pendingApprovals[2]
        }
      },
      packages: packageStats[0] || { avgPackage: 0, maxPackage: 0, minPackage: 0, totalOffers: 0 },
      branchWisePlacement,
      applicationDistribution,
      recentActivity,
      activeDrives
    }
  });
}));

// ===========================================
// STUDENT MANAGEMENT
// ===========================================

/**
 * @route   GET /api/tpo/students
 * @desc    Get all students with filters
 * @access  Private/Admin
 */
router.get('/students', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    search,
    branch,
    batch,
    placementStatus,
    isVerified,
    minCgpa,
    maxCgpa,
    skills,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const query = {};

  // Filters
  if (branch && branch !== 'All') query['academicInfo.branch'] = branch;
  if (batch) query['academicInfo.batch'] = batch;
  if (placementStatus && placementStatus !== 'All') query.placementStatus = placementStatus;
  if (isVerified !== undefined) query.isVerified = isVerified === 'true';
  if (minCgpa) query['academicInfo.cgpa'] = { $gte: parseFloat(minCgpa) };
  if (maxCgpa) query['academicInfo.cgpa'] = { ...query['academicInfo.cgpa'], $lte: parseFloat(maxCgpa) };
  if (skills) {
    const skillList = skills.split(',').map(s => s.trim());
    query['skills.technical'] = { $in: skillList };
  }

  // Build aggregation pipeline for search
  const pipeline = [
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userData'
      }
    },
    { $unwind: '$userData' }
  ];

  // Add search filter
  if (search) {
    pipeline.push({
      $match: {
        $or: [
          { 'userData.firstName': { $regex: search, $options: 'i' } },
          { 'userData.lastName': { $regex: search, $options: 'i' } },
          { 'userData.email': { $regex: search, $options: 'i' } },
          { 'academicInfo.rollNumber': { $regex: search, $options: 'i' } }
        ]
      }
    });
  }

  // Add other filters
  if (Object.keys(query).length > 0) {
    pipeline.push({ $match: query });
  }

  // Sort
  const sortField = sortBy === 'name' ? 'userData.firstName' : 
                    sortBy === 'cgpa' ? 'academicInfo.cgpa' : 'createdAt';
  pipeline.push({ $sort: { [sortField]: sortOrder === 'asc' ? 1 : -1 } });

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Get total count
  const countPipeline = [...pipeline, { $count: 'total' }];
  const countResult = await StudentProfile.aggregate(countPipeline);
  const total = countResult[0]?.total || 0;

  // Add pagination and projection
  pipeline.push(
    { $skip: skip },
    { $limit: parseInt(limit) },
    {
      $lookup: {
        from: 'resumes',
        localField: 'resume',
        foreignField: '_id',
        as: 'resumeData'
      }
    },
    {
      $lookup: {
        from: 'companies',
        localField: 'placedCompany',
        foreignField: '_id',
        as: 'placedCompanyData'
      }
    },
    {
      $project: {
        _id: 1,
        user: {
          _id: '$userData._id',
          firstName: '$userData.firstName',
          lastName: '$userData.lastName',
          email: '$userData.email',
          profileImage: '$userData.profileImage',
          isApproved: '$userData.isApproved',
          isActive: '$userData.isActive'
        },
        academicInfo: 1,
        personalInfo: 1,
        skills: 1,
        placementStatus: 1,
        placedPackage: 1,
        placedCompany: { $arrayElemAt: ['$placedCompanyData.companyName', 0] },
        isVerified: 1,
        eligibilityOverride: 1,
        resume: { $arrayElemAt: ['$resumeData', 0] },
        createdAt: 1
      }
    }
  );

  const students = await StudentProfile.aggregate(pipeline);

  res.json({
    success: true,
    data: {
      students,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
}));

/**
 * @route   GET /api/tpo/students/:id
 * @desc    Get detailed student profile with AI scores
 * @access  Private/Admin
 */
router.get('/students/:id', requireAuth, requireAdmin, validateMongoId('id'), asyncHandler(async (req, res) => {
  const student = await StudentProfile.findById(req.params.id)
    .populate('user', 'firstName lastName email profileImage isApproved isActive createdAt lastLogin')
    .populate('resume')
    .populate('placedCompany', 'companyName companyLogo');

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found'
    });
  }

  // Get applications
  const applications = await Application.find({ student: student._id })
    .populate('job', 'title company package status')
    .populate('company', 'companyName companyLogo')
    .sort({ createdAt: -1 });

  // Get AI scores
  const aiScores = await AIScore.find({ student: student._id })
    .populate('job', 'title')
    .sort({ createdAt: -1 })
    .limit(10);

  // Get activity logs
  const activityLogs = await SystemLog.find({
    targetType: 'StudentProfile',
    targetId: student._id
  })
    .populate('performedBy', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(20);

  res.json({
    success: true,
    data: {
      student,
      applications,
      aiScores,
      activityLogs
    }
  });
}));

/**
 * @route   POST /api/tpo/students/:id/verify
 * @desc    Verify/approve student
 * @access  Private/Admin
 */
router.post('/students/:id/verify', requireAuth, requireAdmin, validateMongoId('id'), asyncHandler(async (req, res) => {
  const { remarks } = req.body;

  const student = await StudentProfile.findByIdAndUpdate(
    req.params.id,
    {
      isVerified: true,
      verifiedBy: req.user._id,
      verifiedAt: new Date(),
      verificationRemarks: remarks
    },
    { new: true }
  ).populate('user', 'firstName lastName email');

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found'
    });
  }

  // Update user approval
  await User.findByIdAndUpdate(student.user._id, { isApproved: true });

  // Log action
  await logAction(
    'STUDENT_APPROVED',
    req.user._id,
    'StudentProfile',
    student._id,
    `Approved student: ${student.user.firstName} ${student.user.lastName}`,
    { remarks },
    'STUDENT_MANAGEMENT'
  );

  res.json({
    success: true,
    message: 'Student verified successfully',
    data: { student }
  });
}));

/**
 * @route   POST /api/tpo/students/:id/reject
 * @desc    Reject student verification
 * @access  Private/Admin
 */
router.post('/students/:id/reject', requireAuth, requireAdmin, validateMongoId('id'), asyncHandler(async (req, res) => {
  const { reason } = req.body;

  if (!reason) {
    return res.status(400).json({
      success: false,
      message: 'Rejection reason is required'
    });
  }

  const student = await StudentProfile.findByIdAndUpdate(
    req.params.id,
    {
      isVerified: false,
      rejectedBy: req.user._id,
      rejectedAt: new Date(),
      rejectionReason: reason
    },
    { new: true }
  ).populate('user', 'firstName lastName email');

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found'
    });
  }

  // Log action
  await logAction(
    'STUDENT_REJECTED',
    req.user._id,
    'StudentProfile',
    student._id,
    `Rejected student: ${student.user.firstName} ${student.user.lastName}`,
    { reason },
    'STUDENT_MANAGEMENT'
  );

  res.json({
    success: true,
    message: 'Student rejected',
    data: { student, reason }
  });
}));

/**
 * @route   POST /api/tpo/students/:id/override-eligibility
 * @desc    Override AI eligibility for a student
 * @access  Private/Admin
 */
router.post('/students/:id/override-eligibility', requireAuth, requireAdmin, validateMongoId('id'), asyncHandler(async (req, res) => {
  const { jobId, isEligible, reason, newScore } = req.body;

  if (!reason) {
    return res.status(400).json({
      success: false,
      message: 'Override reason is required'
    });
  }

  const student = await StudentProfile.findById(req.params.id)
    .populate('user', 'firstName lastName');

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found'
    });
  }

  // Update student's eligibility override
  const overrideData = {
    isOverridden: true,
    isEligible,
    reason,
    overriddenBy: req.user._id,
    overriddenAt: new Date(),
    originalScore: null
  };

  // If specific job, update AI score
  if (jobId) {
    const aiScore = await AIScore.findOne({ student: student._id, job: jobId });
    if (aiScore) {
      overrideData.originalScore = aiScore.overallScore;
      aiScore.isOverridden = true;
      aiScore.overriddenScore = newScore || (isEligible ? 100 : 0);
      aiScore.overriddenBy = req.user._id;
      aiScore.overrideReason = reason;
      aiScore.overriddenAt = new Date();
      await aiScore.save();
    }
  }

  // Update student profile
  student.eligibilityOverride = overrideData;
  await student.save();

  // Log action
  await logAction(
    'ELIGIBILITY_OVERRIDE',
    req.user._id,
    'StudentProfile',
    student._id,
    `Eligibility override for ${student.user.firstName} ${student.user.lastName}: ${isEligible ? 'Made Eligible' : 'Made Ineligible'}`,
    { jobId, isEligible, reason, newScore },
    'STUDENT_MANAGEMENT'
  );

  res.json({
    success: true,
    message: 'Eligibility override applied successfully',
    data: { student, override: overrideData }
  });
}));

/**
 * @route   POST /api/tpo/students/:id/update-placement
 * @desc    Manually update student placement status
 * @access  Private/Admin
 */
router.post('/students/:id/update-placement', requireAuth, requireAdmin, validateMongoId('id'), asyncHandler(async (req, res) => {
  const { status, companyId, package: placedPackage, remarks } = req.body;

  const student = await StudentProfile.findById(req.params.id)
    .populate('user', 'firstName lastName');

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found'
    });
  }

  const previousStatus = student.placementStatus;

  student.placementStatus = status;
  if (companyId) student.placedCompany = companyId;
  if (placedPackage) student.placedPackage = placedPackage;
  
  await student.save();

  // Log action
  await logAction(
    'PLACEMENT_STATUS_UPDATED',
    req.user._id,
    'StudentProfile',
    student._id,
    `Updated placement status for ${student.user.firstName} ${student.user.lastName}: ${previousStatus} → ${status}`,
    { previousStatus, newStatus: status, companyId, placedPackage, remarks },
    'STUDENT_MANAGEMENT'
  );

  res.json({
    success: true,
    message: 'Placement status updated',
    data: { student }
  });
}));

/**
 * @route   POST /api/tpo/students/:id/block
 * @desc    Block/deactivate a student
 * @access  Private/Admin
 */
router.post('/students/:id/block', requireAuth, requireAdmin, validateMongoId('id'), asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const student = await StudentProfile.findById(req.params.id)
    .populate('user');

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found'
    });
  }

  // Deactivate user
  await User.findByIdAndUpdate(student.user._id, { isActive: false });

  // Log action
  await logAction(
    'USER_BLOCKED',
    req.user._id,
    'StudentProfile',
    student._id,
    `Blocked student: ${student.user.firstName} ${student.user.lastName}`,
    { reason },
    'STUDENT_MANAGEMENT'
  );

  res.json({
    success: true,
    message: 'Student blocked successfully'
  });
}));

/**
 * @route   POST /api/tpo/students/bulk-verify
 * @desc    Bulk verify students
 * @access  Private/Admin
 */
router.post('/students/bulk-verify', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const { studentIds, remarks } = req.body;

  if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Student IDs array required'
    });
  }

  const result = await StudentProfile.updateMany(
    { _id: { $in: studentIds } },
    {
      isVerified: true,
      verifiedBy: req.user._id,
      verifiedAt: new Date(),
      verificationRemarks: remarks
    }
  );

  // Get user IDs and approve them
  const students = await StudentProfile.find({ _id: { $in: studentIds } });
  const userIds = students.map(s => s.user);
  await User.updateMany({ _id: { $in: userIds } }, { isApproved: true });

  // Log action
  await logAction(
    'BULK_ACTION',
    req.user._id,
    'StudentProfile',
    null,
    `Bulk verified ${result.modifiedCount} students`,
    { studentIds, remarks, affectedCount: result.modifiedCount },
    'STUDENT_MANAGEMENT'
  );

  res.json({
    success: true,
    message: `${result.modifiedCount} students verified successfully`,
    data: { modifiedCount: result.modifiedCount }
  });
}));

// ===========================================
// COMPANY MANAGEMENT
// ===========================================

/**
 * @route   GET /api/tpo/companies
 * @desc    Get all companies with filters
 * @access  Private/Admin
 */
router.get('/companies', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    search,
    industry,
    isApproved,
    verificationStatus,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const query = {};

  if (industry && industry !== 'All') query.industry = industry;
  if (isApproved !== undefined) query.isApproved = isApproved === 'true';
  if (verificationStatus && verificationStatus !== 'All') query.verificationStatus = verificationStatus;
  if (search) {
    query.$or = [
      { companyName: { $regex: search, $options: 'i' } },
      { 'contact.email': { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortField = sortBy === 'name' ? 'companyName' : sortBy;

  const [companies, total] = await Promise.all([
    Company.find(query)
      .populate('user', 'firstName lastName email createdAt lastLogin')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ [sortField]: sortOrder === 'asc' ? 1 : -1 }),
    Company.countDocuments(query)
  ]);

  // Get job counts for each company
  const companiesWithStats = await Promise.all(companies.map(async (company) => {
    const jobCount = await JobPosting.countDocuments({ company: company._id });
    const hireCount = await Application.countDocuments({ 
      company: company._id, 
      status: { $in: ['Selected', 'Offer Accepted'] } 
    });
    return {
      ...company.toObject(),
      jobsPosted: jobCount,
      totalHires: hireCount
    };
  }));

  res.json({
    success: true,
    data: {
      companies: companiesWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
}));

/**
 * @route   GET /api/tpo/companies/:id
 * @desc    Get detailed company profile
 * @access  Private/Admin
 */
router.get('/companies/:id', requireAuth, requireAdmin, validateMongoId('id'), asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id)
    .populate('user', 'firstName lastName email createdAt lastLogin isActive')
    .populate('approvedBy', 'firstName lastName');

  if (!company) {
    return res.status(404).json({
      success: false,
      message: 'Company not found'
    });
  }

  // Get jobs posted by this company
  const jobs = await JobPosting.find({ company: company._id })
    .select('title status package dates vacancies')
    .sort({ createdAt: -1 });

  // Get hiring statistics
  const hiringStats = await Application.aggregate([
    { $match: { company: company._id } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get activity logs
  const activityLogs = await SystemLog.find({
    targetType: 'Company',
    targetId: company._id
  })
    .populate('performedBy', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(20);

  res.json({
    success: true,
    data: {
      company,
      jobs,
      hiringStats,
      activityLogs
    }
  });
}));

/**
 * @route   POST /api/tpo/companies/:id/approve
 * @desc    Approve company
 * @access  Private/Admin
 */
router.post('/companies/:id/approve', requireAuth, requireAdmin, validateMongoId('id'), asyncHandler(async (req, res) => {
  const { remarks, partnershipType } = req.body;

  const company = await Company.findByIdAndUpdate(
    req.params.id,
    {
      isApproved: true,
      verificationStatus: 'Verified',
      approvedBy: req.user._id,
      approvedAt: new Date(),
      ...(partnershipType && { 'partnership.type': partnershipType })
    },
    { new: true }
  ).populate('user', 'firstName lastName email');

  if (!company) {
    return res.status(404).json({
      success: false,
      message: 'Company not found'
    });
  }

  // Approve user
  await User.findByIdAndUpdate(company.user._id, { isApproved: true });

  // Log action
  await logAction(
    'COMPANY_APPROVED',
    req.user._id,
    'Company',
    company._id,
    `Approved company: ${company.companyName}`,
    { remarks, partnershipType },
    'COMPANY_MANAGEMENT'
  );

  res.json({
    success: true,
    message: 'Company approved successfully',
    data: { company }
  });
}));

/**
 * @route   POST /api/tpo/companies/:id/reject
 * @desc    Reject company
 * @access  Private/Admin
 */
router.post('/companies/:id/reject', requireAuth, requireAdmin, validateMongoId('id'), asyncHandler(async (req, res) => {
  const { reason } = req.body;

  if (!reason) {
    return res.status(400).json({
      success: false,
      message: 'Rejection reason is required'
    });
  }

  const company = await Company.findByIdAndUpdate(
    req.params.id,
    {
      isApproved: false,
      verificationStatus: 'Rejected',
      rejectionReason: reason
    },
    { new: true }
  );

  if (!company) {
    return res.status(404).json({
      success: false,
      message: 'Company not found'
    });
  }

  // Log action
  await logAction(
    'COMPANY_REJECTED',
    req.user._id,
    'Company',
    company._id,
    `Rejected company: ${company.companyName}`,
    { reason },
    'COMPANY_MANAGEMENT'
  );

  res.json({
    success: true,
    message: 'Company rejected',
    data: { company, reason }
  });
}));

/**
 * @route   POST /api/tpo/companies/:id/toggle-status
 * @desc    Enable/disable company
 * @access  Private/Admin
 */
router.post('/companies/:id/toggle-status', requireAuth, requireAdmin, validateMongoId('id'), asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);

  if (!company) {
    return res.status(404).json({
      success: false,
      message: 'Company not found'
    });
  }

  company.isActive = !company.isActive;
  await company.save();

  // Log action
  await logAction(
    company.isActive ? 'COMPANY_UNBLOCKED' : 'COMPANY_BLOCKED',
    req.user._id,
    'Company',
    company._id,
    `${company.isActive ? 'Enabled' : 'Disabled'} company: ${company.companyName}`,
    {},
    'COMPANY_MANAGEMENT'
  );

  res.json({
    success: true,
    message: `Company ${company.isActive ? 'enabled' : 'disabled'} successfully`,
    data: { company }
  });
}));

// ===========================================
// JOB MANAGEMENT
// ===========================================

/**
 * @route   GET /api/tpo/jobs
 * @desc    Get all jobs with filters
 * @access  Private/Admin
 */
router.get('/jobs', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    search,
    status,
    jobType,
    branch,
    minPackage,
    maxPackage,
    company,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const query = {};

  if (status && status !== 'All') query.status = status;
  if (jobType && jobType !== 'All') query.jobType = jobType;
  if (branch && branch !== 'All') query['eligibility.branches'] = branch;
  if (minPackage) query['package.ctc'] = { $gte: parseFloat(minPackage) };
  if (maxPackage) query['package.ctc'] = { ...query['package.ctc'], $lte: parseFloat(maxPackage) };
  if (company) query.company = company;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { department: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [jobs, total] = await Promise.all([
    JobPosting.find(query)
      .populate('company', 'companyName companyLogo industry')
      .populate('postedBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 }),
    JobPosting.countDocuments(query)
  ]);

  // Get application counts for each job
  const jobsWithStats = await Promise.all(jobs.map(async (job) => {
    const [totalApplications, shortlisted, selected] = await Promise.all([
      Application.countDocuments({ job: job._id }),
      Application.countDocuments({ job: job._id, status: 'Shortlisted' }),
      Application.countDocuments({ job: job._id, status: { $in: ['Selected', 'Offer Accepted'] } })
    ]);
    return {
      ...job.toObject(),
      applicationStats: { total: totalApplications, shortlisted, selected }
    };
  }));

  res.json({
    success: true,
    data: {
      jobs: jobsWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
}));

/**
 * @route   GET /api/tpo/jobs/:id
 * @desc    Get detailed job information
 * @access  Private/Admin
 */
router.get('/jobs/:id', requireAuth, requireAdmin, validateMongoId('id'), asyncHandler(async (req, res) => {
  const job = await JobPosting.findById(req.params.id)
    .populate('company', 'companyName companyLogo industry contact')
    .populate('postedBy', 'firstName lastName email')
    .populate('approvedBy', 'firstName lastName');

  if (!job) {
    return res.status(404).json({
      success: false,
      message: 'Job not found'
    });
  }

  // Get applications for this job
  const applications = await Application.find({ job: job._id })
    .populate({
      path: 'student',
      populate: { path: 'user', select: 'firstName lastName email profileImage' }
    })
    .populate('aiScore')
    .sort({ createdAt: -1 });

  // Application status distribution
  const statusDistribution = await Application.aggregate([
    { $match: { job: job._id } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  // Activity logs
  const activityLogs = await SystemLog.find({
    targetType: 'JobPosting',
    targetId: job._id
  })
    .populate('performedBy', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(20);

  res.json({
    success: true,
    data: {
      job,
      applications,
      statusDistribution,
      activityLogs
    }
  });
}));

/**
 * @route   POST /api/tpo/jobs/:id/approve
 * @desc    Approve job posting
 * @access  Private/Admin
 */
router.post('/jobs/:id/approve', requireAuth, requireAdmin, validateMongoId('id'), asyncHandler(async (req, res) => {
  const { remarks } = req.body;

  const job = await JobPosting.findByIdAndUpdate(
    req.params.id,
    {
      status: 'Active',
      approvedBy: req.user._id,
      approvedAt: new Date()
    },
    { new: true }
  ).populate('company', 'companyName');

  if (!job) {
    return res.status(404).json({
      success: false,
      message: 'Job not found'
    });
  }

  // Log action
  await logAction(
    'JOB_APPROVED',
    req.user._id,
    'JobPosting',
    job._id,
    `Approved job: ${job.title} at ${job.company.companyName}`,
    { remarks },
    'JOB_MANAGEMENT'
  );

  res.json({
    success: true,
    message: 'Job approved successfully',
    data: { job }
  });
}));

/**
 * @route   POST /api/tpo/jobs/:id/reject
 * @desc    Reject job posting
 * @access  Private/Admin
 */
router.post('/jobs/:id/reject', requireAuth, requireAdmin, validateMongoId('id'), asyncHandler(async (req, res) => {
  const { reason } = req.body;

  if (!reason) {
    return res.status(400).json({
      success: false,
      message: 'Rejection reason is required'
    });
  }

  const job = await JobPosting.findByIdAndUpdate(
    req.params.id,
    {
      status: 'Cancelled',
      rejectionReason: reason
    },
    { new: true }
  ).populate('company', 'companyName');

  if (!job) {
    return res.status(404).json({
      success: false,
      message: 'Job not found'
    });
  }

  // Log action
  await logAction(
    'JOB_REJECTED',
    req.user._id,
    'JobPosting',
    job._id,
    `Rejected job: ${job.title}`,
    { reason },
    'JOB_MANAGEMENT'
  );

  res.json({
    success: true,
    message: 'Job rejected',
    data: { job, reason }
  });
}));

/**
 * @route   POST /api/tpo/jobs/:id/lock-applications
 * @desc    Lock/unlock applications for a job
 * @access  Private/Admin
 */
router.post('/jobs/:id/lock-applications', requireAuth, requireAdmin, validateMongoId('id'), asyncHandler(async (req, res) => {
  const job = await JobPosting.findById(req.params.id);

  if (!job) {
    return res.status(404).json({
      success: false,
      message: 'Job not found'
    });
  }

  job.isApplicationsLocked = !job.isApplicationsLocked;
  await job.save();

  // Log action
  await logAction(
    job.isApplicationsLocked ? 'APPLICATION_LOCKED' : 'APPLICATION_UNLOCKED',
    req.user._id,
    'JobPosting',
    job._id,
    `${job.isApplicationsLocked ? 'Locked' : 'Unlocked'} applications for: ${job.title}`,
    {},
    'JOB_MANAGEMENT'
  );

  res.json({
    success: true,
    message: `Applications ${job.isApplicationsLocked ? 'locked' : 'unlocked'} for this job`,
    data: { job }
  });
}));

/**
 * @route   POST /api/tpo/jobs/:id/assign-branches
 * @desc    Assign eligible branches to a job
 * @access  Private/Admin
 */
router.post('/jobs/:id/assign-branches', requireAuth, requireAdmin, validateMongoId('id'), asyncHandler(async (req, res) => {
  const { branches } = req.body;

  const job = await JobPosting.findByIdAndUpdate(
    req.params.id,
    { 'eligibility.branches': branches },
    { new: true }
  );

  if (!job) {
    return res.status(404).json({
      success: false,
      message: 'Job not found'
    });
  }

  // Log action
  await logAction(
    'JOB_UPDATED',
    req.user._id,
    'JobPosting',
    job._id,
    `Updated eligible branches for: ${job.title}`,
    { branches },
    'JOB_MANAGEMENT'
  );

  res.json({
    success: true,
    message: 'Branches assigned successfully',
    data: { job }
  });
}));

/**
 * @route   GET /api/tpo/jobs/:id/shortlist
 * @desc    Get shortlisted candidates for download
 * @access  Private/Admin
 */
router.get('/jobs/:id/shortlist', requireAuth, requireAdmin, validateMongoId('id'), asyncHandler(async (req, res) => {
  const { status = 'Shortlisted' } = req.query;

  const applications = await Application.find({
    job: req.params.id,
    status: { $in: status.split(',') }
  })
    .populate({
      path: 'student',
      populate: { path: 'user', select: 'firstName lastName email' }
    })
    .populate('aiScore')
    .sort({ eligibilityScore: -1 });

  const candidates = applications.map(app => ({
    name: `${app.student?.user?.firstName || ''} ${app.student?.user?.lastName || ''}`,
    email: app.student?.user?.email,
    rollNumber: app.student?.academicInfo?.rollNumber,
    branch: app.student?.academicInfo?.branch,
    cgpa: app.student?.academicInfo?.cgpa,
    skills: app.student?.skills?.technical?.join(', '),
    aiScore: app.eligibilityScore,
    status: app.status,
    appliedAt: app.appliedAt
  }));

  res.json({
    success: true,
    data: { candidates, total: candidates.length }
  });
}));

// ===========================================
// APPLICATION MANAGEMENT
// ===========================================

/**
 * @route   GET /api/tpo/applications
 * @desc    Get all applications with filters
 * @access  Private/Admin
 */
router.get('/applications', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    jobId,
    companyId,
    studentId,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const query = {};

  if (status && status !== 'All') query.status = status;
  if (jobId) query.job = jobId;
  if (companyId) query.company = companyId;
  if (studentId) query.student = studentId;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [applications, total] = await Promise.all([
    Application.find(query)
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'firstName lastName email profileImage' }
      })
      .populate('job', 'title package status')
      .populate('company', 'companyName companyLogo')
      .populate('aiScore')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 }),
    Application.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: {
      applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
}));

/**
 * @route   POST /api/tpo/applications/:id/update-status
 * @desc    Update application status (TPO override)
 * @access  Private/Admin
 */
router.post('/applications/:id/update-status', requireAuth, requireAdmin, validateMongoId('id'), asyncHandler(async (req, res) => {
  const { status, remarks } = req.body;

  const validStatuses = [
    'Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled',
    'In Progress', 'Selected', 'Waitlisted', 'Rejected', 'Withdrawn',
    'Offer Accepted', 'Offer Declined'
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status'
    });
  }

  const application = await Application.findById(req.params.id)
    .populate({
      path: 'student',
      populate: { path: 'user', select: 'firstName lastName' }
    })
    .populate('job', 'title');

  if (!application) {
    return res.status(404).json({
      success: false,
      message: 'Application not found'
    });
  }

  const previousStatus = application.status;

  // Add to status history
  application.statusHistory.push({
    status,
    changedAt: new Date(),
    changedBy: req.user._id,
    remarks
  });

  application.status = status;
  application.lastUpdatedAt = new Date();

  // If selected/offer accepted, update student placement status
  if (status === 'Selected' || status === 'Offer Accepted') {
    await StudentProfile.findByIdAndUpdate(application.student._id, {
      placementStatus: 'Placed',
      placedCompany: application.company
    });
  }

  await application.save();

  // Log action
  await logAction(
    'APPLICATION_STATUS_UPDATED',
    req.user._id,
    'Application',
    application._id,
    `Updated application status: ${previousStatus} → ${status} for ${application.student?.user?.firstName} ${application.student?.user?.lastName}`,
    { previousStatus, newStatus: status, remarks, jobTitle: application.job?.title },
    'APPLICATION_MANAGEMENT'
  );

  res.json({
    success: true,
    message: 'Application status updated',
    data: { application }
  });
}));

/**
 * @route   POST /api/tpo/applications/:id/mark-placed
 * @desc    Manually mark student as placed
 * @access  Private/Admin
 */
router.post('/applications/:id/mark-placed', requireAuth, requireAdmin, validateMongoId('id'), asyncHandler(async (req, res) => {
  const { package: ctcPackage, joiningDate, remarks } = req.body;

  const application = await Application.findById(req.params.id)
    .populate({
      path: 'student',
      populate: { path: 'user', select: 'firstName lastName' }
    })
    .populate('job', 'title package')
    .populate('company', 'companyName');

  if (!application) {
    return res.status(404).json({
      success: false,
      message: 'Application not found'
    });
  }

  // Update application
  application.status = 'Offer Accepted';
  application.offerDetails = {
    ctc: ctcPackage || application.job.package?.ctc,
    joiningDate,
    offerResponseAt: new Date(),
    offerResponse: 'Accepted'
  };
  application.statusHistory.push({
    status: 'Offer Accepted',
    changedAt: new Date(),
    changedBy: req.user._id,
    remarks: remarks || 'Manually marked as placed by TPO'
  });

  await application.save();

  // Update student profile
  await StudentProfile.findByIdAndUpdate(application.student._id, {
    placementStatus: 'Placed',
    placedCompany: application.company._id,
    placedPackage: ctcPackage || application.job.package?.ctc
  });

  // Update company stats
  await Company.findByIdAndUpdate(application.company._id, {
    $inc: { 'placementStats.totalStudentsHired': 1 }
  });

  // Log action
  await logAction(
    'PLACEMENT_CONFIRMED',
    req.user._id,
    'Application',
    application._id,
    `Confirmed placement: ${application.student?.user?.firstName} ${application.student?.user?.lastName} at ${application.company?.companyName}`,
    { package: ctcPackage, joiningDate, remarks },
    'APPLICATION_MANAGEMENT'
  );

  res.json({
    success: true,
    message: 'Student marked as placed successfully',
    data: { application }
  });
}));

// ===========================================
// PLACEMENT DRIVES
// ===========================================

/**
 * @route   GET /api/tpo/drives
 * @desc    Get all placement drives
 * @access  Private/Admin
 */
router.get('/drives', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const { status, academicYear, page = 1, limit = 20 } = req.query;

  const query = {};
  if (status && status !== 'All') query.status = status;
  if (academicYear) query.academicYear = academicYear;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [drives, total] = await Promise.all([
    PlacementDrive.find(query)
      .populate('createdBy', 'firstName lastName')
      .populate('companies.company', 'companyName companyLogo')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 }),
    PlacementDrive.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: {
      drives,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
}));

/**
 * @route   POST /api/tpo/drives
 * @desc    Create a new placement drive
 * @access  Private/Admin
 */
router.post('/drives', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const drive = await PlacementDrive.create({
    ...req.body,
    createdBy: req.user._id
  });

  // Log action
  await logAction(
    'DRIVE_CREATED',
    req.user._id,
    'PlacementDrive',
    drive._id,
    `Created placement drive: ${drive.title}`,
    {},
    'PLACEMENT_DRIVE'
  );

  res.status(201).json({
    success: true,
    message: 'Placement drive created successfully',
    data: { drive }
  });
}));

/**
 * @route   PUT /api/tpo/drives/:id
 * @desc    Update placement drive
 * @access  Private/Admin
 */
router.put('/drives/:id', requireAuth, requireAdmin, validateMongoId('id'), asyncHandler(async (req, res) => {
  const drive = await PlacementDrive.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  if (!drive) {
    return res.status(404).json({
      success: false,
      message: 'Drive not found'
    });
  }

  // Log action
  await logAction(
    'DRIVE_UPDATED',
    req.user._id,
    'PlacementDrive',
    drive._id,
    `Updated placement drive: ${drive.title}`,
    {},
    'PLACEMENT_DRIVE'
  );

  res.json({
    success: true,
    message: 'Drive updated successfully',
    data: { drive }
  });
}));

/**
 * @route   POST /api/tpo/drives/:id/update-status
 * @desc    Update drive status
 * @access  Private/Admin
 */
router.post('/drives/:id/update-status', requireAuth, requireAdmin, validateMongoId('id'), asyncHandler(async (req, res) => {
  const { status } = req.body;

  const validStatuses = ['Draft', 'Scheduled', 'Registration Open', 'Registration Closed', 'Ongoing', 'Completed', 'Cancelled'];
  
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status'
    });
  }

  const drive = await PlacementDrive.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  if (!drive) {
    return res.status(404).json({
      success: false,
      message: 'Drive not found'
    });
  }

  // Log action
  const actionMap = {
    'Scheduled': 'DRIVE_CREATED',
    'Ongoing': 'DRIVE_STARTED',
    'Completed': 'DRIVE_COMPLETED',
    'Cancelled': 'DRIVE_CANCELLED'
  };

  await logAction(
    actionMap[status] || 'DRIVE_UPDATED',
    req.user._id,
    'PlacementDrive',
    drive._id,
    `Updated drive status to ${status}: ${drive.title}`,
    { status },
    'PLACEMENT_DRIVE'
  );

  res.json({
    success: true,
    message: 'Drive status updated',
    data: { drive }
  });
}));

// ===========================================
// SETTINGS & SYSTEM CONTROL
// ===========================================

/**
 * @route   GET /api/tpo/settings
 * @desc    Get placement settings
 * @access  Private/Admin
 */
router.get('/settings', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const settings = await PlacementSettings.getSettings();

  res.json({
    success: true,
    data: { settings }
  });
}));

/**
 * @route   PUT /api/tpo/settings
 * @desc    Update placement settings
 * @access  Private/Admin
 */
router.put('/settings', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const settings = await PlacementSettings.updateSettings(req.body, req.user._id);

  // Log action
  await logAction(
    'SETTINGS_UPDATED',
    req.user._id,
    'Settings',
    settings._id,
    'Updated placement settings',
    { updatedFields: Object.keys(req.body) },
    'SYSTEM'
  );

  res.json({
    success: true,
    message: 'Settings updated successfully',
    data: { settings }
  });
}));

/**
 * @route   POST /api/tpo/settings/toggle-ai
 * @desc    Enable/disable AI scoring
 * @access  Private/Admin
 */
router.post('/settings/toggle-ai', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const settings = await PlacementSettings.getSettings();
  settings.aiSettings.enabled = !settings.aiSettings.enabled;
  await settings.save();

  // Log action
  await logAction(
    settings.aiSettings.enabled ? 'AI_ENABLED' : 'AI_DISABLED',
    req.user._id,
    'Settings',
    settings._id,
    `${settings.aiSettings.enabled ? 'Enabled' : 'Disabled'} AI scoring`,
    {},
    'SYSTEM'
  );

  res.json({
    success: true,
    message: `AI scoring ${settings.aiSettings.enabled ? 'enabled' : 'disabled'}`,
    data: { aiEnabled: settings.aiSettings.enabled }
  });
}));

/**
 * @route   GET /api/tpo/activity-logs
 * @desc    Get system activity logs
 * @access  Private/Admin
 */
router.get('/activity-logs', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 50,
    action,
    category,
    userId,
    startDate,
    endDate,
    severity
  } = req.query;

  const query = {};

  if (action) query.action = action;
  if (category) query.category = category;
  if (userId) query.performedBy = userId;
  if (severity) query.severity = severity;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [logs, total] = await Promise.all([
    SystemLog.find(query)
      .populate('performedBy', 'firstName lastName email role')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 }),
    SystemLog.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: {
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
}));

// ===========================================
// REPORTS & ANALYTICS
// ===========================================

/**
 * @route   GET /api/tpo/reports/placements
 * @desc    Get placement summary report
 * @access  Private/Admin
 */
router.get('/reports/placements', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const { startDate, endDate, branch, year } = req.query;

  const dateFilter = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);

  const studentFilter = {};
  if (branch) studentFilter.branch = branch;
  if (year) studentFilter.graduationYear = parseInt(year);

  // Get total students
  const totalStudents = await StudentProfile.countDocuments({
    ...studentFilter,
    isVerified: true
  });

  // Get placed students
  const placedStudents = await StudentProfile.countDocuments({
    ...studentFilter,
    isVerified: true,
    placementStatus: 'Placed'
  });

  // Get active companies
  const activeCompanies = await Company.countDocuments({ isApproved: true, isActive: true });

  // Get offer statistics from applications
  const offerStats = await Application.aggregate([
    {
      $match: {
        status: { $in: ['Selected', 'Offer Accepted'] },
        ...(Object.keys(dateFilter).length ? { updatedAt: dateFilter } : {})
      }
    },
    {
      $lookup: {
        from: 'jobpostings',
        localField: 'job',
        foreignField: '_id',
        as: 'jobDetails'
      }
    },
    { $unwind: { path: '$jobDetails', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: null,
        totalOffers: { $sum: 1 },
        avgPackage: { $avg: '$jobDetails.package.ctc' },
        maxPackage: { $max: '$jobDetails.package.ctc' },
        minPackage: { $min: '$jobDetails.package.ctc' }
      }
    }
  ]);

  const stats = offerStats[0] || { totalOffers: 0, avgPackage: 0, maxPackage: 0, minPackage: 0 };

  res.json({
    success: true,
    data: {
      totalStudents,
      placedStudents,
      placementRate: totalStudents > 0 ? ((placedStudents / totalStudents) * 100).toFixed(2) : 0,
      activeCompanies,
      totalOffers: stats.totalOffers,
      avgPackage: stats.avgPackage ? (stats.avgPackage / 100000).toFixed(2) : 0,
      highestPackage: stats.maxPackage ? (stats.maxPackage / 100000).toFixed(2) : 0,
      lowestPackage: stats.minPackage ? (stats.minPackage / 100000).toFixed(2) : 0,
      notPlaced: totalStudents - placedStudents
    }
  });
}));

/**
 * @route   GET /api/tpo/reports/branches
 * @desc    Get branch-wise placement report
 * @access  Private/Admin
 */
router.get('/reports/branches', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const { startDate, endDate, year } = req.query;

  const matchFilter = { isVerified: true };
  if (year) matchFilter.graduationYear = parseInt(year);

  const branchStats = await StudentProfile.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: '$branch',
        total: { $sum: 1 },
        placed: {
          $sum: { $cond: [{ $eq: ['$placementStatus', 'Placed'] }, 1, 0] }
        }
      }
    },
    {
      $project: {
        branch: '$_id',
        total: 1,
        placed: 1,
        placementRate: {
          $multiply: [{ $divide: ['$placed', '$total'] }, 100]
        }
      }
    },
    { $sort: { placementRate: -1 } }
  ]);

  // Get average package per branch
  const packageByBranch = await Application.aggregate([
    {
      $match: { status: { $in: ['Selected', 'Offer Accepted'] } }
    },
    {
      $lookup: {
        from: 'studentprofiles',
        localField: 'student',
        foreignField: 'user',
        as: 'studentProfile'
      }
    },
    { $unwind: { path: '$studentProfile', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'jobpostings',
        localField: 'job',
        foreignField: '_id',
        as: 'jobDetails'
      }
    },
    { $unwind: { path: '$jobDetails', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: '$studentProfile.branch',
        avgPackage: { $avg: '$jobDetails.package.ctc' }
      }
    }
  ]);

  // Merge package data with branch stats
  const packageMap = {};
  packageByBranch.forEach(p => {
    packageMap[p._id] = p.avgPackage ? (p.avgPackage / 100000).toFixed(2) : 0;
  });

  const enrichedStats = branchStats.map(stat => ({
    branch: stat.branch || 'Unknown',
    total: stat.total,
    placed: stat.placed,
    placementRate: stat.placementRate.toFixed(2),
    avgPackage: packageMap[stat.branch] || 0
  }));

  res.json({
    success: true,
    data: enrichedStats
  });
}));

/**
 * @route   GET /api/tpo/reports/companies
 * @desc    Get company-wise hiring report
 * @access  Private/Admin
 */
router.get('/reports/companies', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const dateFilter = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);

  const companyStats = await Application.aggregate([
    {
      $match: {
        status: { $in: ['Selected', 'Offer Accepted'] },
        ...(Object.keys(dateFilter).length ? { updatedAt: dateFilter } : {})
      }
    },
    {
      $lookup: {
        from: 'jobpostings',
        localField: 'job',
        foreignField: '_id',
        as: 'jobDetails'
      }
    },
    { $unwind: { path: '$jobDetails', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'companies',
        localField: 'jobDetails.company',
        foreignField: '_id',
        as: 'companyDetails'
      }
    },
    { $unwind: { path: '$companyDetails', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: '$companyDetails._id',
        name: { $first: '$companyDetails.name' },
        offers: { $sum: 1 },
        avgPackage: { $avg: '$jobDetails.package.ctc' },
        maxPackage: { $max: '$jobDetails.package.ctc' },
        minPackage: { $min: '$jobDetails.package.ctc' }
      }
    },
    { $sort: { offers: -1 } },
    { $limit: 20 }
  ]);

  const enrichedStats = companyStats.map(stat => ({
    name: stat.name || 'Unknown Company',
    offers: stat.offers,
    avgPackage: stat.avgPackage ? (stat.avgPackage / 100000).toFixed(2) : 0,
    maxPackage: stat.maxPackage ? (stat.maxPackage / 100000).toFixed(2) : 0,
    minPackage: stat.minPackage ? (stat.minPackage / 100000).toFixed(2) : 0
  }));

  res.json({
    success: true,
    data: enrichedStats
  });
}));

/**
 * @route   GET /api/tpo/reports/trends
 * @desc    Get placement trends over time
 * @access  Private/Admin
 */
router.get('/reports/trends', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const { startDate, endDate, granularity = 'month' } = req.query;

  const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 6));
  const end = endDate ? new Date(endDate) : new Date();

  // Get placements by month
  const placementTrends = await Application.aggregate([
    {
      $match: {
        status: { $in: ['Selected', 'Offer Accepted'] },
        updatedAt: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$updatedAt' },
          month: { $month: '$updatedAt' }
        },
        placements: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  // Get applications by month
  const applicationTrends = await Application.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        applications: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  // Merge and format data
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const trendMap = {};
  
  placementTrends.forEach(t => {
    const key = `${t._id.year}-${t._id.month}`;
    trendMap[key] = { 
      month: monthNames[t._id.month - 1],
      year: t._id.year,
      placements: t.placements,
      applications: 0
    };
  });

  applicationTrends.forEach(t => {
    const key = `${t._id.year}-${t._id.month}`;
    if (trendMap[key]) {
      trendMap[key].applications = t.applications;
    } else {
      trendMap[key] = {
        month: monthNames[t._id.month - 1],
        year: t._id.year,
        placements: 0,
        applications: t.applications
      };
    }
  });

  const trendData = Object.values(trendMap).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return monthNames.indexOf(a.month) - monthNames.indexOf(b.month);
  });

  res.json({
    success: true,
    data: trendData
  });
}));

/**
 * @route   GET /api/tpo/reports/:type/export
 * @desc    Export report as CSV
 * @access  Private/Admin
 */
router.get('/reports/:type/export', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const { type } = req.params;
  const { startDate, endDate, branch, year, format = 'csv' } = req.query;

  let csvContent = '';
  let filename = '';

  switch (type) {
    case 'placements': {
      const studentFilter = {};
      if (branch) studentFilter.branch = branch;
      if (year) studentFilter.graduationYear = parseInt(year);

      const students = await StudentProfile.find({
        ...studentFilter,
        isVerified: true
      }).populate('user', 'firstName lastName email');

      csvContent = 'Name,Email,Branch,CGPA,Placement Status,Company,Package\n';
      for (const student of students) {
        const placedApp = await Application.findOne({
          student: student.user._id,
          status: { $in: ['Selected', 'Offer Accepted'] }
        }).populate({
          path: 'job',
          populate: { path: 'company', select: 'name' }
        });

        const company = placedApp?.job?.company?.name || '-';
        const pkg = placedApp?.job?.package?.ctc ? `${(placedApp.job.package.ctc / 100000).toFixed(2)} LPA` : '-';

        csvContent += `"${student.user?.firstName || ''} ${student.user?.lastName || ''}","${student.user?.email || ''}","${student.branch || ''}","${student.cgpa || ''}","${student.placementStatus || 'Not Placed'}","${company}","${pkg}"\n`;
      }
      filename = 'placement-report';
      break;
    }

    case 'branches': {
      const branchStats = await StudentProfile.aggregate([
        { $match: { isVerified: true } },
        {
          $group: {
            _id: '$branch',
            total: { $sum: 1 },
            placed: { $sum: { $cond: [{ $eq: ['$placementStatus', 'Placed'] }, 1, 0] } }
          }
        }
      ]);

      csvContent = 'Branch,Total Students,Placed,Not Placed,Placement Rate\n';
      branchStats.forEach(stat => {
        const rate = stat.total > 0 ? ((stat.placed / stat.total) * 100).toFixed(2) : 0;
        csvContent += `"${stat._id || 'Unknown'}",${stat.total},${stat.placed},${stat.total - stat.placed},${rate}%\n`;
      });
      filename = 'branch-report';
      break;
    }

    case 'companies': {
      const companies = await Company.find({ isApproved: true }).lean();
      
      csvContent = 'Company Name,Industry,Location,Partnership Status,Total Jobs,Total Hires\n';
      for (const company of companies) {
        const jobCount = await JobPosting.countDocuments({ company: company._id });
        const hireCount = await Application.countDocuments({
          status: { $in: ['Selected', 'Offer Accepted'] },
          job: { $in: await JobPosting.find({ company: company._id }).distinct('_id') }
        });

        csvContent += `"${company.name}","${company.industry || ''}","${company.location || ''}","${company.partnershipStatus || 'Active'}",${jobCount},${hireCount}\n`;
      }
      filename = 'company-report';
      break;
    }

    case 'trends': {
      // Similar to trends endpoint but formatted for CSV
      const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 6));
      const end = endDate ? new Date(endDate) : new Date();

      const trends = await Application.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            applications: { $sum: 1 },
            placements: {
              $sum: { $cond: [{ $in: ['$status', ['Selected', 'Offer Accepted']] }, 1, 0] }
            }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]);

      csvContent = 'Month,Year,Applications,Placements\n';
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      trends.forEach(t => {
        csvContent += `${monthNames[t._id.month - 1]},${t._id.year},${t.applications},${t.placements}\n`;
      });
      filename = 'trend-report';
      break;
    }

    default:
      return res.status(400).json({ success: false, message: 'Invalid report type' });
  }

  // Log export action
  await logAction(
    'REPORT_EXPORTED',
    req.user._id,
    'Report',
    null,
    `Exported ${type} report as ${format.toUpperCase()}`,
    { type, format, filters: { startDate, endDate, branch, year } },
    'REPORTS'
  );

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}-${new Date().toISOString().split('T')[0]}.csv`);
  res.send(csvContent);
}));

module.exports = router;
