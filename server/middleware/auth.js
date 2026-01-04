/**
 * Clerk Authentication Middleware
 * 
 * @description Validates Clerk JWT tokens and attaches user info to request.
 * Provides role-based access control for protected routes.
 */

const { clerkClient } = require('@clerk/clerk-sdk-node');
const User = require('../models/User');

/**
 * Verify Clerk JWT and attach user to request
 */
const requireAuth = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify the token using Clerk
    let clerkUser;
    try {
      // Verify JWT - this will throw if invalid
      const sessionClaims = await clerkClient.verifyToken(token);
      clerkUser = await clerkClient.users.getUser(sessionClaims.sub);
    } catch (error) {
      console.error('Token verification failed:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Find or create user in our database
    let user = await User.findOne({ clerkId: clerkUser.id });

    if (!user) {
      // Auto-create user if not exists (from Clerk webhook or first access)
      const primaryEmail = clerkUser.emailAddresses.find(
        email => email.id === clerkUser.primaryEmailAddressId
      );

      user = await User.create({
        clerkId: clerkUser.id,
        email: primaryEmail?.emailAddress || '',
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        profileImage: clerkUser.imageUrl,
        role: clerkUser.publicMetadata?.role || 'STUDENT',
        isApproved: false
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Attach user to request
    req.user = user;
    req.clerkUser = clerkUser;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];

    try {
      const sessionClaims = await clerkClient.verifyToken(token);
      const clerkUser = await clerkClient.users.getUser(sessionClaims.sub);
      
      const user = await User.findOne({ clerkId: clerkUser.id });
      
      if (user) {
        req.user = user;
        req.clerkUser = clerkUser;
      }
    } catch (error) {
      // Token invalid but continue without user
      console.log('Optional auth - invalid token');
    }

    next();
  } catch (error) {
    next();
  }
};

/**
 * Require specific role(s)
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${roles.join(', ')}`
      });
    }

    next();
  };
};

/**
 * Require admin role
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  next();
};

/**
 * Require student role
 */
const requireStudent = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'STUDENT') {
    return res.status(403).json({
      success: false,
      message: 'Student access required'
    });
  }

  next();
};

/**
 * Require recruiter role
 */
const requireRecruiter = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'RECRUITER') {
    return res.status(403).json({
      success: false,
      message: 'Recruiter access required'
    });
  }

  next();
};

/**
 * Require approved user
 */
const requireApproved = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (!req.user.isApproved && req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Your account is pending approval'
    });
  }

  next();
};

/**
 * Check if user owns the resource or is admin
 */
const requireOwnerOrAdmin = (resourceUserIdField = 'user') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Admin has access to everything
    if (req.user.role === 'ADMIN') {
      return next();
    }

    // Check if the resource belongs to the user
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    if (resourceUserId && resourceUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources.'
      });
    }

    next();
  };
};

module.exports = {
  requireAuth,
  optionalAuth,
  requireRole,
  requireAdmin,
  requireStudent,
  requireRecruiter,
  requireApproved,
  requireOwnerOrAdmin
};
