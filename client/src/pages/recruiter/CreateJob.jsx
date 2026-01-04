import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, DollarSign, Calendar, Users, FileText, Code, GraduationCap, Save, ArrowLeft, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

const jobSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(100, 'Description must be at least 100 characters'),
  type: z.string().min(1, 'Job type is required'),
  location: z.string().min(1, 'Location is required'),
  workMode: z.string().min(1, 'Work mode is required'),
  salaryMin: z.number().min(0, 'Minimum salary is required'),
  salaryMax: z.number().min(0, 'Maximum salary is required'),
  openings: z.number().min(1, 'At least 1 opening is required'),
  deadline: z.string().min(1, 'Deadline is required'),
  minCGPA: z.number().min(0).max(10),
  experience: z.string(),
  eligibleBranches: z.array(z.string()).min(1, 'Select at least one branch'),
});

const JOB_TYPES = ['Full-Time', 'Internship', 'Contract', 'Part-Time'];
const WORK_MODES = ['On-site', 'Remote', 'Hybrid'];
const BRANCHES = ['CSE', 'IT', 'ECE', 'EE', 'ME', 'CE', 'All'];

export default function CreateJob() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    resolver: zodResolver(jobSchema),
    defaultValues: { type: 'Full-Time', workMode: 'On-site', salaryMin: 0, salaryMax: 0, openings: 1, minCGPA: 6.0, experience: '0-1 years', eligibleBranches: [] }
  });

  const addSkill = () => { if (newSkill.trim() && !skills.includes(newSkill.trim())) { setSkills([...skills, newSkill.trim()]); setNewSkill(''); } };
  const removeSkill = (skill) => setSkills(skills.filter(s => s !== skill));

  const onSubmit = async (data) => {
    setSaving(true);
    
    // Create new job object
    const newJob = {
      id: Date.now(), // Use timestamp as unique ID
      title: data.title,
      location: data.location,
      type: data.type,
      workMode: data.workMode,
      salary: { min: data.salaryMin, max: data.salaryMax },
      openings: data.openings,
      deadline: data.deadline,
      minCGPA: data.minCGPA,
      experience: data.experience,
      eligibleBranches: data.eligibleBranches,
      skills: skills,
      description: data.description,
      status: 'active',
      applications: 0,
      createdAt: new Date().toISOString(),
    };

    console.log('=== NEW JOB CREATED ===');
    console.log('Job data:', newJob);
    console.log('Job title:', newJob.title);
    console.log('Job ID:', newJob.id);

    // Store in multiple localStorage keys for cross-role access
    const existingRecruiterJobs = JSON.parse(localStorage.getItem('recruiterJobs') || '[]');
    existingRecruiterJobs.push(newJob);
    localStorage.setItem('recruiterJobs', JSON.stringify(existingRecruiterJobs));
    
    // Also store in shared location for student access
    const existingSharedJobs = JSON.parse(localStorage.getItem('sharedJobs') || '[]');
    existingSharedJobs.push(newJob);
    localStorage.setItem('sharedJobs', JSON.stringify(existingSharedJobs));
    
    // Also store in session storage as backup
    const existingSessionJobs = JSON.parse(sessionStorage.getItem('sharedJobs') || '[]');
    existingSessionJobs.push(newJob);
    sessionStorage.setItem('sharedJobs', JSON.stringify(existingSessionJobs));
    
    // Store in global window object for cross-role sharing
    if (typeof window !== 'undefined') {
      window.sharedJobs = window.sharedJobs || [];
      window.sharedJobs.push(newJob);
      console.log('=== GLOBAL STATE UPDATED ===');
      console.log('window.sharedJobs:', window.sharedJobs);
      console.log('window.sharedJobs length:', window.sharedJobs.length);
    }
    
    // NEW: Store in URL parameter for cross-browser sharing
    try {
      const jobData = btoa(JSON.stringify(newJob));
      const timestamp = Date.now();
      
      // Create a temporary URL parameter that the student can detect
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('newJob', jobData);
        url.searchParams.set('timestamp', timestamp);
        
        // Store the URL in localStorage for student to detect
        localStorage.setItem('lastJobUrl', url.toString());
        console.log('=== URL NOTIFICATION CREATED ===');
        console.log('Job URL:', url.toString());
      }
    } catch (error) {
      console.error('Error creating URL notification:', error);
      // Fallback: just use global state
      console.log('=== FALLBACK TO GLOBAL STATE ONLY ===');
    }
    
    console.log('=== STORAGE VERIFICATION ===');
    console.log('Stored in localStorage recruiterJobs:', existingRecruiterJobs.length);
    console.log('Stored in localStorage sharedJobs:', existingSharedJobs.length);
    console.log('Stored in sessionStorage sharedJobs:', existingSessionJobs.length);
    
    // Verify storage immediately
    console.log('=== IMMEDIATE VERIFICATION ===');
    console.log('localStorage recruiterJobs after save:', JSON.parse(localStorage.getItem('recruiterJobs') || '[]'));
    console.log('localStorage sharedJobs after save:', JSON.parse(localStorage.getItem('sharedJobs') || '[]'));
    console.log('sessionStorage sharedJobs after save:', JSON.parse(sessionStorage.getItem('sharedJobs') || '[]'));
    
    await new Promise(r => setTimeout(r, 1000));
    toast.success('Job posted successfully!');
    navigate('/recruiter/jobs');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-secondary-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></button>
        <div><h1 className="text-2xl font-heading font-bold text-secondary-900">Create Job Posting</h1><p className="text-secondary-600">Post a new opportunity for students</p></div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Basic Information</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2"><label className="block text-sm font-medium text-secondary-700 mb-2"><Briefcase className="w-4 h-4 inline mr-2" />Job Title *</label><input {...register('title')} className="input w-full" placeholder="e.g., Software Engineer" />{errors.title && <p className="text-error-600 text-sm mt-1">{errors.title.message}</p>}</div>
            <div><label className="block text-sm font-medium text-secondary-700 mb-2">Job Type *</label><select {...register('type')} className="input w-full">{JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-secondary-700 mb-2">Work Mode *</label><select {...register('workMode')} className="input w-full">{WORK_MODES.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-secondary-700 mb-2"><MapPin className="w-4 h-4 inline mr-2" />Location *</label><input {...register('location')} className="input w-full" placeholder="e.g., Bangalore" /></div>
            <div><label className="block text-sm font-medium text-secondary-700 mb-2"><Users className="w-4 h-4 inline mr-2" />Openings *</label><input type="number" {...register('openings', { valueAsNumber: true })} className="input w-full" min={1} /></div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Compensation</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div><label className="block text-sm font-medium text-secondary-700 mb-2"><DollarSign className="w-4 h-4 inline mr-2" />Min Salary (LPA)</label><input type="number" step="0.1" {...register('salaryMin', { valueAsNumber: true })} className="input w-full" /></div>
            <div><label className="block text-sm font-medium text-secondary-700 mb-2">Max Salary (LPA)</label><input type="number" step="0.1" {...register('salaryMax', { valueAsNumber: true })} className="input w-full" /></div>
            <div><label className="block text-sm font-medium text-secondary-700 mb-2"><Calendar className="w-4 h-4 inline mr-2" />Application Deadline *</label><input type="date" {...register('deadline')} className="input w-full" /></div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Eligibility Criteria</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div><label className="block text-sm font-medium text-secondary-700 mb-2"><GraduationCap className="w-4 h-4 inline mr-2" />Minimum CGPA</label><input type="number" step="0.1" {...register('minCGPA', { valueAsNumber: true })} className="input w-full" min={0} max={10} /></div>
            <div><label className="block text-sm font-medium text-secondary-700 mb-2">Experience Required</label><select {...register('experience')} className="input w-full"><option value="0-1 years">0-1 years (Freshers)</option><option value="1-2 years">1-2 years</option><option value="2-4 years">2-4 years</option></select></div>
            <div className="md:col-span-2"><label className="block text-sm font-medium text-secondary-700 mb-2">Eligible Branches *</label><div className="flex flex-wrap gap-2">{BRANCHES.map(b => (<label key={b} className="flex items-center gap-2 px-3 py-2 bg-secondary-50 rounded-lg cursor-pointer hover:bg-secondary-100"><input type="checkbox" value={b} {...register('eligibleBranches')} className="rounded" />{b}</label>))}</div>{errors.eligibleBranches && <p className="text-error-600 text-sm mt-1">{errors.eligibleBranches.message}</p>}</div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4"><Code className="w-5 h-5 inline mr-2" />Required Skills</h2>
          <div className="flex gap-2 mb-4"><input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())} className="input flex-1" placeholder="Add a skill" /><button type="button" onClick={addSkill} className="btn btn-secondary"><Plus className="w-4 h-4" /></button></div>
          <div className="flex flex-wrap gap-2">{skills.map(skill => (<span key={skill} className="flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full">{skill}<button type="button" onClick={() => removeSkill(skill)} className="hover:bg-primary-200 rounded-full p-0.5"><X className="w-3 h-3" /></button></span>))}</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4"><FileText className="w-5 h-5 inline mr-2" />Job Description</h2>
          <textarea {...register('description')} rows={8} className="input w-full" placeholder="Describe the role, responsibilities, and requirements..." />{errors.description && <p className="text-error-600 text-sm mt-1">{errors.description.message}</p>}
        </motion.div>

        <div className="flex justify-end gap-4"><button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">Cancel</button><button type="submit" disabled={saving} className="btn btn-primary flex items-center gap-2">{saving ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>Posting...</> : <><Save className="w-4 h-4" />Post Job</>}</button></div>
      </form>
    </div>
  );
}
