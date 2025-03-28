// src/lib/api/attendance.ts
import axios from 'axios';

// Define the expected shape of the data for recording attendance
interface RecordAttendancePayload {
  employeeId: number;
  date: string;
  timeIn: string;
  timeOut?: string; // Optional
}

/**
 * Records a new attendance entry via the API.
 * @param payload - The attendance data to record.
 * @returns The newly created attendance record.
 * @throws Error if the API call fails.
 */
export const recordAttendance = async (payload: RecordAttendancePayload): Promise<any> => {
  try {
    const response = await axios.post('/api/attendance', payload);
    return response.data;
  } catch (error: any) {
    console.error('API Error recording attendance:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to record attendance');
  }
};

/**
 * Fetches attendance records from the API, applying optional filters.
 * @param filters - Optional filters (employeeId, startDate, endDate, page, limit).
 * @returns An object containing records, totalPages, and currentPage.
 * @throws Error if the API call fails.
 */
export const fetchAttendanceRecords = async (filters: {
    employeeId?: number;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
} = {}): Promise<{ records: any[], totalPages: number, currentPage: number }> => {
  try {
    // Remove undefined filters before sending
    const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== undefined));
    const response = await axios.get('/api/attendance', { params: cleanFilters });
    return response.data; // Assuming API returns { records: [], totalPages: X, currentPage: Y }
  } catch (error: any) {
    console.error('API Error fetching attendance records:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch attendance records');
  }
};

// TODO: Add function for fetching a single attendance record by ID
// TODO: Add functions for updating/deleting attendance records