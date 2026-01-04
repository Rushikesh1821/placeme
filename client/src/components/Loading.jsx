import { motion } from 'framer-motion';

export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
    xl: 'h-16 w-16 border-4',
  };

  return (
    <div className={`animate-spin rounded-full border-primary-600 border-t-transparent ${sizes[size]} ${className}`}></div>
  );
}

export function LoadingPage({ message = 'Loading...' }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-secondary-600">{message}</p>
      </motion.div>
    </div>
  );
}

export function LoadingCard({ rows = 3 }) {
  return (
    <div className="card p-6 animate-pulse">
      <div className="h-4 bg-secondary-200 rounded w-3/4 mb-4"></div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-3 bg-secondary-200 rounded w-full mb-2"></div>
      ))}
      <div className="h-3 bg-secondary-200 rounded w-1/2"></div>
    </div>
  );
}

export function LoadingTable({ cols = 5, rows = 5 }) {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="p-4 border-b border-secondary-200">
        <div className="h-4 bg-secondary-200 rounded w-1/4"></div>
      </div>
      <table className="w-full">
        <thead>
          <tr className="bg-secondary-50">
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="p-4">
                <div className="h-3 bg-secondary-200 rounded"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex} className="border-b border-secondary-100">
              {Array.from({ length: cols }).map((_, colIndex) => (
                <td key={colIndex} className="p-4">
                  <div className="h-3 bg-secondary-200 rounded"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LoadingSpinner;
