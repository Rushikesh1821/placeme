import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Settings as SettingsIcon,
  Bell,
  Mail,
  Shield,
  Database,
  Palette,
  Globe,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Server,
  Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';

const settingsSchema = z.object({
  siteName: z.string().min(1, 'Site name is required'),
  siteEmail: z.string().email('Invalid email'),
  maxApplicationsPerStudent: z.number().min(1).max(100),
  allowMultipleOffers: z.boolean(),
  autoApproveJobs: z.boolean(),
  requireResumeForApplication: z.boolean(),
  placementSeasonStart: z.string(),
  placementSeasonEnd: z.string(),
  minCGPAForPlacement: z.number().min(0).max(10),
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  maintenanceMode: z.boolean(),
});

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      siteName: 'PlaceMe',
      siteEmail: 'admin@placeme.edu',
      maxApplicationsPerStudent: 10,
      allowMultipleOffers: true,
      autoApproveJobs: false,
      requireResumeForApplication: true,
      placementSeasonStart: '2024-08-01',
      placementSeasonEnd: '2025-05-31',
      minCGPAForPlacement: 6.0,
      emailNotifications: true,
      smsNotifications: false,
      maintenanceMode: false,
    },
  });

  const [systemStatus, setSystemStatus] = useState({
    database: 'connected',
    aiService: 'running',
    storage: 'healthy',
    lastBackup: '2024-01-15 03:00 AM',
    uptime: '15 days, 4 hours',
    activeUsers: 128,
  });

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 500);
  }, []);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleClearCache = () => {
    toast.success('Cache cleared successfully');
  };

  const handleBackup = () => {
    toast.success('Backup initiated. You will be notified when complete.');
  };

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'placement', label: 'Placement Rules', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'system', label: 'System', icon: Server },
  ];

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
        <h1 className="text-2xl font-heading font-bold text-secondary-900">Settings</h1>
        <p className="text-secondary-600">Manage system configuration and preferences</p>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="border-b border-secondary-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Site Name
                  </label>
                  <input
                    {...register('siteName')}
                    className="input w-full"
                  />
                  {errors.siteName && (
                    <p className="text-error-600 text-sm mt-1">{errors.siteName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    {...register('siteEmail')}
                    className="input w-full"
                  />
                  {errors.siteEmail && (
                    <p className="text-error-600 text-sm mt-1">{errors.siteEmail.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Placement Season Start
                  </label>
                  <input
                    type="date"
                    {...register('placementSeasonStart')}
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Placement Season End
                  </label>
                  <input
                    type="date"
                    {...register('placementSeasonEnd')}
                    className="input w-full"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-warning-50 rounded-lg border border-warning-200">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-warning-600" />
                  <div>
                    <p className="font-medium text-secondary-900">Maintenance Mode</p>
                    <p className="text-sm text-secondary-600">When enabled, only admins can access the system</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" {...register('maintenanceMode')} className="sr-only peer" />
                  <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </motion.div>
          )}

          {/* Placement Rules */}
          {activeTab === 'placement' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Max Applications Per Student
                  </label>
                  <input
                    type="number"
                    {...register('maxApplicationsPerStudent', { valueAsNumber: true })}
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Minimum CGPA for Placement
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    {...register('minCGPAForPlacement', { valueAsNumber: true })}
                    className="input w-full"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                  <div>
                    <p className="font-medium text-secondary-900">Allow Multiple Offers</p>
                    <p className="text-sm text-secondary-600">Students can receive and hold multiple job offers</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" {...register('allowMultipleOffers')} className="sr-only peer" />
                    <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                  <div>
                    <p className="font-medium text-secondary-900">Auto-Approve Job Postings</p>
                    <p className="text-sm text-secondary-600">New job postings are automatically published</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" {...register('autoApproveJobs')} className="sr-only peer" />
                    <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                  <div>
                    <p className="font-medium text-secondary-900">Require Resume for Application</p>
                    <p className="text-sm text-secondary-600">Students must upload resume before applying</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" {...register('requireResumeForApplication')} className="sr-only peer" />
                    <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>
            </motion.div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-secondary-600" />
                    <div>
                      <p className="font-medium text-secondary-900">Email Notifications</p>
                      <p className="text-sm text-secondary-600">Send email alerts for important events</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" {...register('emailNotifications')} className="sr-only peer" />
                    <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-secondary-600" />
                    <div>
                      <p className="font-medium text-secondary-900">SMS Notifications</p>
                      <p className="text-sm text-secondary-600">Send SMS alerts for urgent updates</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" {...register('smsNotifications')} className="sr-only peer" />
                    <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>

              <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
                <h3 className="font-medium text-secondary-900 mb-2">Notification Events</h3>
                <ul className="text-sm text-secondary-600 space-y-1">
                  <li>• New job posting matches student profile</li>
                  <li>• Application status updates</li>
                  <li>• Interview schedule notifications</li>
                  <li>• Placement confirmations</li>
                  <li>• Deadline reminders</li>
                </ul>
              </div>
            </motion.div>
          )}

          {/* System */}
          {activeTab === 'system' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* System Status */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-secondary-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="w-4 h-4 text-secondary-600" />
                    <span className="text-sm text-secondary-600">Database</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success-600" />
                    <span className="font-medium text-secondary-900 capitalize">{systemStatus.database}</span>
                  </div>
                </div>

                <div className="p-4 bg-secondary-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Server className="w-4 h-4 text-secondary-600" />
                    <span className="text-sm text-secondary-600">AI Service</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success-600" />
                    <span className="font-medium text-secondary-900 capitalize">{systemStatus.aiService}</span>
                  </div>
                </div>

                <div className="p-4 bg-secondary-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-secondary-600" />
                    <span className="text-sm text-secondary-600">Uptime</span>
                  </div>
                  <span className="font-medium text-secondary-900">{systemStatus.uptime}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg">
                  <div>
                    <p className="font-medium text-secondary-900">Clear Cache</p>
                    <p className="text-sm text-secondary-600">Clear all cached data from the system</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearCache}
                    className="btn btn-secondary flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Clear Cache
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg">
                  <div>
                    <p className="font-medium text-secondary-900">Database Backup</p>
                    <p className="text-sm text-secondary-600">Last backup: {systemStatus.lastBackup}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleBackup}
                    className="btn btn-secondary flex items-center gap-2"
                  >
                    <Database className="w-4 h-4" />
                    Backup Now
                  </button>
                </div>
              </div>

              {/* System Info */}
              <div className="p-4 bg-secondary-50 rounded-lg">
                <h3 className="font-medium text-secondary-900 mb-3">System Information</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Version</span>
                    <span className="text-secondary-900">v1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Environment</span>
                    <span className="text-secondary-900">Production</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Active Users</span>
                    <span className="text-secondary-900">{systemStatus.activeUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Node.js Version</span>
                    <span className="text-secondary-900">v18.17.0</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Save Button */}
          <div className="flex justify-end mt-6 pt-6 border-t border-secondary-200">
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
