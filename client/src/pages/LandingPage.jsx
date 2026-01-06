import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import {
  Briefcase,
  Users,
  BarChart3,
  FileText,
  CheckCircle,
  ArrowRight,
  Star,
  Building2,
  GraduationCap,
  Sparkles,
  Target,
  TrendingUp,
  Shield,
} from 'lucide-react';
import { adminAPI } from '../services/api';

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Analysis',
    description: 'Advanced resume parsing and skill extraction using NLP technology.',
  },
  {
    icon: Target,
    title: 'Smart Matching',
    description: 'Get matched with jobs based on your skills, experience, and preferences.',
  },
  {
    icon: BarChart3,
    title: 'Eligibility Scoring',
    description: 'Know your chances with our AI-driven eligibility score for each job.',
  },
  {
    icon: TrendingUp,
    title: 'Real-time Analytics',
    description: 'Track your applications and get insights to improve your profile.',
  },
];

const stats = [
  { value: '500+', label: 'Students Placed' },
  { value: '50+', label: 'Partner Companies' },
  { value: '95%', label: 'Success Rate' },
  { value: '₹12L', label: 'Avg. Package' },
];

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Software Engineer at Google',
    image: 'https://randomuser.me/api/portraits/women/1.jpg',
    quote: 'PlaceMe helped me land my dream job. The AI analysis pointed out exactly what I needed to improve.',
  },
  {
    name: 'Rahul Verma',
    role: 'Product Manager at Microsoft',
    image: 'https://randomuser.me/api/portraits/men/2.jpg',
    quote: 'The eligibility scoring saved me so much time. I only applied to jobs where I had a real chance.',
  },
  {
    name: 'Ananya Patel',
    role: 'Data Scientist at Amazon',
    image: 'https://randomuser.me/api/portraits/women/3.jpg',
    quote: 'From resume building to interview prep, PlaceMe was with me every step of the way.',
  },
];

export default function LandingPage() {
  // State to track if admin exists in the system
  const [adminExists, setAdminExists] = useState(true); // Default true to hide button initially
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  // Check if admin exists on component mount
  useEffect(() => {
    const checkAdminExists = async () => {
      try {
        const response = await adminAPI.checkAdminExists();
        setAdminExists(response.data.data.adminExists);
      } catch (error) {
        console.error('Error checking admin existence:', error);
        // On error, assume admin exists (safer default)
        setAdminExists(true);
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkAdminExists();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-secondary-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-heading font-bold text-secondary-900">PlaceMe</span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-secondary-600 hover:text-secondary-900 transition-colors">
                Features
              </a>
              <a href="#stats" className="text-secondary-600 hover:text-secondary-900 transition-colors">
                Stats
              </a>
              <a href="#testimonials" className="text-secondary-600 hover:text-secondary-900 transition-colors">
                Testimonials
              </a>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <SignedOut>
                {/* Show Admin Setup button ONLY if no admin exists */}
                {!checkingAdmin && !adminExists && (
                  <Link 
                    to="/admin-setup" 
                    className="btn btn-ghost btn-md text-amber-600 hover:bg-amber-50 flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    Setup Admin
                  </Link>
                )}
                <Link to="/sign-in" className="btn btn-ghost btn-md">
                  Sign In
                </Link>
                <Link to="/sign-up" className="btn btn-primary btn-md">
                  Get Started
                </Link>
              </SignedOut>
              <SignedIn>
                <Link to="/dashboard" className="btn btn-primary btn-md">
                  Dashboard
                </Link>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Text */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                AI-Powered Placement System
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-secondary-900 leading-tight mb-6">
                Your Dream Job is
                <span className="text-gradient"> One Click </span>
                Away
              </h1>
              <p className="text-lg text-secondary-600 mb-8 max-w-lg">
                Connect with top companies, get AI-powered resume analysis, and land your perfect job with PlaceMe - the smart college placement system.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/sign-up" className="btn btn-primary btn-lg inline-flex items-center justify-center gap-2">
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a href="#features" className="btn btn-outline btn-lg inline-flex items-center justify-center">
                  Learn More
                </a>
              </div>

              {/* Trust badges */}
              <div className="mt-10 flex items-center gap-6">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <img
                      key={i}
                      src={`https://randomuser.me/api/portraits/${i % 2 === 0 ? 'women' : 'men'}/${i + 10}.jpg`}
                      alt=""
                      className="w-10 h-10 rounded-full border-2 border-white"
                    />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-warning-400 text-warning-400" />
                    ))}
                  </div>
                  <p className="text-sm text-secondary-600">Trusted by 500+ students</p>
                </div>
              </div>
            </motion.div>

            {/* Right - Image */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800"
                  alt="Students collaborating"
                  className="rounded-2xl shadow-2xl"
                />
              </div>

              {/* Floating cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="absolute -left-6 top-1/4 bg-white rounded-xl shadow-lg p-4 z-20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-success-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-secondary-900">Application Sent!</p>
                    <p className="text-xs text-secondary-500">Google SDE Role</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="absolute -right-6 bottom-1/4 bg-white rounded-xl shadow-lg p-4 z-20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-secondary-900">Eligibility: 92%</p>
                    <p className="text-xs text-secondary-500">Based on AI Analysis</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-primary-200">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-secondary-900 mb-4">
              Powerful Features for Your Success
            </h2>
            <p className="text-secondary-600">
              Everything you need to land your dream job, powered by cutting-edge AI technology.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-7 h-7 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">{feature.title}</h3>
                <p className="text-secondary-600 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-secondary-900 mb-4">
              How It Works
            </h2>
            <p className="text-secondary-600">Get started in just a few simple steps</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: GraduationCap,
                title: 'Create Profile',
                description: 'Sign up and complete your profile with your education, skills, and experience.',
              },
              {
                step: '02',
                icon: FileText,
                title: 'Upload Resume',
                description: 'Upload your resume and let our AI analyze and extract your skills automatically.',
              },
              {
                step: '03',
                icon: Briefcase,
                title: 'Apply to Jobs',
                description: 'Browse eligible jobs, check your eligibility score, and apply with one click.',
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="card p-8">
                  <div className="text-6xl font-bold text-secondary-100 absolute top-4 right-4">
                    {item.step}
                  </div>
                  <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-secondary-900 mb-2">{item.title}</h3>
                  <p className="text-secondary-600">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-secondary-900 mb-4">
              What Students Say
            </h2>
            <p className="text-secondary-600">Join hundreds of students who landed their dream jobs</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card p-6"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-warning-400 text-warning-400" />
                  ))}
                </div>
                <p className="text-secondary-600 mb-6">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-secondary-900">{testimonial.name}</p>
                    <p className="text-sm text-secondary-500">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
              Ready to Land Your Dream Job?
            </h2>
            <p className="text-primary-100 mb-8 max-w-lg mx-auto">
              Join PlaceMe today and get access to top companies, AI-powered tools, and personalized job recommendations.
            </p>
            <Link
              to="/student"
              className="btn bg-white text-primary-600 hover:bg-primary-50 btn-lg inline-flex items-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary-900 text-secondary-300 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-heading font-bold text-white">PlaceMe</span>
              </div>
              <p className="text-sm">
                AI-Enabled College Placement Management System. Connecting students with their dream careers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-secondary-800 text-center text-sm">
            <p>© 2024 PlaceMe. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
