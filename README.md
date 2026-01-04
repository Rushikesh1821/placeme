# AI-Enabled College Placement Management System

## 🎓 Final Year Project

A comprehensive web application for managing college placements with AI-powered resume analysis and eligibility scoring.

## 📋 Features

### Student Module
- Profile creation and management
- Resume upload (PDF/DOC) with Cloudinary storage
- View eligible jobs based on AI scoring
- Apply for jobs and track application status
- View AI-generated eligibility scores

### Recruiter Module
- Company registration and profile management
- Job posting with detailed criteria
- View AI-shortlisted candidates
- Download candidate resumes
- Update application statuses

### Admin (TPO) Module
- Approve students and companies
- Monitor all placement drives
- View comprehensive placement statistics
- Override eligibility when needed
- Generate reports and analytics

### AI Features
- Resume text extraction (PDF/DOC)
- Skill extraction using NLP
- Skill matching with job requirements
- Eligibility score calculation (0-100%)
- Smart candidate recommendations

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React.js (Vite) |
| Backend | Node.js + Express.js |
| Database | MongoDB (Mongoose) |
| Authentication | Clerk (Role-based) |
| AI Service | Python (Flask) + spaCy |
| Storage | Cloudinary |
| Charts | Recharts |

## 📁 Project Structure

```
placements/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API services
│   │   ├── context/       # React context
│   │   └── utils/         # Utility functions
│   └── ...
├── server/                 # Node.js Backend
│   ├── config/            # Configuration files
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   └── utils/             # Utility functions
├── ai-service/            # Python Flask AI Service
│   ├── app.py            # Main Flask app
│   ├── resume_parser.py  # Resume parsing logic
│   └── skill_matcher.py  # Skill matching logic
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB
- Python 3.8+ (for AI service)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Rushikesh1821/placeme.git
   cd placeme
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Environment Setup**
   - Copy `server/.env.example` to `server/.env`
   - Configure Clerk keys, MongoDB URI, and other environment variables

4. **Start the application**
   ```bash
   # Start all services
   npm run dev
   
   # Or start individually
   npm run dev:server  # Backend on http://localhost:5000
   npm run dev:client  # Frontend on http://localhost:3000
   npm run dev:ai      # AI service on http://localhost:5001
   ```

## 🌐 Deployment

### Vercel Deployment

The project is configured for Vercel deployment. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

**Quick Deploy:**
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push

**Required Environment Variables:**
- `MONGODB_URI` - MongoDB connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key
- `CLERK_SECRET_KEY` - Clerk secret key
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret

## 🔐 Authentication Roles

| Role | Access Level |
|------|--------------|
| STUDENT | Student dashboard, profile, applications |
| RECRUITER | Company dashboard, job postings, candidates |
| ADMIN | Full access, approvals, analytics |

## 📊 AI Eligibility Formula

```
Eligibility Score = 
  (Skill Match × 0.4) +
  (CGPA Score × 0.3) +
  (Branch Match × 0.2) +
  (Experience Score × 0.1)
```

## 📝 API Documentation

### Authentication
All API routes (except public) require Clerk JWT token in headers.

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/students | Create student profile |
| GET | /api/students/:id | Get student profile |
| PUT | /api/students/:id | Update student profile |
| POST | /api/resumes/upload | Upload resume |
| GET | /api/jobs | Get all eligible jobs |
| POST | /api/jobs | Create job posting (Recruiter) |
| POST | /api/applications | Apply for job |
| GET | /api/ai/eligibility/:jobId | Get AI eligibility score |
| GET | /api/analytics | Get placement analytics (Admin) |

## 👥 Team

- Developer: [Your Name]
- Guide: [Guide Name]
- Institution: [College Name]

## 📄 License

This project is part of academic coursework and is for educational purposes.
