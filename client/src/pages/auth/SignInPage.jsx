import { SignIn } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

export default function SignInPage() {
  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-2 mb-6">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <span className="text-2xl font-heading font-bold text-secondary-900 lg:hidden">
            PlaceMe
          </span>
        </Link>
        <h1 className="text-2xl font-heading font-bold text-secondary-900 mb-2">
          Welcome back
        </h1>
        <p className="text-secondary-600">
          Sign in to continue to your dashboard
        </p>
      </div>

      {/* Clerk Sign In Component */}
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        redirectUrl="/dashboard"
        appearance={{
          elements: {
            rootBox: 'w-full',
            card: 'shadow-none bg-transparent w-full',
            headerTitle: 'hidden',
            headerSubtitle: 'hidden',
            socialButtonsBlockButton: 'border-secondary-300 hover:bg-secondary-50',
            socialButtonsBlockButtonText: 'text-secondary-700 font-medium',
            dividerLine: 'bg-secondary-200',
            dividerText: 'text-secondary-500',
            formFieldLabel: 'text-secondary-700 font-medium',
            formFieldInput: 'input',
            formButtonPrimary: 'btn btn-primary btn-lg w-full',
            footerActionLink: 'text-primary-600 hover:text-primary-700 font-medium',
            identityPreviewText: 'text-secondary-700',
            identityPreviewEditButton: 'text-primary-600 hover:text-primary-700',
          },
        }}
      />

      {/* Additional Links */}
      <div className="mt-6 text-center">
        <p className="text-sm text-secondary-600">
          Don't have an account?{' '}
          <Link to="/sign-up" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign up
          </Link>
        </p>
      </div>

      {/* DEV ONLY: Quick sign-in as Admin for local testing */}
      {import.meta.env.DEV && (
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              // Set a dev role so ProtectedRoute allows admin pages to render
              localStorage.setItem('userRole', 'ADMIN');
              // Optional helper data for UI display (non-auth)
              localStorage.setItem('devUser', JSON.stringify({ firstName: 'Dev', lastName: 'Admin' }));
              // Notify and redirect
              alert('Dev mode: role set to ADMIN. Redirecting to TPO Dashboard.');
              window.location.href = '/admin/tpo-dashboard';
            }}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors"
          >
            Sign in as Admin (dev)
          </button>
        </div>
      )}
    </div>
  );
}
