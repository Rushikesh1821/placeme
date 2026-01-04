/**
 * Express Validator Middleware
 * 
 * @description Validation middleware using express-validator
 * with custom validation rules.
 */

const { body, param, query, validationResult } = require('express-validator');

/**
 * Process validation results
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  
  next();
};

/**
 * Student Profile Validation Rules
 */
const studentProfileRules = {
  create: [
    body('academicInfo.rollNumber')
      .notEmpty()
      .withMessage('Roll number is required')
      .trim(),
    body('academicInfo.department')
      .notEmpty()
      .withMessage('Department is required')
      .isIn([
        'Computer Science', 'Information Technology', 'Electronics',
        'Electrical', 'Mechanical', 'Civil', 'Chemical', 'Biotechnology', 'Other'
      ])
      .withMessage('Invalid department'),
    body('academicInfo.branch')
      .notEmpty()
      .withMessage('Branch is required')
      .trim(),
    body('academicInfo.batch')
      .notEmpty()
      .withMessage('Batch is required')
      .matches(/^\d{4}-\d{4}$/)
      .withMessage('Batch must be in format YYYY-YYYY'),
    body('academicInfo.graduationYear')
      .notEmpty()
      .withMessage('Graduation year is required')
      .isInt({ min: 2020, max: 2035 })
      .withMessage('Invalid graduation year'),
    body('academicInfo.cgpa')
      .notEmpty()
      .withMessage('CGPA is required')
      .isFloat({ min: 0, max: 10 })
      .withMessage('CGPA must be between 0 and 10'),
    validate
  ],
  update: [
    body('academicInfo.cgpa')
      .optional()
      .isFloat({ min: 0, max: 10 })
      .withMessage('CGPA must be between 0 and 10'),
    body('personalInfo.phone')
      .optional()
      .matches(/^[6-9]\d{9}$/)
      .withMessage('Invalid Indian phone number'),
    body('skills.technical')
      .optional()
      .isArray()
      .withMessage('Technical skills must be an array'),
    validate
  ]
};

/**
 * Company Validation Rules
 */
const companyRules = {
  create: [
    body('companyName')
      .notEmpty()
      .withMessage('Company name is required')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Company name must be 2-100 characters'),
    body('industry')
      .notEmpty()
      .withMessage('Industry is required')
      .isIn([
        'Information Technology', 'Finance & Banking', 'Consulting',
        'Manufacturing', 'Healthcare', 'E-commerce', 'Education',
        'Telecommunications', 'Automotive', 'Energy', 'FMCG',
        'Media & Entertainment', 'Real Estate', 'Other'
      ])
      .withMessage('Invalid industry'),
    body('companyType')
      .notEmpty()
      .withMessage('Company type is required')
      .isIn(['MNC', 'Startup', 'SME', 'Government', 'PSU', 'Other'])
      .withMessage('Invalid company type'),
    body('contact.email')
      .notEmpty()
      .withMessage('Contact email is required')
      .isEmail()
      .withMessage('Invalid email format'),
    body('recruiterInfo.name')
      .notEmpty()
      .withMessage('Recruiter name is required'),
    body('recruiterInfo.email')
      .notEmpty()
      .withMessage('Recruiter email is required')
      .isEmail()
      .withMessage('Invalid email format'),
    validate
  ]
};

/**
 * Job Posting Validation Rules
 */
const jobRules = {
  create: [
    body('title')
      .notEmpty()
      .withMessage('Job title is required')
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('Title must be 5-200 characters'),
    body('description')
      .notEmpty()
      .withMessage('Job description is required')
      .isLength({ min: 50, max: 5000 })
      .withMessage('Description must be 50-5000 characters'),
    body('jobType')
      .notEmpty()
      .withMessage('Job type is required')
      .isIn(['Full-time', 'Internship', 'Part-time', 'Contract'])
      .withMessage('Invalid job type'),
    body('department')
      .notEmpty()
      .withMessage('Department is required'),
    body('eligibility.branches')
      .notEmpty()
      .withMessage('Eligible branches are required')
      .isArray({ min: 1 })
      .withMessage('At least one branch must be specified'),
    body('eligibility.minCgpa')
      .notEmpty()
      .withMessage('Minimum CGPA is required')
      .isFloat({ min: 0, max: 10 })
      .withMessage('CGPA must be between 0 and 10'),
    body('eligibility.graduationYear')
      .notEmpty()
      .withMessage('Graduation year is required')
      .isInt({ min: 2020, max: 2035 })
      .withMessage('Invalid graduation year'),
    body('package.ctc')
      .notEmpty()
      .withMessage('CTC is required')
      .isFloat({ min: 0 })
      .withMessage('CTC must be a positive number'),
    body('dates.applicationDeadline')
      .notEmpty()
      .withMessage('Application deadline is required')
      .isISO8601()
      .withMessage('Invalid date format'),
    validate
  ]
};

/**
 * Application Validation Rules
 */
const applicationRules = {
  create: [
    body('jobId')
      .notEmpty()
      .withMessage('Job ID is required')
      .isMongoId()
      .withMessage('Invalid job ID'),
    body('coverLetter')
      .optional()
      .isLength({ max: 3000 })
      .withMessage('Cover letter must be less than 3000 characters'),
    validate
  ],
  updateStatus: [
    body('status')
      .notEmpty()
      .withMessage('Status is required')
      .isIn([
        'Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled',
        'In Progress', 'Selected', 'Waitlisted', 'Rejected', 'Withdrawn',
        'Offer Accepted', 'Offer Declined'
      ])
      .withMessage('Invalid status'),
    body('remarks')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Remarks must be less than 500 characters'),
    validate
  ]
};

/**
 * MongoDB ObjectId Validation
 */
const validateMongoId = (paramName = 'id') => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName}`),
  validate
];

/**
 * Pagination Validation
 */
const paginationRules = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  validate
];

module.exports = {
  validate,
  studentProfileRules,
  companyRules,
  jobRules,
  applicationRules,
  validateMongoId,
  paginationRules
};
