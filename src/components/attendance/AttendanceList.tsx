// src/components/attendance/AttendanceList.tsx
import React, { useState, useEffect } from 'react';
// Placeholder: Import necessary UI components (Table, Pagination, LoadingSpinner, ErrorMessage)
// import { Table, Pagination, LoadingSpinner, ErrorMessage } from '@/components/common';
import { fetchAttendanceRecords } from '@/lib/api/attendance'; // Import the API function
// Placeholder: Import Attendance type
// import { Attendance } from '@/db';

// Define the shape of an attendance record returned by the API
// Adjust based on the actual API response structure (includes nested employee)
interface ApiAttendanceRecord {
  id: number;
  date: string;
  timeIn: string | null;
  timeOut: string | null;
  employee: {
    id: number;
    firstName: string;
    lastName: string;
  };
  createdAt?: string;
  updatedAt?: string;
}


interface AttendanceListProps {
  // Props for filtering (e.g., date range, employeeId) could be added here
  employeeId?: number;
  startDate?: string;
  endDate?: string;
}

const AttendanceList: React.FC<AttendanceListProps> = ({ employeeId, startDate, endDate }) => {
  const [attendanceRecords, setAttendanceRecords] = useState<ApiAttendanceRecord[]>([]); // Use API type
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(20); // Or make this configurable

  useEffect(() => {
    const loadAttendance = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Call the API function with filters and pagination
        const data = await fetchAttendanceRecords({
            employeeId,
            startDate,
            endDate,
            page: currentPage,
            limit
        });
        setAttendanceRecords(data.records);
        setTotalPages(data.totalPages);
        // Ensure currentPage doesn't exceed totalPages after filtering/deletion etc.
        if (currentPage > data.totalPages) {
            setCurrentPage(Math.max(1, data.totalPages));
        }

      } catch (err: any) {
        console.error('Failed to fetch attendance records:', err);
        setError(err.message || 'Failed to load attendance data.');
      } finally {
        setIsLoading(false);
      }
    };

    loadAttendance();
  }, [employeeId, startDate, endDate, currentPage, limit]); // Re-fetch when filters or page change

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };


  if (isLoading) {
    // Placeholder: Replace with LoadingSpinner component
    return <div className="text-center p-4">Loading attendance records...</div>;
  }

  if (error) {
    // Placeholder: Replace with ErrorMessage component
    return <div className="text-center p-4 text-red-500 bg-red-100 border border-red-400 rounded">{error}</div>;
  }

  if (attendanceRecords.length === 0) {
    // Placeholder: Replace with EmptyState component
    return <div className="text-center p-4 text-gray-500">No attendance records found matching the criteria.</div>;
  }

  // Placeholder: Replace with actual Table component
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time In</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Out</th>
            {/* Add more columns as needed */}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {attendanceRecords.map((record) => (
            <tr key={record.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {record.employee ? `${record.employee.lastName}, ${record.employee.firstName}` : 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.date}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.timeIn ?? 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.timeOut ?? 'N/A'}</td>
              {/* TODO: Add action buttons (Edit/Delete) if needed, with RBAC */}
            </tr>
          ))}
        </tbody>
      </table>
      {/* Placeholder: Replace with actual Pagination component */}
      <div className="mt-4 flex justify-center">
         {totalPages > 1 && (
            <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="mx-1 px-3 py-1 border rounded disabled:opacity-50"
            >
                Previous
            </button>
         )}
         <span className="mx-2 self-center">Page {currentPage} of {totalPages}</span>
          {totalPages > 1 && (
            <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
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

export default AttendanceList;