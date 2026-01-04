import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  ArrowRight,
  Building2,
  Plus,
  Eye,
  FileText,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import toast from 'react-hot-toast';
import { companyAPI, jobAPI } from '../../services/api';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function RecruiterDashboard() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Mock data
      setDashboardData({
        stats: {
          activeJobs: 5,
          totalApplications: 342,
          shortlisted: 48,
          hired: 12,
          pending: 156,
        },
        recentJobs: [
          {
            id: 1,
            title: 'Software Development Engineer',
            applications: 89,
            shortlisted: 12,
            status: 'ACTIVE',
            deadline: '2024-01-20',
          },
          {
            id: 2,
            title: 'Frontend Developer',
            applications: 67,
            shortlisted: 8,
            status: 'ACTIVE',
            deadline: '2024-01-25',
          },
          {
            id: 3,
            title: 'Data Analyst',
            applications: 45,
            shortlisted: 6,
            status: 'ACTIVE',
            deadline: '2024-01-18',
          },
        ],
        applicationsByStatus: [
          { name: 'Pending', value: 156 },
          { name: 'Under Review', value: 78 },
          { name: 'Shortlisted', value: 48 },
          { name: 'Rejected', value: 48 },
          { name: 'Hired', value: 12 },
        ],
        applicationsTrend: [
          { date: 'Jan 1', applications: 12 },
          { date: 'Jan 5', applications: 28 },
          { date: 'Jan 10', applications: 45 },
          { date: 'Jan 15', applications: 38 },
          { date: 'Jan 20', applications: 52 },
        ],
        topCandidates: [
          { name: 'Rahul Sharma', email: 'rahul@email.com', score: 95, job: 'SDE' },
          { name: 'Priya Patel', email: 'priya@email.com', score: 92, job: 'Frontend Developer' },
          { name: 'Amit Kumar', email: 'amit@email.com', score: 88, job: 'SDE' },
        ],
      });
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
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
              Welcome back, {user?.firstName || 'Recruiter'}! 👋
            </h1>
            <p className="text-primary-100">
              You have {dashboardData?.stats.pending || 0} applications pending review
            </p>
          </div>
          <Link to="/recruiter/jobs/create" className="btn bg-white text-primary-600 hover:bg-primary-50 btn-md flex items-center gap-2">
            <Plus className="w-4 h-4" /> Post New Job
          </Link>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { title: 'Active Jobs', value: dashboardData?.stats.activeJobs, icon: Briefcase, color: 'bg-primary-100 text-primary-600' },
          { title: 'Total Applications', value: dashboardData?.stats.totalApplications, icon: FileText, color: 'bg-secondary-100 text-secondary-600' },
          { title: 'Pending Review', value: dashboardData?.stats.pending, icon: Clock, color: 'bg-warning-100 text-warning-600' },
          { title: 'Shortlisted', value: dashboardData?.stats.shortlisted, icon: CheckCircle, color: 'bg-success-100 text-success-600' },
          { title: 'Hired', value: dashboardData?.stats.hired, icon: Users, color: 'bg-primary-100 text-primary-600' },
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

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Applications by Status */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-secondary-900">Applications by Status</h2>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={dashboardData?.applicationsByStatus}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {dashboardData?.applicationsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Applications Trend */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-secondary-900">Applications Trend</h2>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dashboardData?.applicationsTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="applications" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Recent Jobs & Top Candidates */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Job Postings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="text-lg font-semibold text-secondary-900">Recent Job Postings</h2>
            <Link to="/recruiter/jobs" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="card-body p-0">
            <div className="divide-y divide-secondary-200">
              {dashboardData?.recentJobs.map((job) => (
                <div key={job.id} className="p-4 hover:bg-secondary-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-secondary-900">{job.title}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-secondary-500">
                        <span>{job.applications} applications</span>
                        <span className="text-success-600">{job.shortlisted} shortlisted</span>
                      </div>
                    </div>
                    <Link to={`/recruiter/jobs/${job.id}/applications`} className="btn btn-secondary btn-sm">
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Top Candidates */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="text-lg font-semibold text-secondary-900">Top Candidates</h2>
            <Link to="/recruiter/applications" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="card-body p-0">
            <div className="divide-y divide-secondary-200">
              {dashboardData?.topCandidates.map((candidate, index) => (
                <div key={index} className="p-4 hover:bg-secondary-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="avatar avatar-md">
                        {candidate.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-medium text-secondary-900">{candidate.name}</h3>
                        <p className="text-sm text-secondary-500">{candidate.job}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-success-600">{candidate.score}%</span>
                      <p className="text-xs text-secondary-500">AI Score</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
