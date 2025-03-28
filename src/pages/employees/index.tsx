import React, { useState, useEffect } from 'react';
import Head from 'next/head';
// Assuming MainLayout is applied via _app.tsx, otherwise import it here
// import MainLayout from '@/components/layouts/MainLayout';
import axios from 'axios'; // Using axios for data fetching

// Define an interface for the Employee data structure (matching the API response)
// Excludes sensitive data like ssnEncrypted
interface EmployeeData {
  id: number;
  firstName: string;
  lastName: string;
  position?: string;
  hireDate?: string; // Dates might be strings from JSON
  departmentId?: number;
  createdAt?: string;
  updatedAt?: string;
  // Add department name if included via API later
  // department?: { name: string };
}

const EmployeeListPage: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch employees when the component mounts
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      setError(null);
      try {
        // Use relative path for API endpoint
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
  }, []); // Empty dependency array means this runs once on mount

  // Basic table styling (can be moved to CSS modules/global CSS)
  const tableStyles: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '1rem',
  };
  const thStyles: React.CSSProperties = {
    border: '1px solid var(--gray-300)',
    padding: '0.75rem',
    textAlign: 'left',
    backgroundColor: 'var(--gray-100)',
    fontWeight: 600,
  };
  const tdStyles: React.CSSProperties = {
    border: '1px solid var(--gray-300)',
    padding: '0.75rem',
  };

  return (
    <>
      <Head>
        <title>Employees - Mountain Care HR</title>
      </Head>
      <div>
        <h2>Employee List</h2>

        {/* TODO: Add Filtering Controls */}
        <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
          <input type="text" placeholder="Filter by name..." disabled />
          <select disabled>
            <option value="">Filter by department...</option>
            {/* Populate departments dynamically later */}
          </select>
        </div>

        {loading && <p>Loading employees...</p>}
        {error && <p style={{ color: 'var(--danger)' }}>Error: {error}</p>}

        {!loading && !error && (
          <table style={tableStyles}>
            <thead>
              <tr>
                <th style={thStyles}>ID</th>
                <th style={thStyles}>First Name</th>
                <th style={thStyles}>Last Name</th>
                <th style={thStyles}>Position</th>
                <th style={thStyles}>Hire Date</th>
                {/* Add Department later */}
                <th style={thStyles}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length > 0 ? (
                employees.map((emp) => (
                  <tr key={emp.id}>
                    <td style={tdStyles}>{emp.id}</td>
                    <td style={tdStyles}>{emp.firstName}</td>
                    <td style={tdStyles}>{emp.lastName}</td>
                    <td style={tdStyles}>{emp.position || 'N/A'}</td>
                    <td style={tdStyles}>{emp.hireDate ? new Date(emp.hireDate).toLocaleDateString() : 'N/A'}</td>
                    <td style={tdStyles}>
                      {/* TODO: Add View/Edit/Delete links/buttons */}
                      <button disabled>View</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ ...tdStyles, textAlign: 'center' }}>
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

// If using per-page layouts, ensure MainLayout is applied:
// EmployeeListPage.getLayout = function getLayout(page: React.ReactElement) {
//   return <MainLayout>{page}</MainLayout>;
// };

export default EmployeeListPage;