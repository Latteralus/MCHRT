import { AppDataSource } from "../../../utils/db";
import User from "../../../entities/User";
import Employee from "../../../entities/Employee";
import { apiHandler } from "../../../utils/apiHandler";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import bcrypt from "bcryptjs";

export default apiHandler({
  GET: async (req, res) => {
    const { id } = req.query;
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const userRepository = AppDataSource.getRepository(User);
      
      // Get user with relations
      const user = await userRepository.findOne({
        where: { id },
        relations: ['employee', 'employee.department']
      });
      
      // Check if user exists
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check access based on role
      // Regular users can only see their own user record
      if (session.user.role !== 'admin' && session.user.role !== 'hr_manager' && 
          session.user.id !== user.id) {
        return res.status(403).json({ message: "You do not have access to this user record" });
      }
      
      // Remove password hash from response
      const { passwordHash, ...safeUser } = user;
      
      return res.status(200).json(safeUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      return res.status(500).json({ message: "Failed to fetch user" });
    }
  },
  
  PUT: async (req, res) => {
    const { id } = req.query;
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const userRepository = AppDataSource.getRepository(User);
      const employeeRepository = AppDataSource.getRepository(Employee);
      
      // Find the user to update
      const user = await userRepository.findOne({
        where: { id },
        relations: ['employee', 'employee.department']
      });
      
      // Check if user exists
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Define what types of updates are allowed based on roles
      let canChangeRole = false;
      let canChangeEmployeeLink = false;
      let canChangeDepartment = false;
      
      // Admins can change anything
      if (session.user.role === 'admin') {
        canChangeRole = true;
        canChangeEmployeeLink = true;
        canChangeDepartment = true;
      } 
      // HR managers can't change admin roles or their own role
      else if (session.user.role === 'hr_manager') {
        canChangeRole = user.role !== 'admin' && session.user.id !== user.id;
        canChangeEmployeeLink = true;
        canChangeDepartment = true;
      }
      // Users can only update their own basic information
      else if (session.user.id === user.id) {
        // Can update name, email, password, but not role or employeeId
        if (req.body.role !== undefined && req.body.role !== user.role) {
          return res.status(403).json({ message: "You cannot change your own role" });
        }
        
        if (req.body.employeeId !== undefined && req.body.employeeId !== user.employee?.id) {
          return res.status(403).json({ message: "You cannot change your linked employee" });
        }
        
        if (req.body.departmentId !== undefined && req.body.departmentId !== user.departmentId) {
          return res.status(403).json({ message: "You cannot change your department" });
        }
      } else {
        return res.status(403).json({ message: "You do not have permission to update this user" });
      }
      
      // Validate role change if applicable
      if (req.body.role !== undefined && req.body.role !== user.role) {
        if (!canChangeRole) {
          return res.status(403).json({ message: "You do not have permission to change this user's role" });
        }
        
        // Validate role
        const validRoles = ['admin', 'hr_manager', 'department_manager', 'employee'];
        if (!validRoles.includes(req.body.role)) {
          return res.status(400).json({ message: "Invalid role. Must be one of: admin, hr_manager, department_manager, employee" });
        }
      }
      
      // Check if email is changing and if it's already in use
      if (req.body.email !== undefined && req.body.email !== user.email) {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(req.body.email)) {
          return res.status(400).json({ message: "Invalid email format" });
        }
        
        const existingUser = await userRepository.findOne({
          where: { email: req.body.email }
        });
        
        if (existingUser) {
          return res.status(409).json({ message: "A user with this email already exists" });
        }
      }
      
      // Check employee link if changing
      if (req.body.employeeId !== undefined && req.body.employeeId !== user.employee?.id) {
        if (!canChangeEmployeeLink) {
          return res.status(403).json({ message: "You do not have permission to change employee links" });
        }
        
        if (req.body.employeeId) {
          const employee = await employeeRepository.findOne({
            where: { id: req.body.employeeId }
          });
          
          if (!employee) {
            return res.status(400).json({ message: "Employee not found" });
          }
          
          // Check if employee is already linked to another user
          const linkedUser = await userRepository.findOne({
            where: { employee: { id: req.body.employeeId } },
            relations: ['employee']
          });
          
          if (linkedUser && linkedUser.id !== user.id) {
            return res.status(409).json({ message: "This employee is already linked to another user" });
          }
        }
      }
      
      // Check department change
      if (req.body.departmentId !== undefined && req.body.departmentId !== user.departmentId) {
        if (!canChangeDepartment) {
          return res.status(403).json({ message: "You do not have permission to change departments" });
        }
      }
      
      // Handle password update separately
      let passwordHash = user.passwordHash;
      if (req.body.password) {
        const saltRounds = 10;
        passwordHash = await bcrypt.hash(req.body.password, saltRounds);
      }
      
      // Prepare update data
      const updateData = {
        name: req.body.name !== undefined ? req.body.name : user.name,
        email: req.body.email !== undefined ? req.body.email : user.email,
        passwordHash,
        role: req.body.role !== undefined ? req.body.role : user.role,
        employee: req.body.employeeId !== undefined ? 
                 (req.body.employeeId ? { id: req.body.employeeId } : null) : 
                 user.employee,
        departmentId: req.body.departmentId !== undefined ? req.body.departmentId : user.departmentId,
        updatedAt: new Date()
      };
      
      // Update the user
      userRepository.merge(user, updateData);
      const updatedUser = await userRepository.save(user);
      
      // Add audit log
      console.log(`[AUDIT] User ${id} updated by ${session.user.name} (${session.user.id}) at ${new Date().toISOString()}`);
      
      // Remove password hash from response
      const { passwordHash: _, ...safeUser } = updatedUser;
      
      return res.status(200).json(safeUser);
    } catch (error) {
      console.error("Error updating user:", error);
      return res.status(500).json({ message: "Failed to update user" });
    }
  },
  
  DELETE: async (req, res) => {
    const { id } = req.query;
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Only admin can delete users
    if (session.user.role !== 'admin') {
      return res.status(403).json({ message: "Only administrators can delete users" });
    }
    
    try {
      const userRepository = AppDataSource.getRepository(User);
      
      // Find the user to delete
      const user = await userRepository.findOne({
        where: { id }
      });
      
      // Check if user exists
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Prevent deleting the last admin
      if (user.role === 'admin') {
        const adminCount = await userRepository.count({
          where: { role: 'admin' }
        });
        
        if (adminCount <= 1) {
          return res.status(400).json({ message: "Cannot delete the last administrator account" });
        }
      }
      
      // Prevent self-deletion
      if (user.id === session.user.id) {
        return res.status(400).json({ message: "You cannot delete your own account" });
      }
      
      // Create log of deletion for audit purposes
      console.log(`[AUDIT] User ${id} (${user.name}) deleted by ${session.user.name} (${session.user.id}) at ${new Date().toISOString()}`);
      
      // Delete the user
      await userRepository.remove(user);
      
      return res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      return res.status(500).json({ message: "Failed to delete user" });
    }
  }
});