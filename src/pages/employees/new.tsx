import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react'; // Add useEffect here
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';

// Define the EmployeeData interface (consider moving to a shared types file)
interface NewEmployeeData {
  firstName: string;
  lastName: string;
  position?: string;
  hireDate?: string | null; // Allow null for submission
  departmentId?: number | string; // Allow string for input value
  // Add other relevant fields needed for creation
}

const NewEmployeePage: React.FC = () => {
  const router = useRouter();

  const [employee, setEmployee] = useState<NewEmployeeData>({
    firstName: '',
    lastName: '',
    position: '',
    hireDate: '',
    departmentId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([]);
  const [deptLoadingError, setDeptLoadingError] = useState<string | null>(null);

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
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Prepare data for submission
      const dataToSubmit = {
        ...employee,
        departmentId: employee.departmentId ? parseInt(employee.departmentId as string, 10) : undefined,
        // Ensure hireDate is handled correctly if empty or invalid
        hireDate: employee.hireDate || null,
      };

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
        <Link href="/employees">
          <a>&larr; Back to Employee List</a>
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
            <label htmlFor="position" style={labelStyles}>Position</label>
            <input
              type="text"
              id="position"
              name="position"
              value={employee.position}
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
              {isSubmitting ? 'Creating...' : 'Create Employee'}
            </button>
            <Link href="/employees" passHref>
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