/**
 * Authentication Routes
 * 
 * @description Routes for user authentication and session management
 */

const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { requireAuth } = require('../middleware/auth');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Company = require('../models/Company');

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  let profile = null;
  
  if (user.role === 'STUDENT') {
    profile = await StudentProfile.findOne({ user: user._id });
  } else if (user.role === 'RECRUITER') {
    profile = await Company.findOne({ user: user._id });
  }

  res.json({
    success: true,
    data: {
      user,
      profile,
      hasProfile: !!profile
    }
  });
}));

/**
 * @route   POST /api/auth/register
 * @desc    Complete registration after Clerk signup
 * @access  Private
 */
router.post('/register', requireAuth, asyncHandler(async (req, res) => {
  const { role } = req.body;
  
  // Validate role
  if (!['STUDENT', 'RECRUITER'].includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid role. Must be STUDENT or RECRUITER'
    });
  }

  // Update user role
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { role },
    { new: true }
  );

  res.json({
    success: true,
    message: 'Registration completed',
    data: { user }
  });
}));

/**
 * @route   PUT /api/auth/update-role
 * @desc    Update user role (Admin only)
 * @access  Private/Admin
 */
router.put('/update-role/:userId', requireAuth, asyncHandler(async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

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
    message: 'Role updated successfully',
    data: { user }
  });
}));

/**
 * @route   GET /api/auth/check-profile
 * @desc    Check if user has completed profile
 * @access  Private
 */
router.get('/check-profile', requireAuth, asyncHandler(async (req, res) => {
  let hasProfile = false;
  let profileComplete = false;

  if (req.user.role === 'STUDENT') {
    const profile = await StudentProfile.findOne({ user: req.user._id });
    hasProfile = !!profile;
    profileComplete = profile ? profile.profileCompletion >= 70 : false;
  } else if (req.user.role === 'RECRUITER') {
    const company = await Company.findOne({ user: req.user._id });
    hasProfile = !!company;
    profileComplete = company ? company.isApproved : false;
  } else if (req.user.role === 'ADMIN') {
    hasProfile = true;
    profileComplete = true;
  }

  res.json({
    success: true,
    data: {
      hasProfile,
      profileComplete,
      role: req.user.role,
      isApproved: req.user.isApproved
    }
  });
}));

/**
 * @route   DELETE /api/auth/account
 * @desc    Delete user account
 * @access  Private
 */
router.delete('/account', requireAuth, asyncHandler(async (req, res) => {
  // Don't allow admin deletion through this route
  if (req.user.role === 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Admin accounts cannot be deleted through this route'
    });
  }

  // Soft delete - mark as inactive
  await User.findByIdAndUpdate(req.user._id, { isActive: false });

  res.json({
    success: true,
    message: 'Account deactivated successfully'
  });
}));

module.exports = router;
