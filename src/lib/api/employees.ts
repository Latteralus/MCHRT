import axios from 'axios';

// Interface for the data needed for a select dropdown
interface EmployeeSelectItem {
    id: number;
    name: string; // e.g., "LastName, FirstName"
}

/**
 * Fetches a list of employees formatted for a select dropdown.
 * Assumes the API endpoint '/api/employees' returns a list of employees
 * with at least 'id', 'firstName', and 'lastName'.
 * Applies RBAC filtering implicitly via the API endpoint.
 */
export const fetchEmployeesForSelect = async (): Promise<EmployeeSelectItem[]> => {
    try {
        // Construct absolute URL for server-side fetching
        const baseURL = typeof window === 'undefined'
            ? process.env.NEXTAUTH_URL // Use NEXTAUTH_URL or NEXT_PUBLIC_APP_URL if set
            : ''; // Client-side uses relative path
        const url = `${baseURL}/api/employees`;

        // Fetch the full list - the API endpoint handles RBAC filtering
        const response = await axios.get(url);

        // Assuming the API returns an array of objects like { id, firstName, lastName, ... }
        const employees = response.data;

        if (!Array.isArray(employees)) {
            console.error('API did not return an array for employees select:', employees);
            throw new Error('Invalid response format from employee API.');
        }

        // Map to the required format for the select dropdown
        const selectItems: EmployeeSelectItem[] = employees.map(emp => ({
            id: emp.id,
            name: `${emp.lastName}, ${emp.firstName}` // Format name
        }));

        // Sort alphabetically by name
        selectItems.sort((a, b) => a.name.localeCompare(b.name));

        return selectItems;

    } catch (error: any) {
        console.error('API Error fetching employees for select:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to fetch employees');
    }
};

// Add other employee-related API functions here if needed
// e.g., fetchEmployeeDetails, createEmployee, updateEmployee