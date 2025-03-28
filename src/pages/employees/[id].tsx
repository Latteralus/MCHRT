import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import axios from 'axios';
// import MainLayout from '@/components/layouts/MainLayout'; // Applied via _app.tsx

// Define the EmployeeData interface again (or move to a shared types file)
interface EmployeeData {
  id: number;
  firstName: string;
  lastName: string;
  position?: string;
  hireDate?: string;
  departmentId?: number;
  createdAt?: string;
  updatedAt?: string;
  // Add department details if included via API later
  // department?: { name: string };
}

const EmployeeDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query; // Get the employee ID from the URL query parameters

  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch employee data only if the ID is available in the router query
    if (id) {
      const fetchEmployee = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await axios.get<EmployeeData>(`/api/employees/${id}`);
          setEmployee(response.data);
        } catch (err: any) {
          console.error(`Error fetching employee ${id}:`, err);
          if (err.response?.status === 404) {
            setError('Employee not found.');
          } else {
            setError(err.response?.data?.message || 'Failed to fetch employee details.');
          }
        } finally {
          setLoading(false);
        }
      };

      fetchEmployee();
    } else {
      // Set loading to false if ID is not yet available (e.g., during initial render)
      setLoading(false);
    }
  }, [id]); // Re-run effect if the ID changes

  // Basic styling for detail view (can be improved)
  const detailStyles: React.CSSProperties = {
    padding: '1rem',
    border: '1px solid var(--gray-300)',
    borderRadius: 'var(--radius)',
    backgroundColor: 'white',
    marginTop: '1rem',
  };
  const labelStyles: React.CSSProperties = {
    fontWeight: 600,
    color: 'var(--gray-700)',
    minWidth: '120px',
    display: 'inline-block',
  };
  const itemStyles: React.CSSProperties = {
    marginBottom: '0.75rem',
  };

  if (loading) {
    return <p>Loading employee details...</p>;
  }

  if (error) {
    return <p style={{ color: 'var(--danger)' }}>Error: {error}</p>;
  }

  if (!employee) {
    // This might happen briefly before ID is ready or if fetch failed silently
    return <p>Employee data not available.</p>;
  }

  return (
    <>
      <Head>
        <title>{`Employee: ${employee.firstName} ${employee.lastName} - Mountain Care HR`}</title>
      </Head>
      <div>
        {/* TODO: Add Breadcrumbs or back link */}
        <h2>Employee Details</h2>

        {/* TODO: Add Edit button */}

        <div style={detailStyles}>
          <div style={itemStyles}>
            <span style={labelStyles}>ID:</span> {employee.id}
          </div>
          <div style={itemStyles}>
            <span style={labelStyles}>First Name:</span> {employee.firstName}
          </div>
          <div style={itemStyles}>
            <span style={labelStyles}>Last Name:</span> {employee.lastName}
          </div>
          <div style={itemStyles}>
            <span style={labelStyles}>Position:</span> {employee.position || 'N/A'}
          </div>
          <div style={itemStyles}>
            <span style={labelStyles}>Hire Date:</span> {employee.hireDate ? new Date(employee.hireDate).toLocaleDateString() : 'N/A'}
          </div>
          <div style={itemStyles}>
            <span style={labelStyles}>Department ID:</span> {employee.departmentId || 'N/A'}
            {/* TODO: Display Department Name */}
          </div>
          {/* Add more fields as needed */}
        </div>

        {/* TODO: Add tabs for related info (Attendance, Leave, Compliance, Documents) */}
      </div>
    </>
  );
};

export default EmployeeDetailPage;