// utils/leaveAttendanceService.js
// Refactored to use dbService
import { dbService } from '@/utils/dbService'; // Use path alias

/**
 * Service to handle integration between leave requests and attendance records
 */
const leaveAttendanceService = {
  /**
   * Sync attendance records based on approved leave requests
   * @param {string} leaveId - ID of the leave request that was updated
   * @returns {Promise<Array>} - Array of created or updated attendance records
   */
  async syncAttendanceWithLeave(leaveId) {
    try {
      // Get the leave request using dbService
      const leaveRequest = await dbService.getLeaveById(leaveId); // Assumes getLeaveById fetches relations needed or we fetch employee separately

      if (!leaveRequest) {
        throw new Error(`Leave request with ID ${leaveId} not found`);
      }

      // Fetch employee details if not included in getLeaveById response (adjust based on dbService implementation)
      // If dbService.getLeaveById doesn't include employee, uncomment below
      // const employee = await dbService.getEmployeeById(leaveRequest.employeeId);
      // if (!employee) throw new Error(`Employee not found for leave request ${leaveId}`);
      // const employeeId = employee.id;
      // Assuming leaveRequest includes employee object with id:
      const employeeId = leaveRequest.employee?.id;
      if (!employeeId) throw new Error(`Employee ID missing from leave request ${leaveId}`);


      // Only process approved leave requests
      if (leaveRequest.status !== 'approved') {
        console.log(`Leave request ${leaveId} is not approved. Skipping attendance sync.`);
        return [];
      }

      // Generate dates between start and end date (inclusive)
      const dates = this.generateDateRange(
        new Date(leaveRequest.startDate),
        new Date(leaveRequest.endDate)
      );

      // Create or update attendance records for each date
      const attendanceRecords = [];

      for (const date of dates) {
        // Skip weekends if needed (uncomment if your business logic requires it)
        // const dayOfWeek = date.getDay();
        // if (dayOfWeek === 0 || dayOfWeek === 6) continue; // 0 = Sunday, 6 = Saturday

        // Check if an attendance record already exists for this date using dbService
        const existingRecords = await dbService.getAttendanceRecords({
          employeeId: employeeId,
          date: date, // dbService needs to handle date matching appropriately
        });
        const existingRecord = existingRecords && existingRecords.length > 0 ? existingRecords[0] : null;

        const attendanceStatus = this.mapLeaveTypeToAttendanceStatus(leaveRequest.leaveType);
        const attendanceNotes = `${leaveRequest.leaveType} (Leave Request #${leaveRequest.id})`;

        if (existingRecord) {
          // Update existing record using dbService
          const updatedRecord = await dbService.updateAttendance(existingRecord.id, {
            status: attendanceStatus,
            notes: attendanceNotes,
            timeIn: null, // Ensure times are nulled out for leave
            timeOut: null,
          });
          attendanceRecords.push(updatedRecord);
        } else {
          // Create new attendance record using dbService
          const newAttendanceData = {
            employeeId: employeeId, // Pass ID directly
            date: date,
            timeIn: null, // No clock in/out for leave days
            timeOut: null,
            status: attendanceStatus,
            notes: attendanceNotes
          };

          const savedRecord = await dbService.createAttendance(newAttendanceData);
          attendanceRecords.push(savedRecord);
        }
      }
      console.log(`Synced ${attendanceRecords.length} attendance records for leave request ${leaveId}.`);
      return attendanceRecords;
    } catch (error) {
      console.error('Error syncing attendance with leave:', error);
      throw error; // Re-throw error for calling function to handle
    }
  },

  /**
   * Map leave type to appropriate attendance status
   * @param {string} leaveType - Type of leave (e.g., 'Sick Leave', 'Vacation')
   * @returns {string} - Corresponding attendance status
   */
  mapLeaveTypeToAttendanceStatus(leaveType) {
    const mapping = {
      'Sick Leave': 'sick',
      'Vacation': 'vacation',
      'Personal': 'personal',
      'Bereavement': 'excused',
      'Maternity/Paternity': 'maternity',
      'Family Medical Leave': 'fmla',
      'Unpaid Leave': 'unpaid'
      // Add other leave types as needed
    };

    // Default status if type not found in mapping
    return mapping[leaveType] || 'leave';
  },

  /**
   * Generate an array of dates between start and end date (inclusive)
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Array<Date>} - Array of dates
   */
  generateDateRange(startDate, endDate) {
    const dates = [];
    const currentDate = new Date(startDate);

    // Reset time component for consistent date comparison
    currentDate.setUTCHours(0, 0, 0, 0); // Use UTC to avoid timezone issues

    const normalizedEndDate = new Date(endDate);
    normalizedEndDate.setUTCHours(0, 0, 0, 0); // Use UTC

    while (currentDate <= normalizedEndDate) {
      dates.push(new Date(currentDate)); // Create a new Date object for the array
      currentDate.setUTCDate(currentDate.getUTCDate() + 1); // Increment day in UTC
    }

    return dates;
  },

  /**
   * Check for conflicts between leave request and existing attendance records
   * @param {string} employeeId - Employee ID
   * @param {Date} startDate - Leave start date
   * @param {Date} endDate - Leave end date
   * @returns {Promise<Object>} - Object with hasConflict and conflictingRecords
   */
  async checkAttendanceConflicts(employeeId, startDate, endDate) {
    try {
      // Get date range for the leave request
      const dates = this.generateDateRange(new Date(startDate), new Date(endDate));

      // Get existing attendance records for the employee during this period using dbService
      const existingRecords = await dbService.getAttendanceRecords({
          employeeId: employeeId,
          startDate: dates[0], // Assuming dbService can handle date range
          endDate: dates[dates.length - 1], // Assuming dbService can handle date range
      });


      // Filter for conflicting records (those with actual attendance logged)
      const conflictingRecords = existingRecords.filter(record => {
          // Check if the record date falls within the leave range
          const recordDate = new Date(record.date);
          recordDate.setUTCHours(0,0,0,0);
          const isInRange = dates.some(d => d.getTime() === recordDate.getTime());

          // Conflict exists if record is in range and indicates presence
          return isInRange && (
              record.timeIn !== null || record.timeOut !== null ||
              (record.status !== 'absent' && !this.isLeaveStatus(record.status)) // Check against known leave statuses
          );
      });

      return {
        hasConflict: conflictingRecords.length > 0,
        conflictingRecords
      };
    } catch (error) {
      console.error('Error checking attendance conflicts:', error);
      throw error;
    }
  },

  /**
   * Check for conflicts between attendance record and existing leave requests
   * @param {string} employeeId - Employee ID
   * @param {Date} date - Attendance date
   * @returns {Promise<Object>} - Object with hasConflict and conflictingLeave
   */
  async checkLeaveConflicts(employeeId, date) {
    try {
      // Normalize the date for comparison
      const normalizedDate = new Date(date);
      normalizedDate.setUTCHours(0, 0, 0, 0);

      // Find approved leave requests that include this date using dbService
      // We need a way to query leave requests by date range containing a specific date.
      // dbService.getLeaveRequests might need enhancement or we query broadly and filter.
      const potentialConflicts = await dbService.getLeaveRequests({
          employeeId: employeeId,
          status: 'approved',
          // Add date filtering if dbService supports it, e.g.:
          // dateWithinRange: normalizedDate
      });

      // Filter results manually if dbService doesn't support precise range check
      const conflictingLeave = potentialConflicts.find(leave => {
          const startDate = new Date(leave.startDate);
          startDate.setUTCHours(0,0,0,0);
          const endDate = new Date(leave.endDate);
          endDate.setUTCHours(0,0,0,0);
          return normalizedDate >= startDate && normalizedDate <= endDate;
      });

      return {
        hasConflict: !!conflictingLeave,
        conflictingLeave // Returns the first conflicting leave found
      };
    } catch (error) {
      console.error('Error checking leave conflicts:', error);
      throw error;
    }
  },

  /**
   * Remove attendance records associated with a leave request when it's denied or deleted
   * @param {string} leaveId - ID of the leave request
   * @param {string} employeeId - Employee ID
   * @param {Date} startDate - Leave start date
   * @param {Date} endDate - Leave end date
   * @returns {Promise<number>} - Number of attendance records removed
   */
  async removeAttendanceForLeave(leaveId, employeeId, startDate, endDate) {
    try {
      // Get date range
      const dates = this.generateDateRange(new Date(startDate), new Date(endDate));

      // Find attendance records that were created from this leave request using dbService
      const records = await dbService.getAttendanceRecords({
          employeeId: employeeId,
          startDate: dates[0],
          endDate: dates[dates.length - 1],
          // We need to filter by notes manually after fetching, as dbService might not support LIKE on notes
      });

      const recordsToDelete = records.filter(record =>
          record.notes && record.notes.includes(`(Leave Request #${leaveId})`)
      );

      let deletedCount = 0;
      // Delete these records one by one using dbService
      if (recordsToDelete.length > 0) {
          for (const record of recordsToDelete) {
              await dbService.deleteAttendance(record.id);
              deletedCount++;
          }
          console.log(`Removed ${deletedCount} attendance records associated with leave request ${leaveId}.`);
      }

      return deletedCount;
    } catch (error) {
      console.error('Error removing attendance for leave:', error);
      throw error;
    }
  },

  /**
   * Helper function to check if an attendance status represents leave
   * @param {string} status - Attendance status
   * @returns {boolean} - True if the status is a leave status
   */
   isLeaveStatus(status) {
    const leaveStatuses = ['leave', 'sick', 'vacation', 'personal', 'excused', 'maternity', 'fmla', 'unpaid'];
    return leaveStatuses.includes(status?.toLowerCase());
  }

};

export default leaveAttendanceService;