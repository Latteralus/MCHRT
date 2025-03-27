import React, { useState, useEffect } from 'react';
// **MODIFIED: Import getSession for server-side**
import { useSession, getSession } from 'next-auth/react';
import Layout from '../components/common/Layout';
import AttendanceLog from '../components/attendance/AttendanceLog';
import AttendanceCalendar from '../components/attendance/AttendanceCalendar';
import { format } from 'date-fns';
// **MODIFIED: Import the fixed dbService**
import { dbService } from '@/utils/dbService';
// **MODIFIED: Import authOptions needed by getSession/getServerSession in some contexts**
// If not using getServerSession here, this might not be needed, but good practice
import { authOptions } from '@/pages/api/auth/[...nextauth]';


// **MODIFIED: Receive initial records as props**
export default function AttendancePage({ initialAttendanceRecords, error }) {
  const { data: session, status } = useSession({ required: true });
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  // **MODIFIED: Use initial records, allow updates**
  const [attendanceRecords, setAttendanceRecords] = useState(initialAttendanceRecords || []);
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  // State for client-side errors
  const [clientError, setClientError] = useState(error || null); // Show server-side error initially

  // Client-side fetching might still be needed for updates or different filters
  useEffect(() => {
    // If initial load failed, don't rely on initialAttendanceRecords
    if (session && !initialAttendanceRecords && !error) {
      fetchAttendanceRecords();
    }
    // Re-fetch when selected employee changes
    if (session && selectedEmployee !== null) { // Assuming null means fetch default/own
       fetchAttendanceRecords(selectedEmployee?.id);
    }

  }, [session, selectedEmployee, error]); // Add error dependency

  const fetchAttendanceRecords = async (employeeFilterId = null) => {
    setClientError(null); // Clear previous errors
    try {
      const params = new URLSearchParams({ limit: 100 }); // Adjust limit as needed
      if (employeeFilterId) {
        params.append('employeeId', employeeFilterId);
      }
      // Use the API route for client-side fetching
      const response = await fetch(`/api/attendance?${params.toString()}`);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to fetch attendance records client-side');
      }
      const data = await response.json();
      // Assuming the API returns { records: [...] }
      setAttendanceRecords(data.records || []);
    } catch (error) {
      console.error('Error fetching attendance records client-side:', error);
      setClientError(error.message);
    }
  };

   const handleSelectEmployee = (employee) => {
      setSelectedEmployee(employee);
      // fetchAttendanceRecords(employee?.id); // Let useEffect handle refetch
  };

  const handleClearSelection = () => {
      setSelectedEmployee(null);
       fetchAttendanceRecords(); // Explicitly fetch default view
  };


  const handleDateClick = (date, record) => {
    setSelectedDate(date);
    if (record) {
      console.log("Clicked date with record:", record);
      // Navigate to detail page (make sure this page exists)
      // Example: Router.push(`/attendance/detail/${record.id}`); (import Router from 'next/router')
    }
  };

  if (status === 'loading') {
    return <Layout><p>Loading session...</p></Layout>;
  }
   if (!session) {
     // Should be handled by useSession({ required: true }) redirecting
     return <Layout><p>Redirecting...</p></Layout>;
   }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Attendance Management</h1>
          <p className="text-gray-600">
            {selectedEmployee
              ? `Viewing records for ${selectedEmployee.name}`
              : (session.user.role === 'admin' || session.user.role === 'hr_manager') ? 'Viewing all attendance records' : 'Viewing your attendance records'}
          </p>
        </div>

         {/* Display errors */}
         {clientError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{clientError}</span>
            </div>
         )}


        {/* Status Cards - Keep as is */}
        {/* ... */}

        {/* Employee Selector - Keep as is */}
        {/* ... */}

        {/* View Mode Toggle - Keep as is */}
         {/* ... */}

        {/* Conditional Rendering */}
        {viewMode === 'list' ? (
          // AttendanceLog likely fetches its own data based on props
          <AttendanceLog employeeId={selectedEmployee?.id} /* Pass initial records if needed */ />
        ) : (
          <AttendanceCalendar
            // Pass current records from state for calendar display
            attendanceRecords={attendanceRecords}
            employeeId={selectedEmployee?.id}
            onDateClick={handleDateClick}
          />
        )}
      </div>
    </Layout>
  );
}

// **MODIFIED: Fetch initial data on the server**
export async function getServerSideProps(context) {
  // **MODIFIED: Use getSession for server-side context**
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: { destination: '/login', permanent: false, },
    };
  }

  let initialAttendanceRecords = [];
  let error = null; // Variable to hold potential errors

  try {
    const filterOptions = { limit: 100 }; // Initial limit for server-side load
    // Apply default filters based on role
     if (session.user.role !== 'admin' && session.user.role !== 'hr_manager' /* Check role name */) {
       if (session.user.employeeId) {
         filterOptions.employeeId = session.user.employeeId;
       } else {
          console.warn("getServerSideProps (Attendance): User session missing employeeId.");
          // Decide if this is an error state or just means no initial data
          error = "User profile incomplete (missing employee ID).";
       }
       // Department manager logic might go here if needed for default view
    }
    // Admins/HR see all initially unless specific filters are added later

    // Only fetch if no error identified yet
    if (!error) {
        // **MODIFIED: Use the fixed dbService and await the result**
        // Assuming getAttendanceRecords returns an array directly
        initialAttendanceRecords = await dbService.getAttendanceRecords(filterOptions);
    }

  } catch (e) {
    console.error("getServerSideProps (Attendance) Error:", e);
    // Capture the error message to pass to the page
    error = `Failed to load initial attendance data: ${e.message}`;
    // Ensure records array is empty on error
    initialAttendanceRecords = [];
  }

  return {
    props: {
      // **MODIFIED: Serialize potentially complex objects like dates**
      initialAttendanceRecords: JSON.parse(JSON.stringify(initialAttendanceRecords)),
      error: error, // Pass error state to the page component
      // Session object is available via useSession hook client-side, no need to pass explicitly
    },
  };
}