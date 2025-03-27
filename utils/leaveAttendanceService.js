// utils/leaveAttendanceService.js
import { AppDataSource } from "../utils/db";
import Attendance from "../entities/Attendance";
import Leave from "../entities/Leave";

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
      const leaveRepository = AppDataSource.getRepository(Leave);
      const attendanceRepository = AppDataSource.getRepository(Attendance);
      
      // Get the leave request with employee information
      const leaveRequest = await leaveRepository.findOne({
        where: { id: leaveId },
        relations: ['employee']
      });
      
      if (!leaveRequest) {
        throw new Error(`Leave request with ID ${leaveId} not found`);
      }
      
      // Only process approved leave requests
      if (leaveRequest.status !== 'approved') {
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
        
        // Check if an attendance record already exists for this date
        const existingRecord = await attendanceRepository.findOne({
          where: {
            employee: { id: leaveRequest.employee.id },
            date: date
          }
        });
        
        if (existingRecord) {
          // Update existing record
          existingRecord.status = this.mapLeaveTypeToAttendanceStatus(leaveRequest.leaveType);
          existingRecord.notes = `${leaveRequest.leaveType} (Leave Request #${leaveRequest.id})`;
          
          await attendanceRepository.save(existingRecord);
          attendanceRecords.push(existingRecord);
        } else {
          // Create new attendance record
          const newAttendance = attendanceRepository.create({
            employee: { id: leaveRequest.employee.id },
            date: date,
            timeIn: null, // No clock in/out for leave days
            timeOut: null,
            status: this.mapLeaveTypeToAttendanceStatus(leaveRequest.leaveType),
            notes: `${leaveRequest.leaveType} (Leave Request #${leaveRequest.id})`
          });
          
          const savedRecord = await attendanceRepository.save(newAttendance);
          attendanceRecords.push(savedRecord);
        }
      }
      
      return attendanceRecords;
    } catch (error) {
      console.error('Error syncing attendance with leave:', error);
      throw error;
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
    };
    
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
    currentDate.setHours(0, 0, 0, 0);
    
    const normalizedEndDate = new Date(endDate);
    normalizedEndDate.setHours(0, 0, 0, 0);
    
    while (currentDate <= normalizedEndDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
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
      const attendanceRepository = AppDataSource.getRepository(Attendance);
      
      // Get date range for the leave request
      const dates = this.generateDateRange(new Date(startDate), new Date(endDate));
      
      // Get existing attendance records for the employee during this period
      const existingRecords = await attendanceRepository.find({
        where: {
          employee: { id: employeeId },
          date: dates // TypeORM will handle the In operator for dates
        }
      });
      
      // Filter for conflicting records (those with actual attendance logged)
      const conflictingRecords = existingRecords.filter(record => 
        record.timeIn !== null || record.timeOut !== null ||
        (record.status !== 'absent' && record.status !== 'leave' && 
         record.status !== 'sick' && record.status !== 'vacation')
      );
      
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
      const leaveRepository = AppDataSource.getRepository(Leave);
      
      // Normalize the date for comparison
      const normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0);
      
      // Find approved leave requests that include this date
      const conflictingLeave = await leaveRepository
        .createQueryBuilder('leave')
        .where('leave.employee.id = :employeeId', { employeeId })
        .andWhere('leave.status = :status', { status: 'approved' })
        .andWhere('leave.startDate <= :date AND leave.endDate >= :date', { 
          date: normalizedDate 
        })
        .getOne();
      
      return {
        hasConflict: !!conflictingLeave,
        conflictingLeave
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
      const attendanceRepository = AppDataSource.getRepository(Attendance);
      
      // Get date range
      const dates = this.generateDateRange(new Date(startDate), new Date(endDate));
      
      // Find attendance records that were created from this leave request
      const records = await attendanceRepository.find({
        where: {
          employee: { id: employeeId },
          date: dates,
          notes: records => records.like(`%(Leave Request #${leaveId})%`)
        }
      });
      
      // Delete these records
      if (records.length > 0) {
        await attendanceRepository.remove(records);
      }
      
      return records.length;
    } catch (error) {
      console.error('Error removing attendance for leave:', error);
      throw error;
    }
  }
};

export default leaveAttendanceService;