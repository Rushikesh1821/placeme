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
  GraduationCap,
  Building2,
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const BRANCHES = ['All', 'CSE', 'IT', 'ECE', 'EE', 'ME', 'CE', 'Other'];
const STATUS_OPTIONS = ['All', 'Placed', 'Not Placed', 'Active', 'Inactive'];

export default function AdminStudents() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchStudents();
  }, [selectedBranch, selectedStatus, currentPage]);

  const fetchStudents = async () => {
    try {
      // Mock data for demonstration
      const mockStudents = [
        { id: 1, name: 'Rahul Sharma', email: 'rahul@example.com', branch: 'CSE', cgpa: 8.5, placed: true, company: 'Google', package: '28 LPA' },
        { id: 2, name: 'Priya Patel', email: 'priya@example.com', branch: 'IT', cgpa: 8.2, placed: true, company: 'Microsoft', package: '24 LPA' },
        { id: 3, name: 'Amit Kumar', email: 'amit@example.com', branch: 'ECE', cgpa: 7.8, placed: false, company: null, package: null },
        { id: 4, name: 'Sneha Singh', email: 'sneha@example.com', branch: 'CSE', cgpa: 9.1, placed: true, company: 'Amazon', package: '22 LPA' },
        { id: 5, name: 'Vikram Rao', email: 'vikram@example.com', branch: 'ME', cgpa: 7.5, placed: false, company: null, package: null },
        { id: 6, name: 'Anjali Verma', email: 'anjali@example.com', branch: 'CSE', cgpa: 8.8, placed: true, company: 'Flipkart', package: '18 LPA' },
        { id: 7, name: 'Karthik Reddy', email: 'karthik@example.com', branch: 'IT', cgpa: 7.9, placed: false, company: null, package: null },
        { id: 8, name: 'Neha Gupta', email: 'neha@example.com', branch: 'ECE', cgpa: 8.3, placed: true, company: 'Infosys', package: '8 LPA' },
      ];
      setStudents(mockStudents);
      setTotalPages(3);
    } catch (error) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          student.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBranch = selectedBranch === 'All' || student.branch === selectedBranch;
    const matchesStatus = selectedStatus === 'All' ||
                          (selectedStatus === 'Placed' && student.placed) ||
                          (selectedStatus === 'Not Placed' && !student.placed);
    return matchesSearch && matchesBranch && matchesStatus;
  });

  const handleExport = () => {
    toast.success('Exporting students data...');
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
          <h1 className="text-2xl font-heading font-bold text-secondary-900">Students</h1>
          <p className="text-secondary-600">Manage all registered students</p>
        </div>
        <button onClick={handleExport} className="btn btn-secondary flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="input"
            >
              {BRANCHES.map(branch => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
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
      </div>

      {/* Students Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Branch</th>
                <th>CGPA</th>
                <th>Status</th>
                <th>Company</th>
                <th>Package</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, index) => (
                <motion.tr
                  key={student.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-600 font-semibold">
                          {student.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-secondary-900">{student.name}</p>
                        <p className="text-sm text-secondary-500">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-secondary">{student.branch}</span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <GraduationCap className="w-4 h-4 text-secondary-400" />
                      {student.cgpa}
                    </div>
                  </td>
                  <td>
                    {student.placed ? (
                      <span className="badge badge-success flex items-center gap-1 w-fit">
                        <CheckCircle className="w-3 h-3" />
                        Placed
                      </span>
                    ) : (
                      <span className="badge badge-warning flex items-center gap-1 w-fit">
                        <XCircle className="w-3 h-3" />
                        Not Placed
                      </span>
                    )}
                  </td>
                  <td>
                    {student.company ? (
                      <div className="flex items-center gap-1">
                        <Building2 className="w-4 h-4 text-secondary-400" />
                        {student.company}
                      </div>
                    ) : (
                      <span className="text-secondary-400">-</span>
                    )}
                  </td>
                  <td>
                    {student.package ? (
                      <span className="font-semibold text-success-600">{student.package}</span>
                    ) : (
                      <span className="text-secondary-400">-</span>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-secondary-100 rounded-lg transition-colors">
                        <Eye className="w-4 h-4 text-secondary-600" />
                      </button>
                      <button className="p-2 hover:bg-secondary-100 rounded-lg transition-colors">
                        <Mail className="w-4 h-4 text-secondary-600" />
                      </button>
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
            Showing {filteredStudents.length} of {students.length} students
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
