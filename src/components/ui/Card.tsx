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
    // Use semantic class "card" and merge incoming className
    <div className={`card ${className}`}>
      {(title || headerActions) && (
        // Use semantic class "card-header"
        <div className="card-header">
          {/* Use semantic class "card-title" */}
          {title && <h3 className="card-title">{title}</h3>}
          {/* Render header actions directly */}
          {headerActions && <div>{headerActions}</div>}
        </div>
      )}
      {/* Use semantic class "card-body" */}
      <div className="card-body">
        {children}
      </div>
      {footerContent && (
        // Use semantic class "card-footer"
        <div className="card-footer">
          {footerContent}
        </div>
      )}
    </div>
  );
};

export default Card;