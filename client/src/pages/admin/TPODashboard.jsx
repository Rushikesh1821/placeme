/**
 * TPO Dashboard - Comprehensive Admin Dashboard
 * 
 * @description Main dashboard for Training & Placement Officer with:
 * - Real-time statistics and KPIs
 * - Pending approvals overview
 * - Branch-wise placement analytics
 * - Recent activity log
 * - Quick actions
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, AreaChart, Area
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Loading, Alert, Badge } from '../../components';

// Icons from heroicons (inline SVG)
const Icons = {
  Users: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  ),
  Building: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  Briefcase: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Document: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  CheckCircle: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  TrendingUp: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  Award: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  ArrowRight: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  Refresh: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  )
};

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

const StatCard = ({ title, value, subtitle, icon: Icon, color, trend, link }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
        {trend && (
          <div className={`flex items-center gap-1 mt-2 text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            <Icons.TrendingUp />
            <span>{trend > 0 ? '+' : ''}{trend}% from last month</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon />
      </div>
    </div>
    {link && (
      <Link to={link} className="mt-4 text-blue-600 text-sm font-medium flex items-center gap-1 hover:text-blue-700">
        View Details <Icons.ArrowRight />
      </Link>
    )}
  </motion.div>
);

const PendingApprovalCard = ({ title, count, items, type, onApprove, onReject }) => (
  <Card className="h-full">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <Badge variant={count > 0 ? 'warning' : 'success'}>
        {count} Pending
      </Badge>
    </div>
    {items.length > 0 ? (
      <div className="space-y-3">
        {items.slice(0, 5).map((item, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {item.image ? (
                <img src={item.image} alt="" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                  {item.name?.charAt(0) || '?'}
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">{item.name}</p>
                <p className="text-sm text-gray-500">{item.subtitle}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onApprove(item.id, type)}
                className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => onReject(item.id, type)}
                className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
        {items.length > 5 && (
          <Link 
            to={`/admin/${type}?status=pending`} 
            className="block text-center text-blue-600 text-sm font-medium hover:text-blue-700 mt-2"
          >
            View all {items.length} pending
          </Link>
        )}
      </div>
    ) : (
      <div className="text-center py-8 text-gray-500">
        <Icons.CheckCircle />
        <p className="mt-2">All {title.toLowerCase()} approved</p>
      </div>
    )}
  </Card>
);

const ActivityItem = ({ activity }) => {
  const getActionColor = (action) => {
    if (action.includes('APPROVED') || action.includes('CREATED')) return 'text-green-600 bg-green-100';
    if (action.includes('REJECTED') || action.includes('BLOCKED')) return 'text-red-600 bg-red-100';
    if (action.includes('UPDATED') || action.includes('OVERRIDE')) return 'text-blue-600 bg-blue-100';
    return 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className={`p-2 rounded-lg ${getActionColor(activity.action)}`}>
        <Icons.Clock />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">{activity.description}</p>
        <p className="text-xs text-gray-500 mt-1">
          by {activity.performedBy?.firstName || 'System'} {activity.performedBy?.lastName || ''} • {new Date(activity.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default function TPODashboard() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async () => {
    try {
      setRefreshing(true);

      // DEV fallback conditions: if running locally and dev role or devUser is present, prefer mock data
      const devMode = import.meta.env.DEV;
      const isDevAdmin = localStorage.getItem('userRole') === 'ADMIN' || localStorage.getItem('devUser');

      if (devMode && isDevAdmin) {
        // lightweight mock data used only in dev
        const mockData = {
          overview: {
            students: { total: 240, verified: 200, placementRate: 82, placed: 197 },
            companies: { total: 46, approved: 42 },
            jobs: { active: 38, total: 52 },
            pendingApprovals: { students: 3, companies: 1, jobs: 2, total: 6 }
          },
          packages: { maxPackage: 4500000, avgPackage: 850000, totalOffers: 312 },
          branchWisePlacement: [
            { branch: 'CSE', total: 75, placed: 65 },
            { branch: 'IT', total: 55, placed: 45 },
            { branch: 'ECE', total: 50, placed: 38 }
          ],
          applicationDistribution: [ { _id: 'Applied', count: 520 }, { _id: 'Selected', count: 120 }, { _id: 'Offer Accepted', count: 80 } ],
          recentActivity: [
            { action: 'STUDENT_APPROVED', description: 'Approved student Alice', performedBy: { firstName: 'Dev' }, createdAt: new Date().toISOString() },
            { action: 'COMPANY_APPROVED', description: 'Approved company Acme Corp', performedBy: { firstName: 'Dev' }, createdAt: new Date().toISOString() }
          ],
          activeDrives: [
            { title: 'Winter Drive 2025', schedule: { date: new Date().toISOString() }, status: 'Ongoing', stats: { registeredStudents: 120, companiesParticipating: 12 } }
          ]
        };

        setDashboardData(mockData);
        setError(null);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Normal flow: attempt to fetch from backend
      const response = await fetch('/api/tpo/dashboard', {
        headers: {
          'Authorization': `Bearer ${await user?.getToken()}`
        }
      });

      if (!response.ok) {
        // In dev, fallback to mock data if backend fails
        if (devMode) {
          console.warn('TPO dashboard API failed — falling back to dev mock data');
          const fallback = {
            overview: {
              students: { total: 240, verified: 200, placementRate: 82, placed: 197 },
              companies: { total: 46, approved: 42 },
              jobs: { active: 38, total: 52 },
              pendingApprovals: { students: 3, companies: 1, jobs: 2, total: 6 }
            },
            packages: { maxPackage: 4500000, avgPackage: 850000, totalOffers: 312 },
            branchWisePlacement: [
              { branch: 'CSE', total: 75, placed: 65 },
              { branch: 'IT', total: 55, placed: 45 },
              { branch: 'ECE', total: 50, placed: 38 }
            ],
            applicationDistribution: [ { _id: 'Applied', count: 520 }, { _id: 'Selected', count: 120 }, { _id: 'Offer Accepted', count: 80 } ],
            recentActivity: [
              { action: 'STUDENT_APPROVED', description: 'Approved student Alice', performedBy: { firstName: 'Dev' }, createdAt: new Date().toISOString() }
            ],
            activeDrives: []
          };

          setDashboardData(fallback);
          setError(null);
          return;
        }

        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      setDashboardData(data.data);
      setError(null);
    } catch (err) {
      // If still in dev and we have a dev admin, fallback to mock data
      if (import.meta.env.DEV && (localStorage.getItem('userRole') === 'ADMIN' || localStorage.getItem('devUser'))) {
        console.warn('Error fetching dashboard, using dev mock:', err);
        setDashboardData({
          overview: { students: { total: 240, verified: 200, placementRate: 82, placed: 197 }, companies: { total: 46, approved: 42 }, jobs: { active: 38, total: 52 }, pendingApprovals: { students: 3, companies: 1, jobs: 2, total: 6 } },
          packages: { maxPackage: 4500000, avgPackage: 850000, totalOffers: 312 },
          branchWisePlacement: [ { branch: 'CSE', total: 75, placed: 65 }, { branch: 'IT', total: 55, placed: 45 } ],
          applicationDistribution: [ { _id: 'Applied', count: 520 } ],
          recentActivity: [],
          activeDrives: []
        });
        setError(null);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    // Auto refresh every 5 minutes
    const interval = setInterval(fetchDashboard, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (id, type) => {
    try {
      const endpoint = type === 'students' ? `/api/tpo/students/${id}/verify` :
                       type === 'companies' ? `/api/tpo/companies/${id}/approve` :
                       `/api/tpo/jobs/${id}/approve`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await user?.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      if (!response.ok) throw new Error('Approval failed');
      
      fetchDashboard(); // Refresh data
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReject = async (id, type) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      const endpoint = type === 'students' ? `/api/tpo/students/${id}/reject` :
                       type === 'companies' ? `/api/tpo/companies/${id}/reject` :
                       `/api/tpo/jobs/${id}/reject`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await user?.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      if (!response.ok) throw new Error('Rejection failed');
      
      fetchDashboard();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error" title="Error loading dashboard">
        {error}
        <button 
          onClick={fetchDashboard} 
          className="mt-2 text-red-700 underline"
        >
          Try again
        </button>
      </Alert>
    );
  }

  const { overview, packages, branchWisePlacement, applicationDistribution, recentActivity, activeDrives } = dashboardData || {};

  // Mock pending data - would come from API
  const pendingStudents = [];
  const pendingCompanies = [];
  const pendingJobs = [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">TPO Dashboard</h1>
          <p className="text-gray-500">Welcome back, {user?.firstName || 'Admin'}!</p>
        </div>
        <button
          onClick={fetchDashboard}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <motion.div animate={{ rotate: refreshing ? 360 : 0 }} transition={{ duration: 1, repeat: refreshing ? Infinity : 0 }}>
            <Icons.Refresh />
          </motion.div>
          Refresh
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={overview?.students?.total || 0}
          subtitle={`${overview?.students?.verified || 0} verified`}
          icon={Icons.Users}
          color="bg-blue-100 text-blue-600"
          link="/admin/students"
        />
        <StatCard
          title="Companies"
          value={overview?.companies?.total || 0}
          subtitle={`${overview?.companies?.approved || 0} approved`}
          icon={Icons.Building}
          color="bg-green-100 text-green-600"
          link="/admin/companies"
        />
        <StatCard
          title="Active Jobs"
          value={overview?.jobs?.active || 0}
          subtitle={`${overview?.jobs?.total || 0} total jobs`}
          icon={Icons.Briefcase}
          color="bg-purple-100 text-purple-600"
          link="/admin/jobs"
        />
        <StatCard
          title="Placement Rate"
          value={`${overview?.students?.placementRate || 0}%`}
          subtitle={`${overview?.students?.placed || 0} placed students`}
          icon={Icons.Award}
          color="bg-yellow-100 text-yellow-600"
          link="/admin/analytics"
        />
      </div>

      {/* Package Stats & Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Package Statistics */}
        <Card className="lg:col-span-1">
          <h3 className="font-semibold text-gray-900 mb-4">Package Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Highest Package</p>
                <p className="text-xl font-bold text-green-700">₹{((packages?.maxPackage || 0) / 100000).toFixed(1)} LPA</p>
              </div>
              <Icons.TrendingUp />
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Average Package</p>
                <p className="text-xl font-bold text-blue-700">₹{((packages?.avgPackage || 0) / 100000).toFixed(1)} LPA</p>
              </div>
              <Icons.TrendingUp />
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Total Offers</p>
                <p className="text-xl font-bold text-purple-700">{packages?.totalOffers || 0}</p>
              </div>
              <Icons.Award />
            </div>
          </div>
        </Card>

        {/* Pending Approvals Summary */}
        <Card className="lg:col-span-2">
          <h3 className="font-semibold text-gray-900 mb-4">Pending Approvals</h3>
          <div className="grid grid-cols-3 gap-4">
            <Link to="/admin/students?status=pending" className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
              <p className="text-3xl font-bold text-orange-600">{overview?.pendingApprovals?.students || 0}</p>
              <p className="text-sm text-gray-600">Students</p>
            </Link>
            <Link to="/admin/companies?status=pending" className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <p className="text-3xl font-bold text-blue-600">{overview?.pendingApprovals?.companies || 0}</p>
              <p className="text-sm text-gray-600">Companies</p>
            </Link>
            <Link to="/admin/jobs?status=pending" className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <p className="text-3xl font-bold text-purple-600">{overview?.pendingApprovals?.jobs || 0}</p>
              <p className="text-sm text-gray-600">Jobs</p>
            </Link>
          </div>
          {(overview?.pendingApprovals?.total || 0) > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <span className="font-medium">{overview?.pendingApprovals?.total}</span> items require your attention
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Branch-wise Placement */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Branch-wise Placement</h3>
          {branchWisePlacement && branchWisePlacement.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={branchWisePlacement}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="branch" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" name="Total Students" fill="#94A3B8" />
                <Bar dataKey="placed" name="Placed" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-300 flex items-center justify-center text-gray-500">
              No placement data available
            </div>
          )}
        </Card>

        {/* Application Distribution */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Application Status Distribution</h3>
          {applicationDistribution && applicationDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={applicationDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ _id, percent }) => `${_id}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="_id"
                >
                  {applicationDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-300 flex items-center justify-center text-gray-500">
              No application data available
            </div>
          )}
        </Card>
      </div>

      {/* Active Drives & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Placement Drives */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Active Placement Drives</h3>
            <Link to="/admin/drives" className="text-blue-600 text-sm font-medium hover:text-blue-700">
              View All
            </Link>
          </div>
          {activeDrives && activeDrives.length > 0 ? (
            <div className="space-y-3">
              {activeDrives.map((drive, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{drive.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {drive.schedule?.date ? new Date(drive.schedule.date).toLocaleDateString() : 'Date TBD'}
                      </p>
                    </div>
                    <Badge variant={
                      drive.status === 'Ongoing' ? 'success' :
                      drive.status === 'Registration Open' ? 'info' :
                      'default'
                    }>
                      {drive.status}
                    </Badge>
                  </div>
                  {drive.stats && (
                    <div className="flex gap-4 mt-3 text-sm text-gray-600">
                      <span>{drive.stats.registeredStudents || 0} registered</span>
                      <span>{drive.stats.companiesParticipating || 0} companies</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No active placement drives</p>
              <Link to="/admin/drives/create" className="text-blue-600 text-sm mt-2 inline-block">
                Create New Drive
              </Link>
            </div>
          )}
        </Card>

        {/* Recent Activity */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Activity</h3>
            <Link to="/admin/activity-logs" className="text-blue-600 text-sm font-medium hover:text-blue-700">
              View All
            </Link>
          </div>
          {recentActivity && recentActivity.length > 0 ? (
            <div className="space-y-1 max-h-[350px] overflow-y-auto">
              {recentActivity.map((activity, index) => (
                <ActivityItem key={index} activity={activity} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No recent activity
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Link to="/admin/students?status=pending" className="p-4 bg-gray-50 rounded-lg text-center hover:bg-gray-100 transition-colors">
            <Icons.Users />
            <p className="text-sm font-medium text-gray-900 mt-2">Approve Students</p>
          </Link>
          <Link to="/admin/companies?status=pending" className="p-4 bg-gray-50 rounded-lg text-center hover:bg-gray-100 transition-colors">
            <Icons.Building />
            <p className="text-sm font-medium text-gray-900 mt-2">Approve Companies</p>
          </Link>
          <Link to="/admin/jobs?status=pending" className="p-4 bg-gray-50 rounded-lg text-center hover:bg-gray-100 transition-colors">
            <Icons.Briefcase />
            <p className="text-sm font-medium text-gray-900 mt-2">Approve Jobs</p>
          </Link>
          <Link to="/admin/drives/create" className="p-4 bg-gray-50 rounded-lg text-center hover:bg-gray-100 transition-colors">
            <Icons.Award />
            <p className="text-sm font-medium text-gray-900 mt-2">Create Drive</p>
          </Link>
          <Link to="/admin/analytics" className="p-4 bg-gray-50 rounded-lg text-center hover:bg-gray-100 transition-colors">
            <Icons.TrendingUp />
            <p className="text-sm font-medium text-gray-900 mt-2">View Analytics</p>
          </Link>
          <Link to="/admin/settings" className="p-4 bg-gray-50 rounded-lg text-center hover:bg-gray-100 transition-colors">
            <Icons.Document />
            <p className="text-sm font-medium text-gray-900 mt-2">Settings</p>
          </Link>
        </div>
      </Card>
    </div>
  );
}
