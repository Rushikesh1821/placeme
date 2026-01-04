import { SignUp } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

export default function SignUpPage() {
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
          Create your account
        </h1>
        <p className="text-secondary-600">
          Start your journey to your dream job
        </p>
      </div>

      {/* Clerk Sign Up Component */}
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        redirectUrl="/role-selection"
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
          },
        }}
      />

      {/* Additional Links */}
      <div className="mt-6 text-center">
        <p className="text-sm text-secondary-600">
          Already have an account?{' '}
          <Link to="/sign-in" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>

      {/* Terms */}
      <p className="mt-4 text-xs text-secondary-500 text-center">
        By signing up, you agree to our{' '}
        <a href="#" className="text-primary-600 hover:underline">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="#" className="text-primary-600 hover:underline">
          Privacy Policy
        </a>
      </p>
    </div>
  );
}
