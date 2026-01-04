import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Building2,
  MapPin,
  DollarSign,
  Clock,
  Calendar,
  Briefcase,
  Users,
  GraduationCap,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  BookmarkPlus,
  Share2,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import toast from 'react-hot-toast';
import { jobAPI, applicationAPI } from '../../services/api';

const COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#64748b'];

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [job, setJob] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      // Mock data for demonstration
      setJob({
        id: 1,
        title: 'Software Development Engineer',
        company: {
          name: 'Google',
          logo: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=100&h=100',
          website: 'https://google.com',
          industry: 'Technology',
          size: '10,000+ employees',
          about: 'Google LLC is an American multinational technology company that specializes in Internet-related services and products.',
        },
        location: 'Bangalore',
        jobType: 'Full-time',
        workMode: 'Hybrid',
        salary: { min: 2000000, max: 3500000 },
        deadline: '2024-01-20',
        postedAt: '2024-01-05',
        requiredBranches: ['Computer Science', 'Information Technology'],
        minCGPA: 7.5,
        minTenth: 75,
        minTwelfth: 75,
        maxBacklogs: 0,
        minExperience: 0,
        applicants: 245,
        openings: 10,
        skills: {
          mandatory: ['JavaScript', 'React', 'Node.js'],
          preferred: ['TypeScript', 'GraphQL', 'AWS', 'Docker'],
        },
        description: `We are looking for passionate software engineers to join our team and help build the next generation of Google products.

As a Software Development Engineer at Google, you will work on challenging problems at scale, collaborate with talented engineers from around the world, and have the opportunity to make a real impact on billions of users.

**What you'll do:**
- Design, develop, test, deploy, maintain, and improve software
- Manage individual project priorities, deadlines, and deliverables
- Work on cutting-edge technology and solve complex problems
- Collaborate with cross-functional teams

**The ideal candidate has:**
- Strong foundation in computer science fundamentals
- Proficiency in one or more programming languages (JavaScript, Python, Java, C++)
- Experience with web development frameworks
- Excellent problem-solving skills`,
        responsibilities: [
          'Design and develop high-quality software solutions',
          'Write clean, maintainable, and well-documented code',
          'Participate in code reviews and provide constructive feedback',
          'Collaborate with product managers and designers',
          'Debug and resolve technical issues',
          'Stay up-to-date with emerging technologies',
        ],
        benefits: [
          'Competitive salary and equity',
          'Health, dental, and vision insurance',
          'Flexible work arrangements',
          'Professional development budget',
          'Gym membership and wellness programs',
          'Free meals and snacks',
        ],
        selectionProcess: [
          { stage: 'Resume Screening', description: 'Initial review of applications' },
          { stage: 'Online Assessment', description: 'Coding test (90 minutes)' },
          { stage: 'Technical Interview 1', description: 'Data structures and algorithms' },
          { stage: 'Technical Interview 2', description: 'System design' },
          { stage: 'HR Interview', description: 'Behavioral and culture fit' },
          { stage: 'Offer', description: 'Final decision and offer letter' },
        ],
      });

      setEligibility({
        isEligible: true,
        totalScore: 85,
        scores: {
          skillMatch: { score: 80, weight: 0.4, weightedScore: 32 },
          cgpa: { score: 90, weight: 0.3, weightedScore: 27 },
          branchMatch: { score: 100, weight: 0.2, weightedScore: 20 },
          experience: { score: 60, weight: 0.1, weightedScore: 6 },
        },
        disqualifiers: [],
        suggestions: [
          'Learn TypeScript to improve skill match',
          'Add more projects showcasing your skills',
        ],
      });

      setHasApplied(false);
    } catch (error) {
      toast.error('Failed to load job details');
      navigate('/student/jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!eligibility?.isEligible) {
      toast.error('You are not eligible for this position');
      return;
    }

    setApplying(true);
    try {
      await applicationAPI.create(id, {});
      toast.success('Application submitted successfully!');
      setHasApplied(true);
    } catch (error) {
      toast.error(error.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const formatSalary = (amount) => `₹${(amount / 100000).toFixed(1)}L`;

  const daysUntilDeadline = () => {
    const days = Math.ceil((new Date(job?.deadline) - new Date()) / (1000 * 60 * 60 * 24));
    if (days < 0) return { text: 'Expired', color: 'text-error-600' };
    if (days === 0) return { text: 'Last day!', color: 'text-error-600' };
    if (days <= 3) return { text: `${days} days left`, color: 'text-warning-600' };
    return { text: `${days} days left`, color: 'text-secondary-600' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  const deadlineInfo = daysUntilDeadline();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/student/jobs')}
        className="flex items-center gap-2 text-secondary-600 hover:text-secondary-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Jobs
      </button>

      {/* Job Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Company Logo */}
            <img
              src={job.company.logo}
              alt={job.company.name}
              className="w-20 h-20 rounded-2xl object-contain bg-white border border-secondary-200 p-3"
            />

            {/* Job Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-heading font-bold text-secondary-900">{job.title}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg text-secondary-700">{job.company.name}</span>
                    <a
                      href={job.company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn btn-ghost btn-sm">
                    <BookmarkPlus className="w-4 h-4" />
                  </button>
                  <button className="btn btn-ghost btn-sm">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-secondary-600">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> {job.location}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" /> {job.jobType}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" /> {formatSalary(job.salary.min)} - {formatSalary(job.salary.max)}/year
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" /> {job.applicants} applicants
                </span>
                <span className={`flex items-center gap-1 ${deadlineInfo.color}`}>
                  <Clock className="w-4 h-4" /> {deadlineInfo.text}
                </span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="badge badge-primary">{job.workMode}</span>
                <span className="badge badge-secondary">{job.openings} openings</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-secondary-900">Job Description</h2>
            </div>
            <div className="card-body prose prose-sm max-w-none">
              <div className="whitespace-pre-line text-secondary-700">{job.description}</div>
            </div>
          </motion.div>

          {/* Responsibilities */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-secondary-900">Responsibilities</h2>
            </div>
            <div className="card-body">
              <ul className="space-y-2">
                {job.responsibilities.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-secondary-700">
                    <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Skills */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-secondary-900">Required Skills</h2>
            </div>
            <div className="card-body space-y-4">
              <div>
                <h4 className="text-sm font-medium text-secondary-700 mb-2">Mandatory</h4>
                <div className="flex flex-wrap gap-2">
                  {job.skills.mandatory.map((skill) => (
                    <span key={skill} className="badge badge-primary">{skill}</span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-secondary-700 mb-2">Good to have</h4>
                <div className="flex flex-wrap gap-2">
                  {job.skills.preferred.map((skill) => (
                    <span key={skill} className="badge badge-secondary">{skill}</span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Selection Process */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-secondary-900">Selection Process</h2>
            </div>
            <div className="card-body">
              <div className="relative">
                {job.selectionProcess.map((stage, index) => (
                  <div key={index} className="flex gap-4 pb-6 last:pb-0">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-semibold text-sm">
                        {index + 1}
                      </div>
                      {index < job.selectionProcess.length - 1 && (
                        <div className="w-0.5 flex-1 bg-primary-200 mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-2">
                      <h4 className="font-medium text-secondary-900">{stage.stage}</h4>
                      <p className="text-sm text-secondary-600">{stage.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Eligibility Card */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card sticky top-20">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-secondary-900">Your Eligibility</h2>
            </div>
            <div className="card-body space-y-4">
              {/* Score Circle */}
              <div className="flex justify-center">
                <div className="relative w-32 h-32">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={[
                          { value: eligibility.totalScore },
                          { value: 100 - eligibility.totalScore },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={50}
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                      >
                        <Cell fill={eligibility.totalScore >= 70 ? '#22c55e' : eligibility.totalScore >= 50 ? '#f59e0b' : '#ef4444'} />
                        <Cell fill="#e2e8f0" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-secondary-900">{eligibility.totalScore}%</span>
                    <span className="text-xs text-secondary-500">Match</span>
                  </div>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="space-y-3">
                {Object.entries(eligibility.scores).map(([key, data]) => (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-secondary-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="font-medium text-secondary-900">{data.score}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className={`progress-bar-fill ${data.score >= 70 ? 'bg-success-500' : data.score >= 50 ? 'bg-warning-500' : 'bg-error-500'}`}
                        style={{ width: `${data.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Eligibility Status */}
              <div className={`flex items-center gap-2 p-3 rounded-lg ${eligibility.isEligible ? 'bg-success-50' : 'bg-error-50'}`}>
                {eligibility.isEligible ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-success-600" />
                    <span className="text-success-700 font-medium">You are eligible to apply</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-error-600" />
                    <span className="text-error-700 font-medium">Not eligible for this position</span>
                  </>
                )}
              </div>

              {/* Suggestions */}
              {eligibility.suggestions.length > 0 && (
                <div className="p-3 bg-primary-50 rounded-lg">
                  <h4 className="text-sm font-medium text-primary-700 mb-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> Suggestions to improve
                  </h4>
                  <ul className="text-sm text-primary-600 space-y-1">
                    {eligibility.suggestions.map((suggestion, i) => (
                      <li key={i}>• {suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Apply Button */}
              {hasApplied ? (
                <div className="flex items-center justify-center gap-2 p-3 bg-success-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-success-600" />
                  <span className="text-success-700 font-medium">Application Submitted</span>
                </div>
              ) : (
                <button
                  onClick={handleApply}
                  disabled={!eligibility.isEligible || applying}
                  className="btn btn-primary w-full"
                >
                  {applying ? 'Submitting...' : 'Apply Now'}
                </button>
              )}
            </div>
          </motion.div>

          {/* Requirements Summary */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-secondary-900">Requirements</h2>
            </div>
            <div className="card-body space-y-3">
              <div className="flex items-center gap-3">
                <GraduationCap className="w-5 h-5 text-secondary-400" />
                <div>
                  <p className="text-sm text-secondary-600">Min. CGPA</p>
                  <p className="font-medium text-secondary-900">{job.minCGPA}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-secondary-400" />
                <div>
                  <p className="text-sm text-secondary-600">Branches</p>
                  <p className="font-medium text-secondary-900">{job.requiredBranches.join(', ')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-secondary-400" />
                <div>
                  <p className="text-sm text-secondary-600">Max. Backlogs</p>
                  <p className="font-medium text-secondary-900">{job.maxBacklogs}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-secondary-400" />
                <div>
                  <p className="text-sm text-secondary-600">Apply by</p>
                  <p className="font-medium text-secondary-900">
                    {new Date(job.deadline).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Company Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-secondary-900">About {job.company.name}</h2>
            </div>
            <div className="card-body">
              <p className="text-sm text-secondary-600 mb-4">{job.company.about}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-secondary-500">Industry</span>
                  <span className="font-medium text-secondary-900">{job.company.industry}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-500">Company Size</span>
                  <span className="font-medium text-secondary-900">{job.company.size}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
