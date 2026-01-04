import { motion } from 'framer-motion';

export function Card({ children, className = '', hover = false, onClick }) {
  const baseClasses = 'bg-white rounded-xl border border-secondary-200 shadow-sm';
  const hoverClasses = hover ? 'hover:shadow-md hover:border-secondary-300 transition-all cursor-pointer' : '';
  
  if (hover || onClick) {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        onClick={onClick}
        className={`${baseClasses} ${hoverClasses} ${className}`}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={`${baseClasses} ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`px-6 py-4 border-b border-secondary-200 ${className}`}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = '' }) {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={`px-6 py-4 border-t border-secondary-200 bg-secondary-50 rounded-b-xl ${className}`}>
      {children}
    </div>
  );
}

export function StatsCard({ title, value, change, icon: Icon, color = 'primary' }) {
  const colors = {
    primary: 'bg-primary-100 text-primary-600',
    success: 'bg-success-100 text-success-600',
    warning: 'bg-warning-100 text-warning-600',
    error: 'bg-error-100 text-error-600',
    secondary: 'bg-secondary-100 text-secondary-600',
  };

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-secondary-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-secondary-900">{value}</p>
          {change !== undefined && (
            <p className={`text-sm mt-1 ${change >= 0 ? 'text-success-600' : 'text-error-600'}`}>
              {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% from last month
            </p>
          )}
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </Card>
  );
}

export default Card;
