import React from 'react';

interface IconProps {
  /**
   * The Font Awesome class name (e.g., 'fas fa-home', 'far fa-bell').
   * Ensure Font Awesome is loaded globally (e.g., via CDN in _document.tsx).
   */
  iconName: string;
  className?: string;
  'aria-hidden'?: boolean; // Common accessibility attribute
}

const Icon: React.FC<IconProps> = ({
  iconName,
  className = '',
  'aria-hidden': ariaHidden = true, // Default to true for decorative icons
  ...props
}) => {
  return (
    <i
      className={`${iconName} ${className}`}
      {...(ariaHidden ? { 'aria-hidden': 'true' } : {})} // Conditionally add attribute
      {...props}
    />
  );
};

export default Icon;