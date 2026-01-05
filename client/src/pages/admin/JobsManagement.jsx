/**
 * Jobs Management Page - TPO Module
 * 
 * @description Comprehensive job management with:
 * - Job approval workflow
 * - Branch assignment
 * - Application locking
 * - Shortlist generation
 */

import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Loading, Alert, Badge, Modal } from '../../components';

const JOB_STATUSES = ['All', 'Pending Approval', 'Active', 'Applications Closed', 'Completed', 'Cancelled'];
const JOB_TYPES = ['All', 'Full Time', 'Internship', 'Part Time', 'Contract'];
const BRANCHES = [
  'Computer Science', 'Information Technology', 'Electronics', 
  'Electrical', 'Mechanical', 'Civil', 'Chemical'
];

// Icons
const Icons = {
  Search: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Filter: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  ),
  Download: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
  Check: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  X: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Eye: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  Lock: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  Unlock: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
    </svg>
  ),
  Users: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  ),
  Briefcase: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Currency: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Tag: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  ),
  ChevronDown: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  ExternalLink: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  )
};

const getStatusVariant = (status) => {
  switch (status) {
    case 'Active': return 'success';
    case 'Pending Approval': return 'warning';
    case 'Applications Closed': return 'info';
    case 'Completed': return 'default';
    case 'Cancelled': return 'error';
    default: return 'default';
  }
};

const JobCard = ({ job, onView, onApprove, onReject, onLockToggle, onAssignBranches, onExportShortlist }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
  >
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-4">
        {job.company?.companyLogo ? (
          <img src={job.company.companyLogo} alt="" className="w-12 h-12 rounded-lg object-cover" />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
            <Icons.Briefcase />
          </div>
        )}
        <div>
          <h3 className="font-semibold text-gray-900">{job.title}</h3>
          <p className="text-sm text-gray-500">{job.company?.companyName}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={getStatusVariant(job.status)}>{job.status}</Badge>
            <Badge variant="default">{job.jobType}</Badge>
            {job.isApplicationsLocked && (
              <Badge variant="error">
                <Icons.Lock /> Locked
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Job Details */}
    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
      <div className="text-center">
        <div className="flex items-center justify-center gap-1 text-green-600">
          <Icons.Currency />
          <span className="font-bold">₹{((job.package?.ctc || 0) / 100000).toFixed(1)} LPA</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">Package</p>
      </div>
      <div className="text-center">
        <p className="font-bold text-gray-900">{job.vacancies || '-'}</p>
        <p className="text-xs text-gray-500">Vacancies</p>
      </div>
      <div className="text-center">
        <p className="font-bold text-blue-600">{job.applicationStats?.total || 0}</p>
        <p className="text-xs text-gray-500">Applications</p>
      </div>
    </div>

    {/* Application Stats Bar */}
    {job.applicationStats && job.applicationStats.total > 0 && (
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{job.applicationStats.shortlisted || 0} shortlisted</span>
          <span>{job.applicationStats.selected || 0} selected</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full"
            style={{ width: `${(job.applicationStats.shortlisted / job.applicationStats.total) * 100}%` }}
          />
        </div>
      </div>
    )}

    {/* Eligible Branches */}
    <div className="mt-4">
      <p className="text-xs text-gray-500 mb-2">Eligible Branches:</p>
      <div className="flex flex-wrap gap-1">
        {job.eligibility?.branches?.slice(0, 4).map((branch, i) => (
          <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
            {branch.split(' ')[0]}
          </span>
        ))}
        {job.eligibility?.branches?.length > 4 && (
          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
            +{job.eligibility.branches.length - 4} more
          </span>
        )}
      </div>
    </div>

    {/* Deadline */}
    {job.dates?.applicationDeadline && (
      <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
        <Icons.Calendar />
        <span>Deadline: {new Date(job.dates.applicationDeadline).toLocaleDateString()}</span>
      </div>
    )}

    {/* Actions */}
    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
      <button
        onClick={() => onView(job)}
        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
      >
        <Icons.Eye /> View
      </button>
      
      {job.status === 'Pending Approval' && (
        <>
          <button
            onClick={() => onApprove(job._id)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
          >
            <Icons.Check /> Approve
          </button>
          <button
            onClick={() => onReject(job._id)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
          >
            <Icons.X /> Reject
          </button>
        </>
      )}
      
      {job.status === 'Active' && (
        <>
          <button
            onClick={() => onLockToggle(job._id)}
            className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg ${
              job.isApplicationsLocked 
                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
            }`}
          >
            {job.isApplicationsLocked ? <><Icons.Unlock /> Unlock</> : <><Icons.Lock /> Lock</>}
          </button>
          <button
            onClick={() => onAssignBranches(job)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
          >
            <Icons.Tag /> Branches
          </button>
        </>
      )}
      
      {job.applicationStats?.total > 0 && (
        <button
          onClick={() => onExportShortlist(job._id)}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
        >
          <Icons.Download /> Export
        </button>
      )}
    </div>
  </motion.div>
);

// Job Detail Modal
const JobDetailModal = ({ job, isOpen, onClose }) => {
  if (!isOpen || !job) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Job Details" size="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          {job.company?.companyLogo ? (
            <img src={job.company.companyLogo} alt="" className="w-16 h-16 rounded-lg object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
              <Icons.Briefcase />
            </div>
          )}
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
            <p className="text-gray-500">{job.company?.companyName}</p>
            <div className="flex gap-2 mt-2">
              <Badge variant={getStatusVariant(job.status)}>{job.status}</Badge>
              <Badge variant="default">{job.jobType}</Badge>
            </div>
          </div>
        </div>

        {/* Description */}
        {job.description && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Job Description</h4>
            <p className="text-gray-600 whitespace-pre-wrap">{job.description}</p>
          </div>
        )}

        {/* Requirements */}
        {job.requirements && job.requirements.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Requirements</h4>
            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              {job.requirements.map((req, i) => (
                <li key={i}>{req}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Package & Vacancies */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-500">Package (CTC)</p>
            <p className="text-2xl font-bold text-green-600">₹{((job.package?.ctc || 0) / 100000).toFixed(1)} LPA</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-500">Vacancies</p>
            <p className="text-2xl font-bold text-blue-600">{job.vacancies || 'Not specified'}</p>
          </div>
        </div>

        {/* Eligibility */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Eligibility Criteria</h4>
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Minimum CGPA</span>
              <span className="font-medium">{job.eligibility?.minCGPA || 'Not specified'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Backlogs Allowed</span>
              <span className="font-medium">{job.eligibility?.maxBacklogs ?? 'Not specified'}</span>
            </div>
            <div>
              <span className="text-gray-500">Eligible Branches</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {job.eligibility?.branches?.map((branch, i) => (
                  <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded">
                    {branch}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Important Dates */}
        {job.dates && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Important Dates</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Posted On</p>
                <p className="font-medium">{new Date(job.dates.postedAt || job.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Application Deadline</p>
                <p className="font-medium">
                  {job.dates.applicationDeadline 
                    ? new Date(job.dates.applicationDeadline).toLocaleDateString() 
                    : 'Not set'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Application Stats */}
        {job.applicationStats && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Application Statistics</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">{job.applicationStats.total}</p>
                <p className="text-sm text-gray-500">Total</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-yellow-600">{job.applicationStats.shortlisted}</p>
                <p className="text-sm text-gray-500">Shortlisted</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">{job.applicationStats.selected}</p>
                <p className="text-sm text-gray-500">Selected</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

// Branch Assignment Modal
const BranchAssignmentModal = ({ job, isOpen, onClose, onSubmit }) => {
  const [selectedBranches, setSelectedBranches] = useState(job?.eligibility?.branches || []);

  const handleToggle = (branch) => {
    if (selectedBranches.includes(branch)) {
      setSelectedBranches(selectedBranches.filter(b => b !== branch));
    } else {
      setSelectedBranches([...selectedBranches, branch]);
    }
  };

  const handleSubmit = () => {
    onSubmit(job._id, selectedBranches);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Eligible Branches">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Job: <span className="font-medium">{job?.title}</span>
        </p>

        <div className="space-y-2">
          {BRANCHES.map((branch) => (
            <label key={branch} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedBranches.includes(branch)}
                onChange={() => handleToggle(branch)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span>{branch}</span>
            </label>
          ))}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={() => setSelectedBranches(BRANCHES)}
            className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700"
          >
            Select All
          </button>
          <button
            onClick={() => setSelectedBranches([])}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-700"
          >
            Clear All
          </button>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default function JobsManagement() {
  const { user } = useUser();
  const [searchParams] = useSearchParams();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 0 });

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(searchParams.get('status') === 'pending' ? 'Pending Approval' : 'All');
  const [jobType, setJobType] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  // Modals
  const [viewJob, setViewJob] = useState(null);
  const [assignBranchesJob, setAssignBranchesJob] = useState(null);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(search && { search }),
        ...(status !== 'All' && { status }),
        ...(jobType !== 'All' && { jobType })
      });

      const response = await fetch(`/api/tpo/jobs?${params}`, {
        headers: {
          'Authorization': `Bearer ${await user?.getToken()}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch jobs');

      const data = await response.json();
      setJobs(data.data.jobs);
      setPagination(prev => ({ ...prev, ...data.data.pagination }));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, status, jobType, user]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchJobs();
  };

  const handleApprove = async (id) => {
    try {
      const response = await fetch(`/api/tpo/jobs/${id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await user?.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      if (!response.ok) throw new Error('Approval failed');
      fetchJobs();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      const response = await fetch(`/api/tpo/jobs/${id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await user?.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      if (!response.ok) throw new Error('Rejection failed');
      fetchJobs();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLockToggle = async (id) => {
    try {
      const response = await fetch(`/api/tpo/jobs/${id}/lock-applications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await user?.getToken()}`
        }
      });

      if (!response.ok) throw new Error('Toggle failed');
      fetchJobs();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAssignBranches = async (id, branches) => {
    try {
      const response = await fetch(`/api/tpo/jobs/${id}/assign-branches`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await user?.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ branches })
      });

      if (!response.ok) throw new Error('Update failed');
      setAssignBranchesJob(null);
      fetchJobs();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleExportShortlist = async (id) => {
    try {
      const response = await fetch(`/api/tpo/jobs/${id}/shortlist`, {
        headers: {
          'Authorization': `Bearer ${await user?.getToken()}`
        }
      });

      if (!response.ok) throw new Error('Export failed');

      const data = await response.json();
      const candidates = data.data.candidates;

      // Export to CSV
      const headers = ['Name', 'Email', 'Roll Number', 'Branch', 'CGPA', 'Skills', 'AI Score', 'Status'];
      const rows = candidates.map(c => [
        c.name, c.email, c.rollNumber, c.branch, c.cgpa, c.skills, c.aiScore, c.status
      ]);

      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shortlist_job_${id}.csv`;
      a.click();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading />
      </div>
    );
  }

  // Stats
  const pendingCount = jobs.filter(j => j.status === 'Pending Approval').length;
  const activeCount = jobs.filter(j => j.status === 'Active').length;
  const totalApplications = jobs.reduce((sum, j) => sum + (j.applicationStats?.total || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs Management</h1>
          <p className="text-gray-500">Manage job postings, approvals, and applications</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Total Jobs</p>
          <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Pending Approval</p>
          <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Active Jobs</p>
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Total Applications</p>
          <p className="text-2xl font-bold text-blue-600">{totalApplications}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <Card>
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center">
                <Icons.Search />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search jobs..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Icons.Filter />
            Filters
            <Icons.ChevronDown />
          </button>

          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Search
          </button>
        </form>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {JOB_STATUSES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {JOB_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {error && (
        <Alert variant="error">{error}</Alert>
      )}

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <JobCard
            key={job._id}
            job={job}
            onView={setViewJob}
            onApprove={handleApprove}
            onReject={handleReject}
            onLockToggle={handleLockToggle}
            onAssignBranches={setAssignBranchesJob}
            onExportShortlist={handleExportShortlist}
          />
        ))}
      </div>

      {jobs.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Icons.Briefcase />
          <p className="mt-2">No jobs found matching your criteria</p>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} jobs
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <JobDetailModal
        job={viewJob}
        isOpen={!!viewJob}
        onClose={() => setViewJob(null)}
      />

      <BranchAssignmentModal
        job={assignBranchesJob}
        isOpen={!!assignBranchesJob}
        onClose={() => setAssignBranchesJob(null)}
        onSubmit={handleAssignBranches}
      />
    </div>
  );
}
