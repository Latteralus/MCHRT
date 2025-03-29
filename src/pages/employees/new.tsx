import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';
import { format } from 'date-fns'; // Import date-fns for formatting

// Define the EmployeeData interface (consider moving to a shared types file)
// Define the data structure for a Position (matching API response)
interface PositionData {
  id: number;
  name: string;
}

// Update EmployeeData interface
interface NewEmployeeData {
  firstName: string;
  lastName: string;
  positionId: number | string; // Changed from position to positionId
  hireDate?: string | null;
  departmentId?: number | string;
}

const NewEmployeePage: React.FC = () => {
  const router = useRouter();

  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayDateString = () => {
    return format(new Date(), 'yyyy-MM-dd');
  };

  const [employee, setEmployee] = useState<NewEmployeeData>({
    firstName: '',
    lastName: '',
    positionId: '', // Changed from position
    hireDate: getTodayDateString(), // Default hireDate to today
    departmentId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([]);
  const [deptLoadingError, setDeptLoadingError] = useState<string | null>(null);
  const [positions, setPositions] = useState<PositionData[]>([]); // State for positions
  const [posLoadingError, setPosLoadingError] = useState<string | null>(null); // State for position loading error

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
  }, []);

  // Fetch positions for the dropdown
  useEffect(() => {
    const fetchPositions = async () => {
      setPosLoadingError(null);
      try {
        const response = await axios.get<PositionData[]>('/api/positions');
        setPositions(response.data);
      } catch (err: any) {
        console.error('Error fetching positions:', err);
        setPosLoadingError('Failed to load positions.');
      }
    };
    fetchPositions();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEmployee(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Prepare data for submission, ensuring IDs are numbers
      const dataToSubmit = {
        firstName: employee.firstName,
        lastName: employee.lastName,
        positionId: parseInt(employee.positionId as string, 10), // Parse positionId
        departmentId: employee.departmentId ? parseInt(employee.departmentId as string, 10) : undefined,
        hireDate: employee.hireDate || null,
      };

      // Validate positionId again just before submission
      if (isNaN(dataToSubmit.positionId)) {
          setSubmitError('Please select a valid position.');
          setIsSubmitting(false);
          return;
      }

      // API call to create the employee
      const response = await axios.post('/api/employees', dataToSubmit);

      // Redirect to the new employee's detail page on success
      const newEmployeeId = response.data.id; // Assuming the API returns the new ID
      router.push(`/employees/${newEmployeeId}`);

    } catch (err: any) {
      console.error('Error creating employee:', err);
      setSubmitError(err.response?.data?.message || 'Failed to create employee.');
      setIsSubmitting(false);
    }
    // No finally block needed here as we only set isSubmitting to false on error
  };

  // Basic form styling (reuse or create shared components)
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

  return (
    <>
      <Head>
        <title>Add New Employee - Mountain Care HR</title>
      </Head>
      <div>
        <Link href="/employees" className="text-blue-600 hover:underline mb-4 inline-block">
          &larr; Back to Employee List
        </Link>

        <h2>Add New Employee</h2>

        <form style={formStyles} onSubmit={handleSubmit}>
          <div style={inputGroupStyles}>
            <label htmlFor="firstName" style={labelStyles}>First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={employee.firstName}
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
              value={employee.lastName}
              onChange={handleChange}
              style={inputStyles}
              required
            />
          </div>

          <div style={inputGroupStyles}>
            <label htmlFor="positionId" style={labelStyles}>Position</label>
            {posLoadingError ? (
              <p style={{ color: 'var(--danger)' }}>{posLoadingError}</p>
            ) : (
              <select
                id="positionId"
                name="positionId"
                value={employee.positionId || ''}
                onChange={handleChange}
                style={inputStyles}
                required // Make position mandatory
              >
                <option value="" disabled>-- Select Position --</option>
                {positions.map(pos => (
                  <option key={pos.id} value={pos.id}>
                    {pos.name}
                  </option>
                ))}
              </select>
            )}
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
              {isSubmitting ? 'Creating...' : 'Create Employee'}
            </button>
            <Link href="/employees">
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

export default NewEmployeePage;