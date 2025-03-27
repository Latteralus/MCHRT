import { AppDataSource } from "../../../utils/db";
import Employee from "../../../entities/Employee";
import Department from "../../../entities/Department";
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
      const employeeRepository = AppDataSource.getRepository(Employee);
      
      // Get employee with department and manager
      const employee = await employeeRepository.findOne({
        where: { id },
        relations: ['department', 'manager']
      });
      
      // Check if employee exists
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      
      // Check access based on role
      if (session.user.role === 'department_manager' && 
          session.user.departmentId !== employee.department?.id) {
        return res.status(403).json({ message: "You do not have access to this employee record" });
      }
      
      // Regular employees can only view their own record
      if (session.user.role === 'employee' && 
          session.user.employeeId !== employee.id) {
        return res.status(403).json({ message: "You do not have access to this employee record" });
      }
      
      return res.status(200).json(employee);
    } catch (error) {
      console.error("Error fetching employee:", error);
      return res.status(500).json({ message: "Failed to fetch employee" });
    }
  },
  
  PUT: async (req, res) => {
    const { id } = req.query;
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const employeeRepository = AppDataSource.getRepository(Employee);
      const departmentRepository = AppDataSource.getRepository(Department);
      
      // Find the employee to update
      const employee = await employeeRepository.findOne({
        where: { id },
        relations: ['department']
      });
      
      // Check if employee exists
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      
      // Check access based on role
      // Department managers can only update employees in their department
      if (session.user.role === 'department_manager' && 
          session.user.departmentId !== employee.department?.id) {
        return res.status(403).json({ message: "You do not have access to this employee record" });
      }
      
      // Regular employees cannot update other employees
      if (session.user.role === 'employee' && 
          session.user.employeeId !== employee.id) {
        return res.status(403).json({ message: "You do not have access to this employee record" });
      }
      
      // Department change validation - only admin and HR can change departments
      if (req.body.departmentId && 
          req.body.departmentId !== employee.department?.id) {
          
        // Only admin and HR can change departments
        if (session.user.role !== 'admin' && session.user.role !== 'hr_manager') {
          return res.status(403).json({ message: "You do not have permission to change employee department" });
        }
          
        // Verify department exists
        const department = await departmentRepository.findOne({
          where: { id: req.body.departmentId }
        });
        
        if (!department) {
          return res.status(400).json({ message: "Department not found" });
        }
      }
      
      // Check if email is changing and if it's already in use
      if (req.body.email && req.body.email !== employee.email) {
        const existingEmployee = await employeeRepository.findOne({
          where: { email: req.body.email }
        });
        
        if (existingEmployee) {
          return res.status(409).json({ message: "An employee with this email already exists" });
        }
      }
      
      // Check if manager ID is valid
      if (req.body.managerId && req.body.managerId !== employee.managerId) {
        const manager = await employeeRepository.findOne({
          where: { id: req.body.managerId }
        });
        
        if (!manager) {
          return res.status(400).json({ message: "Manager not found" });
        }
      }
      
      // Prepare update data (parse date strings into Date objects)
      const updateData = {
        ...req.body,
        hireDate: req.body.hireDate ? new Date(req.body.hireDate) : employee.hireDate,
        terminationDate: req.body.terminationDate ? new Date(req.body.terminationDate) : employee.terminationDate,
        dateOfBirth: req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : employee.dateOfBirth
      };
      
      // Update the employee
      employeeRepository.merge(employee, updateData);
      const updatedEmployee = await employeeRepository.save(employee);
      
      // Add audit log
      console.log(`[AUDIT] Employee ${id} updated by ${session.user.name} (${session.user.id}) at ${new Date().toISOString()}`);
      
      // Get the updated employee with relations
      const result = await employeeRepository.findOne({
        where: { id },
        relations: ['department', 'manager']
      });
      
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error updating employee:", error);
      return res.status(500).json({ message: "Failed to update employee" });
    }
  },
  
  DELETE: async (req, res) => {
    const { id } = req.query;
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Only admin and HR managers can delete employees
    if (session.user.role !== 'admin' && session.user.role !== 'hr_manager') {
      return res.status(403).json({ message: "You do not have permission to delete employees" });
    }
    
    try {
      const employeeRepository = AppDataSource.getRepository(Employee);
      
      // Find the employee to delete
      const employee = await employeeRepository.findOne({
        where: { id },
        relations: ['department']
      });
      
      // Check if employee exists
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      
      // Create log of deletion for audit purposes
      console.log(`[AUDIT] Employee ${id} (${employee.firstName} ${employee.lastName}) deleted by ${session.user.name} (${session.user.id}) at ${new Date().toISOString()}`);
      
      // Check if this employee is a manager of other employees
      const managedEmployees = await employeeRepository.find({
        where: { manager: { id } }
      });
      
      if (managedEmployees.length > 0) {
        return res.status(400).json({ 
          message: `Cannot delete employee who is a manager of ${managedEmployees.length} other employees. Reassign them first.` 
        });
      }
      
      // Delete the employee
      await employeeRepository.remove(employee);
      
      return res.status(200).json({ message: "Employee deleted successfully" });
    } catch (error) {
      console.error("Error deleting employee:", error);
      return res.status(500).json({ message: "Failed to delete employee" });
    }
  }
});