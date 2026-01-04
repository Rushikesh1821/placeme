/**
 * Analytics Routes
 * 
 * @description Placement statistics and analytics
 */

const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { requireAuth, requireAdmin, requireRole } = require('../middleware/auth');
const PlacementStats = require('../models/PlacementStats');
const StudentProfile = require('../models/StudentProfile');
const Company = require('../models/Company');
const JobPosting = require('../models/JobPosting');
const Application = require('../models/Application');
const mongoose = require('mongoose');

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Get dashboard statistics
 * @access  Private
 */
router.get('/dashboard', requireAuth, asyncHandler(async (req, res) => {
  const role = req.user.role;
  let stats = {};

  if (role === 'ADMIN') {
    // Admin dashboard stats
    const [
      totalStudents,
      verifiedStudents,
      placedStudents,
      totalCompanies,
      approvedCompanies,
      totalJobs,
      activeJobs,
      totalApplications
    ] = await Promise.all([
      StudentProfile.countDocuments(),
      StudentProfile.countDocuments({ isVerified: true }),
      StudentProfile.countDocuments({ placementStatus: 'Placed' }),
      Company.countDocuments(),
      Company.countDocuments({ isApproved: true }),
      JobPosting.countDocuments(),
      JobPosting.countDocuments({ status: 'Active' }),
      Application.countDocuments()
    ]);

    // Package stats
    const packageStats = await Application.aggregate([
      { $match: { status: 'Selected' } },
      {
        $lookup: {
          from: 'jobpostings',
          localField: 'job',
          foreignField: '_id',
          as: 'job'
        }
      },
      { $unwind: '$job' },
      {
        $group: {
          _id: null,
          avgPackage: { $avg: '$job.package.ctc' },
          maxPackage: { $max: '$job.package.ctc' },
          minPackage: { $min: '$job.package.ctc' }
        }
      }
    ]);

    stats = {
      students: {
        total: totalStudents,
        verified: verifiedStudents,
        placed: placedStudents,
        placementRate: totalStudents > 0 ? ((placedStudents / verifiedStudents) * 100).toFixed(1) : 0
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
      packages: packageStats[0] || { avgPackage: 0, maxPackage: 0, minPackage: 0 }
    };

  } else if (role === 'RECRUITER') {
    // Recruiter dashboard stats
    const company = await Company.findOne({ user: req.user._id });
    
    if (company) {
      const [totalJobs, activeJobs, totalApplications] = await Promise.all([
        JobPosting.countDocuments({ company: company._id }),
        JobPosting.countDocuments({ company: company._id, status: 'Active' }),
        Application.countDocuments({ company: company._id })
      ]);

      const applicationStats = await Application.aggregate([
        { $match: { company: company._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const statusMap = {};
      applicationStats.forEach(s => {
        statusMap[s._id] = s.count;
      });

      stats = {
        jobs: {
          total: totalJobs,
          active: activeJobs
        },
        applications: {
          total: totalApplications,
          byStatus: statusMap
        },
        company: {
          isApproved: company.isApproved,
          studentsHired: company.placementStats?.totalStudentsHired || 0
        }
      };
    }

  } else if (role === 'STUDENT') {
    // Student dashboard stats
    const profile = await StudentProfile.findOne({ user: req.user._id });
    
    if (profile) {
      const [eligibleJobs, applications] = await Promise.all([
        JobPosting.countDocuments({
          status: 'Active',
          'eligibility.branches': profile.academicInfo.branch,
          'eligibility.graduationYear': profile.academicInfo.graduationYear,
          'eligibility.minCgpa': { $lte: profile.academicInfo.cgpa }
        }),
        Application.find({ student: profile._id }).select('status')
      ]);

      const applicationStats = {};
      applications.forEach(app => {
        applicationStats[app.status] = (applicationStats[app.status] || 0) + 1;
      });

      stats = {
        profile: {
          completion: profile.profileCompletion,
          isVerified: profile.isVerified,
          placementStatus: profile.placementStatus
        },
        jobs: {
          eligible: eligibleJobs
        },
        applications: {
          total: applications.length,
          byStatus: applicationStats
        }
      };
    }
  }

  res.json({
    success: true,
    data: { stats }
  });
}));

/**
 * @route   GET /api/analytics/placement-stats
 * @desc    Get detailed placement statistics
 * @access  Private/Admin
 */
router.get('/placement-stats', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const { academicYear, batch } = req.query;

  // Department-wise placement
  const departmentStats = await StudentProfile.aggregate([
    {
      $match: {
        isVerified: true,
        ...(batch && { 'academicInfo.batch': batch })
      }
    },
    {
      $group: {
        _id: '$academicInfo.department',
        total: { $sum: 1 },
        placed: {
          $sum: { $cond: [{ $eq: ['$placementStatus', 'Placed'] }, 1, 0] }
        }
      }
    },
    {
      $project: {
        department: '$_id',
        total: 1,
        placed: 1,
        placementRate: {
          $multiply: [{ $divide: ['$placed', { $max: ['$total', 1] }] }, 100]
        }
      }
    },
    { $sort: { placementRate: -1 } }
  ]);

  // Monthly placements
  const monthlyPlacements = await Application.aggregate([
    {
      $match: {
        status: 'Selected',
        updatedAt: {
          $gte: new Date(new Date().getFullYear(), 0, 1)
        }
      }
    },
    {
      $group: {
        _id: {
          month: { $month: '$updatedAt' },
          year: { $year: '$updatedAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  // Top recruiting companies
  const topRecruiters = await Application.aggregate([
    { $match: { status: 'Selected' } },
    {
      $group: {
        _id: '$company',
        studentsHired: { $sum: 1 }
      }
    },
    { $sort: { studentsHired: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'companies',
        localField: '_id',
        foreignField: '_id',
        as: 'company'
      }
    },
    { $unwind: '$company' },
    {
      $project: {
        companyName: '$company.companyName',
        companyLogo: '$company.companyLogo',
        studentsHired: 1
      }
    }
  ]);

  // Package distribution
  const packageDistribution = await Application.aggregate([
    { $match: { status: 'Selected' } },
    {
      $lookup: {
        from: 'jobpostings',
        localField: 'job',
        foreignField: '_id',
        as: 'job'
      }
    },
    { $unwind: '$job' },
    {
      $bucket: {
        groupBy: '$job.package.ctc',
        boundaries: [0, 5, 10, 15, 20, 50],
        default: '50+',
        output: {
          count: { $sum: 1 }
        }
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      departmentStats,
      monthlyPlacements,
      topRecruiters,
      packageDistribution
    }
  });
}));

/**
 * @route   GET /api/analytics/trends
 * @desc    Get placement trends
 * @access  Private/Admin
 */
router.get('/trends', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  // Application trends (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const applicationTrends = await Application.aggregate([
    {
      $match: {
        appliedAt: { $gte: thirtyDaysAgo }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$appliedAt' }
        },
        applications: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Job posting trends
  const jobTrends = await JobPosting.aggregate([
    {
      $match: {
        createdAt: { $gte: thirtyDaysAgo }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        jobs: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Student registration trends
  const studentTrends = await StudentProfile.aggregate([
    {
      $match: {
        createdAt: { $gte: thirtyDaysAgo }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        registrations: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json({
    success: true,
    data: {
      applicationTrends,
      jobTrends,
      studentTrends
    }
  });
}));

/**
 * @route   GET /api/analytics/skills-demand
 * @desc    Get skills demand analysis
 * @access  Private/Admin
 */
router.get('/skills-demand', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  // Most demanded skills from job postings
  const skillsDemand = await JobPosting.aggregate([
    { $match: { status: 'Active' } },
    { $unwind: '$requiredSkills.mandatory' },
    {
      $group: {
        _id: '$requiredSkills.mandatory.skill',
        demand: { $sum: 1 }
      }
    },
    { $sort: { demand: -1 } },
    { $limit: 20 }
  ]);

  // Skills availability among students
  const skillsAvailability = await StudentProfile.aggregate([
    { $unwind: '$skills.technical' },
    {
      $group: {
        _id: '$skills.technical',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 20 }
  ]);

  // Calculate skill gap
  const demandMap = {};
  skillsDemand.forEach(s => {
    demandMap[s._id.toLowerCase()] = s.demand;
  });

  const availabilityMap = {};
  skillsAvailability.forEach(s => {
    availabilityMap[s._id.toLowerCase()] = s.count;
  });

  const skillGap = Object.keys(demandMap).map(skill => ({
    skill,
    demand: demandMap[skill],
    availability: availabilityMap[skill] || 0,
    gap: demandMap[skill] - (availabilityMap[skill] || 0)
  })).sort((a, b) => b.gap - a.gap);

  res.json({
    success: true,
    data: {
      skillsDemand,
      skillsAvailability,
      skillGap: skillGap.slice(0, 15)
    }
  });
}));

/**
 * @route   GET /api/analytics/company-stats
 * @desc    Get company-wise statistics
 * @access  Private/Admin
 */
router.get('/company-stats', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const companyStats = await Company.aggregate([
    { $match: { isApproved: true } },
    {
      $lookup: {
        from: 'jobpostings',
        localField: '_id',
        foreignField: 'company',
        as: 'jobs'
      }
    },
    {
      $lookup: {
        from: 'applications',
        localField: '_id',
        foreignField: 'company',
        as: 'applications'
      }
    },
    {
      $project: {
        companyName: 1,
        industry: 1,
        companyType: 1,
        totalJobs: { $size: '$jobs' },
        totalApplications: { $size: '$applications' },
        selectedCount: {
          $size: {
            $filter: {
              input: '$applications',
              cond: { $eq: ['$$this.status', 'Selected'] }
            }
          }
        }
      }
    },
    { $sort: { selectedCount: -1 } },
    { $limit: 20 }
  ]);

  // Industry distribution
  const industryDistribution = await Company.aggregate([
    { $match: { isApproved: true } },
    {
      $group: {
        _id: '$industry',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);

  res.json({
    success: true,
    data: {
      companyStats,
      industryDistribution
    }
  });
}));

/**
 * @route   POST /api/analytics/generate-report
 * @desc    Generate placement report
 * @access  Private/Admin
 */
router.post('/generate-report', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const { academicYear, batch, startDate, endDate } = req.body;

  // Build date filter
  const dateFilter = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);

  // Generate comprehensive report
  const report = {
    generatedAt: new Date(),
    parameters: { academicYear, batch, startDate, endDate },
    summary: {},
    details: {}
  };

  // Overall summary
  const profileFilter = batch ? { 'academicInfo.batch': batch } : {};
  
  const [totalStudents, placedStudents] = await Promise.all([
    StudentProfile.countDocuments({ isVerified: true, ...profileFilter }),
    StudentProfile.countDocuments({ placementStatus: 'Placed', ...profileFilter })
  ]);

  report.summary = {
    totalEligibleStudents: totalStudents,
    totalPlacedStudents: placedStudents,
    placementPercentage: ((placedStudents / totalStudents) * 100).toFixed(2)
  };

  // Department-wise breakdown
  report.details.departmentWise = await StudentProfile.aggregate([
    { $match: { isVerified: true, ...profileFilter } },
    {
      $group: {
        _id: '$academicInfo.department',
        total: { $sum: 1 },
        placed: {
          $sum: { $cond: [{ $eq: ['$placementStatus', 'Placed'] }, 1, 0] }
        }
      }
    }
  ]);

  // Package analysis
  const packageAnalysis = await Application.aggregate([
    {
      $match: {
        status: 'Selected',
        ...(Object.keys(dateFilter).length > 0 && { updatedAt: dateFilter })
      }
    },
    {
      $lookup: {
        from: 'jobpostings',
        localField: 'job',
        foreignField: '_id',
        as: 'job'
      }
    },
    { $unwind: '$job' },
    {
      $group: {
        _id: null,
        avgPackage: { $avg: '$job.package.ctc' },
        maxPackage: { $max: '$job.package.ctc' },
        minPackage: { $min: '$job.package.ctc' },
        totalOffers: { $sum: 1 }
      }
    }
  ]);

  report.details.packageAnalysis = packageAnalysis[0] || {
    avgPackage: 0,
    maxPackage: 0,
    minPackage: 0,
    totalOffers: 0
  };

  res.json({
    success: true,
    data: { report }
  });
}));

module.exports = router;
