import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import {
  Briefcase,
  FileText,
  CheckCircle,
  Clock,
  TrendingUp,
  Star,
  ArrowRight,
  Building2,
  MapPin,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { studentAPI, jobAPI } from '../../services/api';
import toast from 'react-hot-toast';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444'];

export default function StudentDashboard() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // In production, this would fetch from your API
      // For now, using mock data
      setDashboardData({
        stats: {
          totalApplications: 12,
          pending: 5,
          shortlisted: 4,
          rejected: 3,
          eligibleJobs: 28,
        },
        applicationsByStatus: [
          { name: 'Pending', value: 5 },
          { name: 'Shortlisted', value: 4 },
          { name: 'Rejected', value: 3 },
        ],
        applicationsByMonth: [
          { month: 'Sep', applications: 2 },
          { month: 'Oct', applications: 5 },
          { month: 'Nov', applications: 3 },
          { month: 'Dec', applications: 2 },
        ],
        profileCompleteness: 75,
        recentApplications: [
          {
            id: 1,
            company: 'Google',
            position: 'Software Engineer',
            status: 'SHORTLISTED',
            appliedAt: '2024-01-10',
            logo: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=100&h=100',
          },
          {
            id: 2,
            company: 'Microsoft',
            position: 'Product Manager',
            status: 'PENDING',
            appliedAt: '2024-01-08',
            logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&q=80&w=100&h=100',
          },
          {
            id: 3,
            company: 'Amazon',
            position: 'Data Analyst',
            status: 'PENDING',
            appliedAt: '2024-01-05',
            logo: 'https://images.unsplash.com/photo-1605087667593-69c0e9b7520b?auto=format&fit=crop&q=80&w=100&h=100',
          },
        ],
      });

      setRecentJobs([
        {
          id: 1,
          title: 'Software Development Engineer',
          company: { 
            name: 'Google', 
            logo: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=100&h=100' 
          },
          location: 'Bangalore',
          salary: { min: 2000000, max: 3500000 },
          eligibilityScore: 92,
          deadline: '2024-01-20',
        },
        {
          id: 2,
          title: 'Frontend Developer',
          company: { 
            name: 'Microsoft', 
            logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&q=80&w=100&h=100' 
          },
          location: 'Hyderabad',
          salary: { min: 1800000, max: 2800000 },
          eligibilityScore: 85,
          deadline: '2024-01-25',
        },
        {
          id: 3,
          title: 'Full Stack Developer',
          company: { 
            name: 'Amazon', 
            logo: 'https://images.unsplash.com/photo-1605087667593-69c0e9b7520b?auto=format&fit=crop&q=80&w=100&h=100' 
          },
          location: 'Remote',
          salary: { min: 2200000, max: 3200000 },
          eligibilityScore: 78,
          deadline: '2024-01-22',
        },
        {
          id: 4,
          title: 'Product Manager',
          company: { 
            name: 'Meta', 
            logo: 'https://images.unsplash.com/photo-1573164713619-24c711fe7878?auto=format&fit=crop&q=80&w=100&h=100' 
          },
          location: 'Pune',
          salary: { min: 2500000, max: 4000000 },
          eligibilityScore: 88,
          deadline: '2024-01-18',
        },
        {
          id: 5,
          title: 'Data Scientist',
          company: { 
            name: 'Apple', 
            logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&q=80&w=100&h=100' 
          },
          location: 'Bangalore',
          salary: { min: 2800000, max: 4500000 },
          eligibilityScore: 95,
          deadline: '2024-01-15',
        },
      ]);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatSalary = (amount) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'badge-warning',
      SHORTLISTED: 'badge-success',
      REJECTED: 'badge-error',
      SELECTED: 'badge-primary',
    };
    return colors[status] || 'badge-secondary';
  };

  const getEligibilityColor = (score) => {
    if (score >= 80) return 'text-success-600';
    if (score >= 60) return 'text-warning-600';
    return 'text-error-600';
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
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading font-bold mb-1">
              Welcome back, {user?.firstName || 'Student'}! 👋
            </h1>
            <p className="text-primary-100">
              You have {dashboardData?.stats.eligibleJobs || 0} new jobs matching your profile
            </p>
          </div>
          <Link to="/student/jobs" className="btn bg-white text-primary-600 hover:bg-primary-50 btn-md">
            Browse Jobs
          </Link>
        </div>
      </motion.div>

      {/* Profile Completion Alert */}
      {dashboardData?.profileCompleteness < 100 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-warning-50 border border-warning-200 rounded-xl p-4 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-warning-800">Complete your profile</p>
            <p className="text-sm text-warning-700">
              Your profile is {dashboardData?.profileCompleteness}% complete. Complete it to get better job matches.
            </p>
          </div>
          <Link to="/student/profile" className="btn btn-sm bg-warning-600 text-white hover:bg-warning-700">
            Complete Profile
          </Link>
        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Total Applications',
            value: dashboardData?.stats.totalApplications || 0,
            icon: FileText,
            color: 'bg-primary-100 text-primary-600',
          },
          {
            title: 'Pending Review',
            value: dashboardData?.stats.pending || 0,
            icon: Clock,
            color: 'bg-warning-100 text-warning-600',
          },
          {
            title: 'Shortlisted',
            value: dashboardData?.stats.shortlisted || 0,
            icon: Star,
            color: 'bg-success-100 text-success-600',
          },
          {
            title: 'Eligible Jobs',
            value: dashboardData?.stats.eligibleJobs || 0,
            icon: Briefcase,
            color: 'bg-secondary-100 text-secondary-600',
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-secondary-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-secondary-900">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts & Tables */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Application Status Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <div className="card-header">
            <h2 className="text-lg font-semibold text-secondary-900">Application Status</h2>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={dashboardData?.applicationsByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {dashboardData?.applicationsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {dashboardData?.applicationsByStatus.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <span className="text-sm text-secondary-600">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Applications Trend */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <div className="card-header">
            <h2 className="text-lg font-semibold text-secondary-900">Applications Trend</h2>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dashboardData?.applicationsByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="applications" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Recommended Jobs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="card-header flex items-center justify-between">
          <h2 className="text-lg font-semibold text-secondary-900">Recommended Jobs</h2>
          <Link
            to="/student/jobs"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="card-body p-0">
          <div className="divide-y divide-secondary-200">
            {recentJobs.map((job) => (
              <div key={job.id} className="p-4 hover:bg-secondary-50 transition-colors">
                <div className="flex items-start gap-4">
                  <img
                    src={job.company.logo}
                    alt={job.company.name}
                    className="w-12 h-12 rounded-xl object-contain bg-white border border-secondary-200 p-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-secondary-900">{job.title}</h3>
                        <p className="text-sm text-secondary-600">{job.company.name}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-lg font-bold ${getEligibilityColor(job.eligibilityScore)}`}>
                          {job.eligibilityScore}%
                        </span>
                        <p className="text-xs text-secondary-500">Eligibility</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-secondary-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {formatSalary(job.salary.min)} - {formatSalary(job.salary.max)}
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/student/jobs/${job.id}`}
                    className="btn btn-primary btn-sm flex-shrink-0"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Recent Applications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="card-header flex items-center justify-between">
          <h2 className="text-lg font-semibold text-secondary-900">Recent Applications</h2>
          <Link
            to="/student/applications"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Position</th>
                <th>Applied On</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData?.recentApplications.map((app) => (
                <tr key={app.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <img
                        src={app.logo}
                        alt={app.company}
                        className="w-8 h-8 rounded-lg object-contain bg-white border border-secondary-200 p-1"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=100&h=100';
                        }}
                      />
                      <span className="font-medium">{app.company}</span>
                    </div>
                  </td>
                  <td>{app.position}</td>
                  <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                  <td>
                    <span className={getStatusColor(app.status)}>{app.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
