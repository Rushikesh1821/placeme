import { motion } from 'framer-motion';
import { AlertTriangle, XCircle, CheckCircle, Info, X } from 'lucide-react';

const variants = {
  info: {
    bg: 'bg-primary-50',
    border: 'border-primary-200',
    icon: Info,
    iconColor: 'text-primary-600',
    textColor: 'text-primary-800',
  },
  success: {
    bg: 'bg-success-50',
    border: 'border-success-200',
    icon: CheckCircle,
    iconColor: 'text-success-600',
    textColor: 'text-success-800',
  },
  warning: {
    bg: 'bg-warning-50',
    border: 'border-warning-200',
    icon: AlertTriangle,
    iconColor: 'text-warning-600',
    textColor: 'text-warning-800',
  },
  error: {
    bg: 'bg-error-50',
    border: 'border-error-200',
    icon: XCircle,
    iconColor: 'text-error-600',
    textColor: 'text-error-800',
  },
};

export default function Alert({ 
  type = 'info', 
  title, 
  message, 
  onClose,
  className = '' 
}) {
  const variant = variants[type];
  const Icon = variant.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`${variant.bg} ${variant.border} border rounded-lg p-4 ${className}`}
    >
      <div className="flex gap-3">
        <Icon className={`w-5 h-5 ${variant.iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          {title && (
            <h4 className={`font-semibold ${variant.textColor} mb-1`}>{title}</h4>
          )}
          <p className={`text-sm ${variant.textColor}`}>{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`${variant.textColor} hover:opacity-70 transition-opacity`}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
