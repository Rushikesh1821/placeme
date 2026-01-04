import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Code,
  Save,
  Plus,
  X,
  Edit2,
  Github,
  Linkedin,
  Globe,
  Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { studentAPI } from '../../services/api';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  // Education
  collegeName: z.string().min(2, 'College name is required'),
  branch: z.string().min(2, 'Branch is required'),
  cgpa: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 10, {
    message: 'CGPA must be between 0 and 10',
  }),
  tenthPercentage: z.string().optional(),
  twelfthPercentage: z.string().optional(),
  graduationYear: z.string().min(4, 'Graduation year is required'),
  backlogs: z.string().default('0'),
  // Social Links
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
});

export default function StudentProfile() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [editMode, setEditMode] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      dateOfBirth: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      collegeName: '',
      branch: '',
      cgpa: '',
      tenthPercentage: '',
      twelfthPercentage: '',
      graduationYear: '',
      backlogs: '0',
      linkedinUrl: '',
      githubUrl: '',
      portfolioUrl: '',
    },
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      // Mock data for demonstration
      const mockProfile = {
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        phone: '9876543210',
        dateOfBirth: '2000-05-15',
        address: '123 Main Street',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        collegeName: 'ABC Engineering College',
        branch: 'Computer Science',
        cgpa: '8.5',
        tenthPercentage: '92',
        twelfthPercentage: '88',
        graduationYear: '2024',
        backlogs: '0',
        skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git'],
        linkedinUrl: 'https://linkedin.com/in/johndoe',
        githubUrl: 'https://github.com/johndoe',
        portfolioUrl: 'https://johndoe.dev',
      };

      reset(mockProfile);
      setSkills(mockProfile.skills || []);
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      // Mock API call - simulate profile update
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      toast.success('Profile updated successfully!');
      setEditMode(false);
      
      // Update local state to reflect changes
      console.log('Profile updated with data:', data);
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-secondary-900">My Profile</h1>
          <p className="text-secondary-600">Manage your personal and academic information</p>
        </div>
        <button
          onClick={() => setEditMode(!editMode)}
          className={`btn ${editMode ? 'btn-secondary' : 'btn-primary'} btn-md flex items-center gap-2`}
        >
          {editMode ? (
            <>
              <X className="w-4 h-4" /> Cancel
            </>
          ) : (
            <>
              <Edit2 className="w-4 h-4" /> Edit Profile
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-secondary-900 flex items-center gap-2">
              <User className="w-5 h-5 text-primary-600" />
              Personal Information
            </h2>
          </div>
          <div className="card-body grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">First Name</label>
              <input
                {...register('firstName')}
                className={`input ${errors.firstName ? 'input-error' : ''}`}
                disabled={!editMode}
              />
              {errors.firstName && (
                <p className="text-error-500 text-sm mt-1">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <label className="label">Last Name</label>
              <input
                {...register('lastName')}
                className={`input ${errors.lastName ? 'input-error' : ''}`}
                disabled={!editMode}
              />
              {errors.lastName && (
                <p className="text-error-500 text-sm mt-1">{errors.lastName.message}</p>
              )}
            </div>
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <input
                  type="email"
                  value={user?.primaryEmailAddress?.emailAddress || ''}
                  className="input pl-10 bg-secondary-50"
                  disabled
                />
              </div>
              <p className="text-xs text-secondary-500 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="label">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <input
                  {...register('phone')}
                  className={`input pl-10 ${errors.phone ? 'input-error' : ''}`}
                  disabled={!editMode}
                />
              </div>
              {errors.phone && <p className="text-error-500 text-sm mt-1">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="label">Date of Birth</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <input
                  type="date"
                  {...register('dateOfBirth')}
                  className="input pl-10"
                  disabled={!editMode}
                />
              </div>
            </div>
            <div>
              <label className="label">City</label>
              <input {...register('city')} className="input" disabled={!editMode} />
            </div>
            <div className="md:col-span-2">
              <label className="label">Address</label>
              <textarea
                {...register('address')}
                className="input min-h-[80px]"
                disabled={!editMode}
              />
            </div>
          </div>
        </motion.div>

        {/* Academic Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <div className="card-header">
            <h2 className="text-lg font-semibold text-secondary-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary-600" />
              Academic Information
            </h2>
          </div>
          <div className="card-body grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">College Name</label>
              <input
                {...register('collegeName')}
                className={`input ${errors.collegeName ? 'input-error' : ''}`}
                disabled={!editMode}
              />
              {errors.collegeName && (
                <p className="text-error-500 text-sm mt-1">{errors.collegeName.message}</p>
              )}
            </div>
            <div>
              <label className="label">Branch / Department</label>
              <select
                {...register('branch')}
                className={`input ${errors.branch ? 'input-error' : ''}`}
                disabled={!editMode}
              >
                <option value="">Select Branch</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics and Communication">Electronics and Communication</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Other">Other</option>
              </select>
              {errors.branch && <p className="text-error-500 text-sm mt-1">{errors.branch.message}</p>}
            </div>
            <div>
              <label className="label">Graduation Year</label>
              <select
                {...register('graduationYear')}
                className={`input ${errors.graduationYear ? 'input-error' : ''}`}
                disabled={!editMode}
              >
                <option value="">Select Year</option>
                {[2024, 2025, 2026, 2027].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">CGPA (out of 10)</label>
              <input
                type="number"
                step="0.01"
                {...register('cgpa')}
                className={`input ${errors.cgpa ? 'input-error' : ''}`}
                disabled={!editMode}
              />
              {errors.cgpa && <p className="text-error-500 text-sm mt-1">{errors.cgpa.message}</p>}
            </div>
            <div>
              <label className="label">Active Backlogs</label>
              <input
                type="number"
                {...register('backlogs')}
                className="input"
                disabled={!editMode}
              />
            </div>
            <div>
              <label className="label">10th Percentage</label>
              <input
                type="number"
                step="0.01"
                {...register('tenthPercentage')}
                className="input"
                disabled={!editMode}
              />
            </div>
            <div>
              <label className="label">12th Percentage</label>
              <input
                type="number"
                step="0.01"
                {...register('twelfthPercentage')}
                className="input"
                disabled={!editMode}
              />
            </div>
          </div>
        </motion.div>

        {/* Skills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="card-header">
            <h2 className="text-lg font-semibold text-secondary-900 flex items-center gap-2">
              <Code className="w-5 h-5 text-primary-600" />
              Skills
            </h2>
          </div>
          <div className="card-body">
            {/* Skill Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium"
                >
                  {skill}
                  {editMode && (
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-1 hover:text-error-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>

            {/* Add Skill Input */}
            {editMode && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  placeholder="Add a skill (e.g., React, Python)"
                  className="input flex-1"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="btn btn-primary btn-md flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="card-header">
            <h2 className="text-lg font-semibold text-secondary-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary-600" />
              Social Links
            </h2>
          </div>
          <div className="card-body space-y-4">
            <div>
              <label className="label">LinkedIn Profile</label>
              <div className="relative">
                <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <input
                  {...register('linkedinUrl')}
                  placeholder="https://linkedin.com/in/username"
                  className="input pl-10"
                  disabled={!editMode}
                />
              </div>
            </div>
            <div>
              <label className="label">GitHub Profile</label>
              <div className="relative">
                <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <input
                  {...register('githubUrl')}
                  placeholder="https://github.com/username"
                  className="input pl-10"
                  disabled={!editMode}
                />
              </div>
            </div>
            <div>
              <label className="label">Portfolio Website</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <input
                  {...register('portfolioUrl')}
                  placeholder="https://yourportfolio.com"
                  className="input pl-10"
                  disabled={!editMode}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Save Button */}
        {editMode && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary btn-lg flex items-center gap-2"
            >
              {saving ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </motion.div>
        )}
      </form>
    </div>
  );
}
