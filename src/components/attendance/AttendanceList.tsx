// src/components/attendance/AttendanceList.tsx
import React, { useState, useEffect } from 'react';
import { fetchAttendanceRecords } from '@/lib/api/attendance'; // Import the API function
import Card from '@/components/ui/Card'; // Import Card

// Define the shape of an attendance record returned by the API
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
  employeeId?: number;
  startDate?: string;
  endDate?: string;
}

const AttendanceList: React.FC<AttendanceListProps> = ({ employeeId, startDate, endDate }) => {
  const [attendanceRecords, setAttendanceRecords] = useState<ApiAttendanceRecord[]>([]);
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
        const data = await fetchAttendanceRecords({
            employeeId,
            startDate,
            endDate,
            page: currentPage,
            limit
        });
        setAttendanceRecords(data.records);
        setTotalPages(data.totalPages);
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
  }, [employeeId, startDate, endDate, currentPage, limit]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };


  if (isLoading) {
    // TODO: Refactor loading state styling
    return <div className="text-center p-4">Loading attendance records...</div>;
  }

  if (error) {
    // TODO: Refactor error state styling
    return <div className="text-center p-4 text-red-500 bg-red-100 border border-red-400 rounded">{error}</div>;
  }

  // Use Card for consistency
  return (
    <Card>
        {/* Remove padding for full-width table */}
        <div className="card-body" style={{padding: 0}}>
            <div className="table-container" style={{ overflowX: 'auto' }}>
              {/* Use semantic data-table class */}
              <table className="data-table" style={{width: '100%'}}>
                <thead>
                  <tr>
                    {/* Use default th styling */}
                    <th>Employee</th>
                    <th>Date</th>
                    <th>Time In</th>
                    <th>Time Out</th>
                    {/* Add more columns as needed */}
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.length === 0 ? (
                     <tr>
                        <td colSpan={4} style={{ textAlign: 'center', padding: '1rem' }}>
                            No attendance records found matching the criteria.
                        </td>
                     </tr>
                  ) : (
                    attendanceRecords.map((record) => (
                      <tr key={record.id}>
                        {/* Use default td styling */}
                        <td>
                            {record.employee ? `${record.employee.lastName}, ${record.employee.firstName}` : 'N/A'}
                        </td>
                        <td>{record.date}</td>
                        <td>{record.timeIn ?? 'N/A'}</td>
                        <td>{record.timeOut ?? 'N/A'}</td>
                        {/* TODO: Add action buttons (Edit/Delete) if needed */}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
        </div>
        {/* Pagination with semantic classes */}
        {totalPages > 1 && (
            <div className="card-footer pagination-container"> {/* Added card-footer */}
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="pagination-button btn btn-outline" /* Added btn classes */
                >
                    Previous
                </button>
                <span className="pagination-info">Page {currentPage} of {totalPages}</span>
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="pagination-button btn btn-outline" /* Added btn classes */
                >
                    Next
                </button>
            </div>
        )}
        {/* <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} /> */}
    </Card>
  );
};

export default AttendanceList;