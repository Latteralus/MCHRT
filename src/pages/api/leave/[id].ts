import type { NextApiRequest, NextApiResponse } from 'next';
import Leave from '@/modules/leave/models/Leave';
import { withRole } from '@/lib/middleware/withRole'; // Import withRole
import { AuthenticatedNextApiHandler } from '@/lib/middleware/withAuth'; // Import handler type
// import { defineAssociations } from '@/db/associations';
// import { getSession } from 'next-auth/react'; // To get approver ID

// TODO: Add more granular authorization (employee can view/cancel own, manager/admin can update/delete)
// TODO: Add proper error handling and validation

// Ensure associations are defined
// defineAssociations();

// Define the core handler logic expecting authentication and session
const handler: AuthenticatedNextApiHandler = async (req, res, session) => {
  const { method } = req;
  const { id } = req.query; // Get the leave request ID from the URL path

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Leave Request ID is required' });
  }

  const requestId = parseInt(id, 10);
  if (isNaN(requestId)) {
    return res.status(400).json({ message: 'Invalid Leave Request ID format' });
  }

  let leaveRequest; // To store the found request

  switch (method) {
    case 'GET':
      // Handle GET request - Retrieve a single request by ID
      try {
        leaveRequest = await Leave.findByPk(requestId, {
          // TODO: Include Employee/Approver details if needed
        });
        if (!leaveRequest) {
          return res.status(404).json({ message: 'Leave request not found' });
        }
        // TODO: Check if the requesting user is allowed to view this request
        res.status(200).json(leaveRequest);
      } catch (error) {
        console.error(`Error fetching leave request ${requestId}:`, error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
      break;

    case 'PUT':
      // Handle PUT request - Update a request (e.g., status by manager/admin, or cancel by employee)
      try {
        leaveRequest = await Leave.findByPk(requestId);
        if (!leaveRequest) {
          return res.status(404).json({ message: 'Leave request not found' });
        }

        // TODO: Implement authorization logic based on user role and request status
        // const session = await getSession({ req });
        // const userId = session?.user?.id; // Assuming ID is in session

        const { status, comments } = req.body; // Fields typically updated
        const updateData: Partial<Leave> = {};

        // Only allow certain status transitions based on role and current status
        if (status && ['Approved', 'Rejected', 'Cancelled'].includes(status)) {
           // TODO: Check if user has permission to change to this status
           if (leaveRequest.status === 'Pending') { // Example: Only update if pending
                updateData.status = status;
                updateData.approvedAt = new Date();
                // updateData.approverId = userId; // Set approver ID from session
                if (comments) updateData.comments = comments;
           } else if (status === 'Cancelled' /* && userId === leaveRequest.employeeId */) {
               // Allow employee to cancel their own pending request
               updateData.status = 'Cancelled';
           } else {
               return res.status(403).json({ message: `Cannot change status from ${leaveRequest.status} to ${status}` });
           }
        } else if (status) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        // Allow updating reason if still pending?
        // if (req.body.reason && leaveRequest.status === 'Pending') {
        //     updateData.reason = req.body.reason;
        // }

        await leaveRequest.update(updateData);
        res.status(200).json(leaveRequest); // Return the updated request

      } catch (error: any) {
        console.error(`Error updating leave request ${requestId}:`, error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
      break;

    case 'DELETE':
      // Handle DELETE request - Delete a request (usually only if pending/cancelled?)
      try {
        leaveRequest = await Leave.findByPk(requestId);
        if (!leaveRequest) {
          return res.status(404).json({ message: 'Leave request not found' });
        }

        // TODO: Add authorization - only admin or employee (if pending/cancelled)?
        // if (leaveRequest.status !== 'Pending' && leaveRequest.status !== 'Cancelled') {
        //    return res.status(403).json({ message: 'Cannot delete an approved or rejected request.' });
        // }

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

// Wrap the handler with the RBAC middleware, allowing Admins and Department Heads
// TODO: Add more specific checks inside the handler (e.g., Employee can GET/PUT(cancel) own request)
export default withRole(['Admin', 'DepartmentHead'], handler);