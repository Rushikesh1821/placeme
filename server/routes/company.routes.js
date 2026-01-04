/**
 * Company Routes
 * 
 * @description CRUD operations for company/recruiter profiles
 */

const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { requireAuth, requireRecruiter, requireAdmin, requireRole } = require('../middleware/auth');
const { companyRules, validateMongoId, paginationRules } = require('../middleware/validation');
const { uploadLogo } = require('../config/cloudinary');
const Company = require('../models/Company');
const User = require('../models/User');

/**
 * @route   POST /api/companies
 * @desc    Create company profile
 * @access  Private/Recruiter
 */
router.post('/', requireAuth, requireRecruiter, companyRules.create, asyncHandler(async (req, res) => {
  // Check if company profile already exists
  const existingCompany = await Company.findOne({ user: req.user._id });
  
  if (existingCompany) {
    return res.status(400).json({
      success: false,
      message: 'Company profile already exists. Use PUT to update.'
    });
  }

  const companyData = {
    user: req.user._id,
    ...req.body
  };

  const company = await Company.create(companyData);

  res.status(201).json({
    success: true,
    message: 'Company profile created successfully. Pending admin approval.',
    data: { company }
  });
}));

/**
 * @route   GET /api/companies/me
 * @desc    Get current recruiter's company
 * @access  Private/Recruiter
 */
router.get('/me', requireAuth, requireRecruiter, asyncHandler(async (req, res) => {
  const company = await Company.findOne({ user: req.user._id })
    .populate('user', 'firstName lastName email');

  if (!company) {
    return res.status(404).json({
      success: false,
      message: 'Company profile not found. Please create your company profile.'
    });
  }

  res.json({
    success: true,
    data: { company }
  });
}));

/**
 * @route   GET /api/companies
 * @desc    Get all companies
 * @access  Private
 */
router.get('/', requireAuth, paginationRules, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build filter
  const filter = {};
  
  // Non-admins only see approved companies
  if (req.user.role !== 'ADMIN') {
    filter.isApproved = true;
    filter.isActive = true;
  }

  if (req.query.industry) {
    filter.industry = req.query.industry;
  }

  if (req.query.companyType) {
    filter.companyType = req.query.companyType;
  }

  if (req.query.verificationStatus && req.user.role === 'ADMIN') {
    filter.verificationStatus = req.query.verificationStatus;
  }

  if (req.query.search) {
    filter.$text = { $search: req.query.search };
  }

  const [companies, total] = await Promise.all([
    Company.find(filter)
      .select(req.user.role === 'ADMIN' ? '' : '-documents -recruiterInfo.phone')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Company.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: {
      companies,
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
 * @route   GET /api/companies/:id
 * @desc    Get company by ID
 * @access  Private
 */
router.get('/:id', requireAuth, validateMongoId('id'), asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);

  if (!company) {
    return res.status(404).json({
      success: false,
      message: 'Company not found'
    });
  }

  // Non-admins can only view approved companies
  if (req.user.role !== 'ADMIN' && !company.isApproved) {
    return res.status(403).json({
      success: false,
      message: 'Company pending approval'
    });
  }

  res.json({
    success: true,
    data: { company }
  });
}));

/**
 * @route   PUT /api/companies/:id
 * @desc    Update company profile
 * @access  Private/Recruiter (own) or Admin
 */
router.put('/:id', requireAuth, validateMongoId('id'), asyncHandler(async (req, res) => {
  let company = await Company.findById(req.params.id);

  if (!company) {
    return res.status(404).json({
      success: false,
      message: 'Company not found'
    });
  }

  // Check ownership (unless admin)
  if (req.user.role !== 'ADMIN' && company.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  const updateData = { ...req.body };

  // Prevent non-admins from updating certain fields
  if (req.user.role !== 'ADMIN') {
    delete updateData.isApproved;
    delete updateData.verificationStatus;
    delete updateData.approvedBy;
  }

  company = await Company.findByIdAndUpdate(
    req.params.id,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Company profile updated successfully',
    data: { company }
  });
}));

/**
 * @route   POST /api/companies/:id/logo
 * @desc    Upload company logo
 * @access  Private/Recruiter
 */
router.post('/:id/logo', requireAuth, requireRecruiter, uploadLogo.single('logo'), asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);

  if (!company) {
    return res.status(404).json({
      success: false,
      message: 'Company not found'
    });
  }

  if (company.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }

  company.companyLogo = req.file.path;
  await company.save();

  res.json({
    success: true,
    message: 'Logo uploaded successfully',
    data: { logoUrl: company.companyLogo }
  });
}));

/**
 * @route   PATCH /api/companies/:id/approve
 * @desc    Approve company (Admin only)
 * @access  Private/Admin
 */
router.patch('/:id/approve', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const company = await Company.findByIdAndUpdate(
    req.params.id,
    {
      isApproved: true,
      verificationStatus: 'Verified',
      approvedBy: req.user._id,
      approvedAt: new Date()
    },
    { new: true }
  );

  if (!company) {
    return res.status(404).json({
      success: false,
      message: 'Company not found'
    });
  }

  // Also approve the user
  await User.findByIdAndUpdate(company.user, { isApproved: true });

  res.json({
    success: true,
    message: 'Company approved successfully',
    data: { company }
  });
}));

/**
 * @route   PATCH /api/companies/:id/reject
 * @desc    Reject company (Admin only)
 * @access  Private/Admin
 */
router.patch('/:id/reject', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
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
 * @route   GET /api/companies/:id/stats
 * @desc    Get company placement statistics
 * @access  Private
 */
router.get('/:id/stats', requireAuth, validateMongoId('id'), asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);

  if (!company) {
    return res.status(404).json({
      success: false,
      message: 'Company not found'
    });
  }

  // Update and return stats
  await company.updatePlacementStats();

  res.json({
    success: true,
    data: { stats: company.placementStats }
  });
}));

/**
 * @route   DELETE /api/companies/:id
 * @desc    Delete company (Admin only)
 * @access  Private/Admin
 */
router.delete('/:id', requireAuth, requireAdmin, validateMongoId('id'), asyncHandler(async (req, res) => {
  const company = await Company.findByIdAndDelete(req.params.id);

  if (!company) {
    return res.status(404).json({
      success: false,
      message: 'Company not found'
    });
  }

  res.json({
    success: true,
    message: 'Company deleted successfully'
  });
}));

module.exports = router;
