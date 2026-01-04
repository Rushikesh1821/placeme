import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Users,
  Building2,
  Briefcase,
  CheckCircle,
  DollarSign,
  Calendar,
  Download,
  Filter,
  GraduationCap,
  Target,
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
  Legend,
  ComposedChart,
} from 'recharts';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedMetric, setSelectedMetric] = useState('placements');

  useEffect(() => {
    fetchAnalytics();
  }, [selectedYear]);

  const fetchAnalytics = async () => {
    try {
      // Mock data
      setData({
        yearlyTrend: [
          { year: '2020', placements: 180, avgPackage: 8.5, companies: 25 },
          { year: '2021', placements: 220, avgPackage: 10.2, companies: 32 },
          { year: '2022', placements: 285, avgPackage: 12.8, companies: 40 },
          { year: '2023', placements: 320, avgPackage: 14.5, companies: 45 },
          { year: '2024', placements: 342, avgPackage: 16.2, companies: 48 },
        ],
        monthlyData: [
          { month: 'Jan', placements: 12, applications: 145 },
          { month: 'Feb', placements: 18, applications: 178 },
          { month: 'Mar', placements: 25, applications: 234 },
          { month: 'Apr', placements: 15, applications: 156 },
          { month: 'May', placements: 8, applications: 89 },
          { month: 'Jun', placements: 5, applications: 67 },
          { month: 'Jul', placements: 10, applications: 112 },
          { month: 'Aug', placements: 22, applications: 198 },
          { month: 'Sep', placements: 35, applications: 287 },
          { month: 'Oct', placements: 48, applications: 356 },
          { month: 'Nov', placements: 72, applications: 445 },
          { month: 'Dec', placements: 72, applications: 423 },
        ],
        branchData: [
          { branch: 'CSE', placed: 145, total: 180, avgPackage: 18.5 },
          { branch: 'IT', placed: 78, total: 120, avgPackage: 15.2 },
          { branch: 'ECE', placed: 52, total: 100, avgPackage: 12.8 },
          { branch: 'EE', placed: 34, total: 80, avgPackage: 10.5 },
          { branch: 'ME', placed: 23, total: 90, avgPackage: 8.2 },
          { branch: 'CE', placed: 10, total: 50, avgPackage: 7.5 },
        ],
        packageRanges: [
          { range: '< 5 LPA', count: 45, percentage: 13.2 },
          { range: '5-10 LPA', count: 89, percentage: 26.0 },
          { range: '10-15 LPA', count: 102, percentage: 29.8 },
          { range: '15-20 LPA', count: 68, percentage: 19.9 },
          { range: '20-30 LPA', count: 28, percentage: 8.2 },
          { range: '> 30 LPA', count: 10, percentage: 2.9 },
        ],
        industryData: [
          { name: 'Technology', value: 185 },
          { name: 'Finance', value: 58 },
          { name: 'Consulting', value: 42 },
          { name: 'E-commerce', value: 35 },
          { name: 'Healthcare', value: 12 },
          { name: 'Others', value: 10 },
        ],
        topSkills: [
          { skill: 'JavaScript', demand: 85 },
          { skill: 'Python', demand: 78 },
          { skill: 'React', demand: 72 },
          { skill: 'Node.js', demand: 65 },
          { skill: 'SQL', demand: 62 },
          { skill: 'Machine Learning', demand: 55 },
          { skill: 'AWS', demand: 48 },
          { skill: 'Docker', demand: 42 },
        ],
        cgpaDistribution: [
          { range: '6.0-6.5', placed: 15, total: 45 },
          { range: '6.5-7.0', placed: 35, total: 78 },
          { range: '7.0-7.5', placed: 62, total: 102 },
          { range: '7.5-8.0', placed: 85, total: 120 },
          { range: '8.0-8.5', placed: 78, total: 98 },
          { range: '8.5-9.0', placed: 52, total: 62 },
          { range: '> 9.0', placed: 15, total: 15 },
        ],
        kpiMetrics: {
          placementRate: 68.5,
          avgPackage: 16.2,
          medianPackage: 14.5,
          highestPackage: 45,
          totalOffers: 412,
          multipleOffers: 68,
        },
      });
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    toast.success('Generating report...');
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
          <h1 className="text-2xl font-heading font-bold text-secondary-900">Analytics</h1>
          <p className="text-secondary-600">Comprehensive placement statistics and insights</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="input"
          >
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>
          <button onClick={handleExport} className="btn btn-primary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { title: 'Placement Rate', value: `${data?.kpiMetrics.placementRate}%`, icon: Target, color: 'bg-primary-100 text-primary-600' },
          { title: 'Avg Package', value: `₹${data?.kpiMetrics.avgPackage}L`, icon: DollarSign, color: 'bg-success-100 text-success-600' },
          { title: 'Median Package', value: `₹${data?.kpiMetrics.medianPackage}L`, icon: TrendingUp, color: 'bg-warning-100 text-warning-600' },
          { title: 'Highest Package', value: `₹${data?.kpiMetrics.highestPackage}L`, icon: GraduationCap, color: 'bg-error-100 text-error-600' },
          { title: 'Total Offers', value: data?.kpiMetrics.totalOffers, icon: Briefcase, color: 'bg-purple-100 text-purple-600' },
          { title: 'Multiple Offers', value: data?.kpiMetrics.multipleOffers, icon: CheckCircle, color: 'bg-cyan-100 text-cyan-600' },
        ].map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="card p-4"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${kpi.color}`}>
              <kpi.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-secondary-900">{kpi.value}</p>
            <p className="text-sm text-secondary-600">{kpi.title}</p>
          </motion.div>
        ))}
      </div>

      {/* Yearly Trend & Monthly Data */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Yearly Trend */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-secondary-900">Year-over-Year Trend</h2>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={data?.yearlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="year" stroke="#64748b" />
                <YAxis yAxisId="left" stroke="#64748b" />
                <YAxis yAxisId="right" orientation="right" stroke="#64748b" />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                <Legend />
                <Bar yAxisId="left" dataKey="placements" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Placements" />
                <Line yAxisId="right" type="monotone" dataKey="avgPackage" stroke="#22c55e" strokeWidth={3} name="Avg Package (LPA)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Monthly Activity */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-secondary-900">Monthly Activity ({selectedYear})</h2>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data?.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                <Legend />
                <Area type="monotone" dataKey="applications" stroke="#8b5cf6" fill="#8b5cf680" name="Applications" />
                <Area type="monotone" dataKey="placements" stroke="#22c55e" fill="#22c55e80" name="Placements" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Branch-wise & Package Distribution */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Branch-wise Performance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-secondary-900">Branch-wise Performance</h2>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.branchData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#64748b" />
                <YAxis type="category" dataKey="branch" stroke="#64748b" width={50} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="placed" fill="#22c55e" name="Placed" radius={[0, 4, 4, 0]} />
                <Bar dataKey="total" fill="#e2e8f0" name="Total" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Package Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-secondary-900">Package Distribution</h2>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data?.packageRanges}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ range, percentage }) => `${range}: ${percentage}%`}
                >
                  {data?.packageRanges.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Industry & Skills */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Industry Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-secondary-900">Industry Distribution</h2>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data?.industryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {data?.industryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Skills in Demand */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-secondary-900">Top Skills in Demand</h2>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {data?.topSkills.map((skill, index) => (
                <div key={skill.skill}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-secondary-700">{skill.skill}</span>
                    <span className="text-sm text-secondary-500">{skill.demand}%</span>
                  </div>
                  <div className="w-full bg-secondary-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.demand}%` }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className="bg-primary-600 h-2 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* CGPA vs Placement */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-secondary-900">CGPA vs Placement Rate</h2>
        </div>
        <div className="card-body">
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={data?.cgpaDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="range" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
              <Legend />
              <Bar dataKey="total" fill="#e2e8f0" name="Total Students" radius={[4, 4, 0, 0]} />
              <Bar dataKey="placed" fill="#22c55e" name="Placed" radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="placed" stroke="#3b82f6" strokeWidth={2} name="Placement Trend" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
