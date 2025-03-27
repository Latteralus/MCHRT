import type { NextApiRequest, NextApiResponse } from 'next';
import Attendance from '@/modules/attendance/models/Attendance';
import { Op } from 'sequelize'; // Import Op for filtering
import { withRole } from '@/lib/middleware/withRole'; // Import withRole
import { AuthenticatedNextApiHandler } from '@/lib/middleware/withAuth'; // Import handler type
// import { defineAssociations } from '@/db/associations';

// TODO: Add more granular authorization (e.g., Dept Head for own dept, Employee for self?)
// TODO: Add proper error handling and validation

// Ensure associations are defined
// defineAssociations();

// Define the core handler logic expecting authentication and session
const handler: AuthenticatedNextApiHandler = async (req, res, session) => {
  const { method } = req;

  switch (method) {
    case 'GET':
      // Handle GET request - List attendance records
      try {
        // TODO: Add more robust filtering (date range, employeeId, etc.)
        const { employeeId, date } = req.query;
        const whereClause: any = {};
        if (employeeId) whereClause.employeeId = parseInt(employeeId as string, 10);
        if (date) whereClause.date = new Date(date as string); // Assumes date is YYYY-MM-DD

        const attendanceRecords = await Attendance.findAll({
            where: whereClause,
            // TODO: Add pagination, sorting
            order: [['date', 'DESC'], ['timeIn', 'ASC']]
        });
        res.status(200).json(attendanceRecords);
      } catch (error) {
        console.error('Error fetching attendance records:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
      break;

    case 'POST':
      // Handle POST request - Create a new attendance record
      try {
        const { employeeId, date, timeIn, timeOut } = req.body;

        // Basic validation
        if (!employeeId || !date) {
          return res.status(400).json({ message: 'Employee ID and date are required' });
        }

        // TODO: Add validation for date/time formats
        // TODO: Check for duplicate entries for the same employee/date?

        const newRecord = await Attendance.create({
          employeeId,
          date: new Date(date), // Ensure date is stored correctly
          timeIn: timeIn ? new Date(timeIn) : undefined,
          timeOut: timeOut ? new Date(timeOut) : undefined,
        });
        res.status(201).json(newRecord);
      } catch (error: any) {
        console.error('Error creating attendance record:', error);
        // Handle potential foreign key constraint errors
        res.status(500).json({ message: 'Internal Server Error' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

// Wrap the handler with the RBAC middleware, allowing Admins and Department Heads
export default withRole(['Admin', 'DepartmentHead'], handler);