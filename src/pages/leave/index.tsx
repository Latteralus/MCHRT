// src/pages/leave/index.tsx
import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import LeaveRequestList from '@/components/leave/LeaveRequestList';
import MainLayout from '@/components/layouts/MainLayout'; // Assuming a main layout exists
// Placeholder: Import function to fetch employees for filter dropdown
// import { fetchEmployeesForSelect } from '@/lib/api/employees'; // Adjust path
// Placeholder: Import UI components (Select, Button)
// Placeholder: Import UserRole type
// import { UserRole } from '@/lib/middleware/withRole';

interface LeaveIndexPageProps {
  employees: { id: number; name: string }[]; // For filter dropdown
  currentUserRole: string | null; // To determine if manager actions are allowed
}

// Example statuses for filter
const leaveStatuses = ['Pending', 'Approved', 'Rejected'];

const LeaveIndexPage: React.FC<LeaveIndexPageProps> = ({ employees, currentUserRole }) => {
  // State for filters
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  // TODO: Add date range filters if needed

  // Determine if the current user can manage requests (e.g., approve/reject)
  const canManage = currentUserRole === 'Admin' || currentUserRole === 'DepartmentHead';

  return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-semibold mb-4">Leave Requests</h1>

        {/* Filter Section - Placeholder */}
        <div className="mb-4 p-4 border rounded shadow-sm bg-gray-50 flex flex-wrap gap-4 items-end">
          {/* Employee Filter (Show only if manager/admin?) */}
          {(currentUserRole === 'Admin' || currentUserRole === 'DepartmentHead') && (
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
          )}

          {/* Status Filter */}
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700">Status</label>
            <select
              id="statusFilter"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">All Statuses</option>
              {leaveStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Apply Filters Button (optional) */}
        </div>

        {/* Leave Request List */}
        <LeaveRequestList
          // If not admin/manager, filter by logged-in user's employee ID (needs to be fetched/passed)
          employeeId={canManage ? (selectedEmployeeId ? parseInt(selectedEmployeeId, 10) : undefined) : undefined /* Pass logged-in employee ID here */}
          status={selectedStatus || undefined}
          canManage={canManage}
        />
      </div>
    </MainLayout>
  );
};

// Fetch employees server-side for the filter dropdown & get user role
export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  // Protect route
  if (!session) {
    return {
      redirect: { destination: '/login', permanent: false },
    };
  }

  const currentUserRole = session.user?.role as string | null; // Get role from session

  let employees: { id: number; name: string }[] = [];
  // Fetch employee list only if user is admin/manager (for filter dropdown)
  if (currentUserRole === 'Admin' || currentUserRole === 'DepartmentHead') {
    try {
      // Placeholder: Fetch employees
      console.log('SSR: Fetching employees for leave filter...');
      // employees = await fetchEmployeesForSelect();
      employees = [ // Placeholder data
        { id: 1, name: 'Doe, John' },
        { id: 2, name: 'Smith, Jane' },
        { id: 3, name: 'Williams, Bob' },
      ];
    } catch (error) {
      console.error('SSR Error fetching employees for filter:', error);
    }
  }

  // TODO: If the user is a regular employee, potentially fetch their specific employee ID
  // to pre-filter the list to only show their own requests.

  return {
    props: {
      employees,
      currentUserRole,
      session,
    },
  };
};

export default LeaveIndexPage;