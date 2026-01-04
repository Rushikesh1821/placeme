# Vercel Deployment Guide

This guide will help you deploy the PlaceMe project on Vercel.

## 🚀 Quick Deployment

### Prerequisites
- Vercel account (sign up at [vercel.com](https://vercel.com))
- GitHub account with the project pushed
- MongoDB Atlas account
- Clerk account

### Step 1: Connect to Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from GitHub**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"
   - Import your GitHub repository: `Rushikesh1821/placeme`

### Step 2: Configure Environment Variables

In your Vercel project settings, add these environment variables:

#### Required Variables
```bash
# Database
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/placements

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# AI Service (if deploying separately)
AI_SERVICE_URL=https://your-ai-service-url.com
```

#### Optional Variables
```bash
# OpenAI (for enhanced AI features)
OPENAI_API_KEY=sk-your-openai-api-key
```

### Step 3: Update Clerk Configuration

1. **Go to Clerk Dashboard**
2. **Add Vercel URLs to Allowed Origins**:
   - `https://your-app-name.vercel.app`
   - `https://your-app-name.vercel.app/sign-in`
   - `https://your-app-name.vercel.app/sign-up`

3. **Update Webhook URLs** (if using webhooks):
   - `https://your-app-name.vercel.app/api/webhooks/clerk`

### Step 4: Deploy

1. **Automatic Deployment**
   - Vercel will automatically deploy when you push to GitHub
   - First deployment may take 5-10 minutes

2. **Manual Deployment**
   ```bash
   vercel --prod
   ```

### Step 5: Update Frontend Configuration

After deployment, update the frontend to use the production API:

1. **Update API Base URL** (if needed)
   - The `vercel.json` configuration handles routing automatically
   - API calls will work without changes

2. **Test the Application**
   - Visit `https://your-app-name.vercel.app`
   - Test authentication, file uploads, and all features

## 🔧 Configuration Details

### Vercel Configuration (`vercel.json`)

The project is configured with:
- **Static Build**: Frontend built with Vite
- **Serverless Functions**: Backend API routes
- **Routing**: API routes proxied to serverless functions
- **Build Optimization**: Code splitting and optimization

### Directory Structure for Vercel

```
placeme/
├── api/                    # Serverless functions
│   └── index.js           # Main API handler
├── client/                 # React frontend
│   ├── dist/              # Build output
│   └── ...                # Source files
├── vercel.json            # Vercel configuration
└── ...                    # Other files
```

## 🐛 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check environment variables in Vercel dashboard
   - Ensure all dependencies are in `package.json`
   - Check build logs for specific errors

2. **API Connection Issues**
   - Verify MongoDB connection string
   - Check CORS settings
   - Ensure environment variables are correctly set

3. **Authentication Issues**
   - Verify Clerk keys are correct
   - Check allowed origins in Clerk dashboard
   - Ensure webhook URLs are correct

4. **File Upload Issues**
   - Verify Cloudinary configuration
   - Check file size limits
   - Ensure proper CORS settings

### Debugging

1. **Check Vercel Logs**
   - Go to Vercel dashboard → Your Project → Functions tab
   - Check real-time logs and error messages

2. **Local Testing**
   ```bash
   # Test locally with production environment
   vercel dev
   ```

3. **Environment Variable Testing**
   ```bash
   # Verify environment variables
   vercel env ls
   ```

## 📱 Post-Deployment Checklist

- [ ] Authentication works correctly
- [ ] File uploads (resumes) work
- [ ] AI service integration (if deployed separately)
- [ ] All pages load without errors
- [ ] Mobile responsiveness
- [ ] Performance optimization
- [ ] Error monitoring setup

## 🔄 Continuous Deployment

Vercel automatically:
- Deploys on every push to main branch
- Creates preview URLs for pull requests
- Rollbacks to previous deployments if needed

## 📊 Monitoring

- **Vercel Analytics**: Built-in performance monitoring
- **Vercel Logs**: Real-time error tracking
- **Clerk Dashboard**: Authentication analytics
- **MongoDB Atlas**: Database performance metrics

## 🆘 Support

If you encounter issues:
1. Check Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
2. Review build logs in Vercel dashboard
3. Verify all environment variables are set correctly
4. Test locally with `vercel dev` command

---

**Note**: The AI service (`ai-service`) needs to be deployed separately (e.g., on Railway, Heroku, or another platform) as it's a Python Flask application.
