import { motion } from 'framer-motion';

export function Badge({ children, variant = 'default', size = 'md', className = '' }) {
  const variants = {
    default: 'bg-secondary-100 text-secondary-700',
    primary: 'bg-primary-100 text-primary-700',
    success: 'bg-success-100 text-success-700',
    warning: 'bg-warning-100 text-warning-700',
    error: 'bg-error-100 text-error-700',
    info: 'bg-blue-100 text-blue-700',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  const statusConfig = {
    pending: { variant: 'warning', label: 'Pending' },
    applied: { variant: 'info', label: 'Applied' },
    shortlisted: { variant: 'primary', label: 'Shortlisted' },
    interviewing: { variant: 'primary', label: 'Interviewing' },
    selected: { variant: 'success', label: 'Selected' },
    rejected: { variant: 'error', label: 'Rejected' },
    active: { variant: 'success', label: 'Active' },
    closed: { variant: 'default', label: 'Closed' },
    verified: { variant: 'success', label: 'Verified' },
    unverified: { variant: 'warning', label: 'Pending' },
  };

  const config = statusConfig[status?.toLowerCase()] || { variant: 'default', label: status };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function SkillBadge({ skill, onRemove }) {
  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium"
    >
      {skill}
      {onRemove && (
        <button
          onClick={() => onRemove(skill)}
          className="ml-1 hover:bg-primary-100 rounded-full p-0.5 transition-colors"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </motion.span>
  );
}

export default Badge;
