import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import axios from 'axios';
import { GetServerSideProps } from 'next';
import { getSession, useSession } from 'next-auth/react'; // Import useSession for client-side role check
import Link from 'next/link'; // Import Link
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
  const [nameFilter, setNameFilter] = useState<string>(''); // State for name filter

  // Get session on client-side for dynamic role checks if needed, though userRole prop is primary
  const { data: session } = useSession();

  // Fetch employees when the component mounts
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      setError(null);
      try {
        // Add filter parameter if nameFilter is set
        const params = nameFilter ? { name: nameFilter } : {};
        const response = await axios.get<EmployeeData[]>('/api/employees', { params });
        setEmployees(response.data);
      } catch (err: any) {
        console.error('Error fetching employees:', err);
        setError(err.response?.data?.message || 'Failed to fetch employees. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [nameFilter]); // Re-fetch when nameFilter changes

  // Determine if the current user can export
  const canManage = userRole === 'Admin' || userRole === 'DepartmentHead'; // Combine check for multiple actions
  const canExport = canManage; // Assuming same roles can export

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
            {/* Enable "New Employee" button if user has permission */}
            {canManage && (
                <Link href="/employees/new" className="btn btn-primary">
                    <Icon iconName="fas fa-plus" /> New Employee
                </Link>
            )}
          </div>
      </div>

      {/* TODO: Refactor Filtering Controls with semantic classes if needed */}
      <div className="filter-controls" style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}> {/* Basic layout */}
        {/* Use form-input class potentially */}
        <input
            type="text"
            placeholder="Filter by name..."
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="form-input"
            style={{maxWidth: '250px'}}
        />
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
                        <td className="actions-cell" style={{ whiteSpace: 'nowrap' }}> {/* Prevent wrapping */}
                           <Link href={`/employees/${emp.id}`} className="btn btn-sm btn-outline" style={{ marginRight: '0.5rem' }}>
                                View
                           </Link>
                           {canManage && (
                               <>
                                   <Link href={`/employees/${emp.id}/edit`} className="btn btn-sm btn-outline" style={{ marginRight: '0.5rem' }}>
                                       Edit
                                   </Link>
                                   <button
                                       onClick={() => handleDelete(emp.id)}
                                       className="btn btn-sm btn-danger-outline"
                                   >
                                       Delete
                                   </button>
                               </>
                           )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      {/* Apply text align via CSS class if available, else inline */}
                      <td colSpan={7} style={{ textAlign: 'center', padding: '1rem' }}> {/* Adjusted colspan */}
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

  // Handle employee deletion
  const handleDelete = async (employeeId: number) => {
    // Basic confirmation dialog
    if (!window.confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/api/employees/${employeeId}`);
      // Remove the employee from the local state to update the UI
      setEmployees(prevEmployees => prevEmployees.filter(emp => emp.id !== employeeId));
      // Optionally show a success notification
      alert('Employee deleted successfully.');
    } catch (err: any) {
      console.error('Error deleting employee:', err);
      setError(err.response?.data?.message || 'Failed to delete employee.');
      // Optionally show an error notification
      alert(`Error: ${err.response?.data?.message || 'Failed to delete employee.'}`);
    }
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