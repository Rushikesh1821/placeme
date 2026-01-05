import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, useUser, UserButton } from '@clerk/clerk-react';
import { Toaster } from 'react-hot-toast';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Auth Pages
import SignInPage from './pages/auth/SignInPage';
import SignUpPage from './pages/auth/SignUpPage';
import RoleSelectionPage from './pages/auth/RoleSelectionPage';

// Public Pages
import LandingPage from './pages/LandingPage';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import StudentProfile from './pages/student/Profile';
import StudentJobs from './pages/student/Jobs';
import StudentApplications from './pages/student/Applications';
import StudentResume from './pages/student/Resume';
import JobDetails from './pages/student/JobDetails';

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/Dashboard';
import RecruiterProfile from './pages/recruiter/Profile';
import RecruiterJobPostings from './pages/recruiter/JobPostings';
import RecruiterApplications from './pages/recruiter/Applications';
import CreateJob from './pages/recruiter/CreateJob';
import EditJob from './pages/recruiter/EditJob';
import ViewApplications from './pages/recruiter/ViewApplications';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminStudents from './pages/admin/Students';
import AdminRecruiters from './pages/admin/Recruiters';
import AdminJobs from './pages/admin/Jobs';
import AdminAnalytics from './pages/admin/Analytics';
import AdminSettings from './pages/admin/Settings';

// TPO Module Pages
import TPODashboard from './pages/admin/TPODashboard';
import StudentsManagement from './pages/admin/StudentsManagement';
import CompaniesManagement from './pages/admin/CompaniesManagement';
import JobsManagement from './pages/admin/JobsManagement';
import TPOSettings from './pages/admin/TPOSettings';
import ActivityLogs from './pages/admin/ActivityLogs';
import ReportsPage from './pages/admin/ReportsPage';

// Dev helpers
import DevLogin from './pages/dev/DevLogin';

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Clerk-provided role (if signed in)
  const clerkRole = user?.publicMetadata?.role;
  // Dev fallback from localStorage (allowed only in dev mode)
  const devRole = import.meta.env.DEV ? localStorage.getItem('userRole') : null;

  // If not signed in at all, redirect to sign-in
  if (!user && !devRole) {
    return <Navigate to="/sign-in" replace />;
  }

  // If signed-in but role not set, prompt role selection
  const effectiveRole = clerkRole || devRole;
  if (!effectiveRole) {
    return <Navigate to="/role-selection" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(effectiveRole)) {
    // Redirect to appropriate dashboard based on role
    const dashboardRoutes = {
      STUDENT: '/student',
      RECRUITER: '/recruiter',
      ADMIN: '/admin',
    };
    return <Navigate to={dashboardRoutes[effectiveRole] || '/'} replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route
            path="/sign-in/*"
            element={
              <SignedOut>
                <SignInPage />
              </SignedOut>
            }
          />
          <Route
            path="/sign-up/*"
            element={
              <SignedOut>
                <SignUpPage />
              </SignedOut>
            }
          />
        </Route>

        {/* Role Selection (for new users) */}
        <Route
          path="/role-selection"
          element={
            <SignedIn>
              <RoleSelectionPage />
            </SignedIn>
          }
        />

        {/* Student Routes */}
        <Route
          path="/student"
          element={
            <SignedIn>
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <DashboardLayout role="student" />
              </ProtectedRoute>
            </SignedIn>
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="jobs" element={<StudentJobs />} />
          <Route path="jobs/:id" element={<JobDetails />} />
          <Route path="applications" element={<StudentApplications />} />
          <Route path="resume" element={<StudentResume />} />
        </Route>
        {/* Dev helpers (development only) */}
        <Route path="/dev-login" element={<DevLogin />} />
        {import.meta.env.DEV && (
          <Route path="/dev-admin" element={<DashboardLayout role="admin" />}>
            <Route index element={<TPODashboard />} />
          </Route>
        )}
        {/* Recruiter Routes */}
        <Route
          path="/recruiter"
          element={
            <SignedIn>
              <ProtectedRoute allowedRoles={['RECRUITER']}>
                <DashboardLayout role="recruiter" />
              </ProtectedRoute>
            </SignedIn>
          }
        >
          <Route index element={<RecruiterDashboard />} />
          <Route path="profile" element={<RecruiterProfile />} />
          <Route path="jobs" element={<RecruiterJobPostings />} />
          <Route path="jobs/create" element={<CreateJob />} />
          <Route path="jobs/:id/edit" element={<EditJob />} />
          <Route path="jobs/:id/applications" element={<ViewApplications />} />
          <Route path="applications" element={<RecruiterApplications />} />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <SignedIn>
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <DashboardLayout role="admin" />
              </ProtectedRoute>
            </SignedIn>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="recruiters" element={<AdminRecruiters />} />
          <Route path="jobs" element={<AdminJobs />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="settings" element={<AdminSettings />} />
          {/* TPO Module Routes */}
          <Route path="tpo-dashboard" element={<TPODashboard />} />
          <Route path="students-management" element={<StudentsManagement />} />
          <Route path="companies-management" element={<CompaniesManagement />} />
          <Route path="jobs-management" element={<JobsManagement />} />
          <Route path="tpo-settings" element={<TPOSettings />} />
          <Route path="activity-logs" element={<ActivityLogs />} />
          <Route path="reports" element={<ReportsPage />} />
        </Route>

        {/* Redirect signed-in users to their dashboard */}
        <Route
          path="/dashboard"
          element={
            <SignedIn>
              <DashboardRedirect />
            </SignedIn>
          }
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

// Helper component to redirect to appropriate dashboard
function DashboardRedirect() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const role = user?.publicMetadata?.role;

  if (!role) {
    return <Navigate to="/role-selection" replace />;
  }

  const dashboardRoutes = {
    STUDENT: '/student',
    RECRUITER: '/recruiter',
    ADMIN: '/admin',
  };

  return <Navigate to={dashboardRoutes[role] || '/'} replace />;
}

export default App;
