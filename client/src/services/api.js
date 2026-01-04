import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    // Get token from Clerk
    const token = await window.Clerk?.session?.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    
    // Handle specific error codes
    if (error.response?.status === 401) {
      // Unauthorized - redirect to sign in
      window.location.href = '/sign-in';
    }
    
    if (error.response?.status === 403) {
      // Forbidden - redirect to dashboard
      window.location.href = '/dashboard';
    }

    return Promise.reject(new Error(message));
  }
);

export default api;

// Auth API
export const authAPI = {
  syncUser: (data) => api.post('/auth/sync', data),
  getProfile: () => api.get('/auth/me'),
  updateRole: (role) => api.put('/auth/role', { role }),
};

// Student API
export const studentAPI = {
  getProfile: () => api.get('/students/profile'),
  updateProfile: (data) => api.put('/students/profile', data),
  getDashboard: () => api.get('/students/dashboard'),
  getEligibleJobs: () => api.get('/students/eligible-jobs'),
};

// Company API
export const companyAPI = {
  getProfile: () => api.get('/companies/profile'),
  createProfile: (data) => api.post('/companies', data),
  updateProfile: (data) => api.put('/companies/profile', data),
  getStats: () => api.get('/companies/stats'),
};

// Job API
export const jobAPI = {
  getAll: (params) => api.get('/jobs', { params }),
  getById: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post('/jobs', data),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
  getApplications: (id) => api.get(`/jobs/${id}/applications`),
  getStats: (id) => api.get(`/jobs/${id}/stats`),
  getEligibility: (id) => api.get(`/jobs/${id}/eligibility`),
};

// Application API
export const applicationAPI = {
  getAll: (params) => api.get('/applications', { params }),
  getById: (id) => api.get(`/applications/${id}`),
  create: (jobId, data) => api.post(`/applications/${jobId}`, data),
  updateStatus: (id, data) => api.put(`/applications/${id}/status`, data),
  withdraw: (id) => api.delete(`/applications/${id}`),
  getByJob: (jobId) => api.get(`/applications/job/${jobId}`),
};

// Resume API
export const resumeAPI = {
  upload: (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    return api.post('/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getMyResumes: () => api.get('/resumes/my'),
  getAnalysis: (id) => api.get(`/resumes/${id}/analysis`),
  setActive: (id) => api.put(`/resumes/${id}/active`),
  delete: (id) => api.delete(`/resumes/${id}`),
};

// AI API
export const aiAPI = {
  parseResume: (resumeId) => api.post(`/ai/parse-resume/${resumeId}`),
  matchSkills: (data) => api.post('/ai/match-skills', data),
  calculateEligibility: (data) => api.post('/ai/calculate-eligibility', data),
  getRecommendations: () => api.get('/ai/recommendations'),
  analyzeResume: (resumeId) => api.post(`/ai/analyze-resume/${resumeId}`),
};

// Analytics API
export const analyticsAPI = {
  getDashboard: (role) => api.get(`/analytics/dashboard/${role}`),
  getPlacementStats: () => api.get('/analytics/placements'),
  getBranchStats: () => api.get('/analytics/branches'),
  getCompanyStats: () => api.get('/analytics/companies'),
  getTrends: (params) => api.get('/analytics/trends', { params }),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getStudents: (params) => api.get('/admin/students', { params }),
  getRecruiters: (params) => api.get('/admin/recruiters', { params }),
  getJobs: (params) => api.get('/admin/jobs', { params }),
  approveCompany: (id) => api.put(`/admin/companies/${id}/approve`),
  rejectCompany: (id) => api.put(`/admin/companies/${id}/reject`),
  approveJob: (id) => api.put(`/admin/jobs/${id}/approve`),
  rejectJob: (id) => api.put(`/admin/jobs/${id}/reject`),
  banUser: (id) => api.put(`/admin/users/${id}/ban`),
  unbanUser: (id) => api.put(`/admin/users/${id}/unban`),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
};

// Recruiter API
export const recruiterAPI = {
  getMyJobs: (params) => api.get('/recruiter/jobs', { params }),
  getJobById: (id) => api.get(`/recruiter/jobs/${id}`),
  createJob: (data) => api.post('/recruiter/jobs', data),
  updateJob: (id, data) => api.put(`/recruiter/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/recruiter/jobs/${id}`),
  getApplications: (jobId) => api.get(`/recruiter/jobs/${jobId}/applications`),
};
