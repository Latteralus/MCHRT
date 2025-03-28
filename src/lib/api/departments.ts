import axios from 'axios';

// Interface for the data needed for a select dropdown
interface DepartmentSelectItem {
    id: number;
    name: string;
}

/**
 * Fetches a list of departments formatted for a select dropdown.
 * Assumes an API endpoint '/api/departments' exists and returns a list
 * of departments with at least 'id' and 'name'.
 */
export const fetchDepartmentsForSelect = async (): Promise<DepartmentSelectItem[]> => {
    try {
        // TODO: Create the /api/departments endpoint if it doesn't exist
        const response = await axios.get('/api/departments');

        const departments = response.data;

        if (!Array.isArray(departments)) {
            console.error('API did not return an array for departments select:', departments);
            throw new Error('Invalid response format from departments API.');
        }

        // Map to the required format
        const selectItems: DepartmentSelectItem[] = departments.map(dept => ({
            id: dept.id,
            name: dept.name
        }));

        // Sort alphabetically by name
        selectItems.sort((a, b) => a.name.localeCompare(b.name));

        return selectItems;

    } catch (error: any) {
        console.error('API Error fetching departments for select:', error.response?.data || error.message);
        // Return empty array on error to avoid breaking the form, or re-throw
        // throw new Error(error.response?.data?.message || 'Failed to fetch departments');
        return []; // Return empty on error for now
    }
};