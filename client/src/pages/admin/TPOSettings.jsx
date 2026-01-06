/**
 * TPO Settings Page
 * 
 * @description Comprehensive system settings including:
 * - Admin Management (Secure)
 * - Eligibility Rules
 * - AI Configuration
 * - Application Policies
 * - Feature Toggles
 */

import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';

// Icons Component
const Icons = {
  Save: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  Settings: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Shield: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Users: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  AI: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  Rules: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  Toggle: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Search: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Warning: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  X: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
};

// Tab Configuration
const tabs = [
  { id: 'admins', label: 'Admin Management', icon: Icons.Shield },
  { id: 'general', label: 'General Settings', icon: Icons.Settings },
  { id: 'eligibility', label: 'Eligibility Rules', icon: Icons.Rules },
  { id: 'ai', label: 'AI Configuration', icon: Icons.AI },
  { id: 'features', label: 'Feature Toggles', icon: Icons.Toggle },
];

// Toggle Switch Component
const ToggleSwitch = ({ enabled, onChange, label, description }) => (
  <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
    <div className="flex-1 pr-4">
      <p className="font-medium text-gray-900">{label}</p>
      {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
    </div>
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${enabled ? 'bg-blue-600' : 'bg-gray-200'}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  </div>
);

// Slider Input Component
const SliderInput = ({ value, onChange, min, max, step, label, suffix = '' }) => (
  <div className="py-4 border-b border-gray-100 last:border-0">
    <div className="flex justify-between mb-2">
      <label className="font-medium text-gray-900">{label}</label>
      <span className="text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded">{value}{suffix}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
    />
    <div className="flex justify-between text-xs text-gray-400 mt-1">
      <span>{min}{suffix}</span>
      <span>{max}{suffix}</span>
    </div>
  </div>
);

// Confirmation Modal Component
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, danger = false }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
      >
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${danger ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
          {danger ? <Icons.Warning /> : <Icons.Shield />}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg font-medium text-white ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default function TPOSettings() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [activeTab, setActiveTab] = useState('admins');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Admin Management State
  const [admins, setAdmins] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, user: null, action: null });
  
  // Settings State
  const [settings, setSettings] = useState({
    academicYear: '2025-2026',
    placementSeason: 'On Campus',
    eligibilityRules: {
      minCGPA: 6.0,
      maxBacklogs: 0,
      minTenthPercentage: 60,
      minTwelfthPercentage: 60,
      allowPlacedStudents: false,
      maxOffers: 1
    },
    applicationPolicies: {
      maxApplicationsPerStudent: 10,
      autoWithdrawOnSelection: true,
      requireResumeForApplication: true,
      allowMultipleOffers: false
    },
    aiSettings: {
      enabled: true,
      autoScore: true,
      minimumScore: 50,
      weights: {
        skills: 40,
        experience: 30,
        education: 20,
        projects: 10
      }
    },
    featureFlags: {
      studentRegistration: true,
      companyRegistration: true,
      jobApplications: true,
      resumeUpload: true,
      aiMatching: true,
      emailNotifications: true,
      smsNotifications: false,
      placementDrives: true
    }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchAdmins(), fetchSettings()]);
    } catch (err) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const response = await adminAPI.getUsers({ role: 'ADMIN' });
      if (response.data.success) {
        setAdmins(response.data.data.users || []);
      }
    } catch (err) {
      console.error('Failed to fetch admins:', err);
    }
  };

  const fetchSettings = async () => {
    try {
      const token = await getToken();
      const response = await fetch('/api/tpo/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.data?.settings) {
          // Map backend schema to frontend schema
          const backendSettings = data.data.settings;
          const mappedSettings = {
            academicYear: backendSettings.academic?.currentAcademicYear || '2025-2026',
            placementSeason: 'On Campus',
            eligibilityRules: {
              minCGPA: backendSettings.eligibilityRules?.minCgpa || 6.0,
              maxBacklogs: backendSettings.eligibilityRules?.maxBacklogs || 0,
              minTenthPercentage: backendSettings.eligibilityRules?.minTenthPercentage || 60,
              minTwelfthPercentage: backendSettings.eligibilityRules?.minTwelfthPercentage || 60,
              allowPlacedStudents: backendSettings.placementRules?.canApplyAfterSelection || false,
              maxOffers: backendSettings.placementRules?.maxOffersAllowed || 1
            },
            applicationPolicies: {
              maxApplicationsPerStudent: 10,
              autoWithdrawOnSelection: true,
              requireResumeForApplication: backendSettings.applicationSettings?.requireResume || true,
              allowMultipleOffers: backendSettings.placementRules?.allowMultipleOffers || false
            },
            aiSettings: {
              enabled: backendSettings.aiSettings?.enabled || true,
              autoScore: backendSettings.aiSettings?.autoShortlist || true,
              minimumScore: backendSettings.aiSettings?.shortlistThreshold || 50,
              weights: {
                skills: (backendSettings.aiSettings?.skillMatchWeight || 0.4) * 100,
                experience: (backendSettings.aiSettings?.experienceWeight || 0.1) * 100,
                education: (backendSettings.aiSettings?.cgpaWeight || 0.3) * 100,
                projects: (backendSettings.aiSettings?.branchMatchWeight || 0.2) * 100
              }
            },
            featureFlags: {
              studentRegistration: backendSettings.features?.studentRegistration ?? true,
              companyRegistration: backendSettings.features?.companyRegistration ?? true,
              jobApplications: backendSettings.features?.jobApplications ?? true,
              resumeUpload: backendSettings.features?.resumeUpload ?? true,
              aiMatching: backendSettings.features?.aiScoring ?? true,
              emailNotifications: true,
              smsNotifications: false,
              placementDrives: true
            }
          };
          setSettings(mappedSettings);
        }
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  };

  const searchUsers = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    try {
      setSearching(true);
      const response = await adminAPI.getUsers({ search: query, limit: 10 });
      if (response.data.success) {
        // Filter out existing admins
        const nonAdmins = response.data.data.users.filter(u => u.role !== 'ADMIN');
        setSearchResults(nonAdmins);
      }
    } catch (err) {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery) searchUsers(searchQuery);
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handlePromoteToAdmin = async (userId) => {
    try {
      const response = await adminAPI.createAdmin(userId);
      if (response.data.success) {
        toast.success('User promoted to admin successfully!');
        setShowAddAdmin(false);
        setSearchQuery('');
        setSearchResults([]);
        fetchAdmins();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to promote user');
    }
    setConfirmModal({ isOpen: false, user: null, action: null });
  };

  const handleDemoteAdmin = async (userId) => {
    // Prevent demoting yourself
    if (admins.find(a => a._id === userId)?.clerkId === user?.id) {
      toast.error('You cannot demote yourself');
      setConfirmModal({ isOpen: false, user: null, action: null });
      return;
    }
    
    try {
      const response = await adminAPI.updateUserRole(userId, 'STUDENT');
      if (response.data.success) {
        toast.success('Admin demoted successfully');
        fetchAdmins();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to demote admin');
    }
    setConfirmModal({ isOpen: false, user: null, action: null });
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const token = await getToken();
      
      // Map frontend schema to backend schema
      const backendSettings = {
        academic: {
          currentAcademicYear: settings.academicYear
        },
        eligibilityRules: {
          minCgpa: settings.eligibilityRules.minCGPA,
          maxBacklogs: settings.eligibilityRules.maxBacklogs,
          minTenthPercentage: settings.eligibilityRules.minTenthPercentage,
          minTwelfthPercentage: settings.eligibilityRules.minTwelfthPercentage
        },
        placementRules: {
          maxOffersAllowed: settings.eligibilityRules.maxOffers,
          allowMultipleOffers: settings.applicationPolicies.allowMultipleOffers,
          canApplyAfterSelection: settings.eligibilityRules.allowPlacedStudents
        },
        applicationSettings: {
          requireResume: settings.applicationPolicies.requireResumeForApplication
        },
        aiSettings: {
          enabled: settings.aiSettings.enabled,
          autoShortlist: settings.aiSettings.autoScore,
          shortlistThreshold: settings.aiSettings.minimumScore,
          skillMatchWeight: settings.aiSettings.weights.skills / 100,
          experienceWeight: settings.aiSettings.weights.experience / 100,
          cgpaWeight: settings.aiSettings.weights.education / 100,
          branchMatchWeight: settings.aiSettings.weights.projects / 100
        },
        features: {
          studentRegistration: settings.featureFlags.studentRegistration,
          companyRegistration: settings.featureFlags.companyRegistration,
          jobApplications: settings.featureFlags.jobApplications,
          resumeUpload: settings.featureFlags.resumeUpload,
          aiScoring: settings.featureFlags.aiMatching
        }
      };
      
      const response = await fetch('/api/tpo/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(backendSettings)
      });
      
      if (response.ok) {
        toast.success('Settings saved successfully!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save');
      }
    } catch (err) {
      console.error('Save error:', err);
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateNestedSetting = (path, value) => {
    setSettings(prev => {
      const keys = path.split('.');
      const newSettings = { ...prev };
      let current = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600 mt-1">Manage administrators, placement rules, and system configuration</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <tab.icon />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* Admin Management Tab */}
          {activeTab === 'admins' && (
            <div className="space-y-6">
              {/* Security Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                <div className="text-amber-600 flex-shrink-0 mt-0.5">
                  <Icons.Warning />
                </div>
                <div>
                  <h3 className="font-semibold text-amber-800">Security Notice</h3>
                  <p className="text-sm text-amber-700 mt-1">
                    Admin accounts have full access to the system. Only promote trusted users to admin role.
                    Admin changes are logged for security purposes.
                  </p>
                </div>
              </div>

              {/* Current Admins */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                      <Icons.Shield />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Current Administrators</h2>
                      <p className="text-sm text-gray-500">{admins.length} admin(s) in the system</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddAdmin(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    <Icons.Plus />
                    Add Admin
                  </button>
                </div>

                <div className="divide-y divide-gray-100">
                  {admins.length === 0 ? (
                    <div className="px-6 py-12 text-center text-gray-500">
                      <Icons.Users />
                      <p className="mt-2">No administrators found</p>
                    </div>
                  ) : (
                    admins.map((admin) => {
                      const isCurrentUser = admin.clerkId === user?.id;
                      return (
                        <div key={admin._id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                              {admin.firstName?.[0] || 'A'}{admin.lastName?.[0] || ''}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-gray-900">
                                  {admin.firstName || 'Unknown'} {admin.lastName || ''}
                                </p>
                                {isCurrentUser && (
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                    You
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">{admin.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full flex items-center gap-1">
                              <Icons.Shield />
                              Admin
                            </span>
                            {!isCurrentUser && admins.length > 1 && (
                              <button
                                onClick={() => setConfirmModal({ isOpen: true, user: admin, action: 'demote' })}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Remove admin access"
                              >
                                <Icons.Trash />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Add Admin Modal */}
              {showAddAdmin && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden"
                  >
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Add New Administrator</h3>
                      <button
                        onClick={() => {
                          setShowAddAdmin(false);
                          setSearchQuery('');
                          setSearchResults([]);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <Icons.X />
                      </button>
                    </div>
                    
                    <div className="p-6">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                          <Icons.Search />
                        </div>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search by name or email..."
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      {searching && (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        </div>
                      )}

                      {searchResults.length > 0 && (
                        <div className="mt-4 max-h-64 overflow-y-auto border border-gray-200 rounded-lg divide-y">
                          {searchResults.map((u) => (
                            <div key={u._id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                                  {u.firstName?.[0] || '?'}{u.lastName?.[0] || ''}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{u.firstName || 'Unknown'} {u.lastName || ''}</p>
                                  <p className="text-sm text-gray-500">{u.email}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                  u.role === 'STUDENT' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                }`}>
                                  {u.role}
                                </span>
                                <button
                                  onClick={() => setConfirmModal({ isOpen: true, user: u, action: 'promote' })}
                                  className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                                >
                                  Make Admin
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {searchQuery && !searching && searchResults.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <p>No users found matching "{searchQuery}"</p>
                        </div>
                      )}

                      {!searchQuery && (
                        <div className="text-center py-8 text-gray-500">
                          <p>Search for a user to promote to admin</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              )}
            </div>
          )}

          {/* General Settings Tab */}
          {activeTab === 'general' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <Icons.Settings />
                </div>
                <h2 className="text-lg font-semibold">General Settings</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
                  <select
                    value={settings.academicYear}
                    onChange={(e) => updateNestedSetting('academicYear', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="2024-2025">2024-2025</option>
                    <option value="2025-2026">2025-2026</option>
                    <option value="2026-2027">2026-2027</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Placement Season</label>
                  <select
                    value={settings.placementSeason}
                    onChange={(e) => updateNestedSetting('placementSeason', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="On Campus">On Campus</option>
                    <option value="Off Campus">Off Campus</option>
                    <option value="Pool Campus">Pool Campus</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Applications per Student</label>
                  <input
                    type="number"
                    value={settings.applicationPolicies.maxApplicationsPerStudent}
                    onChange={(e) => updateNestedSetting('applicationPolicies.maxApplicationsPerStudent', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min={1}
                    max={50}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Offers per Student</label>
                  <input
                    type="number"
                    value={settings.eligibilityRules.maxOffers}
                    onChange={(e) => updateNestedSetting('eligibilityRules.maxOffers', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min={1}
                    max={10}
                  />
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-medium text-gray-900 mb-4">Application Policies</h3>
                <ToggleSwitch
                  label="Auto-withdraw on Selection"
                  description="Automatically withdraw other applications when a student is selected"
                  enabled={settings.applicationPolicies.autoWithdrawOnSelection}
                  onChange={(v) => updateNestedSetting('applicationPolicies.autoWithdrawOnSelection', v)}
                />
                <ToggleSwitch
                  label="Require Resume for Application"
                  description="Students must upload a resume before applying to jobs"
                  enabled={settings.applicationPolicies.requireResumeForApplication}
                  onChange={(v) => updateNestedSetting('applicationPolicies.requireResumeForApplication', v)}
                />
                <ToggleSwitch
                  label="Allow Multiple Offers"
                  description="Students can receive and hold multiple job offers"
                  enabled={settings.applicationPolicies.allowMultipleOffers}
                  onChange={(v) => updateNestedSetting('applicationPolicies.allowMultipleOffers', v)}
                />
              </div>
            </div>
          )}

          {/* Eligibility Rules Tab */}
          {activeTab === 'eligibility' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg text-green-600">
                  <Icons.Rules />
                </div>
                <h2 className="text-lg font-semibold">Eligibility Rules</h2>
              </div>

              <div className="space-y-2">
                <SliderInput
                  label="Minimum CGPA"
                  value={settings.eligibilityRules.minCGPA}
                  onChange={(v) => updateNestedSetting('eligibilityRules.minCGPA', v)}
                  min={0}
                  max={10}
                  step={0.1}
                />

                <SliderInput
                  label="Maximum Backlogs Allowed"
                  value={settings.eligibilityRules.maxBacklogs}
                  onChange={(v) => updateNestedSetting('eligibilityRules.maxBacklogs', v)}
                  min={0}
                  max={10}
                  step={1}
                />

                <SliderInput
                  label="Minimum 10th Percentage"
                  value={settings.eligibilityRules.minTenthPercentage}
                  onChange={(v) => updateNestedSetting('eligibilityRules.minTenthPercentage', v)}
                  min={0}
                  max={100}
                  step={5}
                  suffix="%"
                />

                <SliderInput
                  label="Minimum 12th Percentage"
                  value={settings.eligibilityRules.minTwelfthPercentage}
                  onChange={(v) => updateNestedSetting('eligibilityRules.minTwelfthPercentage', v)}
                  min={0}
                  max={100}
                  step={5}
                  suffix="%"
                />

                <ToggleSwitch
                  label="Allow Placed Students to Apply"
                  description="Let students who are already placed apply for more jobs"
                  enabled={settings.eligibilityRules.allowPlacedStudents}
                  onChange={(v) => updateNestedSetting('eligibilityRules.allowPlacedStudents', v)}
                />
              </div>
            </div>
          )}

          {/* AI Configuration Tab */}
          {activeTab === 'ai' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                    <Icons.AI />
                  </div>
                  <h2 className="text-lg font-semibold">AI Configuration</h2>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  settings.aiSettings.enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {settings.aiSettings.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>

              <div className="space-y-2">
                <ToggleSwitch
                  label="Enable AI Scoring"
                  description="Use AI to calculate student-job compatibility scores"
                  enabled={settings.aiSettings.enabled}
                  onChange={(v) => updateNestedSetting('aiSettings.enabled', v)}
                />

                <ToggleSwitch
                  label="Auto Score Applications"
                  description="Automatically calculate scores when students apply"
                  enabled={settings.aiSettings.autoScore}
                  onChange={(v) => updateNestedSetting('aiSettings.autoScore', v)}
                />

                <SliderInput
                  label="Minimum Eligibility Score"
                  value={settings.aiSettings.minimumScore}
                  onChange={(v) => updateNestedSetting('aiSettings.minimumScore', v)}
                  min={0}
                  max={100}
                  step={5}
                />

                <div className="pt-4 mt-4 border-t border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-4">Score Weights (must total 100%)</h3>
                  <div className="space-y-2">
                    <SliderInput
                      label="Skills Weight"
                      value={settings.aiSettings.weights.skills}
                      onChange={(v) => updateNestedSetting('aiSettings.weights.skills', v)}
                      min={0}
                      max={100}
                      step={5}
                      suffix="%"
                    />
                    <SliderInput
                      label="Experience Weight"
                      value={settings.aiSettings.weights.experience}
                      onChange={(v) => updateNestedSetting('aiSettings.weights.experience', v)}
                      min={0}
                      max={100}
                      step={5}
                      suffix="%"
                    />
                    <SliderInput
                      label="Education Weight"
                      value={settings.aiSettings.weights.education}
                      onChange={(v) => updateNestedSetting('aiSettings.weights.education', v)}
                      min={0}
                      max={100}
                      step={5}
                      suffix="%"
                    />
                    <SliderInput
                      label="Projects Weight"
                      value={settings.aiSettings.weights.projects}
                      onChange={(v) => updateNestedSetting('aiSettings.weights.projects', v)}
                      min={0}
                      max={100}
                      step={5}
                      suffix="%"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Feature Toggles Tab */}
          {activeTab === 'features' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                  <Icons.Toggle />
                </div>
                <h2 className="text-lg font-semibold">Feature Toggles</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                <div>
                  <h3 className="font-medium text-gray-900 mb-4 pb-2 border-b">Registration & Access</h3>
                  <ToggleSwitch
                    label="Student Registration"
                    description="Allow new students to register"
                    enabled={settings.featureFlags.studentRegistration}
                    onChange={(v) => updateNestedSetting('featureFlags.studentRegistration', v)}
                  />
                  <ToggleSwitch
                    label="Company Registration"
                    description="Allow new companies to register"
                    enabled={settings.featureFlags.companyRegistration}
                    onChange={(v) => updateNestedSetting('featureFlags.companyRegistration', v)}
                  />
                  <ToggleSwitch
                    label="Job Applications"
                    description="Allow students to apply for jobs"
                    enabled={settings.featureFlags.jobApplications}
                    onChange={(v) => updateNestedSetting('featureFlags.jobApplications', v)}
                  />
                  <ToggleSwitch
                    label="Resume Upload"
                    description="Allow students to upload resumes"
                    enabled={settings.featureFlags.resumeUpload}
                    onChange={(v) => updateNestedSetting('featureFlags.resumeUpload', v)}
                  />
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-4 pb-2 border-b">Features & Notifications</h3>
                  <ToggleSwitch
                    label="AI Matching"
                    description="Enable AI-based job matching"
                    enabled={settings.featureFlags.aiMatching}
                    onChange={(v) => updateNestedSetting('featureFlags.aiMatching', v)}
                  />
                  <ToggleSwitch
                    label="Email Notifications"
                    description="Send email notifications to users"
                    enabled={settings.featureFlags.emailNotifications}
                    onChange={(v) => updateNestedSetting('featureFlags.emailNotifications', v)}
                  />
                  <ToggleSwitch
                    label="SMS Notifications"
                    description="Send SMS notifications to users"
                    enabled={settings.featureFlags.smsNotifications}
                    onChange={(v) => updateNestedSetting('featureFlags.smsNotifications', v)}
                  />
                  <ToggleSwitch
                    label="Placement Drives"
                    description="Enable placement drive feature"
                    enabled={settings.featureFlags.placementDrives}
                    onChange={(v) => updateNestedSetting('featureFlags.placementDrives', v)}
                  />
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Save Button - Show for all tabs except admins */}
      {activeTab !== 'admins' && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium shadow-sm"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Icons.Save />
                Save Settings
              </>
            )}
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, user: null, action: null })}
        onConfirm={() => {
          if (confirmModal.action === 'promote') {
            handlePromoteToAdmin(confirmModal.user._id);
          } else if (confirmModal.action === 'demote') {
            handleDemoteAdmin(confirmModal.user._id);
          }
        }}
        title={confirmModal.action === 'promote' ? 'Promote to Admin?' : 'Remove Admin Access?'}
        message={
          confirmModal.action === 'promote'
            ? `Are you sure you want to make ${confirmModal.user?.firstName || ''} ${confirmModal.user?.lastName || ''} (${confirmModal.user?.email}) an administrator? They will have full access to the system.`
            : `Are you sure you want to remove admin access from ${confirmModal.user?.firstName || ''} ${confirmModal.user?.lastName || ''}? They will be demoted to a regular student account.`
        }
        confirmText={confirmModal.action === 'promote' ? 'Yes, Make Admin' : 'Yes, Remove Access'}
        danger={confirmModal.action === 'demote'}
      />
    </div>
  );
}
