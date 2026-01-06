/**
 * Admin Setup Page
 * 
 * @description ONE-TIME admin (TPO) account setup page.
 * This page is only accessible when NO admin exists in the system.
 * 
 * Security:
 * - Checks admin existence before allowing setup
 * - Requires Clerk authentication
 * - Backend enforces one-time creation rule
 */

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser, SignIn, SignedIn, SignedOut } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, ArrowLeft, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';

export default function AdminSetupPage() {
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();
  
  const [adminExists, setAdminExists] = useState(null); // null = checking
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);

  // Check if admin already exists
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await adminAPI.checkAdminExists();
        const exists = response.data.data.adminExists;
        setAdminExists(exists);
        
        if (exists) {
          toast.error('Admin already exists. This page is not available.');
          setTimeout(() => navigate('/'), 2000);
        }
      } catch (error) {
        console.error('Error checking admin:', error);
        toast.error('Failed to check admin status');
        navigate('/');
      }
    };

    checkAdmin();
  }, [navigate]);

  // Handle admin setup
  const handleSetupAdmin = async () => {
    if (!user) {
      toast.error('Please sign in first');
      return;
    }

    setIsSettingUp(true);
    try {
      const response = await adminAPI.setupFirstAdmin();
      
      if (response.data.success) {
        setSetupComplete(true);
        toast.success('Admin account created successfully!');
        
        // Update Clerk metadata (optional, for faster role checks)
        try {
          await user.update({
            publicMetadata: { role: 'ADMIN' }
          });
        } catch (clerkError) {
          console.warn('Could not update Clerk metadata:', clerkError);
        }
        
        // Redirect to admin dashboard after a short delay
        setTimeout(() => {
          window.location.href = '/admin';
        }, 2000);
      }
    } catch (error) {
      console.error('Admin setup error:', error);
      const message = error.response?.data?.message || error.message || 'Failed to create admin account';
      toast.error(message);
      
      // If admin already exists, redirect
      if (error.response?.data?.code === 'ADMIN_EXISTS') {
        setTimeout(() => navigate('/'), 2000);
      }
    } finally {
      setIsSettingUp(false);
    }
  };

  // Loading state
  if (adminExists === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-secondary-600">Checking system status...</p>
        </div>
      </div>
    );
  }

  // Admin already exists - show message
  if (adminExists) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-secondary-900 mb-4">
            Admin Already Exists
          </h1>
          <p className="text-secondary-600 mb-6">
            The system already has an administrator. New admins can only be created by existing administrators through the admin panel.
          </p>
          <Link to="/" className="btn btn-primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to Home
          </Link>
        </motion.div>
      </div>
    );
  }

  // Setup complete - show success
  if (setupComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-secondary-900 mb-4">
            Admin Account Created!
          </h1>
          <p className="text-secondary-600 mb-6">
            You are now the system administrator. Redirecting to admin dashboard...
          </p>
          <div className="flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-lg w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link to="/" className="inline-flex items-center gap-2 text-secondary-600 hover:text-secondary-900 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-secondary-900 mb-2">
            Admin Setup
          </h1>
          <p className="text-secondary-600 max-w-md mx-auto">
            Set up the first administrator (TPO) account for the placement management system.
          </p>
        </motion.div>

        {/* Warning Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800 mb-1">Important Notice</h3>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• This is a ONE-TIME setup process</li>
                <li>• The signed-in account will become the system administrator</li>
                <li>• After setup, new admins can only be added from the admin panel</li>
                <li>• This action cannot be undone</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <SignedOut>
            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold text-secondary-900 mb-2">
                Step 1: Sign In
              </h2>
              <p className="text-sm text-secondary-600">
                Sign in with the account you want to use as the administrator account.
              </p>
            </div>
            
            <SignIn
              routing="path"
              path="/admin-setup"
              signUpUrl="/sign-up"
              redirectUrl="/admin-setup"
              appearance={{
                elements: {
                  rootBox: 'w-full',
                  card: 'shadow-none bg-transparent w-full',
                  headerTitle: 'hidden',
                  headerSubtitle: 'hidden',
                  formButtonPrimary: 'btn btn-primary btn-lg w-full',
                },
              }}
            />
          </SignedOut>

          <SignedIn>
            <div className="text-center">
              <h2 className="text-lg font-semibold text-secondary-900 mb-2">
                Step 2: Confirm Admin Setup
              </h2>
              <p className="text-sm text-secondary-600 mb-6">
                You are signed in as <span className="font-medium">{user?.primaryEmailAddress?.emailAddress}</span>. 
                Click below to make this account the system administrator.
              </p>

              {/* User Info Card */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center gap-3">
                  {user?.imageUrl && (
                    <img 
                      src={user.imageUrl} 
                      alt="" 
                      className="w-12 h-12 rounded-full"
                    />
                  )}
                  <div className="text-left">
                    <p className="font-medium text-secondary-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-sm text-secondary-600">
                      {user?.primaryEmailAddress?.emailAddress}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSetupAdmin}
                disabled={isSettingUp}
                className="btn btn-primary btn-lg w-full flex items-center justify-center gap-2"
              >
                {isSettingUp ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Create Admin Account
                  </>
                )}
              </button>

              <p className="text-xs text-secondary-500 mt-4">
                By clicking this button, you confirm that you are authorized to be the system administrator.
              </p>
            </div>
          </SignedIn>
        </motion.div>
      </div>
    </div>
  );
}
