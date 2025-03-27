// pages/api/attendance/index.js // File path comment seems incorrect, actual path is pages/attendance/index.js
// Corrected import paths and authOptions import
import { AppDataSource } from "@/utils/db";
import Attendance from "@/entities/Attendance";
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
      const attendanceRepository = AppDataSource.getRepository(Attendance);
      const employeeRepository = AppDataSource.getRepository(Employee); // Needed for joins/checks

      // Process query parameters
      const {
        employeeId,
        startDate,
        endDate,
        status,
        departmentId,
        page = 1,
        limit = 20
      } = req.query;

      const skip = (page - 1) * limit;

      // Build query based on permissions and filters
      let queryBuilder = attendanceRepository.createQueryBuilder("attendance")
        .leftJoinAndSelect("attendance.employee", "employee")
        .leftJoinAndSelect("employee.department", "department");

      // Apply role-based restrictions
      if (session.user.role !== 'admin' && session.user.role !== 'hr_manager') {
        if (session.user.role === 'department_manager') {
          queryBuilder.where("department.id = :departmentId", {
            departmentId: session.user.departmentId
          });
        } else {
          // Regular employees can only see their own attendance
          queryBuilder.where("employee.id = :employeeId", {
            employeeId: session.user.employeeId
          });
        }
      }

      // Apply filters (ensure subsequent filters use andWhere)
      let hasWhere = session.user.role !== 'admin' && session.user.role !== 'hr_manager'; // Check if initial restriction applied

      if (employeeId) {
         // Only apply if user has permission to filter by arbitrary employeeId
         if (session.user.role === 'admin' || session.user.role === 'hr_manager' ||
             (session.user.role === 'department_manager' && /* additional check if needed */ true)
            ) {
             const clause = hasWhere ? "andWhere" : "where";
             queryBuilder = queryBuilder[clause]("employee.id = :employeeId", { employeeId });
             hasWhere = true;
         } else if (session.user.role === 'employee' && employeeId !== session.user.employeeId) {
             // Prevent employee from filtering for others
             return res.status(403).json({ message: "Cannot filter by other employee IDs." });
         }
         // If employee role and ID matches session, filter is implicitly applied by initial restriction
      }

      if (status) {
        const clause = hasWhere ? "andWhere" : "where";
        queryBuilder = queryBuilder[clause]("attendance.status = :status", { status });
        hasWhere = true;
      }

      if (startDate) {
        const parsedStartDate = new Date(startDate);
        const clause = hasWhere ? "andWhere" : "where";
        queryBuilder = queryBuilder[clause]("attendance.date >= :startDate", { startDate: parsedStartDate });
        hasWhere = true;
      }

      if (endDate) {
        const parsedEndDate = new Date(endDate);
        const clause = hasWhere ? "andWhere" : "where";
        queryBuilder = queryBuilder[clause]("attendance.date <= :endDate", { endDate: parsedEndDate });
        hasWhere = true;
      }

      if (departmentId) {
          // Only apply if user has permission to filter by department
         if (session.user.role === 'admin' || session.user.role === 'hr_manager') {
            const clause = hasWhere ? "andWhere" : "where";
            queryBuilder = queryBuilder[clause]("department.id = :departmentId", { departmentId });
            hasWhere = true;
         } else if (session.user.role === 'department_manager' && departmentId !== session.user.departmentId) {
             return res.status(403).json({ message: "Cannot filter by other department IDs." });
         }
         // If dept manager and ID matches session, filter is implicitly applied by initial restriction
      }

      // Add order and pagination
      queryBuilder
        .orderBy("attendance.date", "DESC")
        .addOrderBy("attendance.timeIn", "DESC")
        .skip(skip)
        .take(parseInt(limit));

      // Execute query
      const [records, total] = await Promise.all([
        queryBuilder.getMany(),
        queryBuilder.getCount() // Count should ideally apply the same filters
      ]);

      // Return paginated results with metadata
      return res.status(200).json({
        records,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error("Error fetching attendance records:", error);
      return res.status(500).json({ message: "Failed to fetch attendance records" });
    }
  },

  POST: async (req, res) => {
    const session = await getServerSession(req, res, authOptions); // Use imported authOptions

    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      // NOTE: Using AppDataSource directly might be inconsistent with dbService refactoring.
      const attendanceRepository = AppDataSource.getRepository(Attendance);
      const employeeRepository = AppDataSource.getRepository(Employee);

      const { employeeId, date, timeIn, timeOut, status, notes } = req.body;

      if (!employeeId || !date) {
        return res.status(400).json({ message: "Employee ID and date are required" });
      }

      // Validate employee exists
      const employee = await employeeRepository.findOne({
        where: { id: employeeId },
        relations: ['department']
      });

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      // Check permissions for creating attendance records
      if (session.user.role !== 'admin' && session.user.role !== 'hr_manager') {
        if (session.user.role === 'department_manager') {
          if (employee.department?.id !== session.user.departmentId) {
            return res.status(403).json({ message: "You can only manage attendance for your department" });
          }
        } else {
          // Regular employees can only log their own attendance
          if (employee.id !== session.user.employeeId) {
            return res.status(403).json({ message: "You can only log your own attendance" });
          }
        }
      }

      // Check for existing attendance record for the same date and employee
       // Ensure date comparison is robust (ignore time part)
      const targetDate = new Date(date);
      targetDate.setUTCHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setUTCDate(targetDate.getUTCDate() + 1);

      const existingRecord = await attendanceRepository.createQueryBuilder("attendance")
          .where("attendance.employeeId = :employeeId", { employeeId })
          .andWhere("attendance.date >= :startOfDay AND attendance.date < :startOfNextDay", {
              startOfDay: targetDate.toISOString().split('T')[0], // Format as YYYY-MM-DD string
              startOfNextDay: nextDay.toISOString().split('T')[0] // Format as YYYY-MM-DD string
          })
          .getOne();


      if (existingRecord) {
        return res.status(409).json({ message: `An attendance record already exists for this employee on ${targetDate.toISOString().split('T')[0]}` });
      }

      // Check for conflicts with approved leave requests
      const { hasConflict, conflictingLeave } = await leaveAttendanceService.checkLeaveConflicts(
        employeeId,
        targetDate // Use normalized date
      );

      if (hasConflict) {
        // Handle conflict logic (as before)
         if (session.user.role !== 'admin' && session.user.role !== 'hr_manager') {
          return res.status(409).json({
            message: "Cannot create attendance record - conflicts with approved leave request",
            conflict: conflictingLeave
          });
        } else {
          const warningNote = `WARNING: This record conflicts with an approved leave request (ID: ${conflictingLeave.id}). ${notes || ''}`;
          req.body.notes = warningNote; // Add warning if admin overrides
        }
      }

      // Create new attendance record
      const newAttendance = attendanceRepository.create({
        employee: { id: employeeId },
        date: targetDate, // Use normalized date
        timeIn: timeIn || null,
        timeOut: timeOut || null,
        status: status || 'present',
        notes: req.body.notes || notes || '' // Use potentially modified notes
      });

      const savedRecord = await attendanceRepository.save(newAttendance);

      return res.status(201).json(savedRecord);
    } catch (error) {
      console.error("Error creating attendance record:", error);
      return res.status(500).json({ message: "Failed to create attendance record", error: error.message });
    }
  }
});