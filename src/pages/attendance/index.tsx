// src/pages/attendance/index.tsx
import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import AttendanceList from '@/components/attendance/AttendanceList';
import MainLayout from '@/components/layouts/MainLayout'; // Assuming a main layout exists
// Placeholder: Import function to fetch employees for filter dropdown
// import { fetchEmployeesForSelect } from '@/lib/api/employees'; // Adjust path
// Placeholder: Import UI components (Input, Select, Button)

interface AttendanceIndexPageProps {
  employees: { id: number; name: string }[]; // For filter dropdown
}

const AttendanceIndexPage: React.FC<AttendanceIndexPageProps> = ({ employees }) => {
  // State for filters
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // TODO: Add logic to handle filter changes and potentially re-fetch data
  // or pass filters down to AttendanceList which fetches based on props.
  // The current AttendanceList fetches internally based on props.

  return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-semibold mb-4">Attendance Records</h1>

        {/* Filter Section - Placeholder */}
        <div className="mb-4 p-4 border rounded shadow-sm bg-gray-50 flex flex-wrap gap-4 items-end">
          {/* Employee Filter */}
          <div>
            <label htmlFor="employeeFilter" className="block text-sm font-medium text-gray-700">Employee</label>
            <select
              id="employeeFilter"
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">All Employees</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>

          {/* Start Date Filter */}
          <div>
            <label htmlFor="startDateFilter" className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              id="startDateFilter"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* End Date Filter */}
          <div>
            <label htmlFor="endDateFilter" className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              id="endDateFilter"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Apply Filters Button (optional, could filter on change) */}
          {/* <button
            // onClick={handleApplyFilters}
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Apply Filters
          </button> */}
        </div>

        {/* Attendance List */}
        <AttendanceList
          employeeId={selectedEmployeeId ? parseInt(selectedEmployeeId, 10) : undefined}
          startDate={startDate || undefined}
          endDate={endDate || undefined}
        />
      </div>
    </MainLayout>
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

  // TODO: Add role-based access control if needed (e.g., Employees can only see their own)

  let employees: { id: number; name: string }[] = [];
  try {
    // Placeholder: Fetch employees
    console.log('SSR: Fetching employees for attendance filter...');
    // employees = await fetchEmployeesForSelect();
    employees = [ // Placeholder data
      { id: 1, name: 'Doe, John' },
      { id: 2, name: 'Smith, Jane' },
      { id: 3, name: 'Williams, Bob' },
    ];
  } catch (error) {
    console.error('SSR Error fetching employees for filter:', error);
  }

  return {
    props: {
      employees,
      session,
    },
  };
};

export default AttendanceIndexPage;