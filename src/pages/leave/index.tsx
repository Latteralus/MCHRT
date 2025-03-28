import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import LeaveRequestList from '@/components/leave/LeaveRequestList';
import Icon from '@/components/ui/Icon'; // Assuming Icon component exists

// Placeholder: Import function to fetch employees for filter dropdown
// import { fetchEmployeesForSelect } from '@/lib/api/employees'; // Adjust path
// Placeholder: Import UserRole type
// import { UserRole } from '@/lib/middleware/withRole';

interface LeaveIndexPageProps {
  // employees: { id: number; name: string }[]; // Keep if needed for future filters
  currentUserRole: string | null; // To determine if manager actions are allowed
  // Placeholder data for stats cards - replace with actual data fetching
  stats: {
    available: number;
    pending: number;
    approved: number;
    usedThisYear: number;
  };
}

// Statuses for tabs
const leaveStatuses = ['All Requests', 'Pending', 'Approved', 'Denied']; // Use 'Denied' instead of 'Rejected' to match screenshot?

const LeaveIndexPage: React.FC<LeaveIndexPageProps> = ({ currentUserRole, stats }) => {
  // State for active tab/filter
  const [activeStatus, setActiveStatus] = useState<string>('Pending'); // Default to Pending to match screenshot

  // Determine if the current user can manage requests (e.g., approve/reject)
  const canManage = currentUserRole === 'Admin' || currentUserRole === 'DepartmentHead';

  // Map tab label to status prop for the list component
  const getStatusForList = (tabLabel: string): string | undefined => {
    if (tabLabel === 'All Requests') return undefined;
    if (tabLabel === 'Denied') return 'Rejected'; // Map UI 'Denied' to API 'Rejected' if needed
    return tabLabel;
  };

  return (
    <>
      <Head>
        <title>Leave Management - Mountain Care HR</title>
      </Head>
      <div className="p-8"> {/* Use consistent padding */}
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
          {/* TODO: Link to actual request page */}
          <Link href="/leave/request" className="btn btn-primary bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2">
            Request Leave
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Available Balance Card */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm text-gray-500 mb-1">AVAILABLE BALANCE</h4>
            <p className="text-3xl font-bold text-blue-600">{stats.available} days</p>
          </div>
          {/* Pending Requests Card */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm text-gray-500 mb-1">PENDING REQUESTS</h4>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          {/* Approved Card */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm text-gray-500 mb-1">APPROVED</h4>
            <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
          </div>
          {/* Used This Year Card */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm text-gray-500 mb-1">USED THIS YEAR</h4>
            <p className="text-3xl font-bold text-gray-700">{stats.usedThisYear} days</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-4">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            {leaveStatuses.map((status) => (
              <button
                key={status}
                onClick={() => setActiveStatus(status)}
                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                  activeStatus === status
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {status}
              </button>
            ))}
          </nav>
        </div>

        {/* Leave Request List */}
        <LeaveRequestList
          // Pass filter based on active tab
          status={getStatusForList(activeStatus)}
          canManage={canManage}
          // Add other necessary props like employeeId if filtering non-managers
        />

        {/* Placeholder message from screenshot */}
         <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700">
             This is a placeholder page. In the full implementation, you would be able to request leave, approve/deny requests, and view leave history.
         </div>

      </div>
    </>
  );
};

// Fetch initial data (e.g., stats, maybe employees for future filters)
export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  // Protect route
  if (!session) {
    return { redirect: { destination: '/login', permanent: false } };
  }

  const currentUserRole = session.user?.role as string | null; // Get role from session

  // Placeholder: Fetch actual stats from an API endpoint
  const stats = {
    available: 14,
    pending: 2,
    approved: 8,
    usedThisYear: 6,
  };

  // Placeholder: Fetch employees if needed for other filters later
  // let employees: { id: number; name: string }[] = [];
  // if (currentUserRole === 'Admin' || currentUserRole === 'DepartmentHead') { ... }

  return {
    props: {
      // employees,
      currentUserRole,
      stats, // Pass fetched/mock stats
      session, // Pass session if needed by child components
    },
  };
};

export default LeaveIndexPage;