import type { NextApiRequest, NextApiResponse } from 'next';
import Attendance from '@/modules/attendance/models/Attendance';
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
  const { id } = req.query; // Get the attendance record ID from the URL path

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Attendance Record ID is required' });
  }

  const recordId = parseInt(id, 10);
  if (isNaN(recordId)) {
    return res.status(400).json({ message: 'Invalid Attendance Record ID format' });
  }

  let record; // To store the found record

  switch (method) {
    case 'GET':
      // Handle GET request - Retrieve a single record by ID
      try {
        record = await Attendance.findByPk(recordId);
        if (!record) {
          return res.status(404).json({ message: 'Attendance record not found' });
        }
        res.status(200).json(record);
      } catch (error) {
        console.error(`Error fetching attendance record ${recordId}:`, error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
      break;

    case 'PUT':
      // Handle PUT request - Update a record by ID
      try {
        record = await Attendance.findByPk(recordId);
        if (!record) {
          return res.status(404).json({ message: 'Attendance record not found' });
        }

        // Only allow updating certain fields, e.g., timeIn, timeOut
        const { timeIn, timeOut } = req.body;
        const updateData: Partial<Attendance> = {};

        // Add validation for time formats if needed
        if (timeIn !== undefined) updateData.timeIn = timeIn ? new Date(timeIn) : undefined;
        if (timeOut !== undefined) updateData.timeOut = timeOut ? new Date(timeOut) : undefined;

        // Prevent changing employeeId or date via this route?
        // if (req.body.employeeId || req.body.date) {
        //   return res.status(400).json({ message: 'Cannot change employeeId or date via update.' });
        // }

        await record.update(updateData);
        res.status(200).json(record); // Return the updated record

      } catch (error: any) {
        console.error(`Error updating attendance record ${recordId}:`, error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
      break;

    case 'DELETE':
      // Handle DELETE request - Delete a record by ID
      try {
        record = await Attendance.findByPk(recordId);
        if (!record) {
          return res.status(404).json({ message: 'Attendance record not found' });
        }

        await record.destroy();
        res.status(204).end(); // No content to send back
      } catch (error) {
        console.error(`Error deleting attendance record ${recordId}:`, error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

// Wrap the handler with the RBAC middleware, allowing Admins and Department Heads
// TODO: Add more specific checks inside the handler (e.g., Dept Head only for own dept, Employee for self)
export default withRole(['Admin', 'DepartmentHead'], handler);