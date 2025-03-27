// components/common/Placeholder.jsx
import React from 'react';

const Placeholder = ({ title, description }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 text-center">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">{title}</h1>
      <p className="text-gray-600">{description}</p>
      <div className="mt-8 p-8 border-2 border-dashed border-gray-300 rounded-lg">
        <p className="text-gray-500">This section is under development</p>
      </div>
    </div>
  );
};

export default Placeholder;