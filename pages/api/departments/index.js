import { AppDataSource } from "../../../utils/db";
import Department from "../../../entities/Department";
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
      const departmentRepository = AppDataSource.getRepository(Department);
      const employeeRepository = AppDataSource.getRepository(Employee);
      
      // Build query options
      const options = {
        order: {
          name: 'ASC' // Sort by name by default
        }
      };
      
      // Add relations if requested
      if (req.query.withManager === 'true') {
        options.relations = ['manager'];
      }
      
      // Get departments
      const departments = await departmentRepository.find(options);
      
      // Get employee counts for each department
      const departmentsWithStats = await Promise.all(
        departments.map(async (dept) => {
          const employeeCount = await employeeRepository.count({
            where: { department: { id: dept.id } }
          });
          
          return {
            ...dept,
            employeeCount
          };
        })
      );
      
      return res.status(200).json(departmentsWithStats);
    } catch (error) {
      console.error("Error fetching departments:", error);
      return res.status(500).json({ message: "Failed to fetch departments" });
    }
  },
  
  POST: async (req, res) => {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Check permissions
    if (session.user.role !== 'admin' && session.user.role !== 'hr_manager') {
      return res.status(403).json({ message: "You do not have permission to create departments" });
    }
    
    try {
      const departmentRepository = AppDataSource.getRepository(Department);
      
      // Validate required fields
      const { name } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: "Department name is required" });
      }
      
      // Check if department already exists
      const existingDepartment = await departmentRepository.findOne({
        where: { name }
      });
      
      if (existingDepartment) {
        return res.status(409).json({ message: "A department with this name already exists" });
      }
      
      // If manager ID is provided, verify the employee exists
      if (req.body.managerId) {
        const employeeRepository = AppDataSource.getRepository(Employee);
        const manager = await employeeRepository.findOne({
          where: { id: req.body.managerId }
        });
        
        if (!manager) {
          return res.status(400).json({ message: "Employee not found for manager assignment" });
        }
      }
      
      // Create the department
      const department = departmentRepository.create(req.body);
      const savedDepartment = await departmentRepository.save(department);
      
      // Add audit log
      console.log(`[AUDIT] Department "${name}" created by ${session.user.name} (${session.user.id}) at ${new Date().toISOString()}`);
      
      return res.status(201).json(savedDepartment);
    } catch (error) {
      console.error("Error creating department:", error);
      return res.status(500).json({ message: "Failed to create department" });
    }
  }
});