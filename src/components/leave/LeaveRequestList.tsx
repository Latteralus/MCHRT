// src/components/leave/LeaveRequestList.tsx
import React, { useState, useEffect, useCallback } from 'react';
// Placeholder: Import UI components (Table, Pagination, Badge, Button, LoadingSpinner, ErrorMessage)
// import { Table, Pagination, Badge, Button, LoadingSpinner, ErrorMessage } from '@/components/common';
import { fetchLeaveRequests, approveLeaveRequest, rejectLeaveRequest } from '@/lib/api/leave'; // Import API functions
// Placeholder: Import Leave type
// import { Leave } from '@/db';
// Placeholder: Import User type/role info if needed for conditional actions
// import { UserRole } from '@/lib/middleware/withRole';

// Define the shape of a leave request for display
interface DisplayLeaveRequest {
  id: number;
  employeeName: string; // Combine first/last name
  startDate: string;
  endDate: string;
  leaveType: string;
  status: string; // e.g., 'Pending', 'Approved', 'Rejected'
  reason?: string;
  approverName?: string | null; // Name of the approver
  // Add other relevant fields like submission date
}

interface LeaveRequestListProps {
  // Props for filtering (e.g., status, employeeId, date range)
  employeeId?: number;
  status?: string;
  // Prop to indicate if the current user can take action (approve/reject)
  canManage?: boolean;
}

const LeaveRequestList: React.FC<LeaveRequestListProps> = ({ employeeId, status, canManage = false }) => {
  const [leaveRequests, setLeaveRequests] = useState<DisplayLeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(20); // Or make configurable

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Call API function with filters and pagination
      const data = await fetchLeaveRequests({
          employeeId,
          status,
          page: currentPage,
          limit
      });
      setLeaveRequests(data.requests);
      setTotalPages(data.totalPages);
       // Ensure currentPage doesn't exceed totalPages
        if (currentPage > data.totalPages) {
            setCurrentPage(Math.max(1, data.totalPages));
        }

    } catch (err: any) {
      console.error('Failed to fetch leave requests:', err);
      setError(err.message || 'Failed to load leave requests.');
    } finally {
      setIsLoading(false);
    }
  }, [employeeId, status, currentPage, limit, setIsLoading, setError, setLeaveRequests, setTotalPages, setCurrentPage]); // Add dependencies for useCallback

  useEffect(() => {
    loadRequests();
  }, [loadRequests]); // Now depends on the memoized loadRequests

  const handleApprove = async (requestId: number) => {
    // Optional: Add confirmation dialog
    try {
      setIsLoading(true); // Indicate loading state during action
      await approveLeaveRequest(requestId);
      alert('Request approved successfully.'); // Simple feedback
      loadRequests(); // Refresh list
    } catch (err: any) {
       console.error('Error approving request:', err);
       alert(`Failed to approve request: ${err.message}`);
       setIsLoading(false); // Reset loading state on error
    }
    // No finally setIsLoading(false) here, as loadRequests() handles it
  };

  const handleReject = async (requestId: number) => {
    // Optional: Add confirmation dialog and prompt for reason
    const comments = prompt("Enter reason for rejection (optional):");
    // If prompt is cancelled, comments will be null, so don't proceed
    if (comments === null && confirm("Are you sure you want to reject without a reason?")) {
        // Allow rejection without reason if confirmed, or handle as needed
    } else if (comments === null) {
        return; // User cancelled the prompt
    }

    try {
      setIsLoading(true);
      await rejectLeaveRequest(requestId, comments || undefined); // Pass comments if provided
      alert('Request rejected successfully.');
      loadRequests(); // Refresh list
    } catch (err: any) {
       console.error('Error rejecting request:', err);
       alert(`Failed to reject request: ${err.message}`);
       setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };


  if (isLoading) {
    // Placeholder: Replace with LoadingSpinner component
    return <div className="text-center p-4">Loading leave requests...</div>;
  }

  if (error) {
    // Placeholder: Replace with ErrorMessage component
    return <div className="text-center p-4 text-red-500 bg-red-100 border border-red-400 rounded">{error}</div>;
  }

  if (leaveRequests.length === 0) {
    // Placeholder: Replace with EmptyState component
    return <div className="text-center p-4 text-gray-500">No leave requests found matching the criteria.</div>;
  }

  // Placeholder: Replace with actual Table component
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            {/* TODO: Add Reason/Comments column? */}
            {canManage && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {leaveRequests.map((request) => (
            <tr key={request.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                 {request.employeeName || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.startDate}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.endDate}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.leaveType}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {/* Placeholder: Replace with Badge component */}
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                  request.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800' // Pending or Cancelled
                }`}>
                  {request.status}
                </span>
              </td>
              {canManage && (
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  {request.status === 'Pending' && (
                    <>
                      {/* Placeholder: Replace with Button components */}
                      <button onClick={() => handleApprove(request.id)} className="text-green-600 hover:text-green-900 disabled:opacity-50" disabled={isLoading}>Approve</button>
                      <button onClick={() => handleReject(request.id)} className="text-red-600 hover:text-red-900 disabled:opacity-50" disabled={isLoading}>Reject</button>
                    </>
                  )}
                  {/* Optionally add Cancel/Delete button here with RBAC */}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
       {/* Placeholder: Replace with actual Pagination component */}
      <div className="mt-4 flex justify-center">
         {totalPages > 1 && (
            <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1 || isLoading}
                className="mx-1 px-3 py-1 border rounded disabled:opacity-50"
            >
                Previous
            </button>
         )}
         <span className="mx-2 self-center">Page {currentPage} of {totalPages}</span>
          {totalPages > 1 && (
            <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || isLoading}
                className="mx-1 px-3 py-1 border rounded disabled:opacity-50"
            >
                Next
            </button>
          )}
      </div>
      {/* <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} /> */}
    </div>
  );
};

export default LeaveRequestList;