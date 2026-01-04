import { motion } from 'framer-motion';
import { FileText, Clock, CheckCircle, XCircle, Calendar, Building2 } from 'lucide-react';

const mockApplications = [
  {
    id: 1,
    company: 'Google',
    position: 'Software Engineer',
    status: 'Under Review',
    appliedDate: '2024-01-15',
    lastUpdate: '2024-01-18',
    logo: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=100',
  },
  {
    id: 2,
    company: 'Microsoft',
    position: 'Product Manager',
    status: 'Interview Scheduled',
    appliedDate: '2024-01-12',
    lastUpdate: '2024-01-17',
    interviewDate: '2024-01-25',
    logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&q=80&w=100',
  },
  {
    id: 3,
    company: 'Amazon',
    position: 'Data Scientist',
    status: 'Applied',
    appliedDate: '2024-01-10',
    lastUpdate: '2024-01-10',
    logo: 'https://images.unsplash.com/photo-1605087667593-69c0e9b7520b?auto=format&fit=crop&q=80&w=100',
  },
];

const getStatusColor = (status) => {
  switch (status) {
    case 'Applied':
      return 'bg-primary-100 text-primary-800';
    case 'Under Review':
      return 'bg-warning-100 text-warning-800';
    case 'Interview Scheduled':
      return 'bg-success-100 text-success-800';
    case 'Offer':
      return 'bg-purple-100 text-purple-800';
    case 'Rejected':
      return 'bg-error-100 text-error-800';
    default:
      return 'bg-secondary-100 text-secondary-800';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'Applied':
      return FileText;
    case 'Under Review':
      return Clock;
    case 'Interview Scheduled':
      return CheckCircle;
    case 'Offer':
      return CheckCircle;
    case 'Rejected':
      return XCircle;
    default:
      return FileText;
  }
};

export default function StudentApplications() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-secondary-900 mb-6">My Applications</h1>
        
        <div className="space-y-4">
          {mockApplications.map((application) => {
            const StatusIcon = getStatusIcon(application.status);
            return (
              <motion.div
                key={application.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
              >
                <div className="card-body">
                  <div className="flex items-start gap-4">
                    <img
                      src={application.logo}
                      alt={application.company}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-secondary-900 mb-1">
                            {application.position}
                          </h3>
                          <p className="text-secondary-600 mb-2">{application.company}</p>
                        </div>
                        <span className={`badge ${getStatusColor(application.status)}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {application.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-secondary-500">
                          <Calendar className="w-4 h-4" />
                          <div>
                            <p className="font-medium">Applied</p>
                            <p>{application.appliedDate}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-secondary-500">
                          <Clock className="w-4 h-4" />
                          <div>
                            <p className="font-medium">Last Update</p>
                            <p>{application.lastUpdate}</p>
                          </div>
                        </div>
                        {application.interviewDate && (
                          <div className="flex items-center gap-2 text-secondary-500">
                            <CheckCircle className="w-4 h-4" />
                            <div>
                              <p className="font-medium">Interview</p>
                              <p>{application.interviewDate}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 mt-4">
                        <button className="btn btn-outline btn-sm">View Details</button>
                        <button className="btn btn-ghost btn-sm">Withdraw</button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
