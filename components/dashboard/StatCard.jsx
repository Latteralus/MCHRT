import React from 'react';

const StatCard = ({ 
  title, 
  value, 
  prevValue, 
  icon, 
  color = 'blue', 
  loading = false,
  onClick,
  footer
}) => {
  // Calculate percentage change if previous value is provided
  const percentChange = prevValue ? ((value - prevValue) / prevValue) * 100 : null;
  const isPositive = percentChange > 0;
  const isNeutral = percentChange === 0;
  
  // Color mapping for different themes
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-500',
      title: 'text-blue-800',
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-500',
      title: 'text-green-800',
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-500',
      title: 'text-red-800',
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: 'text-yellow-500',
      title: 'text-yellow-800',
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      icon: 'text-purple-500',
      title: 'text-purple-800',
    },
    gray: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      icon: 'text-gray-500',
      title: 'text-gray-800',
    }
  };
  
  const theme = colorClasses[color] || colorClasses.blue;
  
  return (
    <div 
      className={`relative overflow-hidden rounded-lg border ${theme.border} ${theme.bg} p-5 shadow-sm ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      {/* Icon */}
      {icon && (
        <div className={`absolute right-4 top-4 text-3xl opacity-20 ${theme.icon}`}>
          {icon}
        </div>
      )}
      
      {/* Title */}
      <h3 className={`text-sm font-medium ${theme.title}`}>{title}</h3>
      
      {/* Value */}
      <div className="mt-2 flex items-baseline">
        {loading ? (
          <div className="h-8 w-24 animate-pulse rounded bg-gray-200"></div>
        ) : (
          <div className="text-2xl font-semibold text-gray-900">{value}</div>
        )}
        
        {/* Percentage change */}
        {percentChange !== null && !loading && (
          <span className={`ml-2 text-sm font-medium ${
            isPositive ? 'text-green-600' : isNeutral ? 'text-gray-500' : 'text-red-600'
          }`}>
            {isPositive ? '↑' : isNeutral ? '–' : '↓'} {Math.abs(percentChange).toFixed(1)}%
          </span>
        )}
      </div>
      
      {/* Optional footer */}
      {footer && (
        <div className="mt-4 border-t border-gray-200 pt-2 text-sm text-gray-500">
          {footer}
        </div>
      )}
    </div>
  );
};

export default StatCard;