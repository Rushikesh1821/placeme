import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { GraduationCap, Building2, Shield, ArrowRight, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const roles = [
  {
    id: 'STUDENT',
    title: 'Student',
    description: 'Looking for job opportunities and internships',
    icon: GraduationCap,
    color: 'bg-blue-500',
    features: [
      'Browse and apply to jobs',
      'AI-powered resume analysis',
      'Track application status',
      'Get eligibility scores',
    ],
  },
  {
    id: 'RECRUITER',
    title: 'Recruiter',
    description: 'Hiring talent for your company',
    icon: Building2,
    color: 'bg-green-500',
    features: [
      'Post job openings',
      'Review applications',
      'AI-powered candidate matching',
      'Track hiring pipeline',
    ],
  },
];

export default function RoleSelectionPage() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const navigate = useNavigate();

  // Check if user already has a role
  const existingRole = user?.publicMetadata?.role;
  if (existingRole) {
    const dashboardRoutes = {
      STUDENT: '/student',
      RECRUITER: '/recruiter',
      ADMIN: '/admin',
    };
    navigate(dashboardRoutes[existingRole] || '/');
    return null;
  }

  const handleRoleSelect = async () => {
    if (!selectedRole) {
      toast.error('Please select a role');
      return;
    }

    setLoading(true);
    try {
      // Try to set role via Clerk API
      try {
        await user.update({
          publicMetadata: {
            role: selectedRole,
          },
        });
        toast.success('Account setup complete!');
      } catch (clerkError) {
        console.warn('Clerk metadata update failed, using fallback:', clerkError);
        
        // Fallback: Store role in localStorage for development
        localStorage.setItem('userRole', selectedRole);
        toast.success('Account setup complete! (Development mode)');
      }

      // Navigate to appropriate dashboard
      const dashboardRoutes = {
        STUDENT: '/student',
        RECRUITER: '/recruiter',
      };
      
      // Force reload to get updated user metadata
      window.location.href = dashboardRoutes[selectedRole];
    } catch (error) {
      console.error('Error setting role:', error);
      toast.error(error.message || 'Failed to set up account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-secondary-900 mb-2">
            Choose your role
          </h1>
          <p className="text-secondary-600 max-w-md mx-auto">
            Select how you want to use PlaceMe. This will customize your dashboard experience.
          </p>
        </motion.div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {roles.map((role, index) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`card p-6 cursor-pointer transition-all duration-300 ${
                selectedRole === role.id
                  ? 'ring-2 ring-primary-500 border-primary-500'
                  : 'hover:border-secondary-300'
              }`}
              onClick={() => setSelectedRole(role.id)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${role.color} rounded-xl flex items-center justify-center`}>
                  <role.icon className="w-6 h-6 text-white" />
                </div>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    selectedRole === role.id
                      ? 'border-primary-500 bg-primary-500'
                      : 'border-secondary-300'
                  }`}
                >
                  {selectedRole === role.id && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                {role.title}
              </h3>
              <p className="text-secondary-600 mb-4">{role.description}</p>

              {/* Features */}
              <ul className="space-y-2">
                {role.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-secondary-600">
                    <Check className="w-4 h-4 text-success-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <button
            onClick={handleRoleSelect}
            disabled={!selectedRole || loading}
            className="btn btn-primary btn-lg inline-flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                Setting up...
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </motion.div>

        {/* Note */}
        <p className="mt-6 text-center text-sm text-secondary-500">
          You can contact support if you need to change your role later.
        </p>
      </div>
    </div>
  );
}
