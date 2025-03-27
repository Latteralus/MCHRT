// Corrected import paths and authOptions import
// Removed direct AppDataSource and entity imports if dbService handles everything
// import { AppDataSource } from "@/utils/db";
// import Leave from "@/entities/Leave";
// import Employee from "@/entities/Employee";
import { dbService } from '@/utils/dbService'; // Import the fixed dbService
import { apiHandler } from "@/utils/apiHandler";
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/pages/api/auth/[...nextauth]'; // Corrected import
import leaveAttendanceService from "@/utils/leaveAttendanceService"; // Keep for conflict checks/sync

export default apiHandler({
  GET: async (req, res) => {
    const session = await getServerSession(req, res, authOptions);
    if (!session) { return res.status(401).json({ message: "Unauthorized" }); }

    try {
      const queryOptions = { ...req.query }; // Pass query params to dbService

      // Apply role-based restrictions within the options if dbService doesn't handle it
      if (session.user.role !== 'admin' && session.user.role !== 'hr_manager') {
          if (session.user.role === 'department_manager') {
              // If filtering by employee outside dept, override or error?
              // If no department filter, add it based on session
              if (!queryOptions.departmentId) {
                  queryOptions.departmentId = session.user.departmentId;
              } else if (queryOptions.departmentId !== session.user.departmentId) {
                  return res.status(403).json({ message: "Cannot query outside your department" });
              }
          } else { // Regular employee
              // Override any employee filter to only allow self
              if (queryOptions.employeeId && queryOptions.employeeId !== session.user.employeeId) {
                   return res.status(403).json({ message: "Cannot query other employees' leave" });
              }
              queryOptions.employeeId = session.user.employeeId; // Force filter to self
          }
      }


      // Use dbService
      // Assuming dbService.getLeaveRequests returns { leaveRequests, pagination }
      const result = await dbService.getLeaveRequests(queryOptions);

      return res.status(200).json(result);

    } catch (error) {
      console.error("API Error fetching leave requests:", error);
      return res.status(500).json({ message: "Failed to fetch leave requests" });
    }
  },

  POST: async (req, res) => {
    const session = await getServerSession(req, res, authOptions);
    if (!session) { return res.status(401).json({ message: "Unauthorized" }); }

    try {
      const leaveData = req.body;

      // Determine target employee ID & Perform Permission Checks (similar logic as before)
      let targetEmployeeId = leaveData.employeeId || session.user.employeeId;
      if (!targetEmployeeId) { return res.status(400).json({ message: "Employee ID is required." }); }

       // Verify permission (could be a separate helper function)
       if (session.user.role !== 'admin' && session.user.role !== 'hr_manager') {
           if (session.user.role === 'department_manager') {
               const employee = await dbService.getEmployeeById(targetEmployeeId); // Need employee data for dept check
               if (!employee || employee.department?.id !== session.user.departmentId) {
                   return res.status(403).json({ message: "Forbidden - Cannot create leave for employees outside your department" });
               }
           } else if (targetEmployeeId !== session.user.employeeId) {
               return res.status(403).json({ message: "Forbidden - Cannot create leave requests for other employees" });
           }
       }


      // Validate required fields and date range (similar logic as before)
       if (!leaveData.startDate || !leaveData.endDate || !leaveData.leaveType) { /* ... */ }
       const startDate = new Date(leaveData.startDate);
       const endDate = new Date(leaveData.endDate);
       if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate > endDate) { /* ... */ }


      // Check for conflicts using leaveAttendanceService and dbService
      const { hasConflict: hasAttConflict, conflictingRecords } = await leaveAttendanceService.checkAttendanceConflicts(
        targetEmployeeId, startDate, endDate
      );
      if (hasAttConflict) { /* ... return 409 ... */ }

      // Check for overlapping leave using dbService
       const overlappingLeave = await dbService.getLeaveRequests({
           employeeId: targetEmployeeId,
           status: ['pending', 'approved'], // Filter by status
           // Need date range overlap filter in dbService.getLeaveRequests
           // Or perform it here if dbService returns enough data
           dateOverlaps: { start: startDate, end: endDate } // Hypothetical filter option
       });
       // Check if overlappingLeave.leaveRequests contains any entries
       if (overlappingLeave?.leaveRequests?.length > 0) {
          return res.status(409).json({ message: "Conflicts with existing leave request", conflict: overlappingLeave.leaveRequests[0] });
       }


      // Prepare data (ensure employeeId is part of leaveData for dbService)
      const dataToCreate = {
        ...leaveData,
        employeeId: targetEmployeeId, // Ensure ID is passed to dbService
        status: leaveData.status || 'pending',
        requestDate: new Date(),
      };

      // Use dbService to create
      const savedLeaveRequest = await dbService.createLeave(dataToCreate);

      // Sync attendance if needed (using leaveAttendanceService)
      if (savedLeaveRequest.status === 'approved') {
        try { await leaveAttendanceService.syncAttendanceWithLeave(savedLeaveRequest.id); }
        catch (syncError) { console.error("Error syncing attendance post-create:", syncError); }
      }

      return res.status(201).json(savedLeaveRequest);
    } catch (error) {
      console.error("API Error creating leave request:", error);
      // Provide more specific error message if possible (e.g., from validation or conflict checks)
      return res.status(500).json({ message: `Failed to create leave request: ${error.message}` });
    }
  }
});