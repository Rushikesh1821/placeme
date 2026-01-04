/**
 * Resume Routes
 * 
 * @description Resume upload, parsing, and management
 */

const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const axios = require('axios');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { requireAuth, requireStudent, requireRole } = require('../middleware/auth');
const { uploadResume, deleteFile } = require('../config/cloudinary');
const { validateMongoId } = require('../middleware/validation');
const Resume = require('../models/Resume');
const StudentProfile = require('../models/StudentProfile');

/**
 * @route   POST /api/resumes/upload
 * @desc    Upload and parse resume
 * @access  Private/Student
 */
router.post('/upload', requireAuth, requireStudent, uploadResume.single('resume'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }

  // Get student profile
  const profile = await StudentProfile.findOne({ user: req.user._id });
  
  if (!profile) {
    return res.status(400).json({
      success: false,
      message: 'Please create your profile first'
    });
  }

  // Determine file type
  const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
  
  // Create resume record
  const resume = await Resume.create({
    student: profile._id,
    user: req.user._id,
    fileName: req.file.originalname,
    fileType: fileExtension,
    fileSize: req.file.size,
    fileUrl: req.file.path,
    cloudinaryId: req.file.filename,
    parsingStatus: 'Processing'
  });

  // Set as primary if first resume
  const existingResumes = await Resume.countDocuments({ student: profile._id, isActive: true });
  if (existingResumes === 1) {
    resume.isPrimary = true;
  }

  // Update student profile with resume reference
  profile.resume = resume._id;
  await profile.save();

  // Start async parsing
  parseResumeAsync(resume._id, req.file.path);

  res.status(201).json({
    success: true,
    message: 'Resume uploaded successfully. Parsing in progress.',
    data: { resume }
  });
}));

/**
 * Async function to parse resume content
 */
async function parseResumeAsync(resumeId, fileUrl) {
  try {
    const resume = await Resume.findById(resumeId);
    if (!resume) return;

    let rawText = '';

    // Download file and parse
    try {
      const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data);

      if (resume.fileType === 'pdf') {
        const pdfData = await pdfParse(buffer);
        rawText = pdfData.text;
      } else if (['doc', 'docx'].includes(resume.fileType)) {
        const result = await mammoth.extractRawText({ buffer });
        rawText = result.value;
      }
    } catch (downloadError) {
      console.error('Error downloading/parsing file:', downloadError);
    }

    // Store raw text
    resume.parsedContent = { rawText };

    // Try to extract skills using AI service
    try {
      const aiResponse = await axios.post(`${process.env.AI_SERVICE_URL}/parse-resume`, {
        text: rawText,
        resumeId: resumeId.toString()
      }, { timeout: 30000 });

      if (aiResponse.data.success) {
        resume.extractedSkills = aiResponse.data.skills;
        resume.parsedContent.structuredData = aiResponse.data.structuredData;
        resume.aiAnalysis = aiResponse.data.analysis;
      }
    } catch (aiError) {
      console.error('AI parsing error:', aiError.message);
      // Fallback to basic skill extraction
      resume.extractedSkills = extractSkillsBasic(rawText);
    }

    resume.parsingStatus = 'Completed';
    resume.parsedAt = new Date();
    await resume.save();

    // Update student profile skills if extracted
    if (resume.extractedSkills?.technical?.length > 0) {
      const profile = await StudentProfile.findById(resume.student);
      if (profile) {
        // Merge extracted skills with existing
        const existingTechnical = new Set(profile.skills.technical || []);
        resume.extractedSkills.technical.forEach(s => existingTechnical.add(s.skill));
        profile.skills.technical = Array.from(existingTechnical);
        await profile.save();
      }
    }

  } catch (error) {
    console.error('Resume parsing error:', error);
    await Resume.findByIdAndUpdate(resumeId, {
      parsingStatus: 'Failed',
      parsingError: error.message
    });
  }
}

/**
 * Basic skill extraction fallback
 */
function extractSkillsBasic(text) {
  const technicalSkills = [
    'JavaScript', 'Python', 'Java', 'C++', 'C#', 'TypeScript', 'Go', 'Rust',
    'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask', 'Spring',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'Git',
    'HTML', 'CSS', 'SASS', 'Bootstrap', 'Tailwind',
    'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch',
    'REST API', 'GraphQL', 'Microservices', 'CI/CD'
  ];

  const textLower = text.toLowerCase();
  const foundSkills = [];

  technicalSkills.forEach(skill => {
    if (textLower.includes(skill.toLowerCase())) {
      foundSkills.push({
        skill,
        confidence: 0.8,
        category: 'Technical'
      });
    }
  });

  return { technical: foundSkills, soft: [], tools: [], domains: [] };
}

