import type { NextApiRequest, NextApiResponse } from 'next';
import Leave from '@/modules/leave/models/Leave';
import { Op } from 'sequelize';
import { withRole } from '@/lib/middleware/withRole'; // Import withRole
import { AuthenticatedNextApiHandler } from '@/lib/middleware/withAuth'; // Import handler type
// import { defineAssociations } from '@/db/associations';

// TODO: Add more granular authorization (e.g., user can create own, manager/admin can list/filter)
// TODO: Add proper error handling and validation

// Ensure associations are defined
// defineAssociations();

// Define the core handler logic expecting authentication and session
const handler: AuthenticatedNextApiHandler = async (req, res, session) => {
  const { method } = req;

  switch (method) {
    case 'GET':
      // Handle GET request - List leave requests
      try {
        // TODO: Add filtering (employeeId, status, date range), pagination, sorting
        const { employeeId, status } = req.query;
        const whereClause: any = {};
        if (employeeId) whereClause.employeeId = parseInt(employeeId as string, 10);
        if (status) whereClause.status = status as string;

        const leaveRequests = await Leave.findAll({
            where: whereClause,
            order: [['startDate', 'DESC']]
            // TODO: Include Employee/Approver details if needed
            // include: [
            //   { model: Employee, as: 'employee', attributes: ['firstName', 'lastName'] },
            //   { model: User, as: 'approver', attributes: ['username'] }
            // ]
        });
        res.status(200).json(leaveRequests);
      } catch (error) {
        console.error('Error fetching leave requests:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
      break;

    case 'POST':
      // Handle POST request - Create a new leave request
      try {
        // TODO: Get employeeId from session/authenticated user, not request body?
        const { employeeId, startDate, endDate, leaveType, reason } = req.body;

        // Basic validation
        if (!employeeId || !startDate || !endDate || !leaveType) {
          return res.status(400).json({ message: 'Employee ID, start date, end date, and leave type are required' });
        }

        // TODO: Add validation for dates, leave type enum, check for overlapping requests?

        const newRequest = await Leave.create({
          employeeId,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          leaveType,
          reason,
          status: 'Pending', // Default status
        });
        res.status(201).json(newRequest);
      } catch (error: any) {
        console.error('Error creating leave request:', error);
        // Handle potential foreign key constraint errors
        res.status(500).json({ message: 'Internal Server Error' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

// Wrap the handler with the RBAC middleware, allowing all authenticated users for now
// More specific checks (e.g., Employee can only POST for self) should be inside the handler
export default withRole(['Admin', 'DepartmentHead', 'Employee'], handler);