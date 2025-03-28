// src/pages/api/attendance/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import Attendance, { AttendanceAttributes } from '@/modules/attendance/models/Attendance'; // Import Attendance model and attributes
import Employee from '@/modules/employees/models/Employee'; // Import Employee model
import { withAuth, AuthenticatedNextApiHandler } from '@/lib/middleware/withAuth';
// Placeholder: Import authorization middleware if needed (e.g., check if user owns the record or is manager/admin)
// import { withAttendanceAccess } from '@/lib/middleware/withAttendanceAccess'; // Example
import { UserRole } from '@/lib/middleware/withRole'; // Import UserRole

// Define an interface that includes the associated employee
interface AttendanceWithEmployee extends Attendance {
  employee?: Employee | null; // Define the included association
}

// Define the handler logic, wrapped with authentication
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

  const requestingUserId = session.user?.id;
  const requestingUserRole = session.user?.role as UserRole | undefined; // Add type assertion for role
  let attendanceRecord: AttendanceWithEmployee | null = null; // Use the extended type

  // Fetch the record first for authorization checks
  try {
      attendanceRecord = await Attendance.findByPk(recordId, {
          include: [{ model: Employee, as: 'employee', attributes: ['id', 'userId', 'departmentId'] }]
      });
  } catch (error) {
      console.error(`Error fetching attendance record ${recordId} for auth check:`, error);
      return res.status(500).json({ message: 'Internal Server Error' });
  }

  if (!attendanceRecord) {
    return res.status(404).json({ message: 'Attendance record not found' });
  }

  // Authorization Check
  let authorized = false;
  if (requestingUserRole === 'Admin') {
      authorized = true; // Admin can access/modify any record
  } else if (requestingUserRole === 'DepartmentHead') {
      // Check if the employee belongs to the manager's department
      const managerDepartmentId = session.user?.departmentId;
      if (!managerDepartmentId) return res.status(403).json({ message: 'Forbidden: Department information missing for manager.' });
      if (attendanceRecord.employee?.departmentId === managerDepartmentId) {
          authorized = true;
      }
  } else if (requestingUserRole === 'Employee') {
      // Check if the record belongs to the logged-in user's employee profile
      if (attendanceRecord.employee?.userId === requestingUserId) {
          authorized = true;
      }
  }

  if (!authorized) {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to access this attendance record.' });
  }

  // Now proceed with the specific method handler
  switch (method) {
    case 'GET':
      // Handle GET request - Record already fetched and authorized
      // Re-fetch with different includes if necessary, or just return the fetched record
      try {
         // Optionally re-fetch with different includes if needed for GET specifically
         const detailedRecord = await Attendance.findByPk(recordId, {
             include: [{ model: Employee, as: 'employee', attributes: ['id', 'firstName', 'lastName'] }]
         });
         if (!detailedRecord) { // Should not happen if auth passed, but good check
             return res.status(404).json({ message: 'Attendance record not found' });
         }
        res.status(200).json(detailedRecord);
      } catch (error) {
        console.error(`Error fetching detailed attendance record ${recordId}:`, error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
      break;

    case 'PUT':
      // Handle PUT request - Update an attendance record by ID
      // Record already fetched and authorized in `attendanceRecord`
      try {
        // TODO: Add more robust validation (e.g., Zod/Yup)
        const { timeIn, timeOut, date } = req.body; // Get fields to update

        // Basic format check (could use a library like date-fns or moment)
        const timeRegex = /^\d{2}:\d{2}(:\d{2})?$/; // HH:MM or HH:MM:SS
        if ((timeIn && !timeRegex.test(timeIn)) || (timeOut && !timeRegex.test(timeOut))) {
             return res.status(400).json({ message: 'Invalid time format. Use HH:MM or HH:MM:SS.' });
        }
        // Add date validation if date can be updated

        // Prepare update data, converting times to Date objects
        const updateData: Partial<AttendanceAttributes> = {}; // Use Attributes interface
        const recordDate = attendanceRecord.date; // Get the date from the existing record

        if (date) {
             // TODO: Add validation for date format if allowing date updates
             updateData.date = date;
        }

        if (timeIn) {
            const timeInDateTime = new Date(`${recordDate}T${timeIn}Z`); // Combine with record's date
            if (isNaN(timeInDateTime.getTime())) return res.status(400).json({ message: 'Invalid timeIn value provided.' });
            updateData.timeIn = timeInDateTime;
        }

        // Allow setting timeOut to null/undefined to clear it, or update it
        if (timeOut !== undefined) {
            if (timeOut === null || timeOut === '') {
                updateData.timeOut = undefined; // Use undefined to clear, as model expects Date | undefined
            } else {
                const timeOutDateTime = new Date(`${recordDate}T${timeOut}Z`); // Combine with record's date
                if (isNaN(timeOutDateTime.getTime())) return res.status(400).json({ message: 'Invalid timeOut value provided.' });
                updateData.timeOut = timeOutDateTime;
            }
        }


        // Perform the update on the already fetched & authorized record
        await attendanceRecord.update(updateData);
        res.status(200).json(attendanceRecord);

      } catch (error: any) {
        console.error(`Error updating attendance record ${recordId}:`, error);
        if (error.name === 'SequelizeValidationError') {
          return res.status(400).json({ message: 'Validation Error', errors: error.errors });
        }
        res.status(500).json({ message: 'Internal Server Error' });
      }
      break;

    case 'DELETE':
      // Handle DELETE request - Delete an attendance record by ID
      // Record already fetched and authorized in `attendanceRecord`
      try {
        // Authorization already performed above

        await attendanceRecord.destroy();
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

// Apply authentication middleware (and potentially specific access middleware)
export default withAuth(handler);
// Example with specific access check: export default withAttendanceAccess(handler);