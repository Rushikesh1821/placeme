/**
 * Companies Management Page - TPO Module
 * 
 * @description Comprehensive company management with:
 * - Company approval workflow
 * - Partnership management
 * - Hiring statistics
 * - Enable/disable functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Loading, Alert, Badge, Modal } from '../../components';

const INDUSTRIES = [
  'All', 'Technology', 'Finance', 'Consulting', 'Healthcare', 
  'Manufacturing', 'E-commerce', 'Education', 'Other'
];

const VERIFICATION_STATUSES = ['All', 'Pending', 'Verified', 'Rejected'];

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
  Building: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  Globe: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  ),
  Mail: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Phone: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  ToggleOn: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  ),
  ChevronDown: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  Briefcase: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Users: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  )
};

const CompanyCard = ({ company, onView, onApprove, onReject, onToggleStatus }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
  >
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-4">
        {company.companyLogo ? (
          <img src={company.companyLogo} alt={company.companyName} className="w-16 h-16 rounded-lg object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
            <Icons.Building />
          </div>
        )}
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">{company.companyName}</h3>
          <p className="text-sm text-gray-500">{company.industry || 'Industry not specified'}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={
              company.verificationStatus === 'Verified' ? 'success' :
              company.verificationStatus === 'Rejected' ? 'error' : 'warning'
            }>
              {company.verificationStatus || 'Pending'}
            </Badge>
            {!company.isActive && (
              <Badge variant="error">Disabled</Badge>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onView(company)}
          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
          title="View Details"
        >
          <Icons.Eye />
        </button>
        <button
          onClick={() => onToggleStatus(company._id)}
          className={`p-2 rounded-lg ${company.isActive ? 'text-gray-500 hover:text-red-600 hover:bg-red-50' : 'text-gray-500 hover:text-green-600 hover:bg-green-50'}`}
          title={company.isActive ? 'Disable' : 'Enable'}
        >
          <Icons.ToggleOn />
        </button>
      </div>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
      <div className="text-center">
        <p className="text-2xl font-bold text-gray-900">{company.jobsPosted || 0}</p>
        <p className="text-xs text-gray-500">Jobs Posted</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-green-600">{company.totalHires || 0}</p>
        <p className="text-xs text-gray-500">Total Hires</p>
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-500">Registered</p>
        <p className="text-xs text-gray-400">{new Date(company.createdAt).toLocaleDateString()}</p>
      </div>
    </div>

    {/* Contact Info */}
    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
      {company.contact?.email && (
        <span className="flex items-center gap-1">
          <Icons.Mail />
          {company.contact.email}
        </span>
      )}
      {company.website && (
        <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:text-blue-700">
          <Icons.Globe />
          Website
        </a>
      )}
    </div>

    {/* Action Buttons for Pending */}
    {company.verificationStatus === 'Pending' && (
      <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={() => onApprove(company._id)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Icons.Check />
          Approve
        </button>
        <button
          onClick={() => onReject(company._id)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
        >
          <Icons.X />
          Reject
        </button>
      </div>
    )}
  </motion.div>
);

// Company Detail Modal
const CompanyDetailModal = ({ company, isOpen, onClose }) => {
  if (!isOpen || !company) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Company Details" size="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          {company.companyLogo ? (
            <img src={company.companyLogo} alt="" className="w-20 h-20 rounded-lg object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
              <Icons.Building />
            </div>
          )}
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{company.companyName}</h3>
            <p className="text-gray-500">{company.industry}</p>
            <div className="flex gap-2 mt-2">
              <Badge variant={company.verificationStatus === 'Verified' ? 'success' : 'warning'}>
                {company.verificationStatus || 'Pending'}
              </Badge>
              <Badge variant={company.isActive ? 'success' : 'error'}>
                {company.isActive ? 'Active' : 'Disabled'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Description */}
        {company.description && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">About</h4>
            <p className="text-gray-600">{company.description}</p>
          </div>
        )}

        {/* Contact Information */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
            {company.contact?.email && (
              <div className="flex items-center gap-2">
                <Icons.Mail />
                <span className="text-sm">{company.contact.email}</span>
              </div>
            )}
            {company.contact?.phone && (
              <div className="flex items-center gap-2">
                <Icons.Phone />
                <span className="text-sm">{company.contact.phone}</span>
              </div>
            )}
            {company.website && (
              <div className="flex items-center gap-2">
                <Icons.Globe />
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-700">
                  {company.website}
                </a>
              </div>
            )}
            {company.location && (
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="text-sm">{company.location.city}, {company.location.state}</p>
              </div>
            )}
          </div>
        </div>

        {/* Company Stats */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Hiring Statistics</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <Icons.Briefcase />
              <p className="text-2xl font-bold text-blue-600">{company.jobsPosted || 0}</p>
              <p className="text-sm text-gray-600">Jobs Posted</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <Icons.Users />
              <p className="text-2xl font-bold text-green-600">{company.totalHires || 0}</p>
              <p className="text-sm text-gray-600">Total Hires</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg text-center">
              <Icons.Users />
              <p className="text-2xl font-bold text-purple-600">{company.employeeCount || '-'}</p>
              <p className="text-sm text-gray-600">Employees</p>
            </div>
          </div>
        </div>

        {/* Recruiter Info */}
        {company.user && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Recruiter Account</h4>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                {company.user.firstName?.charAt(0) || '?'}
              </div>
              <div>
                <p className="font-medium">{company.user.firstName} {company.user.lastName}</p>
                <p className="text-sm text-gray-500">{company.user.email}</p>
              </div>
              <Badge variant={company.user.isActive ? 'success' : 'error'} className="ml-auto">
                {company.user.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        )}

        {/* Registration Date */}
        <div className="text-sm text-gray-500 pt-4 border-t">
          <p>Registered: {new Date(company.createdAt).toLocaleString()}</p>
          {company.approvedAt && (
            <p>Approved: {new Date(company.approvedAt).toLocaleString()}</p>
          )}
        </div>
      </div>
    </Modal>
  );
};

// Approval Modal
const ApprovalModal = ({ company, isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    remarks: '',
    partnershipType: 'Regular'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(company._id, formData);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Approve Company">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Approving: <span className="font-medium">{company?.companyName}</span>
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Partnership Type
          </label>
          <select
            value={formData.partnershipType}
            onChange={(e) => setFormData({ ...formData, partnershipType: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="Regular">Regular</option>
            <option value="Premium">Premium Partner</option>
            <option value="Gold">Gold Partner</option>
            <option value="Platinum">Platinum Partner</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Remarks (Optional)
          </label>
          <textarea
            rows={3}
            value={formData.remarks}
            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Any notes about this approval..."
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Approve Company
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default function CompaniesManagement() {
  const { user } = useUser();
  const [searchParams] = useSearchParams();

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 0 });

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [industry, setIndustry] = useState(searchParams.get('industry') || 'All');
  const [verificationStatus, setVerificationStatus] = useState(searchParams.get('status') === 'pending' ? 'Pending' : 'All');
  const [showFilters, setShowFilters] = useState(false);

  // Modals
  const [viewCompany, setViewCompany] = useState(null);
  const [approveCompany, setApproveCompany] = useState(null);

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(search && { search }),
        ...(industry !== 'All' && { industry }),
        ...(verificationStatus !== 'All' && { verificationStatus })
      });

      const response = await fetch(`/api/tpo/companies?${params}`, {
        headers: {
          'Authorization': `Bearer ${await user?.getToken()}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch companies');

      const data = await response.json();
      setCompanies(data.data.companies);
      setPagination(prev => ({ ...prev, ...data.data.pagination }));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, industry, verificationStatus, user]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchCompanies();
  };

  const handleApproveSubmit = async (id, data) => {
    try {
      const response = await fetch(`/api/tpo/companies/${id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await user?.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Approval failed');

      setApproveCompany(null);
      fetchCompanies();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      const response = await fetch(`/api/tpo/companies/${id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await user?.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      if (!response.ok) throw new Error('Rejection failed');

      fetchCompanies();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const response = await fetch(`/api/tpo/companies/${id}/toggle-status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await user?.getToken()}`
        }
      });

      if (!response.ok) throw new Error('Toggle failed');

      fetchCompanies();
    } catch (err) {
      alert(err.message);
    }
  };

  const exportToCSV = () => {
    const headers = ['Company Name', 'Industry', 'Email', 'Status', 'Jobs Posted', 'Total Hires', 'Registered'];
    const rows = companies.map(c => [
      c.companyName,
      c.industry || '',
      c.contact?.email || '',
      c.verificationStatus || 'Pending',
      c.jobsPosted || 0,
      c.totalHires || 0,
      new Date(c.createdAt).toLocaleDateString()
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `companies_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading && companies.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading />
      </div>
    );
  }

  // Summary stats
  const pendingCount = companies.filter(c => c.verificationStatus === 'Pending').length;
  const verifiedCount = companies.filter(c => c.verificationStatus === 'Verified').length;
  const totalHires = companies.reduce((sum, c) => sum + (c.totalHires || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Companies Management</h1>
          <p className="text-gray-500">Manage company registrations and partnerships</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          <Icons.Download />
          Export
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Total Companies</p>
          <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Pending Approval</p>
          <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Verified</p>
          <p className="text-2xl font-bold text-green-600">{verifiedCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Total Hires</p>
          <p className="text-2xl font-bold text-blue-600">{totalHires}</p>
        </div>
      </div>

      {/* Search and Filters */}
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
                placeholder="Search by company name or email..."
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {INDUSTRIES.map(i => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={verificationStatus}
                    onChange={(e) => setVerificationStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {VERIFICATION_STATUSES.map(s => (
                      <option key={s} value={s}>{s}</option>
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

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <CompanyCard
            key={company._id}
            company={company}
            onView={setViewCompany}
            onApprove={setApproveCompany}
            onReject={handleReject}
            onToggleStatus={handleToggleStatus}
          />
        ))}
      </div>

      {companies.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Icons.Building />
          <p className="mt-2">No companies found matching your criteria</p>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} companies
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
      <CompanyDetailModal
        company={viewCompany}
        isOpen={!!viewCompany}
        onClose={() => setViewCompany(null)}
      />

      <ApprovalModal
        company={approveCompany}
        isOpen={!!approveCompany}
        onClose={() => setApproveCompany(null)}
        onSubmit={handleApproveSubmit}
      />
    </div>
  );
}
