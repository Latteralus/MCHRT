import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link'; // Import Link
import axios from 'axios';
import LeaveBalanceDisplay from '@/components/leave/LeaveBalance'; // Import the balance component
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
  // Department name will be fetched separately
}

const EmployeeDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query; // Get the employee ID from the URL query parameters

  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [departmentName, setDepartmentName] = useState<string | null>(null);
  const [deptLoading, setDeptLoading] = useState<boolean>(false);
  const [deptError, setDeptError] = useState<string | null>(null);

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

  // Effect to fetch department name once employee data is available
  useEffect(() => {
    if (employee?.departmentId) {
      const fetchDepartment = async () => {
        setDeptLoading(true);
        setDeptError(null);
        try {
          const response = await axios.get<{ name: string }>(`/api/departments/${employee.departmentId}`);
          setDepartmentName(response.data.name);
        } catch (err: any) {
          console.error(`Error fetching department ${employee.departmentId}:`, err);
          setDeptError('Could not load department name.');
          setDepartmentName(null); // Clear name on error
        } finally {
          setDeptLoading(false);
        }
      };
      fetchDepartment();
    } else {
      // Reset department name if employee has no department ID
      setDepartmentName(null);
    }
  }, [employee?.departmentId]); // Re-run when departmentId changes

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
        <div style={{ marginBottom: '1rem' }}>
             <Link href="/employees" className="text-link">
                &larr; Back to Employee List
             </Link>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Employee Details</h2>
          {/* Add Edit button */}
          {employee && ( // Only show button if employee data is loaded
            <Link href={`/employees/${employee.id}/edit`} passHref>
              <button className="btn btn-outline"> {/* Assuming btn classes exist */}
                <i className="fas fa-edit" style={{ marginRight: '0.5rem' }}></i> Edit
              </button>
            </Link>
          )}
        </div>

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
            <span style={labelStyles}>Department:</span>
            {deptLoading ? ' Loading...' : (deptError || departmentName || 'N/A')}
          </div>
          {/* Add more fields as needed */}
        </div>

        {/* Display Leave Balances */}
        {employee && <LeaveBalanceDisplay employeeId={employee.id} />}

        {/* TODO: Add tabs for related info (Attendance, Leave, Compliance, Documents) */}
      </div>
    </>
  );
};

export default EmployeeDetailPage;