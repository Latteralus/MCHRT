import axios from 'axios';

// Define the structure of the API response for listing items
// Match this with the actual API response structure
interface ComplianceItemApiResponse {
    id: number;
    employeeId: number;
    itemType: string;
    itemName: string;
    authority?: string | null; // Allow null from API
    licenseNumber?: string | null; // Allow null from API
    issueDate?: string | null; // Allow null from API
    expirationDate?: string | null; // Allow null from API
    status: string;
    employee?: { // Assuming employee details are included
        id: number;
        firstName: string;
        lastName: string;
    };
    // Add other fields returned by the API if necessary
}

interface FetchComplianceItemsParams {
    employeeId?: number;
    status?: string;
    itemType?: string;
    page?: number;
    limit?: number;
}

interface FetchComplianceItemsResponse {
    items: ComplianceItemApiResponse[];
    totalPages: number;
    currentPage: number;
}

/**
 * Fetches compliance items from the API.
 */
export const fetchComplianceItems = async (
    params: FetchComplianceItemsParams
): Promise<FetchComplianceItemsResponse> => {
    try {
        const response = await axios.get<FetchComplianceItemsResponse>('/api/compliance', { params });
        return response.data;
    } catch (error: any) {
        console.error('API Error fetching compliance items:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to fetch compliance items');
    }
};

/**
 * Deletes a compliance item via the API.
 */
export const deleteComplianceItem = async (itemId: number): Promise<void> => {
    try {
        await axios.delete(`/api/compliance/${itemId}`);
    } catch (error: any) {
        console.error(`API Error deleting compliance item ${itemId}:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to delete compliance item');
    }
};

// Define the structure for creating/updating compliance items
// Adjust based on the actual data expected by the API
interface ComplianceItemData {
    employeeId: number;
    itemType: string;
    itemName: string;
    authority?: string | null;
    licenseNumber?: string | null;
    issueDate?: string | null; // Expecting YYYY-MM-DD format or null
    expirationDate?: string | null; // Expecting YYYY-MM-DD format or null
    status?: string;
}

/**
 * Fetches a single compliance item by ID.
 */
export const fetchComplianceItem = async (itemId: number): Promise<ComplianceItemApiResponse> => {
     try {
        const response = await axios.get<ComplianceItemApiResponse>(`/api/compliance/${itemId}`);
        return response.data;
    } catch (error: any) {
        console.error(`API Error fetching compliance item ${itemId}:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to fetch compliance item');
    }
};


/**
 * Creates a new compliance item via the API.
 */
export const createComplianceItem = async (data: ComplianceItemData): Promise<ComplianceItemApiResponse> => {
    try {
        // Ensure empty strings for optional fields become null for the API
        const payload = {
            ...data,
            authority: data.authority || null,
            licenseNumber: data.licenseNumber || null,
            issueDate: data.issueDate || null,
            expirationDate: data.expirationDate || null,
        };
        const response = await axios.post<ComplianceItemApiResponse>('/api/compliance', payload);
        return response.data;
    } catch (error: any) {
        console.error('API Error creating compliance item:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to create compliance item');
    }
};

/**
 * Updates an existing compliance item via the API.
 */
export const updateComplianceItem = async (itemId: number, data: Partial<ComplianceItemData>): Promise<ComplianceItemApiResponse> => {
    try {
        // Build the payload carefully to match Partial<ComplianceItemData>
        const payload: Partial<ComplianceItemData> = {};

        // Handle required fields if present in data
        if (data.employeeId !== undefined) payload.employeeId = data.employeeId;
        if (data.itemType !== undefined) payload.itemType = data.itemType;
        if (data.itemName !== undefined) payload.itemName = data.itemName;
        if (data.status !== undefined) payload.status = data.status;

        // Handle optional fields, converting empty strings/null to null for the API
        if (data.authority !== undefined) payload.authority = data.authority || null;
        if (data.licenseNumber !== undefined) payload.licenseNumber = data.licenseNumber || null;
        if (data.issueDate !== undefined) payload.issueDate = data.issueDate || null;
        if (data.expirationDate !== undefined) payload.expirationDate = data.expirationDate || null;

        // Ensure employeeId is a number if present
        if (payload.employeeId !== undefined && typeof payload.employeeId !== 'number') {
             payload.employeeId = parseInt(String(payload.employeeId), 10);
             if (isNaN(payload.employeeId)) {
                  delete payload.employeeId; // Remove if parsing failed
             }
        }


       const response = await axios.put<ComplianceItemApiResponse>(`/api/compliance/${itemId}`, payload);
        return response.data;
    } catch (error: any) {
        console.error(`API Error updating compliance item ${itemId}:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to update compliance item');
    }
};