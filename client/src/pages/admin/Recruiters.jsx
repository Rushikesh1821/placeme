import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Download,
  MoreVertical,
  Eye,
  Mail,
  CheckCircle,
  XCircle,
  Building2,
  MapPin,
  Users,
  Briefcase,
  Shield,
  ShieldOff,
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['All', 'Verified', 'Pending', 'Rejected'];

export default function AdminRecruiters() {
  const [loading, setLoading] = useState(true);
  const [recruiters, setRecruiters] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchRecruiters();
  }, [selectedStatus, currentPage]);

  const fetchRecruiters = async () => {
    try {
      // Mock data
      const mockRecruiters = [
        { id: 1, company: 'Google', email: 'hr@google.com', location: 'Bangalore', verified: true, jobs: 8, hires: 25 },
        { id: 2, company: 'Microsoft', email: 'recruit@microsoft.com', location: 'Hyderabad', verified: true, jobs: 6, hires: 22 },
        { id: 3, company: 'Amazon', email: 'jobs@amazon.com', location: 'Bangalore', verified: true, jobs: 5, hires: 18 },
        { id: 4, company: 'Flipkart', email: 'careers@flipkart.com', location: 'Bangalore', verified: true, jobs: 4, hires: 15 },
        { id: 5, company: 'Razorpay', email: 'hr@razorpay.com', location: 'Bangalore', verified: true, jobs: 3, hires: 12 },
        { id: 6, company: 'TechCorp', email: 'jobs@techcorp.com', location: 'Mumbai', verified: false, jobs: 2, hires: 0 },
        { id: 7, company: 'StartupXYZ', email: 'hr@startupxyz.com', location: 'Delhi', verified: false, jobs: 1, hires: 0 },
        { id: 8, company: 'Infosys', email: 'careers@infosys.com', location: 'Pune', verified: true, jobs: 7, hires: 35 },
      ];
      setRecruiters(mockRecruiters);
      setTotalPages(2);
    } catch (error) {
      toast.error('Failed to load recruiters');
    } finally {
      setLoading(false);
    }
  };

  const filteredRecruiters = recruiters.filter(recruiter => {
    const matchesSearch = recruiter.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          recruiter.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'All' ||
                          (selectedStatus === 'Verified' && recruiter.verified) ||
                          (selectedStatus === 'Pending' && !recruiter.verified);
    return matchesSearch && matchesStatus;
  });

  const handleVerify = (id) => {
    toast.success('Company verified successfully');
  };

  const handleReject = (id) => {
    toast.success('Company verification rejected');
  };

  const handleExport = () => {
    toast.success('Exporting recruiters data...');
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
          <h1 className="text-2xl font-heading font-bold text-secondary-900">Recruiters</h1>
          <p className="text-secondary-600">Manage registered companies and recruiters</p>
        </div>
        <button onClick={handleExport} className="btn btn-secondary flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900">{recruiters.length}</p>
              <p className="text-sm text-secondary-600">Total Companies</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success-100 flex items-center justify-center">
              <Shield className="w-5 h-5 text-success-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900">{recruiters.filter(r => r.verified).length}</p>
              <p className="text-sm text-secondary-600">Verified</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning-100 flex items-center justify-center">
              <ShieldOff className="w-5 h-5 text-warning-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900">{recruiters.filter(r => !r.verified).length}</p>
              <p className="text-sm text-secondary-600">Pending Verification</p>
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
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="input"
          >
            {STATUS_OPTIONS.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Recruiters Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Location</th>
                <th>Status</th>
                <th>Jobs Posted</th>
                <th>Total Hires</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecruiters.map((recruiter, index) => (
                <motion.tr
                  key={recruiter.id}
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
                        <p className="font-medium text-secondary-900">{recruiter.company}</p>
                        <p className="text-sm text-secondary-500">{recruiter.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1 text-secondary-600">
                      <MapPin className="w-4 h-4" />
                      {recruiter.location}
                    </div>
                  </td>
                  <td>
                    {recruiter.verified ? (
                      <span className="badge badge-success flex items-center gap-1 w-fit">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </span>
                    ) : (
                      <span className="badge badge-warning flex items-center gap-1 w-fit">
                        <XCircle className="w-3 h-3" />
                        Pending
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4 text-secondary-400" />
                      {recruiter.jobs}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-secondary-400" />
                      {recruiter.hires}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-secondary-100 rounded-lg transition-colors">
                        <Eye className="w-4 h-4 text-secondary-600" />
                      </button>
                      {!recruiter.verified && (
                        <>
                          <button
                            onClick={() => handleVerify(recruiter.id)}
                            className="p-2 hover:bg-success-100 rounded-lg transition-colors"
                          >
                            <CheckCircle className="w-4 h-4 text-success-600" />
                          </button>
                          <button
                            onClick={() => handleReject(recruiter.id)}
                            className="p-2 hover:bg-error-100 rounded-lg transition-colors"
                          >
                            <XCircle className="w-4 h-4 text-error-600" />
                          </button>
                        </>
                      )}
                      <button className="p-2 hover:bg-secondary-100 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4 text-secondary-600" />
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
            Showing {filteredRecruiters.length} of {recruiters.length} companies
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
