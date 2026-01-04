import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  User,
  Briefcase,
  FileText,
  BarChart3,
  Settings,
  Building2,
  Users,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  Plus,
} from 'lucide-react';

// Navigation items for each role
const navigationConfig = {
  student: [
    { name: 'Dashboard', href: '/student', icon: Home },
    { name: 'My Profile', href: '/student/profile', icon: User },
    { name: 'Browse Jobs', href: '/student/jobs', icon: Briefcase },
    { name: 'Applications', href: '/student/applications', icon: FileText },
    { name: 'Resume', href: '/student/resume', icon: FileText },
  ],
  recruiter: [
    { name: 'Dashboard', href: '/recruiter', icon: Home },
    { name: 'Company Profile', href: '/recruiter/profile', icon: Building2 },
    { name: 'Job Postings', href: '/recruiter/jobs', icon: Briefcase },
    { name: 'Applications', href: '/recruiter/applications', icon: Users },
  ],
  admin: [
    { name: 'Dashboard', href: '/admin', icon: Home },
    { name: 'Students', href: '/admin/students', icon: Users },
    { name: 'Recruiters', href: '/admin/recruiters', icon: Building2 },
    { name: 'Jobs', href: '/admin/jobs', icon: Briefcase },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ],
};

const roleLabels = {
  student: 'Student',
  recruiter: 'Recruiter',
  admin: 'Administrator',
};

// Mock user for development
const mockUser = {
  firstName: 'Demo',
  lastName: 'User',
  imageUrl: null,
};

export default function DashboardLayout({ role }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const navigationItems = navigationConfig[role] || [];

  const handleSignOut = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        className="fixed left-0 top-0 z-50 w-72 h-full bg-white border-r border-secondary-200 lg:static lg:translate-x-0 lg:z-auto"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 p-6 border-b border-secondary-200">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-heading font-bold text-secondary-900">PlaceMe</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navigationItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-secondary-200">
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary-100 transition-colors">
              <div className="avatar avatar-md bg-primary-100 text-primary-700">
                {mockUser.firstName?.[0]}{mockUser.lastName?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-secondary-900 truncate">
                  {mockUser.firstName} {mockUser.lastName}
                </p>
                <p className="text-xs text-secondary-500 capitalize">{roleLabels[role]}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-secondary-400 hover:text-secondary-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="lg:ml-72">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-secondary-200">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-secondary-100 transition-colors"
            >
              <Menu className="w-5 h-5 text-secondary-600" />
            </button>

            {/* Search bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <input
                  type="text"
                  placeholder="Search jobs, companies, skills..."
                  className="input pl-10"
                />
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-lg hover:bg-secondary-100 transition-colors relative">
                <Bell className="w-5 h-5 text-secondary-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-error-500 rounded-full"></span>
              </button>
              
              {/* User avatar (desktop) */}
              <div className="hidden lg:flex items-center gap-3 p-2 rounded-lg hover:bg-secondary-100 transition-colors">
                <div className="avatar avatar-sm bg-primary-100 text-primary-700">
                  {mockUser.firstName?.[0]}{mockUser.lastName?.[0]}
                </div>
                <span className="text-sm font-medium text-secondary-900">
                  {mockUser.firstName} {mockUser.lastName}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
