/**
 * Students Management Page - TPO Module
 * 
 * @description Comprehensive student management with:
 * - Advanced filtering and search
 * - Verification/approval workflow
 * - Eligibility override functionality
 * - Placement status updates
 * - Bulk operations
 * - Export capability
 */

import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Loading, Alert, Badge, Modal } from '../../components';

// Branch options
const BRANCHES = [
  'All',
  'Computer Science',
  'Information Technology',
  'Electronics',
  'Electrical',
  'Mechanical',
  'Civil',
  'Chemical'
];

const PLACEMENT_STATUSES = ['All', 'Not Placed', 'Placed', 'Not Interested'];
const BATCH_YEARS = ['2024', '2025', '2026', '2027'];

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
  Edit: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  Ban: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
  ),
  Override: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  ChevronDown: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
};

const StudentRow = ({ student, selected, onSelect, onView, onVerify, onReject, onOverride, onUpdatePlacement, onBlock }) => (
  <motion.tr
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="border-b border-gray-100 hover:bg-gray-50"
  >
    <td className="py-4 px-4">
      <input
        type="checkbox"
        checked={selected}
        onChange={(e) => onSelect(student._id, e.target.checked)}
        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
    </td>
    <td className="py-4 px-4">
      <div className="flex items-center gap-3">
        {student.user?.profileImage ? (
          <img src={student.user.profileImage} alt="" className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
            {student.user?.firstName?.charAt(0) || '?'}
          </div>
        )}
        <div>
          <p className="font-medium text-gray-900">
            {student.user?.firstName} {student.user?.lastName}
          </p>
          <p className="text-sm text-gray-500">{student.user?.email}</p>
        </div>
      </div>
    </td>
    <td className="py-4 px-4">
      <p className="text-sm text-gray-900">{student.academicInfo?.rollNumber || '-'}</p>
      <p className="text-xs text-gray-500">{student.academicInfo?.batch || '-'}</p>
    </td>
    <td className="py-4 px-4">
      <p className="text-sm text-gray-900">{student.academicInfo?.branch || '-'}</p>
    </td>
    <td className="py-4 px-4">
      <p className="text-sm font-medium text-gray-900">{student.academicInfo?.cgpa?.toFixed(2) || '-'}</p>
    </td>
    <td className="py-4 px-4">
      <Badge variant={student.isVerified ? 'success' : 'warning'}>
        {student.isVerified ? 'Verified' : 'Pending'}
      </Badge>
    </td>
    <td className="py-4 px-4">
      <Badge variant={
        student.placementStatus === 'Placed' ? 'success' :
        student.placementStatus === 'Not Interested' ? 'default' : 'warning'
      }>
        {student.placementStatus}
      </Badge>
      {student.placedCompany && (
        <p className="text-xs text-gray-500 mt-1">{student.placedCompany}</p>
      )}
    </td>
    <td className="py-4 px-4">
      {student.eligibilityOverride?.isOverridden && (
        <Badge variant="info">Override Active</Badge>
      )}
    </td>
    <td className="py-4 px-4">
      <div className="flex items-center gap-1">
        <button
          onClick={() => onView(student)}
          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
          title="View Details"
        >
          <Icons.Eye />
        </button>
        {!student.isVerified && (
          <>
            <button
              onClick={() => onVerify(student._id)}
              className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg"
              title="Verify"
            >
              <Icons.Check />
            </button>
            <button
              onClick={() => onReject(student._id)}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
              title="Reject"
            >
              <Icons.X />
            </button>
          </>
        )}
        <button
          onClick={() => onOverride(student)}
          className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
          title="Override Eligibility"
        >
          <Icons.Override />
        </button>
        <button
          onClick={() => onUpdatePlacement(student)}
          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
          title="Update Placement"
        >
          <Icons.Edit />
        </button>
        <button
          onClick={() => onBlock(student._id)}
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
          title="Block Student"
        >
          <Icons.Ban />
        </button>
      </div>
    </td>
  </motion.tr>
);

