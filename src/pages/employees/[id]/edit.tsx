import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';

// Define the EmployeeData interface (consider moving to a shared types file)
interface EmployeeData {
  id: number;
  firstName: string;
  lastName: string;
  position?: string;
  hireDate?: string; // Keep as string for input compatibility initially
  departmentId?: number | string; // Allow string for input value
  // Add other relevant fields
}

const EmployeeEditPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const [employee, setEmployee] = useState<Partial<EmployeeData>>({
    firstName: '',
    lastName: '',
    position: '',
    hireDate: '',
    departmentId: '',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([]);
  const [deptLoadingError, setDeptLoadingError] = useState<string | null>(null);

  // Fetch existing employee data
  useEffect(() => {
    if (id) {
      const fetchEmployee = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await axios.get<EmployeeData>(`/api/employees/${id}`);
          // Format date for input type="date" if it exists
          const fetchedData = response.data;
          if (fetchedData.hireDate) {
            fetchedData.hireDate = new Date(fetchedData.hireDate).toISOString().split('T')[0];
          }
          setEmployee(fetchedData);
        } catch (err: any) {
          console.error(`Error fetching employee ${id} for edit:`, err);
          setError(err.response?.data?.message || 'Failed to load employee data.');
        } finally {
          setLoading(false);
        }
      };
      fetchEmployee();
    } else {
      setLoading(false);
    }
  }, [id]);

  // Fetch departments for the dropdown
  useEffect(() => {
    const fetchDepartments = async () => {
      setDeptLoadingError(null);
      try {
        const response = await axios.get<{ id: number; name: string }[]>('/api/departments');
        setDepartments(response.data);
      } catch (err: any) {
        console.error('Error fetching departments:', err);
        setDeptLoadingError('Failed to load departments.');
      }
    };
    fetchDepartments();
  }, []); // Run only once on mount

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEmployee(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Prepare data for submission (e.g., convert departmentId back to number if needed)
      const dataToSubmit = {
        ...employee,
        departmentId: employee.departmentId ? parseInt(employee.departmentId as string, 10) : undefined,
        // Ensure hireDate is handled correctly if empty or invalid
        hireDate: employee.hireDate || null,
      };

      // Actual API call to update the employee
      await axios.put(`/api/employees/${id}`, dataToSubmit);

      // Redirect back to the detail page on success
      router.push(`/employees/${id}`);

    } catch (err: any) {
      console.error(`Error updating employee ${id}:`, err);
      setSubmitError(err.response?.data?.message || 'Failed to update employee.');
      setIsSubmitting(false);
    }
    // No finally block needed here as we only set isSubmitting to false on error
  };

  // Basic form styling (can be improved with components)
  const formStyles: React.CSSProperties = {
    padding: '1.5rem',
    border: '1px solid var(--gray-300)',
    borderRadius: 'var(--radius)',
    backgroundColor: 'white',
    marginTop: '1rem',
    maxWidth: '600px',
  };
  const inputGroupStyles: React.CSSProperties = {
    marginBottom: '1rem',
  };
  const labelStyles: React.CSSProperties = {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 600,
    color: 'var(--gray-700)',
  };
  const inputStyles: React.CSSProperties = {
    width: '100%',
    padding: '0.5rem 0.75rem',
    border: '1px solid var(--gray-300)',
    borderRadius: 'var(--radius)',
    fontSize: '0.875rem',
  };
  const buttonStyles: React.CSSProperties = {
    marginRight: '0.5rem',
  };

  if (loading) {
    return <p>Loading employee data for editing...</p>;
  }

  if (error) {
    return <p style={{ color: 'var(--danger)' }}>Error: {error}</p>;
  }

  if (!employee) {
    return <p>Employee data not available.</p>;
  }

  return (
    <>
      <Head>
        <title>{`Edit Employee: ${employee.firstName || ''} ${employee.lastName || ''} - Mountain Care HR`}</title>
      </Head>
      <div>
        <Link href={`/employees/${id}`}>
          <a>&larr; Back to Employee Details</a>
        </Link>

        <h2>Edit Employee</h2>

        <form style={formStyles} onSubmit={handleSubmit}>
          <div style={inputGroupStyles}>
            <label htmlFor="firstName" style={labelStyles}>First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={employee.firstName || ''}
              onChange={handleChange}
              style={inputStyles}
              required
            />
          </div>

          <div style={inputGroupStyles}>
            <label htmlFor="lastName" style={labelStyles}>Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={employee.lastName || ''}
              onChange={handleChange}
              style={inputStyles}
              required
            />
          </div>

          <div style={inputGroupStyles}>
            <label htmlFor="position" style={labelStyles}>Position</label>
            <input
              type="text"
              id="position"
              name="position"
              value={employee.position || ''}
              onChange={handleChange}
              style={inputStyles}
            />
          </div>

          <div style={inputGroupStyles}>
            <label htmlFor="hireDate" style={labelStyles}>Hire Date</label>
            <input
              type="date"
              id="hireDate"
              name="hireDate"
              value={employee.hireDate || ''}
              onChange={handleChange}
              style={inputStyles}
            />
          </div>

          <div style={inputGroupStyles}>
            <label htmlFor="departmentId" style={labelStyles}>Department</label>
            {deptLoadingError ? (
              <p style={{ color: 'var(--danger)' }}>{deptLoadingError}</p>
            ) : (
              <select
                id="departmentId"
                name="departmentId"
                value={employee.departmentId || ''} // Use empty string if undefined/null
                onChange={handleChange}
                style={inputStyles}
                required // Make department selection mandatory if needed
              >
                <option value="" disabled>-- Select Department --</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Add more form fields as needed */}

          {submitError && (
            <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>
              Error submitting form: {submitError}
            </p>
          )}

          <div>
            <button
              type="submit"
              className="btn btn-primary" // Assuming btn classes exist
              disabled={isSubmitting}
              style={buttonStyles}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
            <Link href={`/employees/${id}`} passHref>
              <button type="button" className="btn btn-outline" disabled={isSubmitting}>
                Cancel
              </button>
            </Link>
          </div>
        </form>
      </div>
    </>
  );
};

export default EmployeeEditPage;