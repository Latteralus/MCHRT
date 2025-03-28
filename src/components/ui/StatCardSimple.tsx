import React from 'react';

interface StatCardSimpleProps {
  title: string;
  value: string | number;
  color?: 'green' | 'red'; // Optional color for value emphasis
}

const StatCardSimple: React.FC<StatCardSimpleProps> = ({ title, value, color }) => {
  let valueColorClass = 'text-gray-800'; // Default
  if (color === 'green') {
    valueColorClass = 'text-green-600';
  } else if (color === 'red') {
    valueColorClass = 'text-red-600';
  }

  return (
    <div className="bg-white p-5 rounded-lg shadow-sm text-center"> {/* Centered text */}
      <div className="text-sm text-gray-500 uppercase font-medium mb-2">{title}</div>
      <div className={`text-3xl font-semibold ${valueColorClass}`}>{value}</div>
    </div>
  );
};

export default StatCardSimple;