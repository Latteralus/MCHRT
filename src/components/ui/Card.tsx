import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  headerActions?: React.ReactNode;
  footerContent?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  headerActions,
  footerContent,
}) => {
  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
      {(title || headerActions) && (
        <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center"> {/* Adjusted padding slightly */}
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {headerActions && <div>{headerActions}</div>}
        </div>
      )}
      <div className="p-6"> {/* Adjusted padding slightly */}
        {children}
      </div>
      {footerContent && (
        <div className="bg-gray-50 px-5 py-4 border-t border-gray-200"> {/* Adjusted padding slightly */}
          {footerContent}
        </div>
      )}
    </div>
  );
};

export default Card;