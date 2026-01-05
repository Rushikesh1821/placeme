/**
 * Activity Logs Page - TPO Module
 * 
 * @description System audit trail viewer with:
 * - Comprehensive action logging
 * - Advanced filtering
 * - Export capability
 */

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Loading, Alert, Badge } from '../../components';

const ACTION_TYPES = [
  'All',
  'USER_CREATED', 'USER_BLOCKED', 'USER_UNBLOCKED',
  'STUDENT_APPROVED', 'STUDENT_REJECTED',
  'COMPANY_APPROVED', 'COMPANY_REJECTED',
  'JOB_APPROVED', 'JOB_REJECTED',
  'ELIGIBILITY_OVERRIDE', 'APPLICATION_STATUS_UPDATED',
  'PLACEMENT_CONFIRMED', 'SETTINGS_UPDATED',
  'DRIVE_CREATED', 'DRIVE_STARTED', 'DRIVE_COMPLETED'
];

const CATEGORIES = ['All', 'STUDENT_MANAGEMENT', 'COMPANY_MANAGEMENT', 'JOB_MANAGEMENT', 'APPLICATION_MANAGEMENT', 'PLACEMENT_DRIVE', 'SYSTEM'];
const SEVERITIES = ['All', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'];

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
  Clock: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  User: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  ChevronDown: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Refresh: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  )
};

const getActionColor = (action) => {
  if (action.includes('APPROVED') || action.includes('CREATED') || action.includes('CONFIRMED')) {
    return 'bg-green-100 text-green-700 border-green-200';
  }
  if (action.includes('REJECTED') || action.includes('BLOCKED') || action.includes('CANCELLED')) {
    return 'bg-red-100 text-red-700 border-red-200';
  }
  if (action.includes('OVERRIDE') || action.includes('WARNING')) {
    return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  }
  if (action.includes('UPDATED') || action.includes('STARTED') || action.includes('COMPLETED')) {
    return 'bg-blue-100 text-blue-700 border-blue-200';
  }
  return 'bg-gray-100 text-gray-700 border-gray-200';
};

const getSeverityColor = (severity) => {
  switch (severity) {
    case 'ERROR': return 'error';
    case 'WARNING': return 'warning';
    case 'CRITICAL': return 'error';
    default: return 'default';
  }
};

const ActivityLogItem = ({ log }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
  >
    <div className={`p-2 rounded-lg ${getActionColor(log.action)}`}>
      <Icons.Clock />
    </div>
    
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`px-2 py-0.5 text-xs font-medium rounded border ${getActionColor(log.action)}`}>
          {log.action.replace(/_/g, ' ')}
        </span>
        <Badge variant={getSeverityColor(log.severity)}>
          {log.severity}
        </Badge>
        <span className="text-xs text-gray-400">{log.category}</span>
      </div>
      
      <p className="text-gray-900 mt-2">{log.description}</p>
      
      {log.metadata && Object.keys(log.metadata).length > 0 && (
        <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
          <pre className="text-xs text-gray-600 whitespace-pre-wrap">
            {JSON.stringify(log.metadata, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <Icons.User />
          {log.performedBy?.firstName || 'System'} {log.performedBy?.lastName || ''}
          {log.performedBy?.role && (
            <span className="text-xs text-gray-400">({log.performedBy.role})</span>
          )}
        </span>
        <span className="flex items-center gap-1">
          <Icons.Clock />
          {new Date(log.createdAt).toLocaleString()}
        </span>
      </div>
    </div>
  </motion.div>
);

export default function ActivityLogs() {
  const { user } = useUser();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 0 });

  // Filters
  const [action, setAction] = useState('All');
  const [category, setCategory] = useState('All');
  const [severity, setSeverity] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(action !== 'All' && { action }),
        ...(category !== 'All' && { category }),
        ...(severity !== 'All' && { severity }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      });

      const response = await fetch(`/api/tpo/activity-logs?${params}`, {
        headers: {
          'Authorization': `Bearer ${await user?.getToken()}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch activity logs');

      const data = await response.json();
      setLogs(data.data.logs);
      setPagination(prev => ({ ...prev, ...data.data.pagination }));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, action, category, severity, startDate, endDate, user]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchLogs();
  };

  const handleClearFilters = () => {
    setAction('All');
    setCategory('All');
    setSeverity('All');
    setStartDate('');
    setEndDate('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const exportLogs = () => {
    const headers = ['Timestamp', 'Action', 'Category', 'Severity', 'Description', 'Performed By'];
    const rows = logs.map(log => [
      new Date(log.createdAt).toISOString(),
      log.action,
      log.category,
      log.severity,
      log.description,
      `${log.performedBy?.firstName || ''} ${log.performedBy?.lastName || ''}`
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Stats
  const todayLogs = logs.filter(log => {
    const logDate = new Date(log.createdAt).toDateString();
    const today = new Date().toDateString();
    return logDate === today;
  }).length;

  if (loading && logs.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
          <p className="text-gray-500">View system audit trail and admin actions</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchLogs}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <Icons.Refresh />
            Refresh
          </button>
          <button
            onClick={exportLogs}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Icons.Download />
            Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Total Logs</p>
          <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Today's Activity</p>
          <p className="text-2xl font-bold text-blue-600">{todayLogs}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Warnings</p>
          <p className="text-2xl font-bold text-yellow-600">
            {logs.filter(l => l.severity === 'WARNING').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Errors</p>
          <p className="text-2xl font-bold text-red-600">
            {logs.filter(l => l.severity === 'ERROR' || l.severity === 'CRITICAL').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-wrap gap-4">
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
              Apply Filters
            </button>

            <button
              type="button"
              onClick={handleClearFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Clear Filters
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
                    <select
                      value={action}
                      onChange={(e) => setAction(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      {ACTION_TYPES.map(a => (
                        <option key={a} value={a}>{a === 'All' ? 'All Actions' : a.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>{c === 'All' ? 'All Categories' : c.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                    <select
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      {SEVERITIES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </Card>

      {error && <Alert variant="error">{error}</Alert>}

      {/* Activity Log List */}
      <div className="space-y-4">
        {logs.map((log, index) => (
          <ActivityLogItem key={log._id || index} log={log} />
        ))}
      </div>

      {logs.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Icons.Clock />
          <p className="mt-2">No activity logs found matching your criteria</p>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} logs
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-gray-600">
              Page {pagination.page} of {pagination.pages}
            </span>
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
    </div>
  );
}