/**
 * @route   GET /api/resumes/my
 * @desc    Get current student's resumes
 * @access  Private/Student
 */
router.get('/my', requireAuth, requireStudent, asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findOne({ user: req.user._id });
  
  if (!profile) {
    return res.status(404).json({
      success: false,
      message: 'Profile not found'
    });
  }

  const resumes = await Resume.find({ student: profile._id, isActive: true })
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: { resumes }
  });
}));

/**
 * @route   GET /api/resumes/:id
 * @desc    Get resume by ID
 * @access  Private
 */
router.get('/:id', requireAuth, validateMongoId('id'), asyncHandler(async (req, res) => {
  const resume = await Resume.findById(req.params.id)
    .populate('student', 'academicInfo')
    .populate('user', 'firstName lastName');

  if (!resume) {
    return res.status(404).json({
      success: false,
      message: 'Resume not found'
    });
  }

  // Check access
  if (req.user.role === 'STUDENT' && resume.user._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  // Increment view count for non-owners
  if (resume.user._id.toString() !== req.user._id.toString()) {
    await resume.incrementViewCount();
  }

  res.json({
    success: true,
    data: { resume }
  });
}));

/**
 * @route   GET /api/resumes/:id/download
 * @desc    Get resume download URL
 * @access  Private
 */
router.get('/:id/download', requireAuth, validateMongoId('id'), asyncHandler(async (req, res) => {
  const resume = await Resume.findById(req.params.id);

  if (!resume) {
    return res.status(404).json({
      success: false,
      message: 'Resume not found'
    });
  }

  // Increment download count
  await resume.incrementDownloadCount();

  res.json({
    success: true,
    data: { 
      downloadUrl: resume.fileUrl,
      fileName: resume.fileName
    }
  });
}));

/**
 * @route   PATCH /api/resumes/:id/primary
 * @desc    Set resume as primary
 * @access  Private/Student
 */
router.patch('/:id/primary', requireAuth, requireStudent, asyncHandler(async (req, res) => {
  const resume = await Resume.findById(req.params.id);

  if (!resume) {
    return res.status(404).json({
      success: false,
      message: 'Resume not found'
    });
  }

  if (resume.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  // Remove primary from other resumes
  await Resume.updateMany(
    { student: resume.student, _id: { $ne: resume._id } },
    { isPrimary: false }
  );

  // Set this as primary
  resume.isPrimary = true;
  await resume.save();

  // Update student profile
  await StudentProfile.findByIdAndUpdate(resume.student, { resume: resume._id });

  res.json({
    success: true,
    message: 'Resume set as primary',
    data: { resume }
  });
}));

/**
 * @route   POST /api/resumes/:id/reparse
 * @desc    Re-parse resume
 * @access  Private/Student
 */
router.post('/:id/reparse', requireAuth, requireStudent, asyncHandler(async (req, res) => {
  const resume = await Resume.findById(req.params.id);

  if (!resume) {
    return res.status(404).json({
      success: false,
      message: 'Resume not found'
    });
  }

  if (resume.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  resume.parsingStatus = 'Processing';
  await resume.save();

  // Start async parsing
  parseResumeAsync(resume._id, resume.fileUrl);

  res.json({
    success: true,
    message: 'Re-parsing started'
  });
}));

/**
 * @route   DELETE /api/resumes/:id
 * @desc    Delete resume
 * @access  Private/Student
 */
router.delete('/:id', requireAuth, requireStudent, validateMongoId('id'), asyncHandler(async (req, res) => {
  const resume = await Resume.findById(req.params.id);

  if (!resume) {
    return res.status(404).json({
      success: false,
      message: 'Resume not found'
    });
  }

  if (resume.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  // Soft delete
  resume.isActive = false;
  await resume.save();

  // If this was primary, set another as primary
  if (resume.isPrimary) {
    const nextResume = await Resume.findOne({ student: resume.student, isActive: true });
    if (nextResume) {
      nextResume.isPrimary = true;
      await nextResume.save();
      await StudentProfile.findByIdAndUpdate(resume.student, { resume: nextResume._id });
    } else {
      await StudentProfile.findByIdAndUpdate(resume.student, { $unset: { resume: 1 } });
    }
  }

  res.json({
    success: true,
    message: 'Resume deleted successfully'
  });
}));

module.exports = router;
