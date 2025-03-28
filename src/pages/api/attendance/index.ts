// src/pages/api/attendance/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Attendance, Employee } from '@/db'; // Import models
import { Op } from 'sequelize'; // Import Op for filtering operators
import { withAuth, AuthenticatedNextApiHandler } from '@/lib/middleware/withAuth';
// Placeholder: Import role checking middleware if needed
// import { withRole } from '@/lib/middleware/withRole';
// Placeholder: Import validation library/schema if used
// import { attendanceSchema } from '@/lib/validation/attendanceSchema';

// Define the handler logic, wrapped with authentication
const handler: AuthenticatedNextApiHandler = async (req, res, session) => {
  const { method } = req;

  switch (method) {
    case 'GET':
      // Fetch attendance records (potentially filtered)
      try {
        const { employeeId, startDate, endDate, page = 1, limit = 20 } = req.query;
        const requestingUserId = session.user?.id;
        const requestingUserRole = session.user?.role;

        console.log('API GET /api/attendance - Filters:', req.query);

        const whereClause: any = {};
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const offset = (pageNum - 1) * limitNum;

        // Authorization & Filtering Logic
        if (requestingUserRole === 'Employee') {
          // Employee can only see their own records
          const employee = await Employee.findOne({ where: { userId: requestingUserId } });
          if (!employee) return res.status(403).json({ message: 'Forbidden: No employee profile linked.' });
          whereClause.employeeId = employee.id;
        } else if (requestingUserRole === 'DepartmentHead') {
          // Manager sees their department
          const managerDepartmentId = session.user?.departmentId;
          if (!managerDepartmentId) return res.status(403).json({ message: 'Forbidden: Department information missing for manager.' });

          // Filter included Employee records by the manager's department ID
          const includeEmployeeWhereClause = { departmentId: managerDepartmentId };

          // If manager filters by a specific employee, ensure that employee is in their department
          if (employeeId) {
             const targetEmployeeId = parseInt(employeeId as string);
             const employeeInDept = await Employee.findOne({ where: { id: targetEmployeeId, departmentId: managerDepartmentId }, attributes: ['id'] });
             if (!employeeInDept) {
                 // If the specified employee is not in the manager's department, return empty results or error
                 // Returning empty for simplicity here
                 return res.status(200).json({ records: [], totalPages: 0, currentPage: pageNum });
             }
             whereClause.employeeId = targetEmployeeId;
          } else {
             // If no specific employee filter, apply department filter via include
             // This requires modifying the include below
          }
        } else if (requestingUserRole === 'Admin') {
          // Admin can filter by any employee
          if (employeeId) {
            whereClause.employeeId = parseInt(employeeId as string);
          }
        } else {
           return res.status(403).json({ message: 'Forbidden: Insufficient permissions.' });
        }

        // Date Filtering
        if (startDate) whereClause.date = { ...whereClause.date, [Op.gte]: startDate };
        if (endDate) whereClause.date = { ...whereClause.date, [Op.lte]: endDate };


        // Need to define includeEmployeeWhereClause outside the if block to use it here
        let includeEmployeeWhereClause: any = undefined;
        if (requestingUserRole === 'DepartmentHead' && !employeeId) {
             const managerDepartmentId = session.user?.departmentId;
             // Ensure managerDepartmentId is valid before assigning
             if (managerDepartmentId) {
                 includeEmployeeWhereClause = { departmentId: managerDepartmentId };
             }
             // If managerDepartmentId is missing, the earlier check should have returned 403
        }

        const { count, rows: records } = await Attendance.findAndCountAll({
            where: whereClause,
            include: [{
                model: Employee,
                as: 'employee',
                attributes: ['id', 'firstName', 'lastName', 'departmentId'], // Include departmentId
                where: includeEmployeeWhereClause, // Apply department filter here if needed
                required: !!includeEmployeeWhereClause // Make include required only if filtering by department
            }],
            order: [['date', 'DESC'], ['timeIn', 'DESC']],
            limit: limitNum,
            offset: offset,
        });

        const totalPages = Math.ceil(count / limitNum);

        res.status(200).json({ records, totalPages, currentPage: pageNum });
      } catch (error) {
        console.error('Error fetching attendance records:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
      break;

    case 'POST':
      // Record new attendance entry
      try {
        // TODO: Add more robust validation (e.g., using Zod or Yup)
        const { employeeId, date, timeIn, timeOut } = req.body;
        const requestingUserId = session.user?.id;
        const requestingUserRole = session.user?.role;
        const targetEmployeeId = parseInt(employeeId, 10);

        // Authorization Check
        let authorized = false;
        if (requestingUserRole === 'Admin') {
            authorized = true; // Admin can record for anyone
        } else if (requestingUserRole === 'DepartmentHead') {
            // Check if targetEmployeeId is in manager's department
            const managerDepartmentId = session.user?.departmentId;
            if (!managerDepartmentId) return res.status(403).json({ message: 'Forbidden: Department information missing for manager.' });
            const employee = await Employee.findOne({ where: { id: targetEmployeeId, departmentId: managerDepartmentId }, attributes: ['id'] });
            if (employee) {
                authorized = true; // Employee found in manager's department
            }
        } else if (requestingUserRole === 'Employee') {
            // Employee can only record for themselves
            const employee = await Employee.findOne({ where: { userId: requestingUserId } });
            if (employee && employee.id === targetEmployeeId) {
                authorized = true;
            }
        }

        if (!authorized) {
             return res.status(403).json({ message: 'Forbidden: You cannot record attendance for this employee.' });
        }


        if (!targetEmployeeId || !date || !timeIn) {
          return res.status(400).json({ message: 'Missing required fields: employeeId, date, timeIn' });
        }

        // Basic format/date check (could use a library like date-fns or moment)
        const timeRegex = /^\d{2}:\d{2}(:\d{2})?$/; // HH:MM or HH:MM:SS
        if (!timeRegex.test(timeIn) || (timeOut && !timeRegex.test(timeOut))) { // Ensure test() is used for regex check
             return res.status(400).json({ message: 'Invalid time format. Use HH:MM or HH:MM:SS.' });
        }

        // Combine date and time strings to create valid Date objects for the database
        // Ensure the date string is in YYYY-MM-DD format
        const timeInDateTime = new Date(`${date}T${timeIn}Z`); // Assume UTC for consistency
        const timeOutDateTime = timeOut ? new Date(`${date}T${timeOut}Z`) : undefined; // Use undefined instead of null

        // Validate the created dates
        if (isNaN(timeInDateTime.getTime()) || (timeOutDateTime && isNaN(timeOutDateTime.getTime()))) {
            return res.status(400).json({ message: 'Invalid date or time value provided.' });
        }

        // Create record in the database using Date objects
        const newRecord = await Attendance.create({
          employeeId: targetEmployeeId,
          date, // DATEONLY field accepts YYYY-MM-DD string
          timeIn: timeInDateTime, // Pass Date object
          timeOut: timeOutDateTime, // Pass Date object or null
        });

        res.status(201).json(newRecord);
      } catch (error: any) {
        console.error('Error recording attendance:', error);
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

// Apply authentication middleware (and potentially role middleware later)
export default withAuth(handler);
// Example with role check: export default withRole(['Admin', 'DepartmentHead'], handler); // Adjust roles as needed