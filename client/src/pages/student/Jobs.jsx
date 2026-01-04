import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  MapPin,
  DollarSign,
  Clock,
  Building2,
  Briefcase,
  ChevronDown,
  X,
  Star,
  BookmarkPlus,
  Users,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { jobAPI } from '../../services/api';

const branches = [
  'All Branches',
  'Computer Science',
  'Information Technology',
  'Electronics and Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
];

const jobTypes = ['All Types', 'Full-time', 'Internship', 'Part-time', 'Contract'];
const locations = ['All Locations', 'Bangalore', 'Hyderabad', 'Mumbai', 'Delhi', 'Chennai', 'Pune', 'Remote'];

export default function StudentJobs() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    branch: 'All Branches',
    jobType: 'All Types',
    location: 'All Locations',
    minSalary: '',
    minEligibility: 0,
  });
  const [sortBy, setSortBy] = useState('eligibility');
  const [savedJobs, setSavedJobs] = useState([]);

  // Global state for cross-role job sharing
  const [globalJobs, setGlobalJobs] = useState(() => {
    // Try to load from window object for cross-component sharing
    if (typeof window !== 'undefined' && window.sharedJobs) {
      return window.sharedJobs;
    }
    return [];
  });

  // Listen for global job updates
  useEffect(() => {
    const checkForNewJobs = () => {
      console.log('=== CHECKING FOR NEW JOBS ===');
      
      // Check all storage locations
      const recruiterJobs = JSON.parse(localStorage.getItem('recruiterJobs') || '[]');
      const sharedJobs = JSON.parse(localStorage.getItem('sharedJobs') || '[]');
      const sessionJobs = JSON.parse(sessionStorage.getItem('sharedJobs') || '[]');
      
      console.log('Storage check - recruiterJobs:', recruiterJobs.length);
      console.log('Storage check - sharedJobs:', sharedJobs.length);
      console.log('Storage check - sessionJobs:', sessionJobs.length);
      
      if (typeof window !== 'undefined' && window.sharedJobs) {
        const newJobs = window.sharedJobs;
        console.log('Global state check - window.sharedJobs:', newJobs.length);
        if (JSON.stringify(newJobs) !== JSON.stringify(globalJobs)) {
          console.log('Found new global jobs:', newJobs);
          setGlobalJobs(newJobs);
          // Trigger fetchJobs to reload
          fetchJobs();
        }
      }
      
      // NEW: Check for URL-based job notifications
      const lastJobUrl = localStorage.getItem('lastJobUrl');
      if (lastJobUrl) {
        try {
          const url = new URL(lastJobUrl);
          const jobData = url.searchParams.get('newJob');
          const timestamp = url.searchParams.get('timestamp');
          
          if (jobData && timestamp) {
            let job;
            
            // Try to decode from base64, fallback to JSON if that fails
            try {
              job = JSON.parse(atob(jobData));
            } catch (decodeError) {
              console.log('Base64 decode failed, trying direct JSON parse');
              try {
                job = JSON.parse(jobData);
              } catch (directParseError) {
                console.error('Could not decode job data:', directParseError);
                localStorage.removeItem('lastJobUrl');
                return;
              }
            }
            
            const jobAge = Date.now() - parseInt(timestamp);
            
            // Only process jobs created in the last 30 seconds (increased from 10)
            if (jobAge < 30000) {
              console.log('=== URL JOB NOTIFICATION DETECTED ===');
              console.log('Job from URL:', job);
              console.log('Job age:', jobAge, 'ms');
              
              // Add to global state
              if (typeof window !== 'undefined') {
                window.sharedJobs = window.sharedJobs || [];
                const existingJobIds = window.sharedJobs.map(j => j.id);
                if (!existingJobIds.includes(job.id)) {
                  window.sharedJobs.push(job);
                  console.log('Added URL job to global state');
                  setGlobalJobs(window.sharedJobs);
                  // Trigger fetchJobs to reload
                  fetchJobs();
                }
              }
              
              // Clear the URL notification
              localStorage.removeItem('lastJobUrl');
            }
          }
        } catch (error) {
          console.error('Error processing URL job notification:', error);
          localStorage.removeItem('lastJobUrl');
        }
      }
      
      // NEW: Check if any storage has new jobs and trigger reload
      const totalStorageJobs = [...recruiterJobs, ...sharedJobs, ...sessionJobs];
      if (totalStorageJobs.length > 0) {
        console.log('Found jobs in storage, triggering fetchJobs');
        fetchJobs();
      }
    };

    // Check immediately
    checkForNewJobs();
    
    // Set up interval to check for new jobs more frequently (every 500ms)
    const interval = setInterval(checkForNewJobs, 500);
    
    return () => clearInterval(interval);
  }, [globalJobs]);

  useEffect(() => {
    fetchJobs();
    
    // Temporary test: Add a test job to see if it works
    const testJob = {
      id: 999999,
      title: 'TEST JOB - Clerk',
      location: 'Bangalore, India',
      type: 'Full-Time',
      salary: { min: 15, max: 25 },
      deadline: '2024-03-15',
      eligibleBranches: ['Computer Science'],
      minCGPA: 7.0,
      skills: ['JavaScript', 'React'],
      createdAt: new Date().toISOString(),
      description: 'This is a test job to verify the system works.',
    };
    
    // Temporarily add this test job to localStorage
    const existingTestJobs = JSON.parse(localStorage.getItem('testJobs') || '[]');
    if (existingTestJobs.length === 0) {
      existingTestJobs.push(testJob);
      localStorage.setItem('testJobs', JSON.stringify(existingTestJobs));
      console.log('Added test job:', testJob);
    }
  }, []);

  useEffect(() => {
    applyFilters();
  }, [jobs, searchQuery, filters, sortBy]);

  const fetchJobs = async () => {
    try {
      // Load from multiple storage locations for cross-role access
      const recruiterJobs = JSON.parse(localStorage.getItem('recruiterJobs') || '[]');
      const sharedJobs = JSON.parse(localStorage.getItem('sharedJobs') || '[]');
      const sessionJobs = JSON.parse(sessionStorage.getItem('sharedJobs') || '[]');
      const testJobs = JSON.parse(localStorage.getItem('testJobs') || '[]');
      
      // Also check global state
      const globalStateJobs = globalJobs || [];
      
      console.log('Raw recruiter jobs from localStorage:', recruiterJobs);
      console.log('Shared jobs from localStorage:', sharedJobs);
      console.log('Session jobs from sessionStorage:', sessionJobs);
      console.log('Test jobs from localStorage:', testJobs);
      console.log('Global state jobs:', globalStateJobs);
      
      // Combine all jobs from different sources
      const allRecruiterJobs = [...recruiterJobs, ...sharedJobs, ...sessionJobs, ...testJobs, ...globalStateJobs];
      
      console.log('Total jobs found:', allRecruiterJobs.length);
      
      // Remove duplicates based on ID
      const uniqueJobs = allRecruiterJobs.filter((job, index, self) => 
        index === self.findIndex((j) => j.id === job.id)
      );
      
      console.log('Unique jobs after deduplication:', uniqueJobs.length);
      
      // Convert job format to student job format
      const convertedRecruiterJobs = uniqueJobs.map(job => {
        console.log('Converting job:', job.title);
        
        // Assign proper company names and logos based on job title or use defaults
        let companyName = 'Company Name';
        let companyLogo = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=100&h=100';
        
        // Map job titles to appropriate companies
        if (job.title.includes('TEST')) {
          companyName = 'Test Company';
          companyLogo = 'https://images.unsplash.com/photo-1560472354-b33ff0c8e4f2?auto=format&fit=crop&q=80&w=100&h=100';
        } else if (job.title.toLowerCase().includes('software') || job.title.toLowerCase().includes('developer') || job.title.toLowerCase().includes('engineer')) {
          companyName = 'TechCorp Solutions';
          companyLogo = 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&q=80&w=100&h=100';
        } else if (job.title.toLowerCase().includes('frontend') || job.title.toLowerCase().includes('ui') || job.title.toLowerCase().includes('web')) {
          companyName = 'Digital Innovations';
          companyLogo = 'https://images.unsplash.com/photo-1605087667593-69c0e9b7520b?auto=format&fit=crop&q=80&w=100&h=100';
        } else if (job.title.toLowerCase().includes('backend') || job.title.toLowerCase().includes('api') || job.title.toLowerCase().includes('server')) {
          companyName = 'Cloud Systems Inc';
          companyLogo = 'https://images.unsplash.com/photo-1573164713619-24c711fe7871?auto=format&fit=crop&q=80&w=100&h=100';
        } else if (job.title.toLowerCase().includes('data') || job.title.toLowerCase().includes('analyst') || job.title.toLowerCase().includes('science')) {
          companyName = 'Data Analytics Pro';
          companyLogo = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=100&h=100';
        } else if (job.title.toLowerCase().includes('product') || job.title.toLowerCase().includes('manager')) {
          companyName = 'Product Leadership Co';
          companyLogo = 'https://images.unsplash.com/photo-1573164713619-24c711fe7871?auto=format&fit=crop&q=80&w=100&h=100';
        } else if (job.title.toLowerCase().includes('designer') || job.title.toLowerCase().includes('ux') || job.title.toLowerCase().includes('creative')) {
          companyName = 'Creative Studio';
          companyLogo = 'https://images.unsplash.com/photo-1560472354-b33ff0c8e4f2?auto=format&fit=crop&q=80&w=100&h=100';
        } else {
          companyName = 'Innovation Labs';
          companyLogo = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=100&h=100';
        }
        
        return {
          id: job.id,
          title: job.title,
          company: { 
            name: companyName,
            logo: companyLogo
          },
          location: job.location,
          jobType: job.type,
          salary: job.salary,
          eligibilityScore: Math.floor(Math.random() * 30) + 70,
          deadline: job.deadline,
          requiredBranches: job.eligibleBranches || ['Computer Science'],
          minCGPA: job.minCGPA || 7.0,
          skills: job.skills || ['JavaScript', 'React'],
          applicants: Math.floor(Math.random() * 100) + 50,
          postedAt: job.createdAt,
          description: job.description || 'Great opportunity for talented students.',
        };
      });
      
      console.log('Converted recruiter jobs:', convertedRecruiterJobs);
      
      // Mock data
      const mockJobs = [
        {
          id: 1,
          title: 'Software Development Engineer',
          company: { name: 'Google', logo: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=100&h=100' },
          location: 'Bangalore',
          jobType: 'Full-time',
          salary: { min: 2000000, max: 3500000 },
          eligibilityScore: 92,
          deadline: '2024-01-20',
          requiredBranches: ['Computer Science', 'Information Technology'],
          minCGPA: 7.5,
          skills: ['JavaScript', 'React', 'Node.js', 'SQL'],
          applicants: 245,
          postedAt: '2024-01-05',
          description: 'Join our team to build innovative products that impact billions of users.',
        },
        {
          id: 2,
          title: 'Frontend Developer',
          company: { name: 'Microsoft', logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&q=80&w=100&h=100' },
          location: 'Hyderabad',
          jobType: 'Full-time',
          salary: { min: 1800000, max: 2800000 },
          eligibilityScore: 85,
          deadline: '2024-01-25',
          requiredBranches: ['Computer Science', 'Information Technology', 'Electronics and Communication'],
          minCGPA: 7.0,
          skills: ['React', 'TypeScript', 'CSS', 'Testing'],
          applicants: 189,
          postedAt: '2024-01-08',
          description: 'Work on cutting-edge web applications with the latest technologies.',
        },
        {
          id: 3,
          title: 'Full Stack Developer',
          company: { name: 'Amazon', logo: 'https://images.unsplash.com/photo-1605087667593-69c0e9b7520b?auto=format&fit=crop&q=80&w=100&h=100' },
          location: 'Remote',
          jobType: 'Full-time',
          salary: { min: 2200000, max: 3200000 },
          eligibilityScore: 78,
          deadline: '2024-01-22',
          requiredBranches: ['Computer Science'],
          minCGPA: 8.0,
          skills: ['Python', 'Django', 'AWS', 'Docker'],
          applicants: 312,
          postedAt: '2024-01-03',
          description: 'Build scalable systems that handle millions of transactions.',
        },
        {
          id: 4,
          title: 'Data Analyst Intern',
          company: { name: 'Flipkart', logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c8e4f2?auto=format&fit=crop&q=80&w=100&h=100' },
          location: 'Bangalore',
          jobType: 'Internship',
          salary: { min: 50000, max: 75000, isMonthly: true },
          eligibilityScore: 88,
          deadline: '2024-01-18',
          requiredBranches: ['All Branches'],
          minCGPA: 7.0,
          skills: ['Python', 'SQL', 'Excel', 'Data Visualization'],
          applicants: 156,
          postedAt: '2024-01-10',
          description: 'Analyze data to drive business decisions for India\'s largest e-commerce platform.',
        },
        {
          id: 5,
          title: 'Backend Engineer',
          company: { name: 'Razorpay', logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c8e4f2?auto=format&fit=crop&q=80&w=100&h=100' },
          location: 'Bangalore',
          jobType: 'Full-time',
          salary: { min: 1500000, max: 2500000 },
          eligibilityScore: 72,
          deadline: '2024-01-28',
          requiredBranches: ['Computer Science', 'Information Technology'],
          minCGPA: 7.5,
          skills: ['Go', 'PostgreSQL', 'Redis', 'Microservices'],
          applicants: 198,
          postedAt: '2024-01-07',
          description: 'Builds payment infrastructure powering thousands of businesses.',
        },
        {
          id: 6,
          title: 'Product Manager',
          company: { name: 'Swiggy', logo: 'https://images.unsplash.com/photo-1573164713619-24c711fe7871?auto=format&fit=crop&q=80&w=100&h=100' },
          location: 'Hyderabad',
          jobType: 'Full-time',
          salary: { min: 2000000, max: 3000000 },
          eligibilityScore: 65,
          deadline: '2024-01-30',
          requiredBranches: ['All Branches'],
          minCGPA: 7.0,
          skills: ['Product Management', 'Analytics', 'Communication', 'Strategy'],
          applicants: 423,
          postedAt: '2024-01-06',
          description: 'India\'s leading food delivery platform connecting millions to restaurants daily.',
        },
      ];

      // Combine recruiter jobs with mock jobs
      const allJobs = [...convertedRecruiterJobs, ...mockJobs];
      setJobs(allJobs);
      
      console.log('Loaded jobs for students:', allJobs);
      console.log('Recruiter jobs found:', convertedRecruiterJobs.length);
    } catch (error) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...jobs];
    
    console.log('applyFilters called with jobs:', jobs);
    console.log('Initial result length:', result.length);

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.company.name.toLowerCase().includes(query) ||
          job.skills.some((s) => s.toLowerCase().includes(query))
      );
      console.log('After search filter:', result.length);
    }

    // Branch filter
    if (filters.branch !== 'All Branches') {
      result = result.filter(
        (job) =>
          job.requiredBranches.includes('All Branches') ||
          job.requiredBranches.includes(filters.branch)
      );
      console.log('After branch filter:', result.length);
    }

    // Job type filter
    if (filters.jobType !== 'All Types') {
      result = result.filter((job) => job.jobType === filters.jobType);
      console.log('After job type filter:', result.length);
    }

    // Location filter
    if (filters.location !== 'All Locations') {
      result = result.filter((job) => job.location === filters.location);
      console.log('After location filter:', result.length);
    }

    // Eligibility filter
    if (filters.minEligibility > 0) {
      result = result.filter((job) => job.eligibilityScore >= filters.minEligibility);
      console.log('After eligibility filter:', result.length);
    }

    // Sorting
    switch (sortBy) {
      case 'eligibility':
        result.sort((a, b) => b.eligibilityScore - a.eligibilityScore);
        break;
      case 'salary':
        result.sort((a, b) => b.salary.max - a.salary.max);
        break;
      case 'deadline':
        result.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
        break;
      case 'recent':
        result.sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
        break;
    }

    console.log('Final filtered jobs:', result);
    console.log('Final filtered jobs length:', result.length);
    setFilteredJobs(result);
  };

  const formatSalary = (salary) => {
    if (salary.isMonthly) {
      return `₹${(salary.min / 1000).toFixed(0)}K - ₹${(salary.max / 1000).toFixed(0)}K/month`;
    }
    return `₹${(salary.min / 100000).toFixed(1)}L - ₹${(salary.max / 100000).toFixed(1)}L/year`;
  };

  const getEligibilityColor = (score) => {
    if (score >= 80) return 'text-success-600 bg-success-50';
    if (score >= 60) return 'text-warning-600 bg-warning-50';
    return 'text-error-600 bg-error-50';
  };

  const toggleSaveJob = (jobId) => {
    if (savedJobs.includes(jobId)) {
      setSavedJobs(savedJobs.filter((id) => id !== jobId));
      toast.success('Job removed from saved');
    } else {
      setSavedJobs([...savedJobs, jobId]);
      toast.success('Job saved!');
    }
  };

  const handleApply = async (jobId) => {
    console.log('Apply Now clicked for job ID:', jobId);
    console.log('Available jobs:', jobs);
    
    // Mock apply functionality - create application and add to list
    const newApplication = {
      id: Date.now(), // Use timestamp as unique ID
      job: jobs.find(j => j.id === jobId),
      status: 'PENDING',
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      eligibilityScore: Math.floor(Math.random() * 30) + 70, // Random score between 70-100
      notes: null,
    };

    console.log('New application data:', newApplication);

    if (newApplication.job) {
      // Add to applications list (in a real app, this would be handled by the backend)
      console.log('Application found, creating...');
      
      // Store in localStorage for Applications component to pick up
      const existingApplications = JSON.parse(localStorage.getItem('studentApplications') || '[]');
      existingApplications.push(newApplication);
      localStorage.setItem('studentApplications', JSON.stringify(existingApplications));
      
      console.log('Application stored in localStorage');
      toast.success('Application submitted successfully!');
      
      // Navigate to job details page
      window.location.href = `/student/jobs/${jobId}`;
    } else {
      console.error('Job not found for ID:', jobId);
      toast.error('Job not found');
    }
  };

  const daysUntilDeadline = (deadline) => {
    const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Expired';
    if (days === 0) return 'Today';
    if (days === 1) return '1 day left';
    return `${days} days left`;
  };

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
        <h1 className="text-2xl font-heading font-bold text-secondary-900">Browse Jobs</h1>
        <p className="text-secondary-600">Find your perfect opportunity from {jobs.length} available positions</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="card p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
            <input
              type="text"
              placeholder="Search jobs, companies, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary btn-md flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input w-auto"
          >
            <option value="eligibility">Sort by Eligibility</option>
            <option value="salary">Sort by Salary</option>
            <option value="deadline">Sort by Deadline</option>
            <option value="recent">Sort by Recent</option>
          </select>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-secondary-200"
          >
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="label">Branch</label>
                <select
                  value={filters.branch}
                  onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
                  className="input"
                >
                  {branches.map((branch) => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Job Type</label>
                <select
                  value={filters.jobType}
                  onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}
                  className="input"
                >
                  {jobTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Location</label>
                <select
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="input"
                >
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Min. Eligibility Score</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.minEligibility}
                  onChange={(e) => setFilters({ ...filters, minEligibility: parseInt(e.target.value) })}
                  className="w-full"
                />
                <p className="text-sm text-secondary-500 text-center">{filters.minEligibility}%</p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setFilters({
                  branch: 'All Branches',
                  jobType: 'All Types',
                  location: 'All Locations',
                  minSalary: '',
                  minEligibility: 0,
                })}
                className="btn btn-ghost btn-sm"
              >
                Clear Filters
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-secondary-600">
          Showing <span className="font-semibold text-secondary-900">{filteredJobs.length}</span> jobs
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              console.log('=== MANUAL REFRESH TRIGGERED ===');
              fetchJobs();
              toast.success('Job list refreshed!');
            }}
            className="btn btn-secondary btn-sm flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Jobs
          </button>
          <button
            onClick={() => {
              // Add a test job manually for cross-browser testing
              const testJob = {
                id: Date.now(),
                title: 'TEST RECRUITER JOB',
                location: 'Bangalore, India',
                type: 'Full-Time',
                workMode: 'On-site',
                salary: { min: 15, max: 25 },
                openings: 5,
                deadline: '2024-03-15',
                minCGPA: 7.0,
                experience: '2-3 years',
                eligibleBranches: ['Computer Science', 'IT'],
                skills: ['JavaScript', 'React', 'Node.js'],
                description: 'This is a test job created manually to simulate recruiter job posting.',
                status: 'active',
                applications: 0,
                createdAt: new Date().toISOString(),
              };
              
              // Store in ALL the same locations that recruiter uses
              const existingRecruiterJobs = JSON.parse(localStorage.getItem('recruiterJobs') || '[]');
              existingRecruiterJobs.push(testJob);
              localStorage.setItem('recruiterJobs', JSON.stringify(existingRecruiterJobs));
              
              const existingSharedJobs = JSON.parse(localStorage.getItem('sharedJobs') || '[]');
              existingSharedJobs.push(testJob);
              localStorage.setItem('sharedJobs', JSON.stringify(existingSharedJobs));
              
              const existingSessionJobs = JSON.parse(sessionStorage.getItem('sharedJobs') || '[]');
              existingSessionJobs.push(testJob);
              sessionStorage.setItem('sharedJobs', JSON.stringify(existingSessionJobs));
              
              // Store in global window object
              if (typeof window !== 'undefined') {
                window.sharedJobs = window.sharedJobs || [];
                window.sharedJobs.push(testJob);
              }
              
              console.log('=== MANUAL TEST JOB ADDED TO ALL LOCATIONS ===');
              console.log('Test job:', testJob);
              console.log('recruiterJobs:', JSON.parse(localStorage.getItem('recruiterJobs')));
              console.log('sharedJobs:', JSON.parse(localStorage.getItem('sharedJobs')));
              console.log('sessionJobs:', JSON.parse(sessionStorage.getItem('sharedJobs')));
              console.log('window.sharedJobs:', window.sharedJobs);
              
              fetchJobs();
              toast.success('Test job added! Check console for details.');
            }}
            className="btn btn-primary btn-sm"
          >
            Add Test Job
          </button>
          <button
            onClick={() => {
              // Debug: Check all storage locations
              console.log('=== COMPLETE STORAGE DEBUG ===');
              console.log('localStorage keys:', Object.keys(localStorage));
              console.log('sessionStorage keys:', Object.keys(sessionStorage));
              console.log('window.sharedJobs:', window.sharedJobs);
              
              // Check all job-related storage
              const recruiterJobs = JSON.parse(localStorage.getItem('recruiterJobs') || '[]');
              const sharedJobs = JSON.parse(localStorage.getItem('sharedJobs') || '[]');
              const sessionJobs = JSON.parse(sessionStorage.getItem('sharedJobs') || '[]');
              const testJobs = JSON.parse(localStorage.getItem('testJobs') || '[]');
              
              console.log('=== STORAGE CONTENTS ===');
              console.log('recruiterJobs:', recruiterJobs);
              console.log('sharedJobs:', sharedJobs);
              console.log('sessionJobs:', sessionJobs);
              console.log('testJobs:', testJobs);
              console.log('globalJobs:', globalJobs);
              
              alert('Storage debug info logged to console! Check the developer console.');
            }}
            className="btn btn-ghost btn-sm"
          >
            Debug Storage
          </button>
          <div className="text-xs text-secondary-500">
            💡 Using different browsers? Try "Add Test Job" for testing
          </div>
        </div>
      </div>

      {/* Job Listings */}
      <div className="space-y-4">
        {console.log('About to render filteredJobs:', filteredJobs)}
        {console.log('filteredJobs.length:', filteredJobs.length)}
        {filteredJobs.length === 0 ? (
          <div className="card p-12 text-center">
            <Briefcase className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">No jobs found</h3>
            <p className="text-secondary-600">Try adjusting your search or filters to find more opportunities.</p>
          </div>
        ) : (
          filteredJobs.map((job, index) => {
            console.log('Rendering job:', job.title, 'ID:', job.id);
            return (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card hover:shadow-lg transition-shadow"
              >
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                {/* Company Logo */}
                <img
                  src={job.company.logo}
                  alt={job.company.name}
                  className="w-16 h-16 rounded-xl object-contain bg-white border border-secondary-200 p-2 flex-shrink-0"
                />

                {/* Job Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-secondary-900 hover:text-primary-600">
                        <Link to={`/student/jobs/${job.id}`}>{job.title}</Link>
                      </h3>
                      <p className="text-secondary-600">{job.company.name}</p>
                    </div>

                    {/* Eligibility Score Badge */}
                    <div className={`px-3 py-1.5 rounded-lg font-bold text-lg ${getEligibilityColor(job.eligibilityScore)}`}>
                      {job.eligibilityScore}%
                      <span className="block text-xs font-normal">Match</span>
                    </div>
                  </div>

                  {/* Job Meta */}
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-secondary-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" /> {job.jobType}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" /> {formatSalary(job.salary)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" /> {job.applicants} applicants
                    </span>
                    <span className={`flex items-center gap-1 ${
                      daysUntilDeadline(job.deadline) === 'Expired' ? 'text-error-600' :
                      daysUntilDeadline(job.deadline).includes('day') && parseInt(daysUntilDeadline(job.deadline)) <= 3 ? 'text-warning-600' :
                      'text-secondary-500'
                    }`}>
                      <Clock className="w-4 h-4" /> {daysUntilDeadline(job.deadline)}
                    </span>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {job.skills.slice(0, 5).map((skill) => (
                      <span key={skill} className="badge badge-secondary">{skill}</span>
                    ))}
                    {job.skills.length > 5 && (
                      <span className="badge badge-secondary">+{job.skills.length - 5} more</span>
                    )}
                  </div>

                  {/* Description Preview */}
                  <p className="text-secondary-600 text-sm mt-3 line-clamp-2">{job.description}</p>

                  {/* Actions */}
                  <div className="flex items-center gap-3 mt-4">
                    <Link to={`/student/jobs/${job.id}`} onClick={() => handleApply(job.id)} className="btn btn-primary btn-sm">
                      Apply Now
                    </Link>
                    <Link to={`/student/jobs/${job.id}`} className="btn btn-secondary btn-sm">
                      View Details
                    </Link>
                    <button
                      onClick={() => toggleSaveJob(job.id)}
                      className={`btn btn-sm ${savedJobs.includes(job.id) ? 'btn-secondary' : 'btn-ghost'}`}
                    >
                      <BookmarkPlus className={`w-4 h-4 ${savedJobs.includes(job.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
            );
          })
        )}

        {filteredJobs.length === 0 && (
          <div className="card p-12 text-center">
            <Briefcase className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">No jobs found</h3>
            <p className="text-secondary-600">Try adjusting your search or filters to find more opportunities.</p>
          </div>
        )}
      </div>
    </div>
  );
}