// Override Modal Component
const OverrideModal = ({ student, isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    isEligible: true,
    reason: '',
    newScore: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(student._id, formData);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Override Eligibility">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">
            Student: <span className="font-medium">{student?.user?.firstName} {student?.user?.lastName}</span>
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Eligibility Status
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={formData.isEligible}
                onChange={() => setFormData({ ...formData, isEligible: true })}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">Mark Eligible</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={!formData.isEligible}
                onChange={() => setFormData({ ...formData, isEligible: false })}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">Mark Ineligible</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Eligibility Score (Optional)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={formData.newScore}
            onChange={(e) => setFormData({ ...formData, newScore: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason for Override *
          </label>
          <textarea
            required
            rows={3}
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Provide justification for this override..."
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
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Apply Override
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Placement Update Modal
const PlacementModal = ({ student, isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    status: student?.placementStatus || 'Not Placed',
    companyId: '',
    package: '',
    remarks: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(student._id, formData);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Placement Status">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Placement Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="Not Placed">Not Placed</option>
            <option value="Placed">Placed</option>
            <option value="Not Interested">Not Interested</option>
          </select>
        </div>

        {formData.status === 'Placed' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Package (LPA)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.package}
                onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 8.5"
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Remarks
          </label>
          <textarea
            rows={2}
            value={formData.remarks}
            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Update Status
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Student Detail Modal
const StudentDetailModal = ({ student, isOpen, onClose }) => {
  if (!isOpen || !student) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Student Details" size="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          {student.user?.profileImage ? (
            <img src={student.user.profileImage} alt="" className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-medium">
              {student.user?.firstName?.charAt(0) || '?'}
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {student.user?.firstName} {student.user?.lastName}
            </h3>
            <p className="text-gray-500">{student.user?.email}</p>
            <div className="flex gap-2 mt-2">
              <Badge variant={student.isVerified ? 'success' : 'warning'}>
                {student.isVerified ? 'Verified' : 'Pending Verification'}
              </Badge>
              <Badge variant={student.placementStatus === 'Placed' ? 'success' : 'default'}>
                {student.placementStatus}
              </Badge>
            </div>
          </div>
        </div>

        {/* Academic Info */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Academic Information</h4>
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <p className="text-sm text-gray-500">Roll Number</p>
              <p className="font-medium">{student.academicInfo?.rollNumber || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Branch</p>
              <p className="font-medium">{student.academicInfo?.branch || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Batch</p>
              <p className="font-medium">{student.academicInfo?.batch || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">CGPA</p>
              <p className="font-medium">{student.academicInfo?.cgpa?.toFixed(2) || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">10th %</p>
              <p className="font-medium">{student.academicInfo?.tenthPercentage || '-'}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">12th %</p>
              <p className="font-medium">{student.academicInfo?.twelfthPercentage || '-'}%</p>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Skills</h4>
          <div className="flex flex-wrap gap-2">
            {student.skills?.technical?.map((skill, index) => (
              <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                {skill}
              </span>
            ))}
            {(!student.skills?.technical || student.skills.technical.length === 0) && (
              <p className="text-gray-500 text-sm">No skills listed</p>
            )}
          </div>
        </div>

        {/* Resume */}
        {student.resume && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Resume</h4>
            <a
              href={student.resume.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm"
            >
              <Icons.Download />
              Download Resume
            </a>
          </div>
        )}

        {/* Eligibility Override Info */}
        {student.eligibilityOverride?.isOverridden && (
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="font-medium text-purple-900 mb-2">Eligibility Override Active</h4>
            <p className="text-sm text-purple-700">
              Status: {student.eligibilityOverride.isEligible ? 'Made Eligible' : 'Made Ineligible'}
            </p>
            <p className="text-sm text-purple-700">
              Reason: {student.eligibilityOverride.reason}
            </p>
            <p className="text-xs text-purple-600 mt-2">
              Overridden at: {new Date(student.eligibilityOverride.overriddenAt).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default function StudentsManagement() {
  const { user } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  
  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [branch, setBranch] = useState(searchParams.get('branch') || 'All');
  const [batch, setBatch] = useState(searchParams.get('batch') || '');
  const [placementStatus, setPlacementStatus] = useState(searchParams.get('status') || 'All');
  const [isVerified, setIsVerified] = useState(searchParams.get('verified') || '');
  const [showFilters, setShowFilters] = useState(false);
  
  // Selection
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Modals
  const [viewStudent, setViewStudent] = useState(null);
  const [overrideStudent, setOverrideStudent] = useState(null);
  const [placementStudent, setPlacementStudent] = useState(null);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(search && { search }),
        ...(branch !== 'All' && { branch }),
        ...(batch && { batch }),
        ...(placementStatus !== 'All' && { placementStatus }),
        ...(isVerified && { isVerified })
      });

      const response = await fetch(`/api/tpo/students?${params}`, {
        headers: {
          'Authorization': `Bearer ${await user?.getToken()}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch students');

      const data = await response.json();
      setStudents(data.data.students);
      setPagination(prev => ({ ...prev, ...data.data.pagination }));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, branch, batch, placementStatus, isVerified, user]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchStudents();
  };

  const handleSelect = (id, checked) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(i => i !== id));
    }
  };

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedIds(students.map(s => s._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleVerify = async (id) => {
    try {
      const response = await fetch(`/api/tpo/students/${id}/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await user?.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      if (!response.ok) throw new Error('Verification failed');
      
      fetchStudents();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      const response = await fetch(`/api/tpo/students/${id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await user?.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      if (!response.ok) throw new Error('Rejection failed');
      
      fetchStudents();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleOverrideSubmit = async (id, data) => {
    try {
      const response = await fetch(`/api/tpo/students/${id}/override-eligibility`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await user?.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Override failed');
      
      setOverrideStudent(null);
      fetchStudents();
    } catch (err) {
      alert(err.message);
    }
  };

  const handlePlacementSubmit = async (id, data) => {
    try {
      const response = await fetch(`/api/tpo/students/${id}/update-placement`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await user?.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Update failed');
      
      setPlacementStudent(null);
      fetchStudents();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleBlock = async (id) => {
    if (!confirm('Are you sure you want to block this student?')) return;

    try {
      const response = await fetch(`/api/tpo/students/${id}/block`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await user?.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: 'Blocked by TPO' })
      });

      if (!response.ok) throw new Error('Block failed');
      
      fetchStudents();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleBulkVerify = async () => {
    if (selectedIds.length === 0) {
      alert('Please select students to verify');
      return;
    }

    try {
      const response = await fetch('/api/tpo/students/bulk-verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await user?.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ studentIds: selectedIds })
      });

      if (!response.ok) throw new Error('Bulk verification failed');
      
      setSelectedIds([]);
      setSelectAll(false);
      fetchStudents();
    } catch (err) {
      alert(err.message);
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Roll Number', 'Branch', 'CGPA', 'Status', 'Placement'];
    const rows = students.map(s => [
      `${s.user?.firstName || ''} ${s.user?.lastName || ''}`,
      s.user?.email || '',
      s.academicInfo?.rollNumber || '',
      s.academicInfo?.branch || '',
      s.academicInfo?.cgpa || '',
      s.isVerified ? 'Verified' : 'Pending',
      s.placementStatus
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading && students.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students Management</h1>
          <p className="text-gray-500">Manage student profiles, verification, and eligibility</p>
        </div>
        <div className="flex gap-3">
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkVerify}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Icons.Check />
              Verify Selected ({selectedIds.length})
            </button>
          )}
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            <Icons.Download />
            Export
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Icons.Search />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, or roll number..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {BRANCHES.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                  <select
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">All Batches</option>
                    {BATCH_YEARS.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Placement Status</label>
                  <select
                    value={placementStatus}
                    onChange={(e) => setPlacementStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {PLACEMENT_STATUSES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Verification</label>
                  <select
                    value={isVerified}
                    onChange={(e) => setIsVerified(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">All</option>
                    <option value="true">Verified</option>
                    <option value="false">Pending</option>
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

      {/* Students Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600"
                  />
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Student</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Roll No / Batch</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Branch</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">CGPA</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Placement</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Override</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <StudentRow
                  key={student._id}
                  student={student}
                  selected={selectedIds.includes(student._id)}
                  onSelect={handleSelect}
                  onView={setViewStudent}
                  onVerify={handleVerify}
                  onReject={handleReject}
                  onOverride={setOverrideStudent}
                  onUpdatePlacement={setPlacementStudent}
                  onBlock={handleBlock}
                />
              ))}
            </tbody>
          </table>

          {students.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No students found matching your criteria
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} students
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setPagination(prev => ({ ...prev, page }))}
                    className={`px-3 py-1 rounded-lg ${pagination.page === page ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}
                  >
                    {page}
                  </button>
                );
              })}
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
      </Card>

      {/* Modals */}
      <StudentDetailModal
        student={viewStudent}
        isOpen={!!viewStudent}
        onClose={() => setViewStudent(null)}
      />

      <OverrideModal
        student={overrideStudent}
        isOpen={!!overrideStudent}
        onClose={() => setOverrideStudent(null)}
        onSubmit={handleOverrideSubmit}
      />

      <PlacementModal
        student={placementStudent}
        isOpen={!!placementStudent}
        onClose={() => setPlacementStudent(null)}
        onSubmit={handlePlacementSubmit}
      />
    </div>
  );
}
