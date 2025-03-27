import React, { useState, useEffect } from 'react';
import { useSession, getSession } from 'next-auth/react'; // Import getSession for server-side
import Layout from '../components/common/Layout';
import AttendanceLog from '../components/attendance/AttendanceLog';
import AttendanceCalendar from '../components/attendance/AttendanceCalendar';
import { format } from 'date-fns';
import { dbService } from '@/utils/dbService'; // Import the fixed dbService
import { authOptions } from '@/pages/api/auth/[...nextauth]'; // Import authOptions for getServerSession

// Define AttendancePage component (keep client-side logic for interaction)
export default function AttendancePage({ initialAttendanceRecords }) { // Receive initial records as props
  const { data: session, status } = useSession({ required: true });
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  // Use initial records, allow updates
  const [attendanceRecords, setAttendanceRecords] = useState(initialAttendanceRecords || []);
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'

  // Client-side fetching might still be needed for updates or different filters
  // Consider if this useEffect is still needed or if getServerSideProps handles initial load sufficiently
  // useEffect(() => {
  //   if (session) {
  //     // Maybe fetch only if selectedEmployee changes or for refresh?
  //     // fetchAttendanceRecords();
  //   }
  // }, [session, selectedEmployee]);

  const fetchAttendanceRecords = async (employeeFilterId = null) => {
    // Simplified client-side fetch (adjust params as needed)
    try {
      const params = new URLSearchParams({ limit: 100 });
      if (employeeFilterId) {
        params.append('employeeId', employeeFilterId);
      }
      const response = await fetch(`/api/attendance?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch attendance records');
      const data = await response.json();
      setAttendanceRecords(data.records); // Update state
    } catch (error) {
      console.error('Error fetching attendance records client-side:', error);
    }
  };

  const handleSelectEmployee = (employee) => {
      setSelectedEmployee(employee);
      fetchAttendanceRecords(employee?.id); // Fetch for selected employee client-side
  };

  const handleClearSelection = () => {
      setSelectedEmployee(null);
      fetchAttendanceRecords(); // Fetch default (e.g., own) records client-side
  };


  // Handle date selection from calendar
  const handleDateClick = (date, record) => {
    setSelectedDate(date);
    if (record) {
      // Navigate or show details modal
      console.log("Clicked date with record:", record);
      // Example: window.location.href = `/attendance/detail/${record.id}`;
      // Make sure the detail page exists and works
    }
  };

  // Handle loading state
  if (status === 'loading') {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64"><p>Loading session...</p></div>
      </Layout>
    );
  }

  // Ensure session exists before rendering main content
   if (!session) {
     return (
       <Layout>
         <div className="flex justify-center items-center h-64"><p>Redirecting...</p></div>
       </Layout>
     );
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
              : 'Viewing your attendance records'}
          </p>
        </div>

        {/* Status Cards - Consider making these dynamic if needed */}
         {/* ... status cards ... */}

         {/* Employee Selector (Simplified Example) */}
         {(session.user.role === 'admin' || session.user.role === 'hr' || session.user.role === 'manager') && (
           <div className="bg-white rounded-lg shadow p-6 mb-8">
             {/* ... Employee search/selection UI ... */}
              {/* Example: Replace with actual EmployeeSearch component */}
              <button onClick={() => handleSelectEmployee({ id: 'some-employee-id', name: 'Test Employee' })}>Select Test Employee</button>
              {selectedEmployee && <button onClick={handleClearSelection}>Clear Selection</button>}
           </div>
         )}


        {/* View Mode Toggle */}
         <div className="mb-4">
             <button /* ... onClick={() => setViewMode('list')} ... */>List</button>
             <button /* ... onClick={() => setViewMode('calendar')} ... */>Calendar</button>
         </div>

        {/* Conditional Rendering based on viewMode */}
        {viewMode === 'list' ? (
          // Pass current records from state
          <AttendanceLog records={attendanceRecords} employeeId={selectedEmployee?.id} />
        ) : (
          <AttendanceCalendar
            attendanceRecords={attendanceRecords} // Pass current records from state
            employeeId={selectedEmployee?.id}
            onDateClick={handleDateClick}
          />
        )}
      </div>
    </Layout>
  );
}

// Fetch initial data on the server
export async function getServerSideProps(context) {
  const session = await getSession(context); // Use getSession server-side

  if (!session) {
    return {
      redirect: {
        destination: '/login', // Redirect to login if not authenticated
        permanent: false,
      },
    };
  }

  let initialAttendanceRecords = [];
  try {
    // Determine filter based on user role
    const filterOptions = { limit: 100 }; // Initial limit
    if (session.user.role !== 'admin' && session.user.role !== 'hr' /* hr_manager? */) {
       // Default to fetching only the logged-in user's records
       if (session.user.employeeId) {
         filterOptions.employeeId = session.user.employeeId;
       } else {
          console.warn("User session missing employeeId, cannot fetch personal attendance.");
       }
       // Managers might see their department by default - requires more logic
    } else {
        // Admins/HR see all initially, or apply default filters
    }


    // Use the fixed dbService (ensure it handles connection internally)
    // Assuming getAttendanceRecords returns an array directly now, not an object with 'records'
    initialAttendanceRecords = await dbService.getAttendanceRecords(filterOptions);

  } catch (error) {
    console.error("Error fetching initial attendance in getServerSideProps:", error);
    // Handle error appropriately, maybe return empty array or show error message
    // Check if the error is due to DB connection issues handled in dbService
  }

  return {
    props: {
      // Session is automatically provided by SessionProvider, but passing it can be useful
      // session: session, // Already available via useSession hook client-side
      initialAttendanceRecords: JSON.parse(JSON.stringify(initialAttendanceRecords)), // Serialize data
    },
  };
}