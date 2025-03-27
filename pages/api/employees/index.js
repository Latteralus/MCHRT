import { AppDataSource } from "../../../utils/db";
import Employee from "../../../entities/Employee";
import Department from "../../../entities/Department";
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
      const employeeRepository = AppDataSource.getRepository(Employee);
      
      // Parse query parameters
      const {
        search,
        departmentId,
        status,
        page = 1,
        limit = 20,
        sortBy = "lastName",
        sortOrder = "ASC"
      } = req.query;
      
      const skip = (page - 1) * limit;
      const take = parseInt(limit);
      
      // Build query
      const queryBuilder = employeeRepository.createQueryBuilder("employee")
        .leftJoinAndSelect("employee.department", "department")
        .leftJoinAndSelect("employee.manager", "manager")
        .skip(skip)
        .take(take);
      
      // Apply department filter based on user role
      if (session.user.role === "department_manager") {
        // Department managers can only see employees in their department
        queryBuilder.andWhere("department.id = :departmentId", { 
          departmentId: session.user.departmentId 
        });
      } else if (departmentId) {
        // Admin and HR can filter by department
        if (session.user.role === "admin" || session.user.role === "hr_manager") {
          queryBuilder.andWhere("department.id = :departmentId", { 
            departmentId 
          });
        } else {
          return res.status(403).json({ message: "You do not have access to this department" });
        }
      }
      
      // Apply search if provided
      if (search) {
        queryBuilder.andWhere(
          "(employee.firstName LIKE :search OR employee.lastName LIKE :search OR employee.email LIKE :search OR employee.position LIKE :search)",
          { search: `%${search}%` }
        );
      }
      
      // Apply status filter if provided
      if (status) {
        queryBuilder.andWhere("employee.status = :status", { status });
      }
      
      // Apply sorting
      if (sortBy && sortOrder) {
        // Validate sort field to prevent SQL injection
        const validSortFields = ["firstName", "lastName", "email", "position", "hireDate", "status"];
        const safeField = validSortFields.includes(sortBy) ? sortBy : "lastName";
        
        // Validate sort order to prevent SQL injection
        const safeOrder = sortOrder === "DESC" ? "DESC" : "ASC";
        
        queryBuilder.orderBy(`employee.${safeField}`, safeOrder);
      } else {
        // Default sort by last name
        queryBuilder.orderBy("employee.lastName", "ASC");
      }
      
      // Get total count for pagination
      const total = await queryBuilder.getCount();
      
      // Execute the query
      const employees = await queryBuilder.getMany();
      
      // Return the results with pagination info
      return res.status(200).json({
        employees,
        pagination: {
          total,
          page: parseInt(page),
          limit: take,
          pages: Math.ceil(total / take)
        }
      });
    } catch (error) {
      console.error("Error fetching employees:", error);
      return res.status(500).json({ message: "Failed to fetch employees" });
    }
  },
  
  POST: async (req, res) => {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Check permissions - only admin and HR managers can create employees
    if (session.user.role !== "admin" && session.user.role !== "hr_manager") {
      return res.status(403).json({ message: "You do not have permission to create employees" });
    }
    
    try {
      const employeeRepository = AppDataSource.getRepository(Employee);
      const departmentRepository = AppDataSource.getRepository(Department);
      
      // Validate required fields
      const { firstName, lastName, email, position, hireDate, departmentId } = req.body;
      
      if (!firstName || !lastName || !email || !position || !hireDate) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Check email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }
      
      // If department ID is provided, check if it exists
      if (departmentId) {
        const department = await departmentRepository.findOne({
          where: { id: departmentId }
        });
        
        if (!department) {
          return res.status(400).json({ message: "Department not found" });
        }
      }
      
      // Check if manager ID is provided and valid
      if (req.body.managerId) {
        const manager = await employeeRepository.findOne({
          where: { id: req.body.managerId }
        });
        
        if (!manager) {
          return res.status(400).json({ message: "Manager not found" });
        }
      }
      
      // Check if employee with this email already exists
      const existingEmployee = await employeeRepository.findOne({
        where: { email }
      });
      
      if (existingEmployee) {
        return res.status(409).json({ message: "An employee with this email already exists" });
      }
      
      // Create the new employee
      const employee = employeeRepository.create({
        ...req.body,
        // Parse date strings into Date objects
        hireDate: new Date(hireDate),
        terminationDate: req.body.terminationDate ? new Date(req.body.terminationDate) : null,
        dateOfBirth: req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : null
      });
      
      // Save to database
      const savedEmployee = await employeeRepository.save(employee);
      
      // Add audit log
      console.log(`[AUDIT] Employee ${savedEmployee.id} (${savedEmployee.firstName} ${savedEmployee.lastName}) created by ${session.user.name} (${session.user.id}) at ${new Date().toISOString()}`);
      
      // Return the created employee
      return res.status(201).json(savedEmployee);
    } catch (error) {
      console.error("Error creating employee:", error);
      return res.status(500).json({ message: "Failed to create employee" });
    }
  }
});