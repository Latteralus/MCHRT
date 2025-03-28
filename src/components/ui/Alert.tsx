import React from 'react';

interface AlertProps {
  type?: 'success' | 'warning' | 'danger' | 'info';
  title?: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode; // Allow custom icon
}

// Basic icons (consider using a library like react-icons)
const Icons = {
  success: (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  warning: (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 3.006-1.742 3.006H4.42c-1.53 0-2.493-1.672-1.742-3.006l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm0-5a1 1 0 011 1v2a1 1 0 11-2 0V9a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
  ),
  danger: (
     <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  ),
  info: (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
  ),
};

const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  className = '',
  icon,
}) => {
  const typeStyles = {
    success: {
      bg: 'bg-green-50', // Mapped --success related colors
      iconColor: 'text-green-400',
      titleColor: 'text-green-800',
      textColor: 'text-green-700',
    },
    warning: {
      bg: 'bg-yellow-50', // Mapped --warning related colors
      iconColor: 'text-yellow-400',
      titleColor: 'text-yellow-800',
      textColor: 'text-yellow-700',
    },
    danger: {
      bg: 'bg-red-50', // Mapped --danger related colors
      iconColor: 'text-red-400',
      titleColor: 'text-red-800',
      textColor: 'text-red-700',
    },
    info: {
      bg: 'bg-blue-50', // Mapped --secondary related colors (using blue)
      iconColor: 'text-blue-400',
      titleColor: 'text-blue-800',
      textColor: 'text-blue-700',
    },
  };

  const styles = typeStyles[type];
  const displayIcon = icon !== undefined ? icon : Icons[type]; // Use custom icon if provided

  return (
    <div className={`rounded-md p-4 ${styles.bg} ${className}`}>
      <div className="flex">
        {displayIcon && (
          <div className={`flex-shrink-0 ${styles.iconColor}`}>
            {displayIcon}
          </div>
        )}
        <div className={`ml-3 ${displayIcon ? '' : 'ml-0'}`}>
          {title && (
            <h3 className={`text-sm font-medium ${styles.titleColor}`}>
              {title}
            </h3>
          )}
          <div className={`text-sm ${styles.textColor} ${title ? 'mt-2' : ''}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alert;