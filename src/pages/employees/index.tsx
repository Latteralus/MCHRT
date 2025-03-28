import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import axios from 'axios';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
// MainLayout is applied globally via _app.tsx
import Icon from '@/components/ui/Icon';
import Card from '@/components/ui/Card'; // Import Card

// Define an interface for the Employee data structure
interface EmployeeData {
  id: number;
  firstName: string;
  lastName: string;
  position?: string;
  hireDate?: string;
  departmentId?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Add props interface to accept userRole
interface EmployeeListPageProps {
    userRole: string | null;
}

const EmployeeListPage: React.FC<EmployeeListPageProps> = ({ userRole }) => {
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch employees when the component mounts
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get<EmployeeData[]>('/api/employees');
        setEmployees(response.data);
      } catch (err: any) {
        console.error('Error fetching employees:', err);
        setError(err.response?.data?.message || 'Failed to fetch employees. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Determine if the current user can export
  const canExport = userRole === 'Admin' || userRole === 'DepartmentHead';

  return (
    <> {/* Single root fragment */}
      <Head>
        <title>Employees - Mountain Care HR</title>
      </Head>

      {/* Header Section */}
      <div className="header">
          <div className="page-title">
              <h1>Employee List</h1>
              {/* <div className="page-subtitle">Manage employee information</div> */}
          </div>
          <div className="header-actions">
            {/* Export Button using semantic classes */}
            {canExport && (
                 <a
                    href="/api/employees/export"
                    download
                    className="btn btn-outline" // Use semantic classes
                 >
                    <Icon iconName="fas fa-download" />
                    Export CSV
                 </a>
            )}
            {/* TODO: Add "New Employee" button if needed */}
            {/* <Link href="/employees/new" className="btn btn-primary">
                <Icon iconName="fas fa-plus" /> New Employee
            </Link> */}
          </div>
      </div>

      {/* TODO: Refactor Filtering Controls with semantic classes if needed */}
      <div className="filter-controls" style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}> {/* Basic layout */}
        {/* Use form-input class potentially */}
        <input type="text" placeholder="Filter by name..." disabled title="Filter by name" className="form-input" style={{maxWidth: '250px'}} />
        <select disabled title="Filter by department" className="form-input" style={{maxWidth: '250px'}}>
          <option value="">Filter by department...</option>
          {/* Populate departments dynamically later */}
        </select>
      </div>

      {/* Loading/Error States (Keep utility classes for now, or create specific components/classes) */}
      {loading && <p className="text-gray-500">Loading employees...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}

      {/* Table Section */}
      {!loading && !error && (
        // Wrap table in a card for consistent styling
        <div className="card"> {/* Using card for consistency */}
          <div className="card-body" style={{ padding: 0 }}> {/* Remove padding for full-width table */}
            <div className="table-container" style={{ overflowX: 'auto' }}>
              {/* Apply a base class for potential global table styling */}
              <table className="data-table" style={{ width: '100%' }}> {/* Ensure table takes width */}
                <thead>
                  <tr>
                    {/* Add specific classes if needed for th styling */}
                    <th>ID</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Position</th>
                    <th>Hire Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.length > 0 ? (
                    employees.map((emp) => (
                      <tr key={emp.id}>
                        {/* Add specific classes if needed for td styling */}
                        <td>{emp.id}</td>
                        <td>{emp.firstName}</td>
                        <td>{emp.lastName}</td>
                        <td>{emp.position || 'N/A'}</td>
                        <td>{emp.hireDate ? new Date(emp.hireDate).toLocaleDateString() : 'N/A'}</td>
                        <td>
                          {/* TODO: Add View/Edit/Delete links/buttons */}
                          {/* Use standard button or semantic class */}
                          <button disabled className="btn btn-sm btn-outline">View</button> {/* Example */}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      {/* Apply text align via CSS class if available, else inline */}
                      <td colSpan={6} style={{ textAlign: 'center', padding: '1rem' }}>
                        No employees found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Fetch session data server-side to get the user's role
export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);

    // Redirect if not logged in
    if (!session) {
        return { redirect: { destination: '/login', permanent: false } };
    }

    // Pass the role to the page component
    return {
        props: {
            userRole: session.user?.role ?? null, // Pass role or null
        },
    };
};


export default EmployeeListPage;