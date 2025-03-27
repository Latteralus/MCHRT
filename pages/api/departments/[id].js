import { AppDataSource } from "../../../utils/db";
import Department from "../../../entities/Department";
import Employee from "../../../entities/Employee";
import { apiHandler } from "../../../utils/apiHandler";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default apiHandler({
  GET: async (req, res) => {
    const { id } = req.query;
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const departmentRepository = AppDataSource.getRepository(Department);
      const employeeRepository = AppDataSource.getRepository(Employee);
      
      // Get the department with manager relation
      const department = await departmentRepository.findOne({
        where: { id },
        relations: ['manager']
      });
      
      // Check if department exists
      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }
      
      // Get employee count for this department
      const employeeCount = await employeeRepository.count({
        where: { department: { id } }
      });
      
      // Return department data with employee count
      const departmentWithStats = {
        ...department,
        employeeCount
      };
      
      return res.status(200).json(departmentWithStats);
    } catch (error) {
      console.error("Error fetching department:", error);
      return res.status(500).json({ message: "Failed to fetch department" });
    }
  },
  
  PUT: async (req, res) => {
    const { id } = req.query;
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Only admin and HR managers can update departments
    if (session.user.role !== 'admin' && session.user.role !== 'hr_manager') {
      return res.status(403).json({ message: "You do not have permission to update departments" });
    }
    
    try {
      const departmentRepository = AppDataSource.getRepository(Department);
      const employeeRepository = AppDataSource.getRepository(Employee);
      
      // Check if department exists
      const department = await departmentRepository.findOne({
        where: { id }
      });
      
      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }
      
      // Check if name is changing and if it already exists
      if (req.body.name && req.body.name !== department.name) {
        const existingDepartment = await departmentRepository.findOne({
          where: { name: req.body.name }
        });
        
        if (existingDepartment) {
          return res.status(409).json({ message: "A department with this name already exists" });
        }
      }
      
      // If assigning a manager, check if employee exists
      if (req.body.managerId && req.body.managerId !== department.managerId) {
        const manager = await employeeRepository.findOne({
          where: { id: req.body.managerId }
        });
        
        if (!manager) {
          return res.status(400).json({ message: "Employee not found for manager assignment" });
        }
      }
      
      // Update the department
      departmentRepository.merge(department, req.body);
      const updatedDepartment = await departmentRepository.save(department);
      
      // Add audit log
      console.log(`[AUDIT] Department ${id} updated by ${session.user.name} (${session.user.id}) at ${new Date().toISOString()}`);
      
      return res.status(200).json(updatedDepartment);
    } catch (error) {
      console.error("Error updating department:", error);
      return res.status(500).json({ message: "Failed to update department" });
    }
  },
  
  DELETE: async (req, res) => {
    const { id } = req.query;
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Only admin can delete departments
    if (session.user.role !== 'admin') {
      return res.status(403).json({ message: "You do not have permission to delete departments" });
    }
    
    try {
      const departmentRepository = AppDataSource.getRepository(Department);
      const employeeRepository = AppDataSource.getRepository(Employee);
      
      // Check if department exists
      const department = await departmentRepository.findOne({
        where: { id }
      });
      
      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }
      
      // Check if department has employees
      const employeeCount = await employeeRepository.count({
        where: { department: { id } }
      });
      
      if (employeeCount > 0) {
        return res.status(400).json({ 
          message: `Cannot delete department that has ${employeeCount} employees assigned. Reassign them first.` 
        });
      }
      
      // Create log of deletion for audit purposes
      const now = new Date();
      console.log(`[AUDIT] Department "${department.name}" (${id}) deleted by ${session.user.name} (${session.user.id}) at ${now.toISOString()}`);
      
      // Delete the department
      await departmentRepository.remove(department);
      
      return res.status(200).json({ message: "Department deleted successfully" });
    } catch (error) {
      console.error("Error deleting department:", error);
      return res.status(500).json({ message: "Failed to delete department" });
    }
  }
});