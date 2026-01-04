/**
 * Admin Routes
 * 
 * @description Administrative operations and approvals
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

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Private/Admin
 */
router.get('/users', requireAuth, requireAdmin, paginationRules, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter = {};
  
  if (req.query.role) {
    filter.role = req.query.role;
  }
  
  if (req.query.isApproved !== undefined) {
    filter.isApproved = req.query.isApproved === 'true';
  }

  if (req.query.search) {
    filter.$or = [
      { firstName: { $regex: req.query.search, $options: 'i' } },
      { lastName: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-__v')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    User.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: {
      users,
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
 * @route   GET /api/admin/pending-approvals
 * @desc    Get all pending approvals
 * @access  Private/Admin
 */
router.get('/pending-approvals', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const [pendingStudents, pendingCompanies, pendingJobs] = await Promise.all([
    StudentProfile.find({ isVerified: false })
      .populate('user', 'firstName lastName email createdAt')
      .sort({ createdAt: -1 })
      .limit(50),
    Company.find({ isApproved: false })
      .populate('user', 'firstName lastName email createdAt')
      .sort({ createdAt: -1 })
      .limit(50),
    JobPosting.find({ status: 'Pending Approval' })
      .populate('company', 'companyName companyLogo')
      .sort({ createdAt: -1 })
      .limit(50)
  ]);

  res.json({
    success: true,
    data: {
      pendingStudents,
      pendingCompanies,
      pendingJobs,
      counts: {
        students: pendingStudents.length,
        companies: pendingCompanies.length,
        jobs: pendingJobs.length
      }
    }
  });
}));

/**
 * @route   POST /api/admin/approve-student/:id
 * @desc    Approve student profile
 * @access  Private/Admin
 */
router.post('/approve-student/:id', requireAuth, requireAdmin, validateMongoId('id'), asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findByIdAndUpdate(
    req.params.id,
    {
      isVerified: true,
      verifiedBy: req.user._id,
      verifiedAt: new Date()
    },
    { new: true }
  ).populate('user', 'firstName lastName email');

  if (!profile) {
    return res.status(404).json({
      success: false,
      message: 'Student profile not found'
    });
  }

  // Approve user as well
  await User.findByIdAndUpdate(profile.user._id, { isApproved: true });

  res.json({
    success: true,
    message: 'Student approved successfully',
    data: { profile }
  });
}));

/**
 * @route   POST /api/admin/reject-student/:id
 * @desc    Reject student profile
 * @access  Private/Admin
 */
router.post('/reject-student/:id', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const profile = await StudentProfile.findById(req.params.id);

  if (!profile) {
    return res.status(404).json({
      success: false,
      message: 'Student profile not found'
    });
  }

  // Delete the profile or mark as rejected
  await StudentProfile.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Student profile rejected',
    data: { reason }
  });
}));

/**
 * @route   POST /api/admin/approve-company/:id
 * @desc    Approve company
 * @access  Private/Admin
 */
router.post('/approve-company/:id', requireAuth, requireAdmin, validateMongoId('id'), asyncHandler(async (req, res) => {
  const company = await Company.findByIdAndUpdate(
    req.params.id,
    {
      isApproved: true,
      verificationStatus: 'Verified',
      approvedBy: req.user._id,
      approvedAt: new Date()
    },
    { new: true }
  ).populate('user', 'firstName lastName email');

  if (!company) {
    return res.status(404).json({
      success: false,
      message: 'Company not found'
    });
  }

  // Approve user as well
  await User.findByIdAndUpdate(company.user._id, { isApproved: true });

  res.json({
    success: true,
    message: 'Company approved successfully',
    data: { company }
  });
}));

/**
 * @route   POST /api/admin/reject-company/:id
 * @desc    Reject company
 * @access  Private/Admin
 */
router.post('/reject-company/:id', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const { reason } = req.body;

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

  res.json({
    success: true,
    message: 'Company rejected',
    data: { company }
  });
}));

/**
 * @route   POST /api/admin/approve-job/:id
 * @desc    Approve job posting
 * @access  Private/Admin
 */
router.post('/approve-job/:id', requireAuth, requireAdmin, validateMongoId('id'), asyncHandler(async (req, res) => {
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

  res.json({
    success: true,
    message: 'Job approved successfully',
    data: { job }
  });
}));

/**
 * @route   POST /api/admin/reject-job/:id
 * @desc    Reject job posting
 * @access  Private/Admin
 */
router.post('/reject-job/:id', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const job = await JobPosting.findByIdAndUpdate(
    req.params.id,
    {
      status: 'Cancelled',
      rejectionReason: reason
    },
    { new: true }
  );

  if (!job) {
    return res.status(404).json({
      success: false,
      message: 'Job not found'
    });
  }

  res.json({
    success: true,
    message: 'Job rejected',
    data: { job }
  });
}));

/**
 * @route   POST /api/admin/override-eligibility/:studentId
 * @desc    Override student eligibility
 * @access  Private/Admin
 */
router.post('/override-eligibility/:studentId', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const profile = await StudentProfile.findByIdAndUpdate(
    req.params.studentId,
    {
      eligibilityOverride: {
        isOverridden: true,
        reason,
        overriddenBy: req.user._id,
        overriddenAt: new Date()
      }
    },
    { new: true }
  );

  if (!profile) {
    return res.status(404).json({
      success: false,
      message: 'Student not found'
    });
  }

  res.json({
    success: true,
    message: 'Eligibility override applied',
    data: { profile }
  });
}));

/**
 * @route   PATCH /api/admin/user-role/:userId
 * @desc    Update user role
 * @access  Private/Admin
 */
router.patch('/user-role/:userId', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!['STUDENT', 'RECRUITER', 'ADMIN'].includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid role'
    });
  }

  const user = await User.findByIdAndUpdate(
    req.params.userId,
    { role },
    { new: true }
  );

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    message: 'User role updated',
    data: { user }
  });
}));

/**
 * @route   POST /api/admin/bulk-approve-students
 * @desc    Bulk approve students
 * @access  Private/Admin
 */
router.post('/bulk-approve-students', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const { studentIds } = req.body;

  if (!studentIds || !Array.isArray(studentIds)) {
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
      verifiedAt: new Date()
    }
  );

  // Also approve users
  const profiles = await StudentProfile.find({ _id: { $in: studentIds } });
  const userIds = profiles.map(p => p.user);
  await User.updateMany(
    { _id: { $in: userIds } },
    { isApproved: true }
  );

  res.json({
    success: true,
    message: `${result.modifiedCount} students approved`,
    data: { modifiedCount: result.modifiedCount }
  });
}));

/**
 * @route   DELETE /api/admin/user/:userId
 * @desc    Delete user account
 * @access  Private/Admin
 */
router.delete('/user/:userId', requireAuth, requireAdmin, validateMongoId('userId'), asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Prevent deleting yourself
  if (user._id.toString() === req.user._id.toString()) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete your own account'
    });
  }

  // Delete related data based on role
  if (user.role === 'STUDENT') {
    await StudentProfile.deleteOne({ user: user._id });
  } else if (user.role === 'RECRUITER') {
    await Company.deleteOne({ user: user._id });
  }

  // Delete user
  await User.findByIdAndDelete(req.params.userId);

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
}));

/**
 * @route   GET /api/admin/system-health
 * @desc    Get system health status
 * @access  Private/Admin
 */
router.get('/system-health', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const mongoose = require('mongoose');
  
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  // Get counts
  const [userCount, studentCount, companyCount, jobCount, applicationCount] = await Promise.all([
    User.estimatedDocumentCount(),
    StudentProfile.estimatedDocumentCount(),
    Company.estimatedDocumentCount(),
    JobPosting.estimatedDocumentCount(),
    Application.estimatedDocumentCount()
  ]);

  res.json({
    success: true,
    data: {
      status: 'healthy',
      database: dbStatus,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      collections: {
        users: userCount,
        students: studentCount,
        companies: companyCount,
        jobs: jobCount,
        applications: applicationCount
      },
      timestamp: new Date()
    }
  });
}));

module.exports = router;
