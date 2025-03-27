import { AppDataSource } from "../../../utils/db";
import Attendance from "../../../entities/Attendance";
import Employee from "../../../entities/Employee";
import { apiHandler } from "../../../utils/apiHandler";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default apiHandler({
  GET: async (req, res) => {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const attendanceRepository = AppDataSource.getRepository(Attendance);
      const employeeRepository = AppDataSource.getRepository(Employee);
      
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
      
      // Apply filters
      if (employeeId && (session.user.role === 'admin' || session.user.role === 'hr_manager' || 
          (session.user.role === 'department_manager' && session.user.departmentId))) {
        queryBuilder.andWhere("employee.id = :employeeId", { employeeId });
      }
      
      if (status) {
        queryBuilder.andWhere("attendance.status = :status", { status });
      }
      
      if (startDate) {
        const parsedStartDate = new Date(startDate);
        queryBuilder.andWhere("attendance.date >= :startDate", { startDate: parsedStartDate });
      }
      
      if (endDate) {
        const parsedEndDate = new Date(endDate);
        queryBuilder.andWhere("attendance.date <= :endDate", { endDate: parsedEndDate });
      }
      
      if (departmentId && (session.user.role === 'admin' || session.user.role === 'hr_manager')) {
        queryBuilder.andWhere("department.id = :departmentId", { departmentId });
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
        queryBuilder.getCount()
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
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
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
      const existingRecord = await attendanceRepository.findOne({
        where: {
          employee: { id: employeeId },
          date: new Date(date)
        }
      });
      
      if (existingRecord) {
        return res.status(409).json({ message: "An attendance record already exists for this employee on this date" });
      }
      
      // Create new attendance record
      const newAttendance = attendanceRepository.create({
        employee: { id: employeeId },
        date: new Date(date),
        timeIn: timeIn || null,
        timeOut: timeOut || null,
        status: status || 'present',
        notes: notes || ''
      });
      
      const savedRecord = await attendanceRepository.save(newAttendance);
      
      return res.status(201).json(savedRecord);
    } catch (error) {
      console.error("Error creating attendance record:", error);
      return res.status(500).json({ message: "Failed to create attendance record" });
    }
  }
});