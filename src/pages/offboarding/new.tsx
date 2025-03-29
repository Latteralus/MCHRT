import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';
import { format } from 'date-fns'; // Import date-fns for formatting
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';

// Define interfaces (adjust as needed based on actual API/data model)
interface EmployeeOption {
  id: number;
  name: string; // e.g., "LastName, FirstName" - Assuming API returns this format
}

interface NewOffboardingData {
  employeeId: number | string;
  exitDate: string;
  reason?: string;
}

const NewOffboardingPage: React.FC = () => {
  const router = useRouter();

  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayDateString = () => {
    return format(new Date(), 'yyyy-MM-dd');
  };

  const [formData, setFormData] = useState<NewOffboardingData>({
    employeeId: '',
    exitDate: getTodayDateString(), // Default exitDate to today
    reason: '',
  });
  // State for employee search
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<EmployeeOption[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [selectedEmployeeName, setSelectedEmployeeName] = useState<string>(''); // To display selected name

  // General form state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null); // General loading error (e.g., initial load if needed)

  // Debounced search for employees
  useEffect(() => {
    // Clear results if search term is empty or an employee is selected
    if (!searchTerm || formData.employeeId) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setLoadingError(null); // Clear previous errors

    const delayDebounceFn = setTimeout(async () => {
      try {
        // Assuming API supports a 'search' query parameter
        const response = await axios.get<EmployeeOption[]>('/api/employees', {
          params: {
            status: 'active', // Only search active employees
            search: searchTerm
          }
        });
        // Format name if necessary, e.g., response.data.map(emp => ({ id: emp.id, name: `${emp.lastName}, ${emp.firstName}` }))
        setSearchResults(response.data);
      } catch (err: any) {
        console.error('Error searching employees:', err);
        setLoadingError('Failed to search employees.');
        setSearchResults([]); // Clear results on error
      } finally {
        setIsSearching(false);
      }
    }, 500); // 500ms debounce delay

    return () => clearTimeout(delayDebounceFn); // Cleanup timeout on unmount or re-render
  }, [searchTerm, formData.employeeId]); // Re-run effect when searchTerm changes or employeeId is set/cleared

  // Handle changes in form inputs (including search)
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'employeeSearch') {
      setSearchTerm(value);
      // Clear selected employee if user starts typing again
      setFormData(prev => ({ ...prev, employeeId: '' }));
      setSelectedEmployeeName('');
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle selecting an employee from search results
  const handleSelectEmployee = (employee: EmployeeOption) => {
    setFormData(prev => ({ ...prev, employeeId: employee.id }));
    setSelectedEmployeeName(employee.name); // Display selected name in input
    setSearchTerm(''); // Clear search term
    setSearchResults([]); // Hide results
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    if (!formData.employeeId || !formData.exitDate) {
        setSubmitError('Please select an employee and provide an exit date.');
        setIsSubmitting(false);
        return;
    }

    try {
      const dataToSubmit = {
          ...formData,
          employeeId: parseInt(formData.employeeId as string, 10),
          // Ensure reason is not empty string if not provided, send undefined instead
          reason: formData.reason?.trim() || undefined
      };

      const response = await axios.post('/api/offboarding', dataToSubmit);

      // Redirect to the main offboarding page on success
      router.push('/offboarding');

    } catch (err: any) {
      console.error('Error starting offboarding:', err);
      setSubmitError(err.response?.data?.message || 'Failed to start offboarding process.');
      setIsSubmitting(false); // Keep form enabled on error
    }
    // Remove finally block if only setting false on error
    // finally {
    //   setIsSubmitting(false);
    // }
  };

  // Basic form styling (reuse or create shared components)
  const formStyles: React.CSSProperties = { /* ... styles ... */ };
  const inputGroupStyles: React.CSSProperties = { marginBottom: '1rem' };
  const labelStyles: React.CSSProperties = { display: 'block', marginBottom: '0.5rem', fontWeight: 600 };
  const inputStyles: React.CSSProperties = { width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' };
  const buttonStyles: React.CSSProperties = { marginRight: '0.5rem' };


  return (
    <>
      <Head>
        <title>Start New Offboarding - Mountain Care HR</title>
      </Head>
      <div style={{ padding: '1rem 2rem' }}>
        <Link href="/offboarding" className="text-blue-600 hover:underline mb-4 inline-block">
          &larr; Back to Offboarding List
        </Link>

        <h2 className="text-2xl font-semibold mb-4">Start New Offboarding Process</h2>

        <form style={formStyles} onSubmit={handleSubmit}>
          <div style={inputGroupStyles} className="relative"> {/* Added relative positioning for results */}
            <label htmlFor="employeeSearch" style={labelStyles}>Employee</label>
            <input
              type="text"
              id="employeeSearch"
              name="employeeSearch"
              placeholder="Type to search..."
              value={selectedEmployeeName || searchTerm} // Show selected name or current search term
              onChange={handleChange}
              style={inputStyles}
              required={!formData.employeeId} // Input is required only if no employee is selected yet
              autoComplete="off" // Prevent browser autocomplete
            />
            {/* Search Results Dropdown */}
            {(isSearching || searchResults.length > 0 || loadingError) && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {isSearching && <div className="p-2 text-gray-500">Searching...</div>}
                {loadingError && !isSearching && <div className="p-2 text-red-500">{loadingError}</div>}
                {!isSearching && !loadingError && searchResults.length === 0 && searchTerm && (
                  <div className="p-2 text-gray-500">No matching employees found.</div>
                )}
                {!isSearching && searchResults.length > 0 && (
                  <ul>
                    {searchResults.map(emp => (
                      <li
                        key={emp.id}
                        className="p-2 hover:bg-blue-100 cursor-pointer"
                        onClick={() => handleSelectEmployee(emp)}
                        onMouseDown={(e) => e.preventDefault()} // Prevent input blur on click
                      >
                        {emp.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
             {/* Hidden input to store the actual employeeId for form submission */}
             <input type="hidden" name="employeeId" value={formData.employeeId} />
          </div>

          <div style={inputGroupStyles}>
            <label htmlFor="exitDate" style={labelStyles}>Exit Date</label>
            <input
              type="date"
              id="exitDate"
              name="exitDate"
              value={formData.exitDate}
              onChange={handleChange}
              style={inputStyles}
              required
            />
          </div>

          <div style={inputGroupStyles}>
            <label htmlFor="reason" style={labelStyles}>Reason for Leaving (Optional)</label>
            <textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              style={{ ...inputStyles, minHeight: '80px' }}
            />
          </div>

          {submitError && (
            <p style={{ color: 'red', marginBottom: '1rem' }}>
              Error: {submitError}
            </p>
          )}

          <div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !formData.employeeId} // Disable if submitting or no employee selected
              style={buttonStyles}
            >
              {isSubmitting ? 'Starting...' : 'Start Offboarding Process'}
            </button>
            <Link href="/offboarding">
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

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return { redirect: { destination: '/login', permanent: false } };
  }
  // Add role check if only specific roles can start offboarding
  // if (session.user?.role !== 'Admin' && session.user?.role !== 'HR') {
  //    return { redirect: { destination: '/unauthorized', permanent: false } };
  // }

  return {
    props: { session },
  };
};


export default NewOffboardingPage;