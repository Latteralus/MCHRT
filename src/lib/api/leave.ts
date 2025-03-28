// src/lib/api/leave.ts
import axios from 'axios';

// Define the expected shape of the data for submitting a leave request
interface SubmitLeavePayload {
  employeeId: number;
  startDate: string;
  endDate: string;
  leaveType: string;
  reason?: string;
}

/**
 * Submits a new leave request via the API.
 * @param payload - The leave request data.
 * @returns The newly created leave request record.
 * @throws Error if the API call fails.
 */
export const submitLeaveRequest = async (payload: SubmitLeavePayload): Promise<any> => {
  try {
    const response = await axios.post('/api/leave', payload);
    return response.data;
  } catch (error: any) {
    console.error('API Error submitting leave request:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to submit leave request');
  }
};

/**
 * Fetches leave requests from the API, applying optional filters.
 * @param filters - Optional filters (employeeId, status, startDate, endDate, page, limit).
 * @returns An object containing requests, totalPages, and currentPage.
 * @throws Error if the API call fails.
 */
export const fetchLeaveRequests = async (filters: {
    employeeId?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
} = {}): Promise<{ requests: any[], totalPages: number, currentPage: number }> => {
  try {
    const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== undefined));
    const response = await axios.get('/api/leave', { params: cleanFilters });
    return response.data; // Assuming API returns { requests: [], totalPages: X, currentPage: Y }
  } catch (error: any) {
    console.error('API Error fetching leave requests:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch leave requests');
  }
};

/**
 * Approves a leave request via the API.
 * @param requestId - The ID of the leave request to approve.
 * @param comments - Optional comments from the approver.
 * @returns The updated leave request record.
 * @throws Error if the API call fails.
 */
export const approveLeaveRequest = async (requestId: number, comments?: string): Promise<any> => {
    try {
        const payload = comments ? { comments } : {};
        const response = await axios.post(`/api/leave/${requestId}/approve`, payload);
        return response.data;
    } catch (error: any) {
        console.error(`API Error approving leave request ${requestId}:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to approve leave request');
    }
};

/**
 * Rejects a leave request via the API.
 * @param requestId - The ID of the leave request to reject.
 * @param comments - Optional comments/reason for rejection.
 * @returns The updated leave request record.
 * @throws Error if the API call fails.
 */
export const rejectLeaveRequest = async (requestId: number, comments?: string): Promise<any> => {
    try {
        const payload = comments ? { comments } : {};
        const response = await axios.post(`/api/leave/${requestId}/reject`, payload);
        return response.data;
    } catch (error: any) {
        console.error(`API Error rejecting leave request ${requestId}:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to reject leave request');
    }
};

/**
 * Fetches all leave balances for a specific employee.
 * @param employeeId - The ID of the employee whose balances to fetch.
 * @returns An array of leave balance records.
 * @throws Error if the API call fails.
 */
export const fetchLeaveBalances = async (employeeId: number): Promise<any[]> => {
    try {
        const response = await axios.get(`/api/employees/${employeeId}/leave-balance`);
        return response.data; // Assuming API returns an array of LeaveBalance objects
    } catch (error: any) {
        console.error(`API Error fetching leave balances for employee ${employeeId}:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to fetch leave balances');
    }
};


// TODO: Add functions for fetching single request, updating, deleting if needed.