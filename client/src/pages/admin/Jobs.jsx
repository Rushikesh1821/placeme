import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Download,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Building2,
  MapPin,
  DollarSign,
  Briefcase,
  Clock,
  Users,
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['All', 'Active', 'Closed', 'Pending'];
const TYPE_OPTIONS = ['All', 'Full-Time', 'Internship', 'Contract'];

export default function AdminJobs() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchJobs();
  }, [selectedStatus, selectedType, currentPage]);

  const fetchJobs = async () => {
    try {
      // Mock data
      const mockJobs = [
        { id: 1, title: 'Software Engineer', company: 'Google', location: 'Bangalore', type: 'Full-Time', salary: '28 LPA', status: 'Active', applications: 156, deadline: '2024-02-28' },
        { id: 2, title: 'Product Manager', company: 'Microsoft', location: 'Hyderabad', type: 'Full-Time', salary: '24 LPA', status: 'Active', applications: 89, deadline: '2024-02-25' },
        { id: 3, title: 'SDE Intern', company: 'Amazon', location: 'Bangalore', type: 'Internship', salary: '60K/month', status: 'Active', applications: 234, deadline: '2024-02-20' },
        { id: 4, title: 'Data Scientist', company: 'Flipkart', location: 'Bangalore', type: 'Full-Time', salary: '18 LPA', status: 'Closed', applications: 67, deadline: '2024-01-31' },
        { id: 5, title: 'Frontend Developer', company: 'Razorpay', location: 'Bangalore', type: 'Full-Time', salary: '16 LPA', status: 'Active', applications: 112, deadline: '2024-03-15' },
        { id: 6, title: 'Backend Engineer', company: 'Infosys', location: 'Pune', type: 'Full-Time', salary: '8 LPA', status: 'Pending', applications: 0, deadline: '2024-03-20' },
        { id: 7, title: 'ML Engineer', company: 'Google', location: 'Bangalore', type: 'Full-Time', salary: '32 LPA', status: 'Active', applications: 78, deadline: '2024-03-10' },
        { id: 8, title: 'DevOps Engineer', company: 'Amazon', location: 'Hyderabad', type: 'Full-Time', salary: '20 LPA', status: 'Active', applications: 45, deadline: '2024-03-05' },
      ];
      setJobs(mockJobs);
      setTotalPages(2);
    } catch (error) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          job.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || job.status === selectedStatus;
    const matchesType = selectedType === 'All' || job.type === selectedType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleApprove = (id) => {
    toast.success('Job posting approved');
  };

  const handleReject = (id) => {
    toast.success('Job posting rejected');
  };

  const handleDelete = (id) => {
    toast.success('Job posting deleted');
  };

  const handleExport = () => {
    toast.success('Exporting jobs data...');
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-secondary-900">Job Postings</h1>
          <p className="text-secondary-600">Manage all job postings in the system</p>
        </div>
        <button onClick={handleExport} className="btn btn-secondary flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900">{jobs.length}</p>
              <p className="text-sm text-secondary-600">Total Jobs</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900">{jobs.filter(j => j.status === 'Active').length}</p>
              <p className="text-sm text-secondary-600">Active</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900">{jobs.filter(j => j.status === 'Pending').length}</p>
              <p className="text-sm text-secondary-600">Pending</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-secondary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900">{jobs.reduce((sum, j) => sum + j.applications, 0)}</p>
              <p className="text-sm text-secondary-600">Applications</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
            <input
              type="text"
              placeholder="Search jobs or companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input"
            >
              {STATUS_OPTIONS.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="input"
            >
              {TYPE_OPTIONS.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Jobs Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Job</th>
                <th>Type</th>
                <th>Salary</th>
                <th>Status</th>
                <th>Applications</th>
                <th>Deadline</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job, index) => (
                <motion.tr
                  key={job.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary-100 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-secondary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-secondary-900">{job.title}</p>
                        <div className="flex items-center gap-2 text-sm text-secondary-500">
                          <span>{job.company}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {job.location}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${job.type === 'Full-Time' ? 'badge-primary' : job.type === 'Internship' ? 'badge-warning' : 'badge-secondary'}`}>
                      {job.type}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1 font-semibold text-success-600">
                      <DollarSign className="w-4 h-4" />
                      {job.salary}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${job.status === 'Active' ? 'badge-success' : job.status === 'Pending' ? 'badge-warning' : 'badge-secondary'}`}>
                      {job.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-secondary-400" />
                      {job.applications}
                    </div>
                  </td>
                  <td>
                    <span className="text-secondary-600">
                      {new Date(job.deadline).toLocaleDateString()}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-secondary-100 rounded-lg transition-colors">
                        <Eye className="w-4 h-4 text-secondary-600" />
                      </button>
                      {job.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(job.id)}
                            className="p-2 hover:bg-success-100 rounded-lg transition-colors"
                          >
                            <CheckCircle className="w-4 h-4 text-success-600" />
                          </button>
                          <button
                            onClick={() => handleReject(job.id)}
                            className="p-2 hover:bg-error-100 rounded-lg transition-colors"
                          >
                            <XCircle className="w-4 h-4 text-error-600" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(job.id)}
                        className="p-2 hover:bg-error-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-error-600" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-secondary-200 flex items-center justify-between">
          <p className="text-sm text-secondary-600">
            Showing {filteredJobs.length} of {jobs.length} jobs
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn btn-secondary btn-sm"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm text-secondary-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="btn btn-secondary btn-sm"
            >
              Next
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
