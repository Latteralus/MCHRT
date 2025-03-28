import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import axios from 'axios';
import { GetServerSideProps } from 'next'; // Import GetServerSideProps
import { getSession } from 'next-auth/react'; // Import getSession
import MainLayout from '@/components/layouts/MainLayout'; // Assuming MainLayout is needed
import Icon from '@/components/ui/Icon'; // Assuming Icon component exists

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

  // Basic table styling (consider moving to CSS)
  const tableStyles: React.CSSProperties = { /* ... existing styles ... */ };
  const thStyles: React.CSSProperties = { /* ... existing styles ... */ };
  const tdStyles: React.CSSProperties = { /* ... existing styles ... */ };

  return (
    // Apply MainLayout here if not done globally in _app.tsx
    <> {/* Removed redundant MainLayout wrapper */}
      <Head>
        <title>Employees - Mountain Care HR</title>
      </Head>
      <div className="p-8"> {/* Use consistent padding */}
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Employee List</h1>
            {/* Conditionally render Export Button */}
            {canExport && ( // Corrected operator
                 <a
                    href="/api/employees/export"
                    download // Optional: Suggests filename, but API header takes precedence
                    className="btn btn-outline bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
                 >
                    <Icon iconName="fas fa-download" /> {/* Assuming Font Awesome */}
                    Export CSV
                 </a>
            )}
        </div>


        {/* TODO: Add Filtering Controls */}
        <div className="mb-4 flex gap-4">
          <input type="text" placeholder="Filter by name..." disabled className="border p-2 rounded text-sm" title="Filter by name" /> {/* Added title */}
          <select disabled className="border p-2 rounded text-sm bg-white" title="Filter by department"> {/* Added title */}
            <option value="">Filter by department...</option>
            {/* Populate departments dynamically later */}
          </select>
        </div>

        {loading && <p className="text-gray-500">Loading employees...</p>}
        {error && <p className="text-red-600">Error: {error}</p>}

        {!loading && !error && ( // Corrected operators
          <div className="overflow-x-auto bg-white shadow rounded-lg"> {/* Added container for better styling */}
            <table className="min-w-full divide-y divide-gray-200"> {/* Use Tailwind for table */}
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">First Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hire Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.length > 0 ? (
                  employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{emp.firstName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{emp.lastName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.position || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.hireDate ? new Date(emp.hireDate).toLocaleDateString() : 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {/* TODO: Add View/Edit/Delete links/buttons */}
                        <button disabled className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50">View</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      No employees found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </> // Moved parenthesis and semicolon after fragment
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