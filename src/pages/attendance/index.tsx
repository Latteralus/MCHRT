// src/pages/attendance/index.tsx
import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { Session } from 'next-auth'; // Import Session type from next-auth
import Head from 'next/head';
import AttendanceList from '@/components/attendance/AttendanceList';
// MainLayout is applied globally via _app.tsx

// Placeholder: Import function to fetch employees for filter dropdown
// import { fetchEmployeesForSelect } from '@/lib/api/employees'; // Adjust path

interface AttendanceIndexPageProps {
  employees: { id: number; name: string }[]; // For filter dropdown
  session: Session | null; // Add session prop type
}

const AttendanceIndexPage: React.FC<AttendanceIndexPageProps> = ({ employees, session }) => {
  // State for filters
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Filter state is passed down to AttendanceList.

  return (
    <>
      <Head>
        <title>Attendance Records - Mountain Care HR</title>
      </Head>

      {/* Header Section */}
      <div className="header">
          <div className="page-title">
              <h1>Attendance Records</h1>
          </div>
          {/* Add header actions if needed */}
          {/* <div className="header-actions">...</div> */}
      </div>

      {/* Filter Section */}
      {/* Using a div with card class instead of Card component */}
      <div className="filter-container card filter-card">
          <div className="card-body filter-card-body">
            {/* Employee Filter */}
            <div className="filter-group"> {/* Wrap label/input */}
              <label htmlFor="employeeFilter" className="form-label">Employee</label>
              <select
                id="employeeFilter"
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="form-input employee-select" /* Use form-input or define form-select */
                /* style={{minWidth: '200px'}} Example width - Replaced by CSS */
              >
                <option value="">All Employees</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>

            {/* Start Date Filter */}
            <div className="filter-group">
              <label htmlFor="startDateFilter" className="form-label">Start Date</label>
              <input
                type="date"
                id="startDateFilter"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="form-input"
              />
            </div>

            {/* End Date Filter */}
            <div className="filter-group">
              <label htmlFor="endDateFilter" className="form-label">End Date</label>
              <input
                type="date"
                id="endDateFilter"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="form-input"
              />
            </div>

            {/* Apply Filters Button (optional) */}
            {/* <div className="filter-group">
                 <button className="btn btn-primary">Apply</button>
               </div> */}
          </div> {/* Close card-body */}
      </div> {/* Close filter-container */}

      {/* Attendance List */}
      {/* Attendance List */}
      <AttendanceList
        employeeId={selectedEmployeeId ? parseInt(selectedEmployeeId, 10) : undefined}
        startDate={startDate || undefined}
        endDate={endDate || undefined}
        // Pass session down if AttendanceList needs it: session={session}
      />
    </>
  );
};

// Fetch employees server-side for the filter dropdown
export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  // Protect route
  if (!session) {
    return {
      redirect: { destination: '/login', permanent: false },
    };
  }

  // TODO: Add role-based access control (RBAC) if needed
  // Example: if (session.user.role !== 'admin' && session.user.role !== 'hr') { return { notFound: true }; }

  let employees: { id: number; name: string }[] = [];
  try {
    // Placeholder: Fetch employees
    console.log('SSR: Fetching employees for attendance filter...');
    // employees = await fetchEmployeesForSelect(); // TODO: Implement actual fetch
    employees = [ // Placeholder data
      { id: 1, name: 'Doe, John' },
      { id: 2, name: 'Smith, Jane' },
      { id: 3, name: 'Williams, Bob' },
    ];
  } catch (error) {
    console.error('SSR Error fetching employees for filter:', error);
    // Handle error appropriately, maybe return an error prop
  }

  return {
    props: {
      employees,
      session, // Session object is passed as a prop
    },
  };
};

export default AttendanceIndexPage;