import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App';
import './index.css';

// Get Clerk publishable key from environment
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// For demo purposes, if no valid Clerk key is provided, show a helpful message
if (!clerkPubKey) {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <h1 className="text-2xl font-bold text-secondary-900 mb-4">Clerk Authentication Required</h1>
        <p>Please add VITE_CLERK_PUBLISHABLE_KEY to your .env file</p>
      </div>
    </div>
  );
  throw new Error('Clerk setup required');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <App />
    </ClerkProvider>
  </React.StrictMode>
);
