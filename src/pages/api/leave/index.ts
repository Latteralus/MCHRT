// src/pages/api/leave/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Leave, Employee, User } from '@/db'; // Import models from central db index
import { Op } from 'sequelize'; // Import Op for filtering operators
import { withAuth, AuthenticatedNextApiHandler } from '@/lib/middleware/withAuth';
// Placeholder: Import role checking middleware if needed
// import { withRole } from '@/lib/middleware/withRole';
// Placeholder: Import validation library/schema if used
// import { leaveRequestSchema } from '@/lib/validation/leaveSchema';
import { checkLeaveBalance } from '@/modules/leave/services/leaveBalanceService'; // Import balance check function
import { calculateLeaveDuration } from '@/lib/dates/durationUtil'; // Import duration calculation

// Define the handler logic, wrapped with authentication
const handler: AuthenticatedNextApiHandler = async (req, res, session) => {
  const { method } = req;
  const requestingUserId = session.user?.id; // ID of the logged-in user
  const requestingUserRole = session.user?.role;

  switch (method) {
    case 'GET':
      // Fetch leave requests (potentially filtered)
      try {
        // TODO: Implement filtering based on query parameters (e.g., employeeId, status, dateRange)
        // TODO: Implement pagination
        // TODO: Add authorization - who can view which requests?
        //       - Employee: View own requests
        //       - DepartmentHead: View requests for employees in their department
        //       - Admin: View all requests

        console.log('API GET /api/leave - Filters:', req.query);

        const { employeeId, status, startDate, endDate, page = 1, limit = 20 } = req.query;
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const offset = (pageNum - 1) * limitNum;

        // Build filter conditions based on role and query params
        const whereClause: any = {};
        let includeEmployeeWhereClause: any = {}; // For filtering based on manager's department

        if (requestingUserRole === 'Employee') {
          // Employee sees only their own requests
          const employee = await Employee.findOne({ where: { userId: requestingUserId }, attributes: ['id'] });
          if (!employee) return res.status(403).json({ message: 'Forbidden: No employee profile linked.' });
          whereClause.employeeId = employee.id;
        } else if (requestingUserRole === 'DepartmentHead') {
          // Manager sees requests for their department
          const managerDepartmentId = session.user?.departmentId;
          if (!managerDepartmentId) return res.status(403).json({ message: 'Forbidden: Department information missing for manager.' });

          // Filter included Employee records by the manager's department ID
          includeEmployeeWhereClause = { departmentId: managerDepartmentId }; // Assign directly

          // Allow manager to further filter by a specific employee within their dept
          if (employeeId) {
             const targetEmployeeId = parseInt(employeeId as string);
             // Verify the specified employee is in the manager's department before applying filter
             const employeeInDept = await Employee.findOne({ where: { id: targetEmployeeId, departmentId: managerDepartmentId }, attributes: ['id'] });
             if (!employeeInDept) {
                 // If employee not in dept, return empty results as they can't see this specific employee's requests
                 return res.status(200).json({ requests: [], totalPages: 0, currentPage: pageNum });
             }
             whereClause.employeeId = targetEmployeeId; // Apply the specific employee filter
          }
          // If no employeeId filter, the includeEmployeeWhereClause handles department filtering
        } else if (requestingUserRole === 'Admin') {
          // Admin can filter by any employee
          if (employeeId) {
            whereClause.employeeId = parseInt(employeeId as string);
          }
        } else {
           return res.status(403).json({ message: 'Forbidden: Insufficient permissions.' });
        }

        // Apply status filter
        if (status) {
            whereClause.status = status;
        }
        // Apply date range filtering (on startDate)
        if (startDate) whereClause.startDate = { ...whereClause.startDate, [Op.gte]: startDate };
        if (endDate) whereClause.startDate = { ...whereClause.startDate, [Op.lte]: endDate }; // Filter by start date within range


        const { count, rows: requests } = await Leave.findAndCountAll({
            where: whereClause,
            include: [ // Include associated data for display and filtering
                {
                    model: Employee,
                    as: 'employee',
                    attributes: ['id', 'firstName', 'lastName', 'departmentId'],
                    where: Object.keys(includeEmployeeWhereClause).length > 0 ? includeEmployeeWhereClause : undefined, // Apply department filter here
                    required: Object.keys(includeEmployeeWhereClause).length > 0 // Make include required if filtering by department
                },
                { model: Employee, as: 'employee', attributes: ['id', 'firstName', 'lastName'] },
                { model: User, as: 'approver', attributes: ['id', 'username'] } // Include approver username
            ],
            order: [['startDate', 'DESC']],
            // limit: limit ? parseInt(limit as string) : 10,
            offset: offset,
        });

        const totalPages = Math.ceil(count / limitNum);

        res.status(200).json({ requests, totalPages, currentPage: pageNum });
      } catch (error) {
        console.error('Error fetching leave requests:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
      break;

    case 'POST':
      // Submit new leave request
      try {
        // TODO: Add validation for request body
        const { employeeId, startDate, endDate, leaveType, reason } = req.body;

        // Authorization: Ensure the request is for the logged-in user OR user is Admin/Manager submitting for someone else
        const targetEmployeeId = parseInt(employeeId, 10);
        let employeeForRequest: Employee | null = null;

        if (!targetEmployeeId || isNaN(targetEmployeeId)) {
             return res.status(400).json({ message: 'Invalid or missing employeeId.' });
        }

        if (requestingUserRole === 'Employee') {
            // Find employee linked to the logged-in user
            employeeForRequest = await Employee.findOne({ where: { userId: requestingUserId }, attributes: ['id'] });
            // Ensure the request is for their own employee ID
            if (!employeeForRequest || employeeForRequest.id !== targetEmployeeId) {
                 return res.status(403).json({ message: 'Forbidden: You can only submit leave requests for yourself.' });
            }
        } else if (requestingUserRole === 'Admin' || requestingUserRole === 'DepartmentHead') {
            // Check if the target employee exists
            employeeForRequest = await Employee.findByPk(targetEmployeeId, { attributes: ['id', 'departmentId'] });
            if (!employeeForRequest) {
                return res.status(404).json({ message: `Employee with ID ${targetEmployeeId} not found.` });
            }
            // If Dept Head, ensure employee is in their department
            if (requestingUserRole === 'DepartmentHead') {
                 const managerDepartmentId = session.user?.departmentId;
                 if (!managerDepartmentId) {
                      return res.status(403).json({ message: 'Forbidden: Department information missing for manager.' });
                 }
                 if (employeeForRequest.departmentId !== managerDepartmentId) {
                     return res.status(403).json({ message: 'Forbidden: You can only submit requests for employees in your department.' });
                 }
            }
        } else {
             // Should not happen if basic auth passed, but good check
             return res.status(403).json({ message: 'Forbidden: Insufficient permissions.' });
        }


        if (!startDate || !endDate || !leaveType) {
          return res.status(400).json({ message: 'Missing required fields: startDate, endDate, leaveType' });
        }

        // Basic date/validation
        if (new Date(endDate) < new Date(startDate)) {
            return res.status(400).json({ message: 'End Date cannot be before Start Date.' });
        }

        // TODO: Check for overlapping leave requests?

        // Calculate requested duration and check balance
        const requestedDuration = calculateLeaveDuration(startDate, endDate);
        if (requestedDuration <= 0) {
             return res.status(400).json({ message: 'Invalid leave dates provided.' });
        }
        const hasSufficientBalance = await checkLeaveBalance(targetEmployeeId, leaveType, requestedDuration);
        if (!hasSufficientBalance) {
            return res.status(400).json({ message: `Insufficient ${leaveType} leave balance for the requested duration (${requestedDuration} days/units).` });
        }

        // Create the leave request
        const newRequest = await Leave.create({
          employeeId: targetEmployeeId,
          startDate,
          endDate,
          leaveType,
          reason: reason || null,
          status: 'Pending', // Initial status
          // approverId will be set upon approval/rejection
        });

        // TODO: Trigger notification to manager?

        res.status(201).json(newRequest);
      } catch (error: any) {
        console.error('Error submitting leave request:', error);
        if (error.name === 'SequelizeValidationError') {
          return res.status(400).json({ message: 'Validation Error', errors: error.errors });
        }
        res.status(500).json({ message: 'Internal Server Error' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

// Apply authentication middleware
export default withAuth(handler);