import { motion } from 'framer-motion';
import { Briefcase, MapPin, DollarSign, Clock, Building2 } from 'lucide-react';

const mockJobs = [
  {
    id: 1,
    title: 'Software Engineer',
    company: 'Google',
    location: 'Mountain View, CA',
    salary: '$120k - $180k',
    type: 'Full-time',
    posted: '2 days ago',
    eligibility: 92,
    logo: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=100',
  },
  {
    id: 2,
    title: 'Product Manager',
    company: 'Microsoft',
    location: 'Redmond, WA',
    salary: '$130k - $170k',
    type: 'Full-time',
    posted: '3 days ago',
    eligibility: 88,
    logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&q=80&w=100',
  },
  {
    id: 3,
    title: 'Data Scientist',
    company: 'Amazon',
    location: 'Seattle, WA',
    salary: '$110k - $160k',
    type: 'Full-time',
    posted: '1 week ago',
    eligibility: 85,
    logo: 'https://images.unsplash.com/photo-1605087667593-69c0e9b7520b?auto=format&fit=crop&q=80&w=100',
  },
];

export default function StudentJobs() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-secondary-900 mb-6">Browse Jobs</h1>
        
        <div className="space-y-4">
          {mockJobs.map((job) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="card-body">
                <div className="flex items-start gap-4">
                  <img
                    src={job.logo}
                    alt={job.company}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-secondary-900 mb-1">{job.title}</h3>
                        <p className="text-secondary-600 mb-2">{job.company}</p>
                      </div>
                      <div className="text-right">
                        <span className="badge badge-success">{job.eligibility}% Match</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-secondary-500 mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {job.salary}
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {job.type}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {job.posted}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <button className="btn btn-primary btn-sm">Apply Now</button>
                      <button className="btn btn-outline btn-sm">View Details</button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
