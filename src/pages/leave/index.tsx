import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import LeaveRequestList from '@/components/leave/LeaveRequestList';
import Icon from '@/components/ui/Icon';
import axios from 'axios'; // Import axios for SSR fetch
import Card from '@/components/ui/Card'; // Assuming Card component exists

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

      {/* Header Section */}
      <div className="header">
          <div className="page-title">
              <h1>Leave Management</h1>
          </div>
          <div className="header-actions">
              {/* Use semantic button classes */}
              <Link href="/leave/request" className="btn btn-primary">
                  {/* <Icon iconName="fas fa-plus" /> */}
                  Request Leave
              </Link>
          </div>
      </div>

      {/* Stats Cards */}
      <div className="dashboard-grid leave-stats-grid" style={{marginBottom: '1.5rem'}}>
        {/* Available Balance Card */}
        <div className="card simple-stat-card">
          <div className="card-body">
              <h4 className="simple-stat-title">AVAILABLE BALANCE</h4>
              <p className="simple-stat-value">{stats.available} days</p>
          </div>
        </div>
        {/* Pending Requests Card */}
        <div className="card simple-stat-card">
          <div className="card-body">
              <h4 className="simple-stat-title">PENDING REQUESTS</h4>
              <p className="simple-stat-value">{stats.pending}</p>
          </div>
        </div>
        {/* Approved Card */}
        <div className="card simple-stat-card">
          <div className="card-body">
              <h4 className="simple-stat-title">APPROVED</h4>
              <p className="simple-stat-value">{stats.approved}</p>
          </div>
        </div>
        {/* Used This Year Card */}
        <div className="card simple-stat-card">
          <div className="card-body">
              <h4 className="simple-stat-title">USED THIS YEAR</h4>
              <p className="simple-stat-value">{stats.usedThisYear} days</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-nav-container" style={{marginBottom: '1rem'}}>
        <nav className="tab-nav" aria-label="Tabs">
          {leaveStatuses.map((status) => (
            <button
              key={status}
              onClick={() => setActiveStatus(status)}
              className={`tab-item ${activeStatus === status ? 'active' : ''}`}
            >
              {status}
            </button>
          ))}
        </nav>
      </div>

      {/* Leave Request List */}
      <LeaveRequestList
        status={getStatusForList(activeStatus)}
        canManage={canManage}
        // Add other necessary props like employeeId if filtering non-managers
      />

      {/* Placeholder message styling */}
      <div className="info-message" style={{marginTop: '1.5rem'}}>
        This is a placeholder page. In the full implementation, you would be able to request leave, approve/deny requests, and view leave history.
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

  // Fetch actual stats from an API endpoint
  let stats = { available: 0, pending: 0, approved: 0, usedThisYear: 0 }; // Default stats
  try {
      console.log('SSR: Fetching leave stats...');
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      // Assuming an endpoint exists to fetch stats for the current user
      const url = new URL('/api/leave/stats', baseUrl);

      const response = await axios.get<typeof stats>(url.toString(), {
           headers: { Cookie: context.req.headers.cookie || '' }
      });
      stats = response.data;

  } catch (error: any) {
      console.error('SSR Error fetching leave stats:', error.message);
      // Keep default stats or handle error appropriately
  }

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