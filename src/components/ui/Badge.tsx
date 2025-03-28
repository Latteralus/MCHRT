import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'gray';
  size?: 'sm' | 'md';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  color = 'gray',
  size = 'md',
  className = '',
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full';

  const colorStyles = {
    primary: 'bg-teal-100 text-teal-800', // Mapped --primary
    secondary: 'bg-sky-100 text-sky-800', // Mapped --secondary (using sky blue)
    success: 'bg-green-100 text-green-800', // Mapped --success
    warning: 'bg-yellow-100 text-yellow-800', // Mapped --warning
    danger: 'bg-red-100 text-red-800', // Mapped --danger
    info: 'bg-blue-100 text-blue-800', // Using blue for info
    gray: 'bg-gray-100 text-gray-800', // Mapped --gray-*
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm', // Slightly larger than example.md for better readability
  };

  return (
    <span
      className={`${baseStyles} ${colorStyles[color]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;