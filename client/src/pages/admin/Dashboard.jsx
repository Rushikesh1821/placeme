import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Building2,
  Briefcase,
  TrendingUp,
  CheckCircle,
  Clock,
  DollarSign,
  GraduationCap,
  ArrowUp,
  ArrowDown,
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
  AreaChart,
  Area,
} from 'recharts';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Mock data
      setData({
        stats: {
          totalStudents: 1250,
          totalRecruiters: 48,
          totalJobs: 156,
          totalPlacements: 342,
          studentsChange: 12.5,
          recruitersChange: 8.3,
          jobsChange: -5.2,
          placementsChange: 18.7,
        },
        placementsByMonth: [
          { month: 'Aug', placements: 12 },
          { month: 'Sep', placements: 28 },
          { month: 'Oct', placements: 45 },
          { month: 'Nov', placements: 68 },
          { month: 'Dec', placements: 89 },
          { month: 'Jan', placements: 100 },
        ],
        placementsByBranch: [
          { name: 'CSE', value: 145 },
          { name: 'IT', value: 78 },
          { name: 'ECE', value: 52 },
          { name: 'EE', value: 34 },
          { name: 'ME', value: 23 },
          { name: 'CE', value: 10 },
        ],
        topCompanies: [
          { name: 'Google', hires: 25, avgPackage: 28 },
          { name: 'Microsoft', hires: 22, avgPackage: 24 },
          { name: 'Amazon', hires: 18, avgPackage: 22 },
          { name: 'Flipkart', hires: 15, avgPackage: 18 },
          { name: 'Razorpay', hires: 12, avgPackage: 16 },
        ],
        packageDistribution: [
          { range: '0-5L', count: 45 },
          { range: '5-10L', count: 89 },
          { range: '10-15L', count: 102 },
          { range: '15-20L', count: 68 },
          { range: '20L+', count: 38 },
        ],
        recentActivity: [
          { type: 'placement', message: 'Rahul Sharma placed at Google', time: '2 hours ago' },
          { type: 'job', message: 'Microsoft posted 5 new positions', time: '4 hours ago' },
          { type: 'company', message: 'Amazon verified their account', time: '6 hours ago' },
          { type: 'student', message: '15 new students registered', time: '1 day ago' },
        ],
      });
    } catch (error) {
      toast.error('Failed to load dashboard');
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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-secondary-900">Admin Dashboard</h1>
        <p className="text-secondary-600">Overview of placement activities and statistics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Students', value: data?.stats.totalStudents, change: data?.stats.studentsChange, icon: Users, color: 'bg-primary-100 text-primary-600' },
          { title: 'Companies', value: data?.stats.totalRecruiters, change: data?.stats.recruitersChange, icon: Building2, color: 'bg-success-100 text-success-600' },
          { title: 'Active Jobs', value: data?.stats.totalJobs, change: data?.stats.jobsChange, icon: Briefcase, color: 'bg-warning-100 text-warning-600' },
          { title: 'Placements', value: data?.stats.totalPlacements, change: data?.stats.placementsChange, icon: CheckCircle, color: 'bg-secondary-100 text-secondary-600' },
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
                <p className="text-2xl font-bold text-secondary-900">{stat.value?.toLocaleString()}</p>
                <div className={`flex items-center gap-1 mt-1 text-sm ${stat.change >= 0 ? 'text-success-600' : 'text-error-600'}`}>
                  {stat.change >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  {Math.abs(stat.change)}% from last month
                </div>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Placements Trend */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-secondary-900">Placements Trend</h2>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={data?.placementsByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="placements" stroke="#3b82f6" fill="#3b82f680" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Placements by Branch */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-secondary-900">Placements by Branch</h2>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data?.placementsByBranch}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {data?.placementsByBranch.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Package Distribution & Top Companies */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Package Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-secondary-900">Package Distribution</h2>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data?.packageDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="range" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Hiring Companies */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-secondary-900">Top Hiring Companies</h2>
          </div>
          <div className="card-body p-0">
            <table className="table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Hires</th>
                  <th>Avg Package (LPA)</th>
                </tr>
              </thead>
              <tbody>
                {data?.topCompanies.map((company, index) => (
                  <tr key={index}>
                    <td className="font-medium">{company.name}</td>
                    <td>{company.hires}</td>
                    <td>₹{company.avgPackage}L</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-secondary-900">Recent Activity</h2>
        </div>
        <div className="card-body p-0">
          <div className="divide-y divide-secondary-200">
            {data?.recentActivity.map((activity, index) => (
              <div key={index} className="p-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activity.type === 'placement' ? 'bg-success-100 text-success-600' :
                  activity.type === 'job' ? 'bg-primary-100 text-primary-600' :
                  activity.type === 'company' ? 'bg-warning-100 text-warning-600' :
                  'bg-secondary-100 text-secondary-600'
                }`}>
                  {activity.type === 'placement' ? <CheckCircle className="w-5 h-5" /> :
                   activity.type === 'job' ? <Briefcase className="w-5 h-5" /> :
                   activity.type === 'company' ? <Building2 className="w-5 h-5" /> :
                   <Users className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <p className="text-secondary-900">{activity.message}</p>
                  <p className="text-sm text-secondary-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
