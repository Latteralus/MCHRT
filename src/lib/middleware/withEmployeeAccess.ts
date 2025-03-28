import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import { getSession } from 'next-auth/react';
import { withAuth, AuthenticatedNextApiHandler } from './withAuth';
import type { UserRole } from './withRole'; // Assuming roles are defined here or centrally
import { Employee } from '@/db'; // Import Employee model from central db index

/**
 * Middleware factory to ensure the user has appropriate access to a specific employee record.
 * Checks for Admin role, Department Head scope, or self-access.
 * Assumes employee ID is passed as req.query.id.
 *
 * @param handler The API route handler to wrap.
 * @returns A new handler function with authentication and employee access check.
 */
export const withEmployeeAccess = (handler: AuthenticatedNextApiHandler): NextApiHandler => {
  // Wrap with basic authentication first
  return withAuth(async (req, res, session) => {
    const userId = session.user?.id; // Assuming user ID is in session
    const userRole = session.user?.role as UserRole | undefined;
    const userDepartmentId = session.user?.departmentId; // Assuming department ID is in session for relevant roles

    const targetEmployeeId = req.query.id as string | undefined;

    if (!targetEmployeeId) {
      // This middleware requires an employee ID in the query
      console.warn('withEmployeeAccess middleware used on a route without req.query.id');
      return res.status(400).json({ message: 'Bad Request: Employee ID missing.' });
    }

    if (!userRole || !userId) {
      console.error('User session missing ID or Role in withEmployeeAccess');
      return res.status(403).json({ message: 'Forbidden: User information incomplete.' });
    }

    // Rule 1: Admins have full access
    if (userRole === 'Admin') {
      console.log(`Admin access granted for user ${userId} to employee ${targetEmployeeId}`);
      return handler(req, res, session); // Proceed to handler
    }

    // Fetch the target employee once for subsequent checks
    let targetEmployee: Employee | null = null;
    try {
      targetEmployee = await Employee.findByPk(targetEmployeeId, {
        attributes: ['id', 'departmentId', 'userId'], // Fetch necessary fields, assuming 'userId' exists for self-check
      });
    } catch (error) {
      console.error(`Error fetching employee ${targetEmployeeId} for access check:`, error);
      return res.status(500).json({ message: 'Internal Server Error during access check.' });
    }

    if (!targetEmployee) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    // Rule 2: Employees can access their own record
    // Assumes Employee model has a 'userId' field linking to the User model's ID (session.user.id)
    // This association needs to be defined in models/associations if not already present.
    if (userRole === 'Employee') {
      if (targetEmployee.userId === userId) { // Check if the employee's linked user ID matches the session user ID
        console.log(`Self-access granted for user ${userId} to employee ${targetEmployeeId}`);
        return handler(req, res, session); // Proceed to handler
      } else {
        console.log(`Self-access denied for user ${userId} trying to access employee ${targetEmployeeId}`);
        // Fall through to the final denial message
      }
    }

    // Rule 3: Department Heads can access employees in their department
    if (userRole === 'DepartmentHead') {
      if (!userDepartmentId) {
        console.warn(`DepartmentHead ${userId} missing departmentId in session.`);
        return res.status(403).json({ message: 'Forbidden: Department information missing.' });
      }

      const targetDepartmentId = targetEmployee.departmentId;

      if (targetDepartmentId === userDepartmentId) {
        console.log(`DepartmentHead access granted for user ${userId} (Dept: ${userDepartmentId}) to employee ${targetEmployeeId} (Dept: ${targetDepartmentId})`);
        return handler(req, res, session); // Proceed to handler
      } else {
        console.log(`DepartmentHead access denied for user ${userId} (Dept: ${userDepartmentId}) to employee ${targetEmployeeId} (Dept: ${targetDepartmentId})`);
        // Fall through to the final denial message
      }
    }

    // If none of the above rules match, deny access
    console.log(`Access denied for user ${userId} (Role: ${userRole}) to employee ${targetEmployeeId}. No matching access rule.`);
    return res.status(403).json({ message: 'Forbidden: You do not have permission to access this employee record.' });
  });
};

// Example Usage (in an API route file like src/pages/api/employees/[id].ts):
//
// import { withEmployeeAccess, AuthenticatedNextApiHandler } from '@/lib/middleware/withEmployeeAccess';
//
// const handler: AuthenticatedNextApiHandler = async (req, res, session) => {
//   const employeeId = req.query.id;
//   // Access granted, proceed with fetching/updating employee data
//   res.status(200).json({ message: `Access granted to employee ${employeeId} for user ${session.user?.name}` });
// };
//
// export default withEmployeeAccess(handler);