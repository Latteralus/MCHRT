import React from 'react';
import Image from 'next/image';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  initials?: string; // Fallback if src is not provided or fails to load
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'User avatar',
  initials,
  size = 'md',
  className = '',
}) => {
  const [imgError, setImgError] = React.useState(false);

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm', // Matches sidebar footer example
    lg: 'h-12 w-12 text-base',
  };

  const handleImageError = () => {
    setImgError(true);
  };

  const showInitials = !src || imgError;

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-gray-300 overflow-hidden ${sizeClasses[size]} ${className}`}
    >
      {showInitials ? (
        <span className="font-medium text-gray-700">
          {initials ? initials.slice(0, 2).toUpperCase() : '?'}
        </span>
      ) : (
        <Image
          fill
          style={{ objectFit: 'cover' }} // Replaced object-cover class with style prop
          src={src}
          alt={alt}
          onError={handleImageError}
        />
      )}
    </span>
  );
};

export default Avatar;