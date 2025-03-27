import type { NextApiRequest, NextApiResponse } from 'next';
import Leave from '@/modules/leave/models/Leave';
import { Op } from 'sequelize';
// import { defineAssociations } from '@/db/associations';

// TODO: Add authentication and authorization checks (e.g., user can create own, manager/admin can list)
// TODO: Add proper error handling and validation

// Ensure associations are defined
// defineAssociations();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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
}