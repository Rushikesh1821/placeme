import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Building2, MapPin, Globe, Mail, Phone, Users, Calendar, Save, Upload, Briefcase, Award } from 'lucide-react';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  industry: z.string().min(1, 'Industry is required'),
  companySize: z.string().min(1, 'Company size is required'),
  foundedYear: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  location: z.string().min(1, 'Location is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  about: z.string().min(50, 'About must be at least 50 characters'),
  benefits: z.string().optional(),
});

const INDUSTRIES = ['Technology', 'Finance', 'Healthcare', 'E-commerce', 'Consulting', 'Manufacturing', 'Education', 'Other'];
const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

export default function RecruiterProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const { register, handleSubmit, formState: { errors }, reset } = useForm({ resolver: zodResolver(profileSchema) });

  useEffect(() => {
    const mockProfile = {
      companyName: 'TechCorp Solutions', industry: 'Technology', companySize: '201-500',
      foundedYear: '2015', website: 'https://techcorp.com', location: 'Bangalore, India',
      email: 'hr@techcorp.com', phone: '+91 9876543210',
      about: 'TechCorp Solutions is a leading technology company specializing in innovative software solutions for enterprises.',
      benefits: 'Health Insurance, Remote Work, Stock Options, Learning Budget',
    };
    reset(mockProfile);
    setLoading(false);
  }, [reset]);

  const onSubmit = async (data) => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    toast.success('Profile updated successfully');
    setSaving(false);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-heading font-bold text-secondary-900">Company Profile</h1><p className="text-secondary-600">Manage your company information</p></div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Company Logo</h2>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-xl bg-secondary-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-secondary-300">
              {logoPreview ? <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" /> : <Building2 className="w-10 h-10 text-secondary-400" />}
            </div>
            <label className="btn btn-secondary cursor-pointer flex items-center gap-2">
              <Upload className="w-4 h-4" />Upload Logo
              <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
            </label>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Company Information</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div><label className="block text-sm font-medium text-secondary-700 mb-2"><Building2 className="w-4 h-4 inline mr-2" />Company Name *</label><input {...register('companyName')} className="input w-full" />{errors.companyName && <p className="text-error-600 text-sm mt-1">{errors.companyName.message}</p>}</div>
            <div><label className="block text-sm font-medium text-secondary-700 mb-2"><Briefcase className="w-4 h-4 inline mr-2" />Industry *</label><select {...register('industry')} className="input w-full"><option value="">Select</option>{INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-secondary-700 mb-2"><Users className="w-4 h-4 inline mr-2" />Company Size *</label><select {...register('companySize')} className="input w-full"><option value="">Select</option>{COMPANY_SIZES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-secondary-700 mb-2"><Calendar className="w-4 h-4 inline mr-2" />Founded Year</label><input type="number" {...register('foundedYear')} className="input w-full" /></div>
            <div><label className="block text-sm font-medium text-secondary-700 mb-2"><MapPin className="w-4 h-4 inline mr-2" />Location *</label><input {...register('location')} className="input w-full" /></div>
            <div><label className="block text-sm font-medium text-secondary-700 mb-2"><Globe className="w-4 h-4 inline mr-2" />Website</label><input {...register('website')} className="input w-full" /></div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Contact</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div><label className="block text-sm font-medium text-secondary-700 mb-2"><Mail className="w-4 h-4 inline mr-2" />HR Email *</label><input type="email" {...register('email')} className="input w-full" /></div>
            <div><label className="block text-sm font-medium text-secondary-700 mb-2"><Phone className="w-4 h-4 inline mr-2" />Phone</label><input {...register('phone')} className="input w-full" /></div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">About</h2>
          <div><label className="block text-sm font-medium text-secondary-700 mb-2">About Company *</label><textarea {...register('about')} rows={4} className="input w-full" />{errors.about && <p className="text-error-600 text-sm mt-1">{errors.about.message}</p>}</div>
          <div className="mt-4"><label className="block text-sm font-medium text-secondary-700 mb-2"><Award className="w-4 h-4 inline mr-2" />Benefits</label><textarea {...register('benefits')} rows={2} className="input w-full" /></div>
        </motion.div>

        <div className="flex justify-end"><button type="submit" disabled={saving} className="btn btn-primary flex items-center gap-2">{saving ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>Saving...</> : <><Save className="w-4 h-4" />Save Changes</>}</button></div>
      </form>
    </div>
  );
}
