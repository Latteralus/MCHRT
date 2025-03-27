import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { useRouter } from 'next/router';

const AttendanceLog = ({ employeeId }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Filter states
  const [filters, setFilters] = useState({
    startDate: format(startOfMonth(currentMonth), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(currentMonth), 'yyyy-MM-dd'),
    status: '',
  });
  
  // New attendance record state
  const [newRecord, setNewRecord] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    timeIn: '',
    timeOut: '',
    status: 'present',
    notes: ''
  });
  
  // Show form state
  const [showForm, setShowForm] = useState(false);

  // Fetch attendance records
  const fetchAttendanceRecords = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        startDate: filters.startDate,
        endDate: filters.endDate
      });
      
      if (employeeId) {
        queryParams.append('employeeId', employeeId);
      }
      
      if (filters.status) {
        queryParams.append('status', filters.status);
      }
      
      // Make API request
      const response = await fetch(`/api/attendance?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch attendance records');
      }
      
      const data = await response.json();
      
      setAttendanceRecords(data.records);
      setPagination(data.pagination);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Handle month change
  const handleMonthChange = (increment) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + increment);
    
    setCurrentMonth(newMonth);
    setFilters({
      ...filters,
      startDate: format(startOfMonth(newMonth), 'yyyy-MM-dd'),
      endDate: format(endOfMonth(newMonth), 'yyyy-MM-dd')
    });
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  // Handle new record input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRecord({ ...newRecord, [name]: value });
  };

  // Handle form submission for new attendance record
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const recordData = {
        ...newRecord,
        employeeId: employeeId || null
      };
      
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(recordData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create attendance record');
      }
      
      // Reset form and refresh data
      setNewRecord({
        date: format(new Date(), 'yyyy-MM-dd'),
        timeIn: '',
        timeOut: '',
        status: 'present',
        notes: ''
      });
      
      setShowForm(false);
      fetchAttendanceRecords();
    } catch (err) {
      setError(err.message);
    }
  };

  // Clock in/out functionality
  const handleClockInOut = async (recordId, isClockIn) => {
    try {
      const currentTime = format(new Date(), 'HH:mm:ss');
      
      const response = await fetch(`/api/attendance/${recordId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          [isClockIn ? 'timeIn' : 'timeOut']: currentTime
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to clock ${isClockIn ? 'in' : 'out'}`);
      }
      
      fetchAttendanceRecords();
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  // Fetch attendance records when filters or pagination changes
  useEffect(() => {
    if (session) {
      fetchAttendanceRecords();
    }
  }, [filters.startDate, filters.endDate, filters.status, pagination.page, employeeId, session]);

  // Get today's attendance record (for clock in/out functionality)
  const todayRecord = attendanceRecords.find(record => {
    const recordDate = new Date(record.date);
    const today = new Date();
    return (
      recordDate.getDate() === today.getDate() &&
      recordDate.getMonth() === today.getMonth() &&
      recordDate.getFullYear() === today.getFullYear()
    );
  });

  // Check if current user is an employee viewing their own attendance
  const isOwnAttendance = !employeeId && session?.user.role === 'employee';

  // Render clock in/out buttons
  const renderClockButtons = () => {
    if (!isOwnAttendance) return null;
    
    if (!todayRecord) {
      return (
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={() => {
            setNewRecord({
              ...newRecord,
              date: format(new Date(), 'yyyy-MM-dd'),
              timeIn: format(new Date(), 'HH:mm:ss'),
              status: 'present'
            });
            setShowForm(true);
          }}
        >
          Clock In
        </button>
      );
    }
    
    if (todayRecord.timeIn && !todayRecord.timeOut) {
      return (
        <button
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          onClick={() => handleClockInOut(todayRecord.id, false)}
        >
          Clock Out
        </button>
      );
    }
    
    return null;
  };

  if (loading && attendanceRecords.length === 0) {
    return <div className="flex justify-center p-8">Loading attendance records...</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {employeeId ? 'Employee Attendance Log' : 'Attendance Log'}
        </h2>
        
        {/* Month selector */}
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <button 
            onClick={() => handleMonthChange(-1)}
            className="bg-gray-200 p-2 rounded hover:bg-gray-300"
          >
            &lt;
          </button>
          <span className="min-w-[140px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button 
            onClick={() => handleMonthChange(1)}
            className="bg-gray-200 p-2 rounded hover:bg-gray-300"
          >
            &gt;
          </button>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div className="flex space-x-2 mb-4 md:mb-0">
          {(session?.user.role === 'admin' || session?.user.role === 'hr' || session?.user.role === 'manager') && (
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? 'Cancel' : 'Add Record'}
            </button>
          )}
          
          {renderClockButtons()}
        </div>
        
        {/* Filter by status */}
        <div className="w-full md:w-auto">
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="p-2 border rounded w-full"
          >
            <option value="">All Statuses</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
            <option value="half-day">Half Day</option>
            <option value="remote">Remote</option>
          </select>
        </div>
      </div>
      
      {/* Add new record form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={newRecord.date}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time In</label>
              <input
                type="time"
                name="timeIn"
                value={newRecord.timeIn}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Out</label>
              <input
                type="time"
                name="timeOut"
                value={newRecord.timeOut}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={newRecord.status}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded"
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="half-day">Half Day</option>
                <option value="remote">Remote</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                name="notes"
                value={newRecord.notes}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                rows="2"
              />
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Save Record
            </button>
          </div>
        </form>
      )}
      
      {/* Attendance records table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="py-3 px-4 text-left">Date</th>
              <th className="py-3 px-4 text-left">Time In</th>
              <th className="py-3 px-4 text-left">Time Out</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Notes</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {attendanceRecords.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-6 px-4 text-center text-gray-500">
                  No attendance records found for this period
                </td>
              </tr>
            ) : (
              attendanceRecords.map((record) => (
                <tr key={record.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    {format(new Date(record.date), 'MMM dd, yyyy')}
                  </td>
                  <td className="py-3 px-4">
                    {record.timeIn || '-'}
                  </td>
                  <td className="py-3 px-4">
                    {record.timeOut || '-'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      record.status === 'present' ? 'bg-green-100 text-green-800' :
                      record.status === 'absent' ? 'bg-red-100 text-red-800' :
                      record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                      record.status === 'half-day' ? 'bg-blue-100 text-blue-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {record.notes || '-'}
                  </td>
                  <td className="py-3 px-4">
                    {(session?.user.role === 'admin' || session?.user.role === 'hr' || 
                      (session?.user.role === 'manager' && record.employee?.departmentId === session?.user.departmentId)) && (
                      <button
                        onClick={() => router.push(`/attendance/${record.id}`)}
                        className="text-blue-600 hover:text-blue-800 mr-2"
                      >
                        Edit
                      </button>
                    )}
                    
                    {(session?.user.role === 'admin' || session?.user.role === 'hr') && (
                      <button
                        onClick={async () => {
                          if (confirm('Are you sure you want to delete this attendance record?')) {
                            try {
                              const response = await fetch(`/api/attendance/${record.id}`, {
                                method: 'DELETE'
                              });
                              
                              if (!response.ok) {
                                throw new Error('Failed to delete attendance record');
                              }
                              
                              fetchAttendanceRecords();
                            } catch (err) {
                              setError(err.message);
                            }
                          }
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="flex space-x-2">
            <button
              onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
              disabled={pagination.page === 1}
              className={`px-3 py-1 rounded ${
                pagination.page === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Previous
            </button>
            
            {[...Array(pagination.pages).keys()].map((pageNum) => (
              <button
                key={pageNum + 1}
                onClick={() => handlePageChange(pageNum + 1)}
                className={`px-3 py-1 rounded ${
                  pagination.page === pageNum + 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {pageNum + 1}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(Math.min(pagination.pages, pagination.page + 1))}
              disabled={pagination.page === pagination.pages}
              className={`px-3 py-1 rounded ${
                pagination.page === pagination.pages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default AttendanceLog;