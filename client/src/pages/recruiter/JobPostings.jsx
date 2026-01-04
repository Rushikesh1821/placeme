import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Eye, Users, Calendar, MapPin, DollarSign, MoreVertical, CheckCircle, XCircle, Clock } from 'lucide-react';
import { recruiterAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function RecruiterJobPostings() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const mockJobs = [
      { id: 1, title: 'Software Engineer', location: 'Bangalore', type: 'Full-Time', salary: { min: 15, max: 25 }, status: 'active', applications: 45, deadline: '2024-03-15', createdAt: '2024-01-10' },
      { id: 2, title: 'Product Manager', location: 'Remote', type: 'Full-Time', salary: { min: 20, max: 35 }, status: 'active', applications: 28, deadline: '2024-03-20', createdAt: '2024-01-15' },
      { id: 3, title: 'Data Analyst Intern', location: 'Hyderabad', type: 'Internship', salary: { min: 0.5, max: 0.8 }, status: 'closed', applications: 62, deadline: '2024-02-28', createdAt: '2024-01-05' },
      { id: 4, title: 'DevOps Engineer', location: 'Pune', type: 'Full-Time', salary: { min: 18, max: 28 }, status: 'draft', applications: 0, deadline: '2024-04-01', createdAt: '2024-02-01' },
    ];
    setJobs(mockJobs);
    setLoading(false);
  }, []);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id) => { toast.success('Job deleted'); setJobs(jobs.filter(j => j.id !== id)); };
  const handleStatusChange = (id, status) => { toast.success(`Job ${status}`); setJobs(jobs.map(j => j.id === id ? { ...j, status } : j)); };

  const getStatusBadge = (status) => {
    const styles = { active: 'badge-success', closed: 'badge-secondary', draft: 'badge-warning' };
    return <span className={`badge ${styles[status]}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-heading font-bold text-secondary-900">Job Postings</h1><p className="text-secondary-600">Manage your job listings</p></div>
        <Link to="/recruiter/jobs/create" className="btn btn-primary flex items-center gap-2"><Plus className="w-4 h-4" />Post New Job</Link>
      </div>

      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" /><input type="text" placeholder="Search jobs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input pl-10 w-full" /></div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input"><option value="all">All Status</option><option value="active">Active</option><option value="closed">Closed</option><option value="draft">Draft</option></select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredJobs.map((job, index) => (
          <motion.div key={job.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="card p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2"><h3 className="text-lg font-semibold text-secondary-900">{job.title}</h3>{getStatusBadge(job.status)}</div>
                <div className="flex flex-wrap gap-4 text-sm text-secondary-600">
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{job.location}</span>
                  <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" />₹{job.salary.min}-{job.salary.max} LPA</span>
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><Users className="w-4 h-4" />{job.applications} applications</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link to={`/recruiter/jobs/${job.id}/applications`} className="btn btn-secondary btn-sm flex items-center gap-1"><Eye className="w-4 h-4" />View</Link>
                <Link to={`/recruiter/jobs/${job.id}/edit`} className="p-2 hover:bg-secondary-100 rounded-lg"><Edit className="w-4 h-4 text-secondary-600" /></Link>
                <button onClick={() => handleDelete(job.id)} className="p-2 hover:bg-error-100 rounded-lg"><Trash2 className="w-4 h-4 text-error-600" /></button>
              </div>
            </div>
            {job.status === 'draft' && <div className="mt-4 pt-4 border-t border-secondary-200 flex gap-2"><button onClick={() => handleStatusChange(job.id, 'active')} className="btn btn-primary btn-sm">Publish</button><button onClick={() => handleDelete(job.id)} className="btn btn-secondary btn-sm">Delete Draft</button></div>}
          </motion.div>
        ))}
        {filteredJobs.length === 0 && <div className="card p-12 text-center"><p className="text-secondary-600">No jobs found. Create your first job posting!</p><Link to="/recruiter/jobs/create" className="btn btn-primary mt-4">Post New Job</Link></div>}
      </div>
    </div>
  );
}
