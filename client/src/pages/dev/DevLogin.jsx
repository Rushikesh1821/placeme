import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function DevLogin() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Dev Login - PlaceMe';
  }, []);

  const signInAs = (role) => {
    localStorage.setItem('userRole', role);
    localStorage.setItem('devUser', JSON.stringify({ firstName: 'Dev', lastName: role.charAt(0) + role.slice(1).toLowerCase() }));
    // Redirect depending on role
    if (role === 'ADMIN') navigate(import.meta.env.DEV ? '/dev-admin' : '/admin/tpo-dashboard');
    else if (role === 'RECRUITER') navigate('/recruiter');
    else navigate('/student');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <h1 className="text-2xl font-bold text-secondary-900 mb-4">Dev Login</h1>
        <p className="text-sm text-gray-500 mb-6">This page is for local development only — it sets a test role in localStorage and redirects accordingly.</p>

        <div className="space-y-3">
          <button
            onClick={() => signInAs('ADMIN')}
            className="w-full px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200"
          >
            Sign in as Admin
          </button>

          <button
            onClick={() => signInAs('RECRUITER')}
            className="w-full px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200"
          >
            Sign in as Recruiter
          </button>

          <button
            onClick={() => signInAs('STUDENT')}
            className="w-full px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200"
          >
            Sign in as Student
          </button>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <p>Go back to <Link to="/" className="text-primary-600 hover:underline">Landing page</Link>.</p>
        </div>
      </div>
    </div>
  );
}
