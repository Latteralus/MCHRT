import { AppDataSource } from "../../../utils/db";
import Attendance from "../../../entities/Attendance";
import Employee from "../../../entities/Employee";
import { apiHandler } from "../../../utils/apiHandler";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import leaveAttendanceService from "../../../utils/leaveAttendanceService";

export default apiHandler({
  GET: async (req, res) => {
    const { id } = req.query;
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const attendanceRepository = AppDataSource.getRepository(Attendance);
      
      const attendanceRecord = await attendanceRepository.findOne({
        where: { id },
        relations: ['employee', 'employee.department']
      });
      
      if (!attendanceRecord) {
        return res.status(404).json({ message: "Attendance record not found" });
      }
      
      // Apply role-based access control
      if (session.user.role !== 'admin' && session.user.role !== 'hr_manager') {
        // Department managers can only view attendance for their department
        if (session.user.role === 'department_manager') {
          if (attendanceRecord.employee?.department?.id !== session.user.departmentId) {
            return res.status(403).json({ message: "Access denied to this attendance record" });
          }
        } else {
          // Regular employees can only view their own attendance
          if (attendanceRecord.employee?.id !== session.user.employeeId) {
            return res.status(403).json({ message: "Access denied to this attendance record" });
          }
        }
      }
      
      return res.status(200).json(attendanceRecord);
    } catch (error) {
      console.error("Error fetching attendance record:", error);
      return res.status(500).json({ message: "Failed to fetch attendance record" });
    }
  },
  
  PUT: async (req, res) => {
    const { id } = req.query;
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const attendanceRepository = AppDataSource.getRepository(Attendance);
      
      const attendanceRecord = await attendanceRepository.findOne({
        where: { id },
        relations: ['employee', 'employee.department']
      });
      
      if (!attendanceRecord) {
        return res.status(404).json({ message: "Attendance record not found" });
      }
      
      // Apply role-based access control
      if (session.user.role !== 'admin' && session.user.role !== 'hr_manager') {
        // Department managers can only update attendance for their department
        if (session.user.role === 'department_manager') {
          if (attendanceRecord.employee?.department?.id !== session.user.departmentId) {
            return res.status(403).json({ message: "You can only update attendance for your department" });
          }
        } else {
          // Regular employees can only update their own attendance on the same day
          if (attendanceRecord.employee?.id !== session.user.employeeId) {
            return res.status(403).json({ message: "You can only update your own attendance" });
          }
          
          // Check if the record is for today
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const recordDate = new Date(attendanceRecord.date);
          recordDate.setHours(0, 0, 0, 0);
          
          if (recordDate.getTime() !== today.getTime()) {
            return res.status(403).json({ message: "You can only update attendance for the current day" });
          }
          
          // Employees can only update timeIn and timeOut
          const { timeIn, timeOut } = req.body;
          req.body = { timeIn, timeOut };
        }
      }
      
      // Check if this is a leave-generated attendance record
      const isLeaveRecord = attendanceRecord.notes && 
                           attendanceRecord.notes.includes('(Leave Request #');
      
      if (isLeaveRecord && session.user.role !== 'admin' && session.user.role !== 'hr_manager') {
        return res.status(403).json({ 
          message: "This attendance record was created from an approved leave request and cannot be modified" 
        });
      }
      
      // Update only provided fields
      const { timeIn, timeOut, status, notes } = req.body;
      
      const updateData = {};
      if (timeIn !== undefined) updateData.timeIn = timeIn;
      if (timeOut !== undefined) updateData.timeOut = timeOut;
      if (status !== undefined) updateData.status = status;
      if (notes !== undefined) updateData.notes = notes;
      
      // Update attendance record
      attendanceRepository.merge(attendanceRecord, updateData);
      const updatedRecord = await attendanceRepository.save(attendanceRecord);
      
      return res.status(200).json(updatedRecord);
    } catch (error) {
      console.error("Error updating attendance record:", error);
      return res.status(500).json({ message: "Failed to update attendance record" });
    }
  },
  
  DELETE: async (req, res) => {
    const { id } = req.query;
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Only admins and HR managers can delete attendance records
    if (session.user.role !== 'admin' && session.user.role !== 'hr_manager') {
      return res.status(403).json({ message: "Only administrators and HR personnel can delete attendance records" });
    }
    
    try {
      const attendanceRepository = AppDataSource.getRepository(Attendance);
      
      const attendanceRecord = await attendanceRepository.findOne({
        where: { id }
      });
      
      if (!attendanceRecord) {
        return res.status(404).json({ message: "Attendance record not found" });
      }
      
      // Check if this is a leave-generated attendance record and log it
      const isLeaveRecord = attendanceRecord.notes && 
                           attendanceRecord.notes.includes('(Leave Request #');
      
      if (isLeaveRecord) {
        console.log(`[WARNING] Deleting attendance record ${id} that was created from a leave request`);
      }
      
      // Create log of deletion for audit purposes
      const now = new Date();
      console.log(`[AUDIT] Attendance record ${id} deleted by ${session.user.name} (${session.user.id}) at ${now.toISOString()}`);
      
      await attendanceRepository.remove(attendanceRecord);
      
      return res.status(200).json({ message: "Attendance record deleted successfully" });
    } catch (error) {
      console.error("Error deleting attendance record:", error);
      return res.status(500).json({ message: "Failed to delete attendance record" });
    }
  }
});