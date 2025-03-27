import React from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const ComplianceCard = ({ compliance, onUpdate, onDelete }) => {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin' || session?.user?.role === 'hr_manager';
  
  // Calculate days until expiration
  const today = new Date();
  const expiration = new Date(compliance.expirationDate);
  const daysUntilExpiration = Math.ceil((expiration - today) / (1000 * 60 * 60 * 24));
  
  // Determine status color
  let statusColor = 'bg-green-100 text-green-800'; // Valid
  if (daysUntilExpiration <= 0) {
    statusColor = 'bg-red-100 text-red-800'; // Expired
  } else if (daysUntilExpiration <= 30) {
    statusColor = 'bg-yellow-100 text-yellow-800'; // Expiring soon
  }

  return (
    <div className="border rounded-lg p-4 shadow-sm mb-4 bg-white">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium">{compliance.licenseType || compliance.certificationType}</h3>
          <p className="text-gray-600">
            {compliance.employee?.firstName} {compliance.employee?.lastName} 
            {compliance.employee?.department && ` • ${compliance.employee.department.name}`}
          </p>
          
          <div className="mt-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
              {daysUntilExpiration <= 0 ? 'Expired' : 
               daysUntilExpiration <= 30 ? `Expires in ${daysUntilExpiration} days` : 
               'Valid'}
            </span>
          </div>
          
          <div className="mt-2 text-sm">
            <p><span className="font-medium">ID/Number:</span> {compliance.licenseNumber || 'N/A'}</p>
            <p><span className="font-medium">Issued Date:</span> {new Date(compliance.issueDate).toLocaleDateString()}</p>
            <p><span className="font-medium">Expiration Date:</span> {new Date(compliance.expirationDate).toLocaleDateString()}</p>
            {compliance.notes && <p><span className="font-medium">Notes:</span> {compliance.notes}</p>}
          </div>
        </div>
        
        {isAdmin && (
          <div className="flex space-x-2">
            <button 
              onClick={() => onUpdate(compliance)}
              className="text-blue-600 hover:text-blue-800"
            >
              Edit
            </button>
            <button 
              onClick={() => onDelete(compliance.id)}
              className="text-red-600 hover:text-red-800"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplianceCard;