import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignUp, useAuth } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { Shield, Lock, Mail, User, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AdminSignUpPage() {
  const navigate = useNavigate();
  const { isLoaded, signUp, setActive } = useSignUp();
  const { isSignedIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [adminExists, setAdminExists] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });

  useEffect(() => {
    checkAdminExists();
  }, []);

  useEffect(() => {
    if (isSignedIn) {
      navigate('/admin/dashboard');
    }
  }, [isSignedIn]);

  const checkAdminExists = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/admin-exists`);
      setAdminExists(response.data.data.exists);
      
      if (response.data.data.exists) {
        toast.error('Admin already exists. Please login.');
        navigate('/sign-in');
      }
    } catch (error) {
      console.error('Error checking admin existence:', error);
      toast.error('Failed to verify admin status');
    } finally {
      setCheckingAdmin(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isLoaded) return;

    setLoading(true);
    
    try {
      // First, check again if admin exists (double-check for security)
      const checkResponse = await axios.get(`${API_BASE_URL}/auth/admin-exists`);
      if (checkResponse.data.data.exists) {
        toast.error('Admin already exists. You cannot create another admin.');
        navigate('/sign-in');
        return;
      }

      // Create account with Clerk
      const result = await signUp.create({
        emailAddress: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName
      });

      // Send verification email
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      // For development, auto-verify (remove in production)
      if (import.meta.env.DEV) {
        // In production, user would need to verify email first
        toast.info('Please check your email for verification code');
      }

      // Create admin in our database
      const createAdminResponse = await axios.post(`${API_BASE_URL}/auth/create-first-admin`, {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        clerkId: result.createdUserId
      });

      if (createAdminResponse.data.success) {
        toast.success('Admin account created successfully!');
        
        // Set active session
        await setActive({ session: result.createdSessionId });
        
        navigate('/admin/dashboard');
      }
    } catch (error) {
      console.error('Admin signup error:', error);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.errors) {
        toast.error(error.errors[0]?.longMessage || 'Signup failed');
      } else {
        toast.error('Failed to create admin account');
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Verifying admin status...</p>
        </div>
      </div>
    );
  }

  if (adminExists) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <AlertCircle className="w-16 h-16 text-error-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">Admin Already Exists</h2>
          <p className="text-secondary-600 mb-6">
            An administrator account already exists in the system. Please contact the existing admin if you need access.
          </p>
          <button
            onClick={() => navigate('/sign-in')}
            className="btn btn-primary w-full"
          >
            Go to Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">Create Admin Account</h1>
          <p className="text-secondary-600">First-time TPO/Admin Setup</p>
          <div className="mt-4 p-4 bg-warning-50 rounded-lg border border-warning-200">
            <p className="text-sm text-warning-800">
              ⚠️ This is a ONE-TIME setup. After creating the first admin, this option will be permanently disabled.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                First Name
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="input"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="input"
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              <Mail className="w-4 h-4 inline mr-1" />
              Official Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input"
              placeholder="tpo@college.edu"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              <Lock className="w-4 h-4 inline mr-1" />
              Password
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input"
              placeholder="••••••••"
              minLength={8}
            />
            <p className="mt-1 text-xs text-secondary-500">Minimum 8 characters</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? 'Creating Admin Account...' : 'Create Admin Account'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn btn-secondary w-full"
          >
            Cancel
          </button>
        </form>
      </motion.div>
    </div>
  );
}
