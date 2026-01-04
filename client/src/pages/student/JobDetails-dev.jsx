import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Clock, 
  Building2, 
  Users, 
  Calendar,
  ArrowLeft,
  CheckCircle 
} from 'lucide-react';

export default function JobDetails() {
  const { id } = useParams();

  // Mock job data
  const job = {
    id: id,
    title: 'Software Engineer',
    company: 'Google',
    location: 'Mountain View, CA',
    salary: '$120k - $180k',
    type: 'Full-time',
    posted: '2 days ago',
    eligibility: 92,
    logo: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=100',
    description: 'We are looking for a talented Software Engineer to join our team and help build innovative products that impact billions of users worldwide.',
    requirements: [
      'Bachelor\'s degree in Computer Science or related field',
      '2+ years of experience in software development',
      'Strong programming skills in JavaScript, Python, or Java',
      'Experience with modern web frameworks (React, Angular, Vue)',
      'Knowledge of data structures and algorithms',
      'Excellent problem-solving skills'
    ],
    responsibilities: [
      'Design, develop, and maintain high-quality software solutions',
      'Collaborate with cross-functional teams to define and ship new features',
      'Write clean, maintainable, and well-documented code',
      'Participate in code reviews and provide constructive feedback',
      'Troubleshoot and debug applications to optimize performance',
      'Stay up-to-date with emerging trends and technologies'
    ],
    benefits: [
      'Competitive salary and equity package',
      'Comprehensive health, dental, and vision insurance',
      'Flexible work hours and remote work options',
      'Professional development opportunities',
      'Free meals and snacks',
      'On-site fitness centers and wellness programs'
    ]
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Back Button */}
        <button className="btn btn-ghost btn-sm mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Jobs
        </button>

        {/* Job Header */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-start gap-6">
              <img
                src={job.logo}
                alt={job.company}
                className="w-20 h-20 rounded-lg object-cover"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-secondary-900 mb-2">{job.title}</h1>
                    <p className="text-lg text-secondary-600 mb-2">{job.company}</p>
                  </div>
                  <div className="text-right">
                    <span className="badge badge-success text-lg px-3 py-2">
                      {job.eligibility}% Match
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 text-secondary-600 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    {job.salary}
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    {job.type}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    {job.posted}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button className="btn btn-primary btn-lg">Apply Now</button>
                  <button className="btn btn-outline btn-lg">Save Job</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Job Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="card"
            >
              <div className="card-header">
                <h3 className="text-lg font-semibold text-secondary-900">Job Description</h3>
              </div>
              <div className="card-body">
                <p className="text-secondary-600 leading-relaxed">{job.description}</p>
              </div>
            </motion.div>

            {/* Responsibilities */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="card"
            >
              <div className="card-header">
                <h3 className="text-lg font-semibold text-secondary-900">Responsibilities</h3>
              </div>
              <div className="card-body">
                <ul className="space-y-2">
                  {job.responsibilities.map((responsibility, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-success-500 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary-600">{responsibility}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Requirements */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="card"
            >
              <div className="card-header">
                <h3 className="text-lg font-semibold text-secondary-900">Requirements</h3>
              </div>
              <div className="card-body">
                <ul className="space-y-2">
                  {job.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary-600">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Company Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="card"
            >
              <div className="card-header">
                <h3 className="text-lg font-semibold text-secondary-900">About Company</h3>
              </div>
              <div className="card-body">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={job.logo}
                    alt={job.company}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-medium text-secondary-900">{job.company}</p>
                    <p className="text-sm text-secondary-600">Technology</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-secondary-400" />
                    <span className="text-secondary-600">10,000+ employees</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-secondary-400" />
                    <span className="text-secondary-600">Mountain View, CA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-secondary-400" />
                    <span className="text-secondary-600">Public Company</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="card"
            >
              <div className="card-header">
                <h3 className="text-lg font-semibold text-secondary-900">Benefits</h3>
              </div>
              <div className="card-body">
                <ul className="space-y-2">
                  {job.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-success-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-secondary-600">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Application Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="card"
            >
              <div className="card-header">
                <h3 className="text-lg font-semibold text-secondary-900">Application Info</h3>
              </div>
              <div className="card-body">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-secondary-400" />
                    <div>
                      <p className="text-sm font-medium text-secondary-900">Posted</p>
                      <p className="text-sm text-secondary-600">{job.posted}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-secondary-400" />
                    <div>
                      <p className="text-sm font-medium text-secondary-900">Applicants</p>
                      <p className="text-sm text-secondary-600">245 applied</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
