/**
 * Student Routes
 * 
 * @description CRUD operations for student profiles
 */

const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { requireAuth, requireStudent, requireAdmin, requireRole } = require('../middleware/auth');
const { studentProfileRules, validateMongoId, paginationRules } = require('../middleware/validation');
const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');

/**
 * @route   POST /api/students
 * @desc    Create student profile
 * @access  Private/Student
 */
router.post('/', requireAuth, requireStudent, studentProfileRules.create, asyncHandler(async (req, res) => {
  // Check if profile already exists
  const existingProfile = await StudentProfile.findOne({ user: req.user._id });
  
  if (existingProfile) {
    return res.status(400).json({
      success: false,
      message: 'Profile already exists. Use PUT to update.'
    });
  }

  const profileData = {
    user: req.user._id,
    ...req.body
  };

  const profile = await StudentProfile.create(profileData);

  res.status(201).json({
    success: true,
    message: 'Profile created successfully',
    data: { profile }
  });
}));

/**
 * @route   GET /api/students/me
 * @desc    Get current student's profile
 * @access  Private/Student
 */
router.get('/me', requireAuth, requireStudent, asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findOne({ user: req.user._id })
    .populate('user', 'firstName lastName email profileImage')
    .populate('resume');

  if (!profile) {
    return res.status(404).json({
      success: false,
      message: 'Profile not found. Please create your profile.'
    });
  }

  res.json({
    success: true,
    data: { profile }
  });
}));

/**
 * @route   GET /api/students
 * @desc    Get all students (Admin/Recruiter)
 * @access  Private/Admin/Recruiter
 */
router.get('/', requireAuth, requireRole('ADMIN', 'RECRUITER'), paginationRules, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build filter query
  const filter = {};
  
  if (req.query.department) {
    filter['academicInfo.department'] = req.query.department;
  }
  
  if (req.query.branch) {
    filter['academicInfo.branch'] = req.query.branch;
  }
  
  if (req.query.graduationYear) {
    filter['academicInfo.graduationYear'] = parseInt(req.query.graduationYear);
  }
  
  if (req.query.minCgpa) {
    filter['academicInfo.cgpa'] = { $gte: parseFloat(req.query.minCgpa) };
  }
  
  if (req.query.placementStatus) {
    filter.placementStatus = req.query.placementStatus;
  }

  if (req.query.isVerified !== undefined) {
    filter.isVerified = req.query.isVerified === 'true';
  }

  // Search by skills
  if (req.query.skills) {
    const skills = req.query.skills.split(',').map(s => s.trim());
    filter['skills.technical'] = { $in: skills };
  }

  const [students, total] = await Promise.all([
    StudentProfile.find(filter)
      .populate('user', 'firstName lastName email profileImage isApproved')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    StudentProfile.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: {
      students,
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
 * @route   GET /api/students/:id
 * @desc    Get student by ID
 * @access  Private
 */
router.get('/:id', requireAuth, validateMongoId('id'), asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findById(req.params.id)
    .populate('user', 'firstName lastName email profileImage')
    .populate('resume');

  if (!profile) {
    return res.status(404).json({
      success: false,
      message: 'Student not found'
    });
  }

  // Students can only view their own full profile
  if (req.user.role === 'STUDENT' && profile.user._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  res.json({
    success: true,
    data: { profile }
  });
}));

/**
 * @route   PUT /api/students/:id
 * @desc    Update student profile
 * @access  Private/Student (own) or Admin
 */
router.put('/:id', requireAuth, validateMongoId('id'), studentProfileRules.update, asyncHandler(async (req, res) => {
  let profile = await StudentProfile.findById(req.params.id);

  if (!profile) {
    return res.status(404).json({
      success: false,
      message: 'Profile not found'
    });
  }

  // Check ownership (unless admin)
  if (req.user.role !== 'ADMIN' && profile.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  // Update profile
  const updateData = { ...req.body };
  
  // Prevent non-admins from updating certain fields
  if (req.user.role !== 'ADMIN') {
    delete updateData.isVerified;
    delete updateData.verifiedBy;
    delete updateData.placementStatus;
    delete updateData.eligibilityOverride;
  }

  profile = await StudentProfile.findByIdAndUpdate(
    req.params.id,
    { $set: updateData },
    { new: true, runValidators: true }
  ).populate('user', 'firstName lastName email profileImage');

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { profile }
  });
}));

/**
 * @route   PATCH /api/students/:id/skills
 * @desc    Update student skills
 * @access  Private/Student
 */
router.patch('/:id/skills', requireAuth, requireStudent, asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findById(req.params.id);

  if (!profile) {
    return res.status(404).json({
      success: false,
      message: 'Profile not found'
    });
  }

  if (profile.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  const { technical, soft, languages, tools } = req.body;

  if (technical) profile.skills.technical = technical;
  if (soft) profile.skills.soft = soft;
  if (languages) profile.skills.languages = languages;
  if (tools) profile.skills.tools = tools;

  await profile.save();

  res.json({
    success: true,
    message: 'Skills updated successfully',
    data: { skills: profile.skills }
  });
}));

/**
 * @route   POST /api/students/:id/experience
 * @desc    Add experience to student profile
 * @access  Private/Student
 */
router.post('/:id/experience', requireAuth, requireStudent, asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findById(req.params.id);

  if (!profile) {
    return res.status(404).json({
      success: false,
      message: 'Profile not found'
    });
  }

  if (profile.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  profile.experience.push(req.body);
  await profile.save();

  res.json({
    success: true,
    message: 'Experience added successfully',
    data: { experience: profile.experience }
  });
}));

/**
 * @route   POST /api/students/:id/projects
 * @desc    Add project to student profile
 * @access  Private/Student
 */
router.post('/:id/projects', requireAuth, requireStudent, asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findById(req.params.id);

  if (!profile) {
    return res.status(404).json({
      success: false,
      message: 'Profile not found'
    });
  }

  if (profile.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  profile.projects.push(req.body);
  await profile.save();

  res.json({
    success: true,
    message: 'Project added successfully',
    data: { projects: profile.projects }
  });
}));

/**
 * @route   PATCH /api/students/:id/verify
 * @desc    Verify student profile (Admin only)
 * @access  Private/Admin
 */
router.patch('/:id/verify', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findByIdAndUpdate(
    req.params.id,
    {
      isVerified: true,
      verifiedBy: req.user._id,
      verifiedAt: new Date()
    },
    { new: true }
  );

  if (!profile) {
    return res.status(404).json({
      success: false,
      message: 'Profile not found'
    });
  }

  // Also approve the user
  await User.findByIdAndUpdate(profile.user, { isApproved: true });

  res.json({
    success: true,
    message: 'Student verified successfully',
    data: { profile }
  });
}));

/**
 * @route   DELETE /api/students/:id
 * @desc    Delete student profile (Admin only)
 * @access  Private/Admin
 */
router.delete('/:id', requireAuth, requireAdmin, validateMongoId('id'), asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findByIdAndDelete(req.params.id);

  if (!profile) {
    return res.status(404).json({
      success: false,
      message: 'Profile not found'
    });
  }

  res.json({
    success: true,
    message: 'Profile deleted successfully'
  });
}));

module.exports = router;
