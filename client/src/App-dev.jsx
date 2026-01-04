import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import DashboardLayout from './layouts/DashboardLayout-dev';

// Public Pages
import LandingPage from './pages/LandingPage';

// Student Pages
import StudentDashboard from './pages/student/Dashboard-dev';
import StudentProfile from './pages/student/Profile-dev';
import StudentJobs from './pages/student/Jobs-dev';
import StudentApplications from './pages/student/Applications-dev';
import StudentResume from './pages/student/Resume-dev';
import JobDetails from './pages/student/JobDetails-dev';

// Mock user for development
const mockUser = {
  user: { publicMetadata: { role: 'STUDENT' } },
  isLoaded: true
};

// Mock useUser hook
const useUser = () => mockUser;

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

  const userRole = user?.publicMetadata?.role;

  if (!userRole) {
    return <Navigate to="/role-selection" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect to appropriate dashboard based on role
    const dashboardRoutes = {
      STUDENT: '/student',
      RECRUITER: '/recruiter',
      ADMIN: '/admin',
    };
    return <Navigate to={dashboardRoutes[userRole] || '/'} replace />;
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

        {/* Student Routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <DashboardLayout role="student" />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="jobs" element={<StudentJobs />} />
          <Route path="jobs/:id" element={<JobDetails />} />
          <Route path="applications" element={<StudentApplications />} />
          <Route path="resume" element={<StudentResume />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
