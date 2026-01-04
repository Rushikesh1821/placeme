import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Download, Eye, CheckCircle, XCircle, Clock, Calendar, Mail, Phone, FileText, User, GraduationCap, Briefcase, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['All', 'Pending', 'Shortlisted', 'Interviewing', 'Selected', 'Rejected'];

export default function RecruiterApplications() {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    const mockApplications = [
      { id: 1, student: { name: 'Rahul Sharma', email: 'rahul@example.com', phone: '+91 9876543210', branch: 'CSE', cgpa: 8.5, skills: ['React', 'Node.js', 'Python'] }, job: 'Software Engineer', appliedAt: '2024-02-10', status: 'pending', aiScore: 85, resumeUrl: '#' },
      { id: 2, student: { name: 'Priya Patel', email: 'priya@example.com', phone: '+91 9876543211', branch: 'IT', cgpa: 8.8, skills: ['Java', 'Spring Boot', 'AWS'] }, job: 'Software Engineer', appliedAt: '2024-02-09', status: 'shortlisted', aiScore: 92, resumeUrl: '#' },
      { id: 3, student: { name: 'Amit Kumar', email: 'amit@example.com', phone: '+91 9876543212', branch: 'ECE', cgpa: 7.8, skills: ['Python', 'ML', 'TensorFlow'] }, job: 'Data Analyst Intern', appliedAt: '2024-02-08', status: 'interviewing', aiScore: 78, resumeUrl: '#' },
      { id: 4, student: { name: 'Sneha Singh', email: 'sneha@example.com', phone: '+91 9876543213', branch: 'CSE', cgpa: 9.1, skills: ['JavaScript', 'React', 'GraphQL'] }, job: 'Product Manager', appliedAt: '2024-02-07', status: 'selected', aiScore: 95, resumeUrl: '#' },
      { id: 5, student: { name: 'Vikram Rao', email: 'vikram@example.com', phone: '+91 9876543214', branch: 'ME', cgpa: 7.2, skills: ['CAD', 'MATLAB'] }, job: 'Software Engineer', appliedAt: '2024-02-06', status: 'rejected', aiScore: 45, resumeUrl: '#' },
    ];
    setApplications(mockApplications);
    setLoading(false);
  }, []);

  const filteredApps = applications.filter(app => {
    const matchesSearch = app.student.name.toLowerCase().includes(searchQuery.toLowerCase()) || app.job.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const updateStatus = (id, status) => { setApplications(apps => apps.map(a => a.id === id ? { ...a, status } : a)); toast.success(`Application ${status}`); };

  const getStatusBadge = (status) => {
    const styles = { pending: 'badge-warning', shortlisted: 'badge-primary', interviewing: 'badge-info', selected: 'badge-success', rejected: 'badge-error' };
    return <span className={`badge ${styles[status] || 'badge-secondary'}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
  };

  const getScoreColor = (score) => score >= 80 ? 'text-success-600' : score >= 60 ? 'text-warning-600' : 'text-error-600';

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-heading font-bold text-secondary-900">All Applications</h1><p className="text-secondary-600">Review and manage candidate applications</p></div>
        <button className="btn btn-secondary flex items-center gap-2"><Download className="w-4 h-4" />Export</button>
      </div>

      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" /><input type="text" placeholder="Search by name or job..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input pl-10 w-full" /></div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input">{STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {filteredApps.map((app, index) => (
            <motion.div key={app.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} onClick={() => setSelectedApp(app)} className={`card p-4 cursor-pointer transition-all hover:shadow-md ${selectedApp?.id === app.id ? 'ring-2 ring-primary-500' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center"><span className="text-primary-600 font-semibold text-lg">{app.student.name.charAt(0)}</span></div>
                  <div><h3 className="font-semibold text-secondary-900">{app.student.name}</h3><p className="text-sm text-secondary-600">{app.job}</p><div className="flex items-center gap-2 mt-1">{getStatusBadge(app.status)}<span className="text-xs text-secondary-500">{new Date(app.appliedAt).toLocaleDateString()}</span></div></div>
                </div>
                <div className="text-right"><div className={`text-2xl font-bold ${getScoreColor(app.aiScore)}`}>{app.aiScore}%</div><p className="text-xs text-secondary-500">AI Score</p></div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="lg:col-span-1">
          {selectedApp ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card p-6 sticky top-4">
              <div className="text-center mb-6">
                <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-3"><span className="text-primary-600 font-bold text-2xl">{selectedApp.student.name.charAt(0)}</span></div>
                <h3 className="text-xl font-semibold text-secondary-900">{selectedApp.student.name}</h3>
                <p className="text-secondary-600">{selectedApp.job}</p>
                <div className="mt-2">{getStatusBadge(selectedApp.status)}</div>
              </div>
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 text-sm"><Mail className="w-4 h-4 text-secondary-400" />{selectedApp.student.email}</div>
                <div className="flex items-center gap-3 text-sm"><Phone className="w-4 h-4 text-secondary-400" />{selectedApp.student.phone}</div>
                <div className="flex items-center gap-3 text-sm"><GraduationCap className="w-4 h-4 text-secondary-400" />{selectedApp.student.branch} • CGPA: {selectedApp.student.cgpa}</div>
                <div><p className="text-sm text-secondary-600 mb-2">Skills</p><div className="flex flex-wrap gap-1">{selectedApp.student.skills.map(s => <span key={s} className="px-2 py-1 bg-primary-50 text-primary-700 rounded text-xs">{s}</span>)}</div></div>
                <div className="p-4 bg-secondary-50 rounded-lg"><div className="flex items-center justify-between mb-2"><span className="text-sm text-secondary-600">AI Match Score</span><span className={`text-xl font-bold ${getScoreColor(selectedApp.aiScore)}`}>{selectedApp.aiScore}%</span></div><div className="w-full bg-secondary-200 rounded-full h-2"><div className={`h-2 rounded-full ${selectedApp.aiScore >= 80 ? 'bg-success-500' : selectedApp.aiScore >= 60 ? 'bg-warning-500' : 'bg-error-500'}`} style={{ width: `${selectedApp.aiScore}%` }}></div></div></div>
              </div>
              <div className="space-y-2">
                <a href={selectedApp.resumeUrl} className="btn btn-secondary w-full flex items-center justify-center gap-2"><FileText className="w-4 h-4" />View Resume</a>
                {selectedApp.status === 'pending' && <><button onClick={() => updateStatus(selectedApp.id, 'shortlisted')} className="btn btn-primary w-full">Shortlist</button><button onClick={() => updateStatus(selectedApp.id, 'rejected')} className="btn btn-error w-full">Reject</button></>}
                {selectedApp.status === 'shortlisted' && <button onClick={() => updateStatus(selectedApp.id, 'interviewing')} className="btn btn-primary w-full">Schedule Interview</button>}
                {selectedApp.status === 'interviewing' && <><button onClick={() => updateStatus(selectedApp.id, 'selected')} className="btn btn-success w-full">Select</button><button onClick={() => updateStatus(selectedApp.id, 'rejected')} className="btn btn-error w-full">Reject</button></>}
              </div>
            </motion.div>
          ) : <div className="card p-8 text-center text-secondary-500">Select an application to view details</div>}
        </div>
      </div>
    </div>
  );
}
