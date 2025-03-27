// pages/api/leave/index.js
import { AppDataSource } from "../../../utils/db";
import Leave from "../../../entities/Leave";
import Employee from "../../../entities/Employee";
import { apiHandler } from "../../../utils/apiHandler";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import leaveAttendanceService from "../../../utils/leaveAttendanceService";

export default apiHandler({
  GET: async (req, res) => {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const leaveRepository = AppDataSource.getRepository(Leave);
      
      // Process query parameters
      const { 
        status, 
        startDate, 
        endDate, 
        leaveType, 
        employeeId, 
        departmentId,
        limit,
        offset
      } = req.query;
      
      // Build query based on permissions and filters
      let queryBuilder = leaveRepository.createQueryBuilder("leave")
        .leftJoinAndSelect("leave.employee", "employee")
        .leftJoinAndSelect("employee.department", "department")
        .leftJoinAndSelect("leave.approver", "approver");
      
      // Apply role-based restrictions
      if (session.user.role !== 'admin' && session.user.role !== 'hr_manager') {
        if (session.user.role === 'department_manager') {
          queryBuilder.where("department.id = :departmentId", { 
            departmentId: session.user.departmentId 
          });
        } else {
          // Regular employees can only see their own leave requests
          queryBuilder.where("employee.id = :employeeId", { 
            employeeId: session.user.employeeId 
          });
        }
      }
      
      // Apply filters
      if (status) {
        queryBuilder.andWhere("leave.status = :status", { status });
      }
      
      if (startDate) {
        const parsedStartDate = new Date(startDate);
        queryBuilder.andWhere("leave.startDate >= :startDate", { startDate: parsedStartDate });
      }
      
      if (endDate) {
        const parsedEndDate = new Date(endDate);
        queryBuilder.andWhere("leave.endDate <= :endDate", { endDate: parsedEndDate });
      }
      
      if (leaveType) {
        queryBuilder.andWhere("leave.leaveType = :leaveType", { leaveType });
      }
      
      if (employeeId && (session.user.role === 'admin' || session.user.role === 'hr_manager' || 
          (session.user.role === 'department_manager' && session.user.departmentId))) {
        queryBuilder.andWhere("employee.id = :employeeId", { employeeId });
      }
      
      if (departmentId && (session.user.role === 'admin' || session.user.role === 'hr_manager')) {
        queryBuilder.andWhere("department.id = :departmentId", { departmentId });
      }
      
      // Add pagination if specified
      if (limit) {
        queryBuilder.take(parseInt(limit));
      }
      
      if (offset) {
        queryBuilder.skip(parseInt(offset));
      }
      
      // Order by start date (most recent first)
      queryBuilder.orderBy("leave.startDate", "DESC");
      
      // Execute query
      const leaveRequests = await queryBuilder.getMany();
      
      return res.status(200).json(leaveRequests);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      return res.status(500).json({ message: "Failed to fetch leave requests" });
    }
  },
  
  POST: async (req, res) => {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const leaveRepository = AppDataSource.getRepository(Leave);
      const employeeRepository = AppDataSource.getRepository(Employee);
      
      const leaveData = req.body;
      
      // Check if the requesting user has permission to create a leave request for the specified employee
      let targetEmployeeId = leaveData.employeeId;
      
      // If no employeeId provided and user is an employee, use their own ID
      if (!targetEmployeeId && session.user.employeeId) {
        targetEmployeeId = session.user.employeeId;
        leaveData.employeeId = targetEmployeeId;
      }
      
      // Verify permission to create leave request for this employee
      if (session.user.role !== 'admin' && session.user.role !== 'hr_manager') {
        if (session.user.role === 'department_manager') {
          // Department managers can create leave for employees in their department
          const employee = await employeeRepository.findOne({
            where: { id: targetEmployeeId },
            relations: ['department']
          });
          
          if (!employee || employee.department.id !== session.user.departmentId) {
            return res.status(403).json({ 
              message: "Forbidden - Cannot create leave requests for employees outside your department" 
            });
          }
        } else if (targetEmployeeId !== session.user.employeeId) {
          // Regular employees can only create leave for themselves
          return res.status(403).json({ 
            message: "Forbidden - Cannot create leave requests for other employees" 
          });
        }
      }
      
      // Check for required fields
      if (!leaveData.startDate || !leaveData.endDate || !leaveData.leaveType) {
        return res.status(400).json({ message: "Start date, end date, and leave type are required" });
      }
      
      // Validate date range
      const startDate = new Date(leaveData.startDate);
      const endDate = new Date(leaveData.endDate);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      
      if (startDate > endDate) {
        return res.status(400).json({ message: "End date cannot be before start date" });
      }
      
      // Check for attendance conflicts
      const { hasConflict, conflictingRecords } = await leaveAttendanceService.checkAttendanceConflicts(
        targetEmployeeId,
        startDate,
        endDate
      );
      
      if (hasConflict) {
        return res.status(409).json({
          message: "Cannot create leave request - conflicts with existing attendance records",
          conflicts: conflictingRecords
        });
      }
      
      // Check for overlapping leave requests
      const overlappingLeave = await leaveRepository
        .createQueryBuilder('leave')
        .where('leave.employee.id = :employeeId', { employeeId: targetEmployeeId })
        .andWhere('leave.status IN (:...statuses)', { statuses: ['pending', 'approved'] })
        .andWhere(
          '(leave.startDate <= :endDate AND leave.endDate >= :startDate)',
          { startDate, endDate }
        )
        .getOne();
      
      if (overlappingLeave) {
        return res.status(409).json({
          message: "Cannot create leave request - overlaps with existing leave request",
          conflict: overlappingLeave
        });
      }
      
      // Set initial status to 'pending' if not provided
      if (!leaveData.status) {
        leaveData.status = 'pending';
      }
      
      // Set request date to now
      leaveData.requestDate = new Date();
      
      // Create new leave request
      const newLeaveRequest = leaveRepository.create({
        employee: { id: targetEmployeeId },
        leaveType: leaveData.leaveType,
        startDate: startDate,
        endDate: endDate,
        status: leaveData.status,
        reason: leaveData.reason || '',
        requestDate: leaveData.requestDate,
        approver: leaveData.approverId ? { id: leaveData.approverId } : null,
        approvalDate: leaveData.approvalDate || null,
        notes: leaveData.notes || ''
      });
      
      const savedLeaveRequest = await leaveRepository.save(newLeaveRequest);
      
      // If the leave request is created as approved, create attendance records
      if (savedLeaveRequest.status === 'approved') {
        try {
          await leaveAttendanceService.syncAttendanceWithLeave(savedLeaveRequest.id);
        } catch (syncError) {
          console.error("Error syncing attendance with leave:", syncError);
          // Continue with the response even if sync fails, but log the error
        }
      }
      
      return res.status(201).json(savedLeaveRequest);
    } catch (error) {
      console.error("Error creating leave request:", error);
      return res.status(500).json({ message: "Failed to create leave request", error: error.message });
    }
  }
});