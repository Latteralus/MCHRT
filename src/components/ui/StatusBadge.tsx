import React from 'react';

type StatusType = 'Complete' | 'In Progress' | 'Pending';

interface StatusBadgeProps {
  status: StatusType;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-700';

  switch (status) {
    case 'Complete':
      bgColor = 'bg-green-100';
      textColor = 'text-green-700';
      break;
    case 'In Progress':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-700';
      break;
    case 'Pending':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-700';
      break;
  }

  return (
    <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${bgColor} ${textColor}`}>
      {status}
    </span>
  );
};

export default StatusBadge;