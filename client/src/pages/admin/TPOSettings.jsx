/**
 * TPO Settings Page
 * 
 * @description System-wide placement settings including:
 * - Eligibility rules
 * - AI configuration
 * - Application policies
 * - Feature toggles
 */

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { Card, Loading, Alert, Badge } from '../../components';

// Icons
const Icons = {
  Save: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  Settings: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  AI: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  Rules: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Toggle: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  Refresh: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  )
};

const ToggleSwitch = ({ enabled, onChange, label, description }) => (
  <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
    <div>
      <p className="font-medium text-gray-900">{label}</p>
      {description && <p className="text-sm text-gray-500">{description}</p>}
    </div>
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${enabled ? 'bg-blue-600' : 'bg-gray-200'}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  </div>
);

const SliderInput = ({ value, onChange, min, max, step, label, suffix = '' }) => (
  <div className="py-4 border-b border-gray-100 last:border-0">
    <div className="flex justify-between mb-2">
      <label className="font-medium text-gray-900">{label}</label>
      <span className="text-blue-600 font-medium">{value}{suffix}</span>
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

export default function TPOSettings() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [settings, setSettings] = useState({
    academicYear: '2024-2025',
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
    },
    notifications: {
      emailOnNewJob: true,
      emailOnApplicationStatus: true,
      emailOnSelection: true,
      digestEmails: true,
      digestFrequency: 'weekly'
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tpo/settings', {
        headers: {
          'Authorization': `Bearer ${await user?.getToken()}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch settings');

      const data = await response.json();
      if (data.data.settings) {
        setSettings(prev => ({ ...prev, ...data.data.settings }));
      }
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/tpo/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${await user?.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) throw new Error('Failed to save settings');

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAI = async () => {
    try {
      const response = await fetch('/api/tpo/settings/toggle-ai', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await user?.getToken()}`
        }
      });

      if (!response.ok) throw new Error('Failed to toggle AI');

      const data = await response.json();
      setSettings(prev => ({
        ...prev,
        aiSettings: { ...prev.aiSettings, enabled: data.data.aiEnabled }
      }));
    } catch (err) {
      setError(err.message);
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
      <div className="flex items-center justify-center h-64">
        <Loading />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Placement Settings</h1>
          <p className="text-gray-500">Configure system-wide placement rules and policies</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchSettings}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <Icons.Refresh />
            Refresh
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Icons.Save />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">Settings saved successfully!</Alert>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <Icons.Settings />
            </div>
            <h2 className="text-lg font-semibold">General Settings</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
              <select
                value={settings.academicYear}
                onChange={(e) => updateNestedSetting('academicYear', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="2023-2024">2023-2024</option>
                <option value="2024-2025">2024-2025</option>
                <option value="2025-2026">2025-2026</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Placement Season</label>
              <select
                value={settings.placementSeason}
                onChange={(e) => updateNestedSetting('placementSeason', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="On Campus">On Campus</option>
                <option value="Off Campus">Off Campus</option>
                <option value="Pool Campus">Pool Campus</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Eligibility Rules */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg text-green-600">
              <Icons.Rules />
            </div>
            <h2 className="text-lg font-semibold">Eligibility Rules</h2>
          </div>

          <div className="space-y-1">
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
              step={1}
              suffix="%"
            />

            <SliderInput
              label="Minimum 12th Percentage"
              value={settings.eligibilityRules.minTwelfthPercentage}
              onChange={(v) => updateNestedSetting('eligibilityRules.minTwelfthPercentage', v)}
              min={0}
              max={100}
              step={1}
              suffix="%"
            />

            <SliderInput
              label="Maximum Offers per Student"
              value={settings.eligibilityRules.maxOffers}
              onChange={(v) => updateNestedSetting('eligibilityRules.maxOffers', v)}
              min={1}
              max={5}
              step={1}
            />

            <ToggleSwitch
              label="Allow Placed Students to Apply"
              description="Let already placed students apply for more jobs"
              enabled={settings.eligibilityRules.allowPlacedStudents}
              onChange={(v) => updateNestedSetting('eligibilityRules.allowPlacedStudents', v)}
            />
          </div>
        </Card>

        {/* AI Settings */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                <Icons.AI />
              </div>
              <h2 className="text-lg font-semibold">AI Configuration</h2>
            </div>
            <Badge variant={settings.aiSettings.enabled ? 'success' : 'error'}>
              {settings.aiSettings.enabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>

          <div className="space-y-1">
            <ToggleSwitch
              label="Enable AI Scoring"
              description="Use AI to score student-job compatibility"
              enabled={settings.aiSettings.enabled}
              onChange={handleToggleAI}
            />

            <ToggleSwitch
              label="Auto Score Applications"
              description="Automatically score new applications"
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

            <div className="pt-4">
              <p className="font-medium text-gray-900 mb-3">Score Weights</p>
              <div className="space-y-3">
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
        </Card>

        {/* Application Policies */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600">
              <Icons.Toggle />
            </div>
            <h2 className="text-lg font-semibold">Application Policies</h2>
          </div>

          <div className="space-y-1">
            <SliderInput
              label="Max Applications per Student"
              value={settings.applicationPolicies.maxApplicationsPerStudent}
              onChange={(v) => updateNestedSetting('applicationPolicies.maxApplicationsPerStudent', v)}
              min={1}
              max={50}
              step={1}
            />

            <ToggleSwitch
              label="Auto-withdraw on Selection"
              description="Automatically withdraw other applications when selected"
              enabled={settings.applicationPolicies.autoWithdrawOnSelection}
              onChange={(v) => updateNestedSetting('applicationPolicies.autoWithdrawOnSelection', v)}
            />

            <ToggleSwitch
              label="Require Resume for Application"
              description="Students must upload resume to apply"
              enabled={settings.applicationPolicies.requireResumeForApplication}
              onChange={(v) => updateNestedSetting('applicationPolicies.requireResumeForApplication', v)}
            />

            <ToggleSwitch
              label="Allow Multiple Offers"
              description="Students can receive multiple job offers"
              enabled={settings.applicationPolicies.allowMultipleOffers}
              onChange={(v) => updateNestedSetting('applicationPolicies.allowMultipleOffers', v)}
            />
          </div>
        </Card>

        {/* Feature Flags */}
        <Card className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-100 rounded-lg text-red-600">
              <Icons.Toggle />
            </div>
            <h2 className="text-lg font-semibold">Feature Toggles</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            <div className="space-y-1">
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
                description="Allow resume uploads"
                enabled={settings.featureFlags.resumeUpload}
                onChange={(v) => updateNestedSetting('featureFlags.resumeUpload', v)}
              />
            </div>

            <div className="space-y-1">
              <ToggleSwitch
                label="AI Matching"
                description="Enable AI-based job matching"
                enabled={settings.featureFlags.aiMatching}
                onChange={(v) => updateNestedSetting('featureFlags.aiMatching', v)}
              />

              <ToggleSwitch
                label="Email Notifications"
                description="Send email notifications"
                enabled={settings.featureFlags.emailNotifications}
                onChange={(v) => updateNestedSetting('featureFlags.emailNotifications', v)}
              />

              <ToggleSwitch
                label="SMS Notifications"
                description="Send SMS notifications"
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
        </Card>
      </div>

      {/* Save Button (Bottom) */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Icons.Save />
          {saving ? 'Saving Changes...' : 'Save All Settings'}
        </button>
      </div>
    </div>
  );
}
