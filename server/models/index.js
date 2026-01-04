/**
 * Models Index
 * 
 * @description Central export for all Mongoose models
 */

const User = require('./User');
const StudentProfile = require('./StudentProfile');
const Company = require('./Company');
const JobPosting = require('./JobPosting');
const Application = require('./Application');
const Resume = require('./Resume');
const AIScore = require('./AIScore');
const PlacementStats = require('./PlacementStats');

module.exports = {
  User,
  StudentProfile,
  Company,
  JobPosting,
  Application,
  Resume,
  AIScore,
  PlacementStats
};
