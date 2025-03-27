// pages/api/leave/index.js // File path comment seems incorrect, actual path is pages/leave.js
// Corrected import paths and authOptions import
import { AppDataSource } from "@/utils/db";
import Leave from "@/entities/Leave";
import Employee from "@/entities/Employee";
import { apiHandler } from "@/utils/apiHandler";
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/pages/api/auth/[...nextauth]'; // Corrected import
import leaveAttendanceService from "@/utils/leaveAttendanceService";

export default apiHandler({
  GET: async (req, res) => {
    const session = await getServerSession(req, res, authOptions); // Use imported authOptions
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      // NOTE: Using AppDataSource directly might be inconsistent with dbService refactoring.
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
        offset // Assuming offset might be used instead of page
      } = req.query;

       // Pagination logic using offset and limit
       const take = limit ? parseInt(limit, 10) : 20; // Default limit
       const skip = offset ? parseInt(offset, 10) : 0; // Default offset

      // Build query based on permissions and filters
      let queryBuilder = leaveRepository.createQueryBuilder("leave")
        .leftJoinAndSelect("leave.employee", "employee")
        .leftJoinAndSelect("employee.department", "department")
        .leftJoinAndSelect("leave.approver", "approver"); // Join approver

      // Apply role-based restrictions
      let hasWhere = false;
      if (session.user.role !== 'admin' && session.user.role !== 'hr_manager') {
        if (session.user.role === 'department_manager') {
          queryBuilder = queryBuilder.where("department.id = :departmentId", {
            departmentId: session.user.departmentId
          });
          hasWhere = true;
        } else {
          // Regular employees can only see their own leave requests
          queryBuilder = queryBuilder.where("employee.id = :employeeId", {
            employeeId: session.user.employeeId
          });
          hasWhere = true;
        }
      }

      // Apply filters (use andWhere if initial restriction applied)
      const addFilter = (condition, params) => {
          const clause = hasWhere ? "andWhere" : "where";
          queryBuilder = queryBuilder[clause](condition, params);
          hasWhere = true;
      };

      if (status) {
        addFilter("leave.status = :status", { status });
      }

      if (startDate) {
        const parsedStartDate = new Date(startDate);
        // Find leaves starting on or after startDate
        addFilter("leave.startDate >= :startDate", { startDate: parsedStartDate });
      }

      if (endDate) {
        const parsedEndDate = new Date(endDate);
         // Find leaves ending on or before endDate
        addFilter("leave.endDate <= :endDate", { endDate: parsedEndDate });
      }

      if (leaveType) {
        addFilter("leave.leaveType = :leaveType", { leaveType });
      }

      if (employeeId) {
          if (session.user.role === 'admin' || session.user.role === 'hr_manager' ||
             (session.user.role === 'department_manager' && /* check if emp is in dept */ true) ||
             (session.user.role === 'employee' && employeeId === session.user.employeeId)
            ) {
              addFilter("employee.id = :employeeId", { employeeId });
          } else {
              return res.status(403).json({ message: "Insufficient permissions to filter by this employee ID." });
          }
      }

      if (departmentId) {
          if (session.user.role === 'admin' || session.user.role === 'hr_manager' ||
             (session.user.role === 'department_manager' && departmentId === session.user.departmentId)
            ) {
              addFilter("department.id = :departmentId", { departmentId });
          } else {
               return res.status(403).json({ message: "Insufficient permissions to filter by this department ID." });
          }
      }


      // Add pagination
      queryBuilder = queryBuilder.skip(skip).take(take);


      // Order by start date (most recent first)
      queryBuilder = queryBuilder.orderBy("leave.startDate", "DESC");

      // Execute query and count
      const [leaveRequests, total] = await queryBuilder.getManyAndCount();


      // Return paginated results
       return res.status(200).json({
           leaveRequests,
           pagination: {
               total,
               limit: take,
               offset: skip
           }
       });
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      return res.status(500).json({ message: "Failed to fetch leave requests" });
    }
  },

  POST: async (req, res) => {
    const session = await getServerSession(req, res, authOptions); // Use imported authOptions
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      // NOTE: Using AppDataSource directly might be inconsistent with dbService refactoring.
      const leaveRepository = AppDataSource.getRepository(Leave);
      const employeeRepository = AppDataSource.getRepository(Employee);

      const leaveData = req.body;

      // Determine target employee ID
      let targetEmployeeId = leaveData.employeeId;
      if (!targetEmployeeId && session.user.employeeId) {
        targetEmployeeId = session.user.employeeId;
      }

       if (!targetEmployeeId) {
           return res.status(400).json({ message: "Employee ID is required." });
       }

      // Verify permission to create leave request for this employee
      if (session.user.role !== 'admin' && session.user.role !== 'hr_manager') {
        if (session.user.role === 'department_manager') {
          const employee = await employeeRepository.findOne({
            where: { id: targetEmployeeId },
            relations: ['department']
          });
          if (!employee || employee.department?.id !== session.user.departmentId) { // Added optional chaining
            return res.status(403).json({
              message: "Forbidden - Cannot create leave requests for employees outside your department"
            });
          }
        } else if (targetEmployeeId !== session.user.employeeId) {
          return res.status(403).json({
            message: "Forbidden - Cannot create leave requests for other employees"
          });
        }
      }

      // Validate required fields
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

      // Check for conflicts (Attendance and Overlapping Leave)
       const { hasConflict: hasAttConflict, conflictingRecords } = await leaveAttendanceService.checkAttendanceConflicts(
        targetEmployeeId,
        startDate,
        endDate
      );
       if (hasAttConflict) {
        return res.status(409).json({
          message: "Cannot create leave request - conflicts with existing attendance records",
          conflicts: conflictingRecords
        });
      }

      const overlappingLeave = await leaveRepository.createQueryBuilder('leave')
        .where('leave.employeeId = :employeeId', { employeeId: targetEmployeeId }) // Use ID directly
        .andWhere('leave.status IN (:...statuses)', { statuses: ['pending', 'approved'] })
        .andWhere('(leave.startDate <= :endDate AND leave.endDate >= :startDate)', { startDate, endDate })
        .getOne();
      if (overlappingLeave) {
        return res.status(409).json({
          message: "Cannot create leave request - overlaps with existing leave request",
          conflict: overlappingLeave
        });
      }

      // Set defaults
      const status = leaveData.status || 'pending'; // Default to pending
      const requestDate = new Date();

      // Prepare data for creation, linking relations via ID objects
      const dataToCreate = {
          employee: { id: targetEmployeeId },
          leaveType: leaveData.leaveType,
          startDate: startDate,
          endDate: endDate,
          status: status,
          reason: leaveData.reason || '',
          requestDate: requestDate,
          // Approver/approvalDate should only be set on PUT/PATCH, not initial creation
          notes: leaveData.notes || ''
      };


      // Create new leave request
      const newLeaveRequest = leaveRepository.create(dataToCreate);
      const savedLeaveRequest = await leaveRepository.save(newLeaveRequest);

      // Sync attendance ONLY if created directly as 'approved' (less common for POST)
      if (savedLeaveRequest.status === 'approved') {
        try {
          await leaveAttendanceService.syncAttendanceWithLeave(savedLeaveRequest.id);
        } catch (syncError) {
          console.error("Error syncing attendance after direct approved leave creation:", syncError);
          // Log error but don't fail the request
        }
      }

      return res.status(201).json(savedLeaveRequest);
    } catch (error) {
      console.error("Error creating leave request:", error);
      return res.status(500).json({ message: "Failed to create leave request", error: error.message });
    }
  }
});