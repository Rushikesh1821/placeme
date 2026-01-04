/**
 * User Model
 * 
 * @description Core user model linked to Clerk authentication.
 * Stores basic user info and role for authorization.
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['STUDENT', 'RECRUITER', 'ADMIN'],
    default: 'STUDENT'
  },
  profileImage: {
    type: String
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Indexes for faster queries
userSchema.index({ role: 1, isApproved: 1 });
userSchema.index({ email: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim();
});

// Method to check if user has specific role
userSchema.methods.hasRole = function(role) {
  return this.role === role;
};

// Method to check if user is admin
userSchema.methods.isAdmin = function() {
  return this.role === 'ADMIN';
};

// Static method to find by clerk ID
userSchema.statics.findByClerkId = function(clerkId) {
  return this.findOne({ clerkId });
};

// Ensure virtuals are included in JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
