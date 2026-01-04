import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import {
  FileText,
  Upload,
  Trash2,
  Download,
  Eye,
  CheckCircle,
  AlertCircle,
  Star,
  Sparkles,
  RefreshCw,
  Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { resumeAPI, aiAPI } from '../../services/api';

export default function StudentResume() {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [activeResume, setActiveResume] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [previewResume, setPreviewResume] = useState(null);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    console.log('Resume component: fetchResumes called');
    try {
      // Enhanced mock data with sample resumes
      const mockResumes = [
        {
          id: 1,
          filename: 'Demo_Student_Resume_2024.pdf',
          url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&q=80&w=400',
          size: '245 KB',
          isActive: true,
          uploadedAt: '2024-01-10',
          aiScore: 85,
          parsedData: {
            skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git', 'MongoDB', 'AWS'],
            experience: [
              { 
                title: 'Software Engineering Intern', 
                company: 'Tech Solutions Inc.', 
                duration: 'Jan 2024 - Present',
                description: 'Developed web applications using React and Node.js'
              },
              { 
                title: 'Junior Developer', 
                company: 'StartupHub', 
                duration: 'Jun 2023 - Dec 2023',
                description: 'Built RESTful APIs and database schemas'
              },
            ],
            education: { 
              degree: 'B.Tech Computer Science', 
              institution: 'Engineering College',
              cgpa: '8.5', 
              year: '2020 - 2024'
            },
            projects: [
              {
                title: 'E-commerce Platform',
                tech: 'React, Node.js, MongoDB',
                description: 'Full-stack e-commerce solution with payment integration'
              },
              {
                title: 'AI Resume Analyzer',
                tech: 'Python, Flask, NLP',
                description: 'Machine learning model for resume parsing and analysis'
              }
            ]
          },
        },
        {
          id: 2,
          filename: 'Demo_Student_Resume_Old.pdf',
          url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&q=80&w=400',
          size: '198 KB',
          isActive: false,
          uploadedAt: '2023-12-01',
          aiScore: 72,
          parsedData: {
            skills: ['Java', 'C++', 'HTML', 'CSS', 'MySQL'],
            experience: [
              { 
                title: 'Web Development Intern', 
                company: 'Local Tech', 
                duration: '3 months'
              },
            ],
            education: { 
              degree: 'B.Tech Computer Science', 
              cgpa: '7.8' 
            },
          },
        },
        {
          id: 3,
          filename: 'Demo_Student_Resume_Fresh.pdf',
          url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&q=80&w=400',
          size: '156 KB',
          isActive: false,
          uploadedAt: '2023-10-15',
          aiScore: 68,
          parsedData: {
            skills: ['Python', 'JavaScript', 'React', 'Git'],
            experience: [],
            education: { 
              degree: 'B.Tech Computer Science', 
              cgpa: '8.2',
              year: '2020 - 2024'
            },
            projects: [
              {
                title: 'Portfolio Website',
                tech: 'React, CSS',
                description: 'Personal portfolio showcasing projects and skills'
              }
            ]
          },
        },
      ];

      setResumes(mockResumes);
      setActiveResume(mockResumes.find((r) => r.isActive) || null);
      console.log('Resume component: Data loaded', mockResumes);
    } catch (error) {
      console.error('Resume component: Error loading data', error);
      toast.error('Failed to load resumes');
    } finally {
      console.log('Resume component: Setting loading to false');
      setLoading(false);
      // Force a re-render
      setTimeout(() => {
        setLoading(false);
      }, 100);
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF or Word document');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      // Mock upload - simulate file upload
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Add new resume to the list
      const newResume = {
        id: Date.now(),
        filename: file.name,
        url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&q=80&w=400',
        size: `${(file.size / 1024).toFixed(0)} KB`,
        isActive: false,
        uploadedAt: new Date().toISOString().split('T')[0],
        aiScore: 0,
        parsedData: null,
      };

      setResumes(prev => [...prev, newResume]);
      toast.success('Resume uploaded successfully! Click "Analyze Resume" to get AI insights.');
    } catch (error) {
      toast.error(error.message || 'Failed to upload resume');
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
  });

  const handleAnalyze = async (resumeId) => {
    setAnalyzing(true);
    try {
      // Mock AI analysis
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      setAnalysis({
        overallScore: 85,
        sections: {
          contact: { score: 100, feedback: 'All contact information is present and properly formatted.' },
          summary: { score: 80, feedback: 'Good summary, but could be more specific about achievements.' },
          experience: { score: 85, feedback: 'Well-described experience with action verbs. Add more quantifiable results.' },
          education: { score: 90, feedback: 'Education section is well-formatted.' },
          skills: { score: 75, feedback: 'Good technical skills. Consider adding soft skills.' },
          formatting: { score: 88, feedback: 'Clean formatting. Consider using bullet points more consistently.' },
        },
        suggestions: [
          'Add more quantifiable achievements (e.g., "Increased performance by 30%")',
          'Include a brief professional summary at the top',
          'Add relevant certifications if you have any',
          'Consider adding links to portfolio or GitHub',
          'Use more action verbs to describe experiences',
        ],
        keywords: {
          found: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git', 'REST API'],
          missing: ['TypeScript', 'AWS', 'Docker', 'CI/CD', 'Agile'],
        },
        atsScore: 82,
      });
      
      toast.success('Analysis complete!');
    } catch (error) {
      toast.error('Failed to analyze resume');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSetActive = async (resumeId) => {
    try {
      // Mock setting active resume
      setResumes(
        resumes.map((r) => ({
          ...r,
          isActive: r.id === resumeId,
        }))
      );
      setActiveResume(resumes.find((r) => r.id === resumeId));
      toast.success('Resume set as active!');
    } catch (error) {
      toast.error('Failed to set active resume');
    }
  };

  const handleDelete = async (resumeId) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;

    try {
      // Mock delete
      setResumes(resumes.filter((r) => r.id !== resumeId));
      toast.success('Resume deleted');
    } catch (error) {
      toast.error('Failed to delete resume');
    }
  };

  const handlePreview = (resume) => {
    setPreviewResume(resume);
  };

  const handleDownload = (resume) => {
    // Create a temporary download link
    const link = document.createElement('a');
    link.href = resume.url;
    link.download = resume.filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download started!');
  };

  if (loading) {
    console.log('Resume component: Still loading...');
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading your resumes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-secondary-900">My Resume</h1>
        <p className="text-secondary-600">Manage your resumes and get AI-powered analysis</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Upload & List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upload Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-secondary-900">Upload Resume</h2>
            </div>
            <div className="card-body">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-secondary-300 hover:border-primary-400 hover:bg-secondary-50'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragActive ? 'text-primary-500' : 'text-secondary-400'}`} />
                {uploading ? (
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-primary-600" />
                    <span className="text-primary-600">Uploading...</span>
                  </div>
                ) : isDragActive ? (
                  <p className="text-primary-600">Drop your resume here...</p>
                ) : (
                  <>
                    <p className="text-secondary-700 mb-1">
                      Drag & drop your resume here, or <span className="text-primary-600">browse</span>
                    </p>
                    <p className="text-sm text-secondary-500">Supports PDF, DOC, DOCX (Max 5MB)</p>
                  </>
                )}
              </div>
            </div>
          </motion.div>

          {/* Resume List */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-secondary-900">My Resumes</h2>
            </div>
            <div className="card-body p-0">
              {resumes.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
                  <p className="text-secondary-600">No resumes uploaded yet</p>
                </div>
              ) : (
                <div className="divide-y divide-secondary-200">
                  {resumes.map((resume) => (
                    <div key={resume.id} className="p-4 hover:bg-secondary-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <FileText className="w-6 h-6 text-primary-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-secondary-900 truncate">{resume.filename}</h3>
                            {resume.isActive && (
                              <span className="badge badge-success">Active</span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-secondary-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(resume.uploadedAt).toLocaleDateString()}
                            </span>
                            {resume.aiScore && (
                              <span className="flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-primary-500" />
                                AI Score: {resume.aiScore}%
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAnalyze(resume.id)}
                            disabled={analyzing}
                            className="btn btn-secondary btn-sm"
                            title="AI Analysis"
                          >
                            <Sparkles className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handlePreview(resume)}
                            className="btn btn-ghost btn-sm" 
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDownload(resume)}
                            className="btn btn-ghost btn-sm" 
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          {!resume.isActive && (
                            <button
                              onClick={() => handleSetActive(resume.id)}
                              className="btn btn-ghost btn-sm text-success-600"
                              title="Set as Active"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(resume.id)}
                            className="btn btn-ghost btn-sm text-error-600"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Column - Analysis */}
        <div className="space-y-6">
          {/* Extracted Skills */}
          {activeResume?.parsedData && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-secondary-900">Extracted Skills</h2>
              </div>
              <div className="card-body">
                <div className="flex flex-wrap gap-2">
                  {activeResume.parsedData.skills.map((skill) => (
                    <span key={skill} className="badge badge-primary">{skill}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* AI Analysis Results */}
          {analysis && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card"
            >
              <div className="card-header">
                <h2 className="text-lg font-semibold text-secondary-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary-600" />
                  AI Analysis
                </h2>
              </div>
              <div className="card-body space-y-4">
                {/* Overall Score */}
                <div className="text-center p-4 bg-primary-50 rounded-xl">
                  <div className="text-4xl font-bold text-primary-600 mb-1">{analysis.overallScore}%</div>
                  <p className="text-sm text-primary-700">Overall Resume Score</p>
                </div>

                {/* ATS Score */}
                <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                  <span className="text-secondary-700">ATS Compatibility</span>
                  <span className="font-bold text-secondary-900">{analysis.atsScore}%</span>
                </div>

                {/* Section Scores */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-secondary-700">Section Scores</h4>
                  {Object.entries(analysis.sections).map(([section, data]) => (
                    <div key={section}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize text-secondary-600">{section}</span>
                        <span className="font-medium">{data.score}%</span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className={`progress-bar-fill ${
                            data.score >= 80 ? 'bg-success-500' : data.score >= 60 ? 'bg-warning-500' : 'bg-error-500'
                          }`}
                          style={{ width: `${data.score}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Keywords */}
                <div>
                  <h4 className="text-sm font-medium text-secondary-700 mb-2">Keywords Found</h4>
                  <div className="flex flex-wrap gap-1">
                    {analysis.keywords.found.map((kw) => (
                      <span key={kw} className="badge badge-success text-xs">{kw}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-secondary-700 mb-2">Missing Keywords</h4>
                  <div className="flex flex-wrap gap-1">
                    {analysis.keywords.missing.map((kw) => (
                      <span key={kw} className="badge badge-error text-xs">{kw}</span>
                    ))}
                  </div>
                </div>

                {/* Suggestions */}
                <div>
                  <h4 className="text-sm font-medium text-secondary-700 mb-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Improvement Suggestions
                  </h4>
                  <ul className="space-y-2 text-sm text-secondary-600">
                    {analysis.suggestions.map((suggestion, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-5 h-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs flex-shrink-0">
                          {i + 1}
                        </span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {/* Analyzing State */}
          {analyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card p-8 text-center"
            >
              <RefreshCw className="w-12 h-12 text-primary-600 mx-auto mb-4 animate-spin" />
              <p className="text-secondary-700">Analyzing your resume...</p>
              <p className="text-sm text-secondary-500 mt-1">This may take a few seconds</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Resume Preview Modal */}
      {previewResume && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewResume(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-secondary-200">
              <div>
                <h3 className="text-xl font-semibold text-secondary-900">Resume Preview</h3>
                <p className="text-sm text-secondary-600">{previewResume.filename}</p>
              </div>
              <button
                onClick={() => setPreviewResume(null)}
                className="btn btn-ghost btn-sm"
              >
                ✕
              </button>
            </div>

            {/* Resume Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="bg-secondary-50 rounded-lg p-8 min-h-[500px]">
                {/* Resume Header */}
                <div className="text-center mb-8 pb-6 border-b border-secondary-200">
                  <h1 className="text-2xl font-bold text-secondary-900 mb-2">Demo Student</h1>
                  <p className="text-secondary-600 mb-2">Computer Science Engineering</p>
                  <p className="text-sm text-secondary-500">demo.student@example.com | +91 98765 43210 | Bangalore, India</p>
                </div>

                {/* Resume Sections */}
                {previewResume.parsedData ? (
                  <>
                    {/* Education Section */}
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-secondary-900 mb-3">Education</h4>
                      <div className="bg-white p-4 rounded-lg border border-secondary-200">
                        <p className="font-medium text-secondary-900">{previewResume.parsedData.education?.degree || 'B.Tech Computer Science'}</p>
                        <p className="text-secondary-600">{previewResume.parsedData.education?.institution || 'Engineering College'}</p>
                        <p className="text-sm text-secondary-500">CGPA: {previewResume.parsedData.education?.cgpa || '8.5'}</p>
                        <p className="text-sm text-secondary-500">{previewResume.parsedData.education?.year || '2020 - 2024'}</p>
                      </div>
                    </div>

                    {/* Skills Section */}
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-secondary-900 mb-3">Technical Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {(previewResume.parsedData.skills || ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git']).map((skill, index) => (
                          <span key={index} className="badge badge-secondary">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Experience Section */}
                    {previewResume.parsedData.experience && previewResume.parsedData.experience.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-secondary-900 mb-3">Experience</h4>
                        <div className="space-y-4">
                          {previewResume.parsedData.experience.map((exp, index) => (
                            <div key={index} className="bg-white p-4 rounded-lg border border-secondary-200">
                              <p className="font-medium text-secondary-900">{exp.title}</p>
                              <p className="text-secondary-600">{exp.company}</p>
                              <p className="text-sm text-secondary-500 mb-2">{exp.duration}</p>
                              {exp.description && <p className="text-sm text-secondary-600">{exp.description}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Projects Section */}
                    {previewResume.parsedData.projects && previewResume.parsedData.projects.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-secondary-900 mb-3">Projects</h4>
                        <div className="space-y-4">
                          {previewResume.parsedData.projects.map((project, index) => (
                            <div key={index} className="bg-white p-4 rounded-lg border border-secondary-200">
                              <p className="font-medium text-secondary-900">{project.title}</p>
                              <p className="text-sm text-secondary-500 mb-2">{project.tech}</p>
                              <p className="text-sm text-secondary-600">{project.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  /* Default Resume Preview */
                  <div className="space-y-6">
                    <div className="text-center">
                      <img 
                        src={previewResume.url} 
                        alt="Resume Preview" 
                        className="mx-auto max-w-full h-auto rounded-lg shadow-lg border border-secondary-200"
                        style={{ maxHeight: '600px' }}
                      />
                    </div>
                    <div className="text-center text-sm text-secondary-500">
                      <p>Resume preview for {previewResume.filename}</p>
                      <p>AI Score: {previewResume.aiScore || 0}%</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-secondary-200 bg-secondary-50">
              <div className="text-sm text-secondary-600">
                File size: {previewResume.size || '245 KB'} • Uploaded: {previewResume.uploadedAt || '2024-01-10'}
              </div>
              <button
                onClick={() => setPreviewResume(null)}
                className="btn btn-outline"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
