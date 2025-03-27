// pages/api/leave/[id].js
import { AppDataSource } from "../../../utils/db";
import Leave from "../../../entities/Leave";
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
      const leaveRepository = AppDataSource.getRepository(Leave);
      
      const leaveRequest = await leaveRepository.findOne({
        where: { id },
        relations: ['employee', 'employee.department', 'approver'],
      });
      
      if (!leaveRequest) {
        return res.status(404).json({ message: "Leave request not found" });
      }
      
      // Check permission based on role
      if (
        session.user.role !== 'admin' && 
        session.user.role !== 'hr_manager' &&
        (session.user.role === 'department_manager' && 
         leaveRequest.employee?.department?.id !== session.user.departmentId) &&
        (session.user.role === 'employee' && 
         leaveRequest.employee?.id !== session.user.employeeId)
      ) {
        return res.status(403).json({ message: "Forbidden - Insufficient permissions" });
      }
      
      return res.status(200).json(leaveRequest);
    } catch (error) {
      console.error("Error fetching leave request:", error);
      return res.status(500).json({ message: "Failed to fetch leave request" });
    }
  },
  
  PUT: async (req, res) => {
    const { id } = req.query;
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const leaveRepository = AppDataSource.getRepository(Leave);
      const employeeRepository = AppDataSource.getRepository(Employee);
      
      const leaveRequest = await leaveRepository.findOne({
        where: { id },
        relations: ['employee', 'employee.department']
      });
      
      if (!leaveRequest) {
        return res.status(404).json({ message: "Leave request not found" });
      }
      
      // Check permissions based on role and action
      const isStatusChange = req.body.status && req.body.status !== leaveRequest.status;
      const isOwnRequest = leaveRequest.employee?.id === session.user.employeeId;
      const isDepartmentManager = session.user.role === 'department_manager' && 
                                 leaveRequest.employee?.department?.id === session.user.departmentId;
      const isAdminOrHR = session.user.role === 'admin' || session.user.role === 'hr_manager';
      
      // Regular employees can only update their own requests and cannot approve/reject
      if (session.user.role === 'employee') {
        if (!isOwnRequest) {
          return res.status(403).json({ message: "Forbidden - Cannot update other employees' leave requests" });
        }
        
        // Employees cannot change the status to approved/rejected
        if (isStatusChange && (req.body.status === 'approved' || req.body.status === 'rejected')) {
          return res.status(403).json({ message: "Forbidden - Cannot approve or reject your own leave request" });
        }
        
        // Employees cannot update approved/rejected requests
        if (leaveRequest.status === 'approved' || leaveRequest.status === 'rejected') {
          return res.status(403).json({ 
            message: "Forbidden - Cannot update leave request that has already been approved or rejected" 
          });
        }
      }
      
      // If updating status to approved/rejected, must be admin, HR, or department manager
      if (isStatusChange && (req.body.status === 'approved' || req.body.status === 'rejected')) {
        if (!isAdminOrHR && !isDepartmentManager) {
          return res.status(403).json({ message: "Forbidden - Insufficient permissions to approve/reject" });
        }
        
        // Add approver information
        req.body.approvalDate = new Date();
        req.body.approverId = session.user.id;
        req.body.approverName = session.user.name;
      }
      
      // Handle date changes - check for attendance conflicts
      if ((req.body.startDate && req.body.startDate !== leaveRequest.startDate) || 
          (req.body.endDate && req.body.endDate !== leaveRequest.endDate)) {
        
        const startDate = req.body.startDate || leaveRequest.startDate;
        const endDate = req.body.endDate || leaveRequest.endDate;
        
        // Check for conflicts with existing attendance records
        const { hasConflict, conflictingRecords } = await leaveAttendanceService.checkAttendanceConflicts(
          leaveRequest.employee.id,
          startDate,
          endDate
        );
        
        if (hasConflict) {
          return res.status(409).json({
            message: "Cannot update leave request - conflicts with existing attendance records",
            conflicts: conflictingRecords
          });
        }
      }
      
      // Update leave request
      leaveRepository.merge(leaveRequest, req.body);
      const updatedLeaveRequest = await leaveRepository.save(leaveRequest);
      
      // If leave request was approved, create attendance records
      if (isStatusChange && req.body.status === 'approved') {
        try {
          await leaveAttendanceService.syncAttendanceWithLeave(updatedLeaveRequest.id);
        } catch (syncError) {
          console.error("Error syncing attendance with leave:", syncError);
          // Continue with the response even if sync fails, but log the error
        }
      }
      
      // If leave request was changed from approved to rejected or canceled, remove attendance records
      if (isStatusChange && leaveRequest.status === 'approved' && 
         (req.body.status === 'rejected' || req.body.status === 'canceled')) {
        try {
          await leaveAttendanceService.removeAttendanceForLeave(
            updatedLeaveRequest.id,
            leaveRequest.employee.id,
            leaveRequest.startDate,
            leaveRequest.endDate
          );
        } catch (removeError) {
          console.error("Error removing attendance for rejected/canceled leave:", removeError);
          // Continue with the response even if removal fails, but log the error
        }
      }
      
      return res.status(200).json(updatedLeaveRequest);
    } catch (error) {
      console.error("Error updating leave request:", error);
      return res.status(500).json({ message: "Failed to update leave request" });
    }
  },
  
  DELETE: async (req, res) => {
    const { id } = req.query;
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const leaveRepository = AppDataSource.getRepository(Leave);
      
      const leaveRequest = await leaveRepository.findOne({
        where: { id },
        relations: ['employee', 'employee.department']
      });
      
      if (!leaveRequest) {
        return res.status(404).json({ message: "Leave request not found" });
      }
      
      // Check permissions
      const isOwnRequest = leaveRequest.employee?.id === session.user.employeeId;
      const isDepartmentManager = session.user.role === 'department_manager' && 
                                 leaveRequest.employee?.department?.id === session.user.departmentId;
      const isAdminOrHR = session.user.role === 'admin' || session.user.role === 'hr_manager';
      
      // Regular employees can only delete their own pending requests
      if (session.user.role === 'employee') {
        if (!isOwnRequest) {
          return res.status(403).json({ message: "Forbidden - Cannot delete other employees' leave requests" });
        }
        
        // Employees cannot delete approved/rejected requests
        if (leaveRequest.status !== 'pending') {
          return res.status(403).json({ 
            message: "Forbidden - Cannot delete leave request that has already been processed" 
          });
        }
      } else if (!isAdminOrHR && !isDepartmentManager) {
        return res.status(403).json({ message: "Forbidden - Insufficient permissions to delete this leave request" });
      }
      
      // If the leave request was approved, remove associated attendance records
      if (leaveRequest.status === 'approved') {
        try {
          await leaveAttendanceService.removeAttendanceForLeave(
            leaveRequest.id,
            leaveRequest.employee.id,
            leaveRequest.startDate,
            leaveRequest.endDate
          );
        } catch (removeError) {
          console.error("Error removing attendance for deleted leave:", removeError);
          // Continue with the deletion even if removal fails, but log the error
        }
      }
      
      // Create log of deletion for audit purposes
      const now = new Date();
      console.log(`[AUDIT] Leave request ${id} deleted by ${session.user.name} (${session.user.id}) at ${now.toISOString()}`);
      
      await leaveRepository.remove(leaveRequest);
      
      return res.status(200).json({ message: "Leave request deleted successfully" });
    } catch (error) {
      console.error("Error deleting leave request:", error);
      return res.status(500).json({ message: "Failed to delete leave request" });
    }
  }
});