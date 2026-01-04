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
- Node.js (v18+)
- Python (v3.9+)
- MongoDB
- Clerk Account
- Cloudinary Account

### Installation

1. **Clone and Install Dependencies**

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install

# Install AI service dependencies
cd ../ai-service
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

2. **Environment Setup**

Create `.env` files in each directory using the provided `.env.example` files.

### 🔐 Clerk Authentication Setup

**Important**: Clerk authentication is required for the application to work properly.

1. **Create Clerk Account**
   - Go to [https://clerk.com](https://clerk.com) and create an account
   - Create a new application with your preferred providers (Email, Google, etc.)

2. **Configure Clerk**
   - Set redirect URLs: `http://localhost:3006/sign-in`, `http://localhost:3006/sign-up`
   - Configure user metadata schema with `role` field
   - Get your publishable key from the dashboard

3. **Update Environment Variables**
   ```bash
   # In client/.env
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
   ```

4. **Test Authentication**
   - Start the frontend server
   - Open `http://localhost:3006`
   - Test sign-up and sign-in functionality

📖 **For detailed instructions, see [CLERK_SETUP.md](./CLERK_SETUP.md)**

⚡ **Quick Setup**: Run `setup-clerk.bat` (Windows) or `./setup-clerk.sh` (Linux/Mac) to check your setup.

3. **Start Services**

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev

# Terminal 3 - AI Service
cd ai-service
python app.py
```

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
