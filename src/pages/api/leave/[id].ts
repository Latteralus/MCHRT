// src/pages/api/leave/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Leave, Employee, User } from '@/db'; // Import models from central db index
import { withAuth, AuthenticatedNextApiHandler } from '@/lib/middleware/withAuth';
// Placeholder: Import authorization middleware if needed (e.g., check ownership or manager status)
// import { withLeaveAccess } from '@/lib/middleware/withLeaveAccess'; // Example

// Define the handler logic, wrapped with authentication
const handler: AuthenticatedNextApiHandler = async (req, res, session) => {
  const { method } = req;
  const { id } = req.query; // Get the leave request ID from the URL path
  const requestingUserId = session.user?.id;
  const requestingUserRole = session.user?.role;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Leave Request ID is required' });
  }

  const requestId = parseInt(id, 10);
  if (isNaN(requestId)) {
    return res.status(400).json({ message: 'Invalid Leave Request ID format' });
  }

  let leaveRequest; // To store the found record

  // Fetch the request first for authorization checks
  try {
    leaveRequest = await Leave.findByPk(requestId, {
      include: [{ model: Employee, as: 'employee', attributes: ['id', 'userId', 'departmentId'] }] // Include employee info for checks
    });
  } catch (error) {
     console.error(`Error fetching leave request ${requestId} for auth check:`, error);
     return res.status(500).json({ message: 'Internal Server Error' });
  }

  if (!leaveRequest) {
    return res.status(404).json({ message: 'Leave request not found' });
  }

  // Authorization Check:
  let authorized = false;
  if (requestingUserRole === 'Admin') {
    authorized = true; // Admins can access any request
  } else if (requestingUserRole === 'DepartmentHead') {
    // Check if the employee belongs to the manager's department
    const managerDepartmentId = session.user?.departmentId;
     if (!managerDepartmentId) {
         // If manager has no department ID in session, they shouldn't be able to access specific requests
         console.warn(`DepartmentHead ${requestingUserId} missing departmentId in session during access check for leave request ${requestId}.`);
         // authorized remains false
     } else if (leaveRequest.employee?.departmentId === managerDepartmentId) {
      authorized = true;
    }
  } else if (requestingUserRole === 'Employee') {
    // Check if the request belongs to the logged-in user's employee profile
    if (leaveRequest.employee?.userId === requestingUserId) {
      authorized = true;
    }
  }

  if (!authorized) {
    return res.status(403).json({ message: 'Forbidden: You do not have permission to access this leave request.' });
  }


  switch (method) {
    case 'GET':
      // Handle GET request - Record already fetched and authorized in `leaveRequest`
      // Return the fetched record (which includes basic employee info for auth)
      // If more details needed specifically for GET, re-fetch as below, otherwise just return `leaveRequest`
      try {
         // Example: Re-fetch with Approver details if not included in initial auth fetch
         const detailedRequest = await Leave.findByPk(requestId, {
            include: [
                { model: Employee, as: 'employee', attributes: ['id', 'firstName', 'lastName', 'userId', 'departmentId'] }, // Keep fields needed for auth + display
                { model: User, as: 'approver', attributes: ['id', 'name'] } // Add approver details
            ]
         });
         if (!detailedRequest) { // Should not happen if auth passed, but good check
             return res.status(404).json({ message: 'Leave request not found' });
         }
        res.status(200).json(detailedRequest); // Return the potentially more detailed record
      } catch (error) {
        console.error(`Error fetching detailed leave request ${requestId}:`, error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
      break;

    case 'PUT':
      // Handle PUT request - Update a leave request
      // Record already fetched and authorized in `leaveRequest`
      try {
        // Stricter check: Only owner or Admin can update, and only if Pending
        if (leaveRequest.status !== 'Pending') {
            return res.status(400).json({ message: 'Cannot update a request that is not Pending.' });
        }
        if (requestingUserRole !== 'Admin' && leaveRequest.employee?.userId !== requestingUserId) {
             return res.status(403).json({ message: 'Forbidden: Only the owner or an Admin can update a pending request.' });
        }

        // TODO: Add more robust validation (e.g., Zod/Yup)
        const { startDate, endDate, leaveType, reason } = req.body;

        // Basic date/validation
        if (endDate && startDate && new Date(endDate) < new Date(startDate)) {
            return res.status(400).json({ message: 'End Date cannot be before Start Date.' });
        }

        // Prepare update data
        const updateData: Partial<Leave> = {};
        if (startDate) updateData.startDate = startDate;
        if (endDate) updateData.endDate = endDate;
        if (leaveType) updateData.leaveType = leaveType;
        // Allow reason to be updated or cleared
        if (reason !== undefined) updateData.reason = reason || null; // Allow clearing reason


        // Perform the update on the already fetched & authorized record
        await leaveRequest.update(updateData);
        res.status(200).json(leaveRequest);

      } catch (error: any) {
        console.error(`Error updating leave request ${requestId}:`, error);
        if (error.name === 'SequelizeValidationError') {
          return res.status(400).json({ message: 'Validation Error', errors: error.errors });
        }
        res.status(500).json({ message: 'Internal Server Error' });
      }
      break;

    case 'DELETE':
      // Handle DELETE request - Delete a leave request
      // Record already fetched and authorized in `leaveRequest`
      try {
         // Stricter check: Only owner or Admin can delete, and only if Pending
         if (leaveRequest.status !== 'Pending') {
            return res.status(400).json({ message: 'Cannot delete a request that is not Pending.' });
        }
        if (requestingUserRole !== 'Admin' && leaveRequest.employee?.userId !== requestingUserId) {
             return res.status(403).json({ message: 'Forbidden: Only the owner or an Admin can delete a pending request.' });
        }

        // Perform the delete on the already fetched & authorized record
        await leaveRequest.destroy();
        res.status(204).end(); // No content to send back
      } catch (error) {
        console.error(`Error deleting leave request ${requestId}:`, error);
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
// Example: export default withLeaveAccess(handler);