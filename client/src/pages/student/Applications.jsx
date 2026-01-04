import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Building2,
  MapPin,
  Calendar,
  Filter,
  Search,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { applicationAPI } from '../../services/api';

const statusConfig = {
  PENDING: { label: 'Pending', color: 'badge-warning', icon: Clock },
  UNDER_REVIEW: { label: 'Under Review', color: 'badge-primary', icon: Eye },
  SHORTLISTED: { label: 'Shortlisted', color: 'badge-success', icon: CheckCircle },
  REJECTED: { label: 'Rejected', color: 'badge-error', icon: XCircle },
  SELECTED: { label: 'Selected', color: 'badge-success', icon: CheckCircle },
  WITHDRAWN: { label: 'Withdrawn', color: 'badge-secondary', icon: XCircle },
};

export default function StudentApplications() {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedApplication, setSelectedApplication] = useState(null);

  useEffect(() => {
    fetchApplications();
    
    // Listen for localStorage changes from Jobs component
    const handleStorageChange = () => {
      const storedApplications = JSON.parse(localStorage.getItem('studentApplications') || '[]');
      if (storedApplications.length !== applications.length) {
        setApplications(storedApplications);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [applications]);

  useEffect(() => {
    filterApplications();
  }, [applications, searchQuery, statusFilter]);

  const fetchApplications = async () => {
    try {
      // Mock data
      const mockApplications = [
        {
          id: 1,
          job: {
            id: 1,
            title: 'Software Development Engineer',
            company: { name: 'Google', logo: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=100&h=100' },
            location: 'Bangalore',
          },
          status: 'SHORTLISTED',
          appliedAt: '2024-01-10',
          updatedAt: '2024-01-12',
          eligibilityScore: 92,
          notes: 'Technical interview scheduled for Jan 15',
        },
        {
          id: 2,
          job: {
            id: 2,
            title: 'Frontend Developer',
            company: { name: 'Microsoft', logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&q=80&w=100&h=100' },
            location: 'Hyderabad',
          },
          status: 'UNDER_REVIEW',
          appliedAt: '2024-01-08',
          updatedAt: '2024-01-10',
          eligibilityScore: 85,
          notes: null,
        },
        {
          id: 3,
          job: {
            id: 3,
            title: 'Full Stack Developer',
            company: { name: 'Amazon', logo: 'https://images.unsplash.com/photo-1605087667593-69c0e9b7520b?auto=format&fit=crop&q=80&w=100&h=100' },
            location: 'Remote',
          },
          status: 'PENDING',
          appliedAt: '2024-01-05',
          updatedAt: '2024-01-05',
          eligibilityScore: 78,
          notes: null,
        },
        {
          id: 4,
          job: {
            id: 4,
            title: 'Data Analyst',
            company: { name: 'Flipkart', logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c8e4f2?auto=format&fit=crop&q=80&w=100&h=100' },
            location: 'Bangalore',
          },
          status: 'REJECTED',
          appliedAt: '2024-01-02',
          updatedAt: '2024-01-08',
          eligibilityScore: 65,
          notes: 'Did not meet experience requirements',
        },
        {
          id: 5,
          job: {
            id: 5,
            title: 'Product Manager',
            company: { name: 'Swiggy', logo: 'https://images.unsplash.com/photo-1573164713619-24c711fe7871?auto=format&fit=crop&q=80&w=100&h=100' },
            location: 'Hyderabad',
          },
          status: 'SELECTED',
          appliedAt: '2023-12-20',
          updatedAt: '2024-01-05',
          eligibilityScore: 88,
          notes: 'Offer letter sent!',
        },
      ];

      setApplications(mockApplications);
    } catch (error) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let result = [...applications];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (app) =>
          app.job.title.toLowerCase().includes(query) ||
          app.job.company.name.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'All') {
      result = result.filter((app) => app.status === statusFilter);
    }

    setFilteredApplications(result);
  };

  const handleWithdraw = async (applicationId) => {
    if (!confirm('Are you sure you want to withdraw this application?')) return;

    try {
      // Mock withdraw
      setApplications(applications.filter((app) => app.id !== applicationId));
      toast.success('Application withdrawn successfully');
    } catch (error) {
      toast.error('Failed to withdraw application');
    }
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
  };

  const getStatusCounts = () => {
    const counts = { All: applications.length };
    applications.forEach((app) => {
      counts[app.status] = (counts[app.status] || 0) + 1;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-secondary-900">My Applications</h1>
        <p className="text-secondary-600">Track the status of your job applications</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { status: 'All', label: 'Total', icon: FileText, color: 'bg-primary-100 text-primary-600' },
          { status: 'SHORTLISTED', label: 'Shortlisted', icon: CheckCircle, color: 'bg-success-100 text-success-600' },
          { status: 'PENDING', label: 'Pending', icon: Clock, color: 'bg-warning-100 text-warning-600' },
          { status: 'REJECTED', label: 'Rejected', icon: XCircle, color: 'bg-error-100 text-error-600' },
        ].map((item) => (
          <motion.div
            key={item.status}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`card p-4 cursor-pointer transition-all ${
              statusFilter === item.status ? 'ring-2 ring-primary-500' : ''
            }`}
            onClick={() => setStatusFilter(item.status)}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-secondary-900">{statusCounts[item.status] || 0}</p>
                <p className="text-sm text-secondary-600">{item.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
            <input
              type="text"
              placeholder="Search by job title or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input w-auto"
          >
            <option value="All">All Status</option>
            {Object.entries(statusConfig).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.map((application, index) => {
          const status = statusConfig[application.status];
          const StatusIcon = status.icon;

          return (
            <motion.div
              key={application.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Company Logo */}
                  <img
                    src={application.job.company.logo}
                    alt={application.job.company.name}
                    className="w-14 h-14 rounded-xl object-contain bg-white border border-secondary-200 p-2 flex-shrink-0"
                  />

                  {/* Job Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-secondary-900">{application.job.title}</h3>
                        <p className="text-secondary-600">{application.job.company.name}</p>
                      </div>
                      <span className={`${status.color} flex items-center gap-1`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-secondary-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> {application.job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" /> Applied {new Date(application.appliedAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> {application.eligibilityScore}% match
                      </span>
                    </div>

                    {application.notes && (
                      <div className="mt-3 p-3 bg-secondary-50 rounded-lg">
                        <p className="text-sm text-secondary-700">
                          <span className="font-medium">Note:</span> {application.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button 
                    onClick={() => handleViewDetails(application)}
                    className="btn btn-secondary btn-sm"
                  >
                    View Details
                  </button>
                    {(application.status === 'PENDING' || application.status === 'UNDER_REVIEW') && (
                      <button
                        onClick={() => handleWithdraw(application.id)}
                        className="btn btn-ghost btn-sm text-error-600 hover:bg-error-50"
                      >
                        Withdraw
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="px-6 py-3 bg-secondary-50 border-t border-secondary-200 text-sm text-secondary-500">
                Last updated: {new Date(application.updatedAt).toLocaleString()}
              </div>
            </motion.div>
          );
        })}

        {filteredApplications.length === 0 && (
          <div className="card p-12 text-center">
            <FileText className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">No applications found</h3>
            <p className="text-secondary-600">
              {applications.length === 0
                ? "You haven't applied to any jobs yet. Start browsing jobs to find your perfect opportunity!"
                : 'No applications match your current filters.'}
            </p>
          </div>
        )}
      </div>

      {/* Application Details Modal */}
      {selectedApplication && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedApplication(null)}
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
                <h3 className="text-xl font-semibold text-secondary-900">Application Details</h3>
                <p className="text-sm text-secondary-600">{selectedApplication.job.title}</p>
              </div>
              <button
                onClick={() => setSelectedApplication(null)}
                className="btn btn-ghost btn-sm"
              >
                ✕
              </button>
            </div>

            {/* Application Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Left Column - Job Details */}
                <div className="space-y-6">
                  {/* Company Info */}
                  <div className="bg-secondary-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-secondary-900 mb-4">Company Information</h4>
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={selectedApplication.job.company.logo}
                        alt={selectedApplication.job.company.name}
                        className="w-16 h-16 rounded-xl object-contain bg-white border border-secondary-200 p-2"
                      />
                      <div>
                        <h5 className="font-semibold text-secondary-900">{selectedApplication.job.company.name}</h5>
                        <p className="text-secondary-600 flex items-center gap-2">
                          <MapPin className="w-4 h-4" /> {selectedApplication.job.location}
                        </p>
                      </div>
                    </div>

                    {/* Job Details */}
                    <div>
                      <h5 className="font-semibold text-secondary-900 mb-2">Position Details</h5>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm text-secondary-500">Position:</span>
                          <p className="font-medium">{selectedApplication.job.title}</p>
                        </div>
                        <div>
                          <span className="text-sm text-secondary-500">Location:</span>
                          <p className="font-medium">{selectedApplication.job.location}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Application Status */}
                  <div className="bg-secondary-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-secondary-900 mb-4">Application Status</h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <span className={`badge ${statusConfig[selectedApplication.status].color}`}>
                          {statusConfig[selectedApplication.status].label}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm text-secondary-500">Eligibility Score:</span>
                            <span className="text-lg font-bold text-primary-600">{selectedApplication.eligibilityScore}%</span>
                          </div>
                          <div className="w-full bg-secondary-200 rounded-full h-2">
                            <div 
                              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${selectedApplication.eligibilityScore}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <span className="text-sm text-secondary-500">Applied:</span>
                        <p className="font-medium">{new Date(selectedApplication.appliedAt).toLocaleDateString()}</p>
                      </div>

                      <div>
                        <span className="text-sm text-secondary-500">Last Updated:</span>
                        <p className="font-medium">{new Date(selectedApplication.updatedAt).toLocaleString()}</p>
                      </div>

                      {selectedApplication.notes && (
                        <div className="mt-4 p-4 bg-white rounded-lg border border-secondary-200">
                          <span className="text-sm text-secondary-500">Notes:</span>
                          <p className="text-secondary-700 mt-1">{selectedApplication.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-secondary-200 bg-secondary-50">
              <div className="text-sm text-secondary-600">
                Application ID: #{selectedApplication.id}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="btn btn-outline"
                >
                  Close
                </button>
                {(selectedApplication.status === 'PENDING' || selectedApplication.status === 'UNDER_REVIEW') && (
                  <button
                    onClick={() => {
                      handleWithdraw(selectedApplication.id);
                      setSelectedApplication(null);
                    }}
                    className="btn btn-error"
                  >
                    Withdraw Application
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
