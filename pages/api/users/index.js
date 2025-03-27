import { AppDataSource } from "../../../utils/db";
import User from "../../../entities/User";
import Employee from "../../../entities/Employee";
import { apiHandler } from "../../../utils/apiHandler";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import bcrypt from "bcryptjs";

export default apiHandler({
  GET: async (req, res) => {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Only admin and HR managers can list all users
    if (session.user.role !== 'admin' && session.user.role !== 'hr_manager') {
      return res.status(403).json({ message: "You do not have permission to list users" });
    }
    
    try {
      const userRepository = AppDataSource.getRepository(User);
      
      // Parse query parameters
      const {
        search,
        role,
        departmentId,
        page = 1,
        limit = 20,
        sortBy = "name",
        sortOrder = "ASC"
      } = req.query;
      
      const skip = (page - 1) * limit;
      const take = parseInt(limit);
      
      // Build query
      const queryBuilder = userRepository.createQueryBuilder("user")
        .leftJoinAndSelect("user.employee", "employee")
        .leftJoinAndSelect("employee.department", "department")
        .skip(skip)
        .take(take);
      
      // Apply search if provided
      if (search) {
        queryBuilder.andWhere(
          "(user.name LIKE :search OR user.email LIKE :search OR employee.firstName LIKE :search OR employee.lastName LIKE :search)",
          { search: `%${search}%` }
        );
      }
      
      // Apply role filter if provided
      if (role) {
        queryBuilder.andWhere("user.role = :role", { role });
      }
      
      // Apply department filter if provided
      if (departmentId) {
        queryBuilder.andWhere("department.id = :departmentId", { departmentId });
      }
      
      // Apply sorting
      if (sortBy && sortOrder) {
        // Validate sort field to prevent SQL injection
        const validSortFields = ["name", "email", "role", "createdAt"];
        const safeField = validSortFields.includes(sortBy) ? sortBy : "name";
        
        // Validate sort order to prevent SQL injection
        const safeOrder = sortOrder === "DESC" ? "DESC" : "ASC";
        
        queryBuilder.orderBy(`user.${safeField}`, safeOrder);
      } else {
        // Default sort by name
        queryBuilder.orderBy("user.name", "ASC");
      }
      
      // Get total count for pagination
      const total = await queryBuilder.getCount();
      
      // Execute the query
      const users = await queryBuilder.getMany();
      
      // Remove password hashes from results
      const safeUsers = users.map(user => {
        const { passwordHash, ...safeUser } = user;
        return safeUser;
      });
      
      // Return the results with pagination info
      return res.status(200).json({
        users: safeUsers,
        pagination: {
          total,
          page: parseInt(page),
          limit: take,
          pages: Math.ceil(total / take)
        }
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      return res.status(500).json({ message: "Failed to fetch users" });
    }
  },
  
  POST: async (req, res) => {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Only admin can create users
    if (session.user.role !== 'admin') {
      return res.status(403).json({ message: "You do not have permission to create users" });
    }
    
    try {
      const userRepository = AppDataSource.getRepository(User);
      const employeeRepository = AppDataSource.getRepository(Employee);
      
      // Validate required fields
      const { name, email, password, role, employeeId } = req.body;
      
      if (!name || !email || !password || !role) {
        return res.status(400).json({ message: "Name, email, password, and role are required" });
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }
      
      // Check if user with this email already exists
      const existingUser = await userRepository.findOne({
        where: { email }
      });
      
      if (existingUser) {
        return res.status(409).json({ message: "A user with this email already exists" });
      }
      
      // Validate role
      const validRoles = ['admin', 'hr_manager', 'department_manager', 'employee'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role. Must be one of: admin, hr_manager, department_manager, employee" });
      }
      
      // If employeeId is provided, check if employee exists
      if (employeeId) {
        const employee = await employeeRepository.findOne({
          where: { id: employeeId }
        });
        
        if (!employee) {
          return res.status(400).json({ message: "Employee not found" });
        }
      }
      
      // Hash the password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      
      // Create the new user
      const user = userRepository.create({
        name,
        email,
        passwordHash,
        role,
        employee: employeeId ? { id: employeeId } : null,
        departmentId: req.body.departmentId || null,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Save to database
      const savedUser = await userRepository.save(user);
      
      // Remove password hash from response
      const { passwordHash: _, ...safeUser } = savedUser;
      
      // Add audit log
      console.log(`[AUDIT] User ${savedUser.id} (${savedUser.name}) created by ${session.user.name} (${session.user.id}) at ${new Date().toISOString()}`);
      
      // Return the created user
      return res.status(201).json(safeUser);
    } catch (error) {
      console.error("Error creating user:", error);
      return res.status(500).json({ message: "Failed to create user" });
    }
  }
});