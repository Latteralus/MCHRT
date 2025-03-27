// Corrected import paths and authOptions import
// Removed direct AppDataSource and entity imports if dbService handles everything
// import { AppDataSource } from "@/utils/db";
// import Attendance from "@/entities/Attendance";
// import Employee from "@/entities/Employee";
import { dbService } from '@/utils/dbService'; // Import the fixed dbService
import { apiHandler } from "@/utils/apiHandler";
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/pages/api/auth/[...nextauth]'; // Corrected import
// leaveAttendanceService might still be needed if dbService doesn't handle that logic
import leaveAttendanceService from "@/utils/leaveAttendanceService";

export default apiHandler({
  GET: async (req, res) => {
    const { id } = req.query;
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      // Use dbService to get the record
      const attendanceRecord = await dbService.getAttendanceById(id); // Assuming relations are included

      if (!attendanceRecord) {
        return res.status(404).json({ message: "Attendance record not found" });
      }

      // Apply role-based access control (assuming relations like employee.department are fetched by dbService)
      if (session.user.role !== 'admin' && session.user.role !== 'hr_manager' /* Correct role? */ ) {
        if (session.user.role === 'department_manager') {
          // Ensure employee and department data is present from dbService call
          if (!attendanceRecord.employee || attendanceRecord.employee.department?.id !== session.user.departmentId) {
             return res.status(403).json({ message: "Access denied (Dept Manager)" });
          }
        } else { // Regular employee
          if (!attendanceRecord.employee || attendanceRecord.employee.id !== session.user.employeeId) {
            return res.status(403).json({ message: "Access denied (Employee)" });
          }
        }
      }

      return res.status(200).json(attendanceRecord);
    } catch (error) {
      console.error("API Error fetching attendance record:", error);
      return res.status(500).json({ message: "Failed to fetch attendance record" });
    }
  },

  PUT: async (req, res) => {
    const { id } = req.query;
    const session = await getServerSession(req, res, authOptions);

    if (!session) { return res.status(401).json({ message: "Unauthorized" }); }

    try {
      // Get record first to check permissions and if it's a leave record
      const attendanceRecord = await dbService.getAttendanceById(id);

      if (!attendanceRecord) {
        return res.status(404).json({ message: "Attendance record not found" });
      }

      // Apply role-based access control (permissions check)
       let canUpdate = false;
       let allowedUpdates = req.body; // Assume all fields initially

       if (session.user.role === 'admin' || session.user.role === 'hr_manager' /* Correct role? */) {
           canUpdate = true;
       } else if (session.user.role === 'department_manager') {
           if (attendanceRecord.employee?.department?.id === session.user.departmentId) {
               canUpdate = true;
           }
       } else { // Regular employee
            if (attendanceRecord.employee?.id === session.user.employeeId) {
               // Can only update own record, potentially limited fields/timeframe
               const today = new Date(); today.setHours(0, 0, 0, 0);
               const recordDate = new Date(attendanceRecord.date); recordDate.setHours(0, 0, 0, 0);
               if (recordDate.getTime() === today.getTime()) {
                   canUpdate = true;
                   // Restrict updates for employees
                   const { timeIn, timeOut } = req.body;
                   allowedUpdates = { timeIn, timeOut };
               } else {
                  return res.status(403).json({ message: "You can only update attendance for the current day" });
               }
           }
       }

       if (!canUpdate) {
           return res.status(403).json({ message: "Insufficient permissions to update this record" });
       }

      // Check if this is a leave-generated attendance record
      const isLeaveRecord = attendanceRecord.notes && attendanceRecord.notes.includes('(Leave Request #');
      if (isLeaveRecord && session.user.role !== 'admin' && session.user.role !== 'hr_manager') {
        return res.status(403).json({
          message: "This attendance record was created from an approved leave request and cannot be modified"
        });
      }

      // Update using dbService with potentially restricted fields
      const updatedRecord = await dbService.updateAttendance(id, allowedUpdates);

       if (!updatedRecord) {
           // This might happen if update failed or record disappeared
           return res.status(404).json({ message: "Update failed or record not found after update attempt." });
       }

      return res.status(200).json(updatedRecord);
    } catch (error) {
      console.error("API Error updating attendance record:", error);
      return res.status(500).json({ message: "Failed to update attendance record" });
    }
  },

  DELETE: async (req, res) => {
    const { id } = req.query;
    const session = await getServerSession(req, res, authOptions);

    if (!session) { return res.status(401).json({ message: "Unauthorized" }); }

    // Permission check
    if (session.user.role !== 'admin' && session.user.role !== 'hr_manager' /* Correct role? */) {
      return res.status(403).json({ message: "Insufficient permissions to delete attendance records" });
    }

    try {
      // Optional: Get record first if you need to log details before deletion
      const recordToDelete = await dbService.getAttendanceById(id);
      if (!recordToDelete) {
          return res.status(404).json({ message: "Attendance record not found" });
      }
      // Log details if needed...
      console.log(`[AUDIT] Attempting delete attendance ${id} by ${session.user.email}`);


      const deleteResult = await dbService.deleteAttendance(id);

      if (!deleteResult.success) {
        // This shouldn't happen if findOneById worked, but good practice
        return res.status(404).json({ message: "Deletion failed, record might already be gone." });
      }

      return res.status(200).json({ message: "Attendance record deleted successfully" });
    } catch (error) {
      console.error("API Error deleting attendance record:", error);
      return res.status(500).json({ message: "Failed to delete attendance record" });
    }
  }
});