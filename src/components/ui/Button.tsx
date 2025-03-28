import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline';
  size?: 'sm' | 'md' | 'lg'; // Add size prop
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md', // Default size
  leftIcon,
  rightIcon,
  children,
  className = '',
  ...props
}) => {
  // Base styles (adjust as needed)
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 ease-in-out cursor-pointer border focus:outline-none focus:ring-2 focus:ring-offset-2';

  // Size styles
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs', // Smaller padding and text
    md: 'px-4 py-2 text-sm',   // Original size
    lg: 'px-5 py-2.5 text-base', // Larger padding and text
  };

  // Variant styles
  const variantStyles = {
    primary: 'bg-teal-700 text-white border-transparent hover:bg-teal-800 focus:ring-teal-500', // Mapped --primary to teal-700
    outline: 'bg-transparent border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 focus:ring-teal-500', // Mapped --gray-*
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};

export default Button;