import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../components/common/Layout';
import AttendanceLog from '../components/attendance/AttendanceLog';
import AttendanceCalendar from '../components/attendance/AttendanceCalendar';
import { format } from 'date-fns';

export default function AttendancePage() {
  const { data: session, status } = useSession({ required: true });
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  
  // Fetch attendance records for the selected employee or current user
  useEffect(() => {
    if (session) {
      fetchAttendanceRecords();
    }
  }, [session, selectedEmployee]);

  const fetchAttendanceRecords = async () => {
    try {
      const params = new URLSearchParams({
        limit: 100 // Get more records for calendar view
      });
      
      if (selectedEmployee?.id) {
        params.append('employeeId', selectedEmployee.id);
      }
      
      const response = await fetch(`/api/attendance?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch attendance records');
      }
      
      const data = await response.json();
      setAttendanceRecords(data.records);
    } catch (error) {
      console.error('Error fetching attendance records:', error);
    }
  };

  // Handle date selection from calendar
  const handleDateClick = (date, record) => {
    setSelectedDate(date);
    // If there's a record, navigate to it
    if (record) {
      window.location.href = `/attendance/${record.id}`;
    }
  };

  // Handle loading state
  if (status === 'loading') {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Attendance Management</h1>
          <p className="text-gray-600">
            Track and manage employee attendance records
          </p>
        </div>
        
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Today's Date</h3>
            <p className="text-2xl font-bold text-blue-600">{format(new Date(), 'MMMM dd, yyyy')}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Current Time</h3>
            <p className="text-2xl font-bold text-blue-600">{format(new Date(), 'h:mm a')}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Work Day</h3>
            <p className="text-2xl font-bold text-green-600">In Progress</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">View</h3>
            <div className="flex mt-2">
              <button 
                className={`px-4 py-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'} rounded-l`}
                onClick={() => setViewMode('list')}
              >
                List
              </button>
              <button 
                className={`px-4 py-2 ${viewMode === 'calendar' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'} rounded-r`}
                onClick={() => setViewMode('calendar')}
              >
                Calendar
              </button>
            </div>
          </div>
        </div>
        
        {/* Employee Selector (for Admins, HR, and Managers) */}
        {(session.user.role === 'admin' || session.user.role === 'hr' || session.user.role === 'manager') && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Employee Selection</h2>
            <p className="text-gray-600 mb-4">
              {session.user.role === 'manager' 
                ? 'View attendance records for employees in your department' 
                : 'View attendance records for any employee'}
            </p>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow">
                <input
                  type="text"
                  placeholder="Search employees..."
                  className="w-full p-3 border rounded"
                  // In a real implementation, this would trigger an API search
                />
              </div>
              
              <button 
                className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
                // This would open a modal or dropdown with employee search results
              >
                Find Employee
              </button>
              
              {selectedEmployee && (
                <button 
                  className="bg-gray-200 text-gray-800 px-6 py-3 rounded hover:bg-gray-300"
                  onClick={() => setSelectedEmployee(null)}
                >
                  Clear Selection
                </button>
              )}
            </div>
            
            {selectedEmployee && (
              <div className="mt-4 p-4 bg-blue-50 rounded">
                <p className="font-medium">Selected Employee: {selectedEmployee.name}</p>
              </div>
            )}
          </div>
        )}
        
        {/* Toggle between List and Calendar views */}
        {viewMode === 'list' ? (
          <AttendanceLog employeeId={selectedEmployee?.id} />
        ) : (
          <AttendanceCalendar 
            attendanceRecords={attendanceRecords} 
            employeeId={selectedEmployee?.id} 
            onDateClick={handleDateClick} 
          />
        )}
      </div>
    </Layout>
  );
}

// Add server-side authentication check
export async function getServerSideProps(context) {
  return {
    props: {}
  };
}