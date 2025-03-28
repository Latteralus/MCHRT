// src/pages/api/leave/[id]/reject.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Leave, Employee } from '@/db'; // Import models from central db index
import { withAuth, AuthenticatedNextApiHandler } from '@/lib/middleware/withAuth';
// Placeholder: Import role checking middleware or perform checks manually

// Define the handler logic, wrapped with authentication
const handler: AuthenticatedNextApiHandler = async (req, res, session): Promise<void> => { // Explicit return type
  // Only allow POST (or PUT) method for this action
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`); // No return
    return; // Add return void
  }

  const { id } = req.query; // Get the leave request ID from the URL path
  const requestingUserId = session.user?.id; // ID of the user performing the action
  const requestingUserRole = session.user?.role;

  if (!id || typeof id !== 'string') {
    res.status(400).json({ message: 'Leave Request ID is required' }); return; // Add return void
  }

  const requestId = parseInt(id, 10);
  if (isNaN(requestId)) {
    res.status(400).json({ message: 'Invalid Leave Request ID format' }); return; // Add return void
  }

  // Authorization Check: Only Admins or Department Heads should reject
  if (requestingUserRole !== 'Admin' && requestingUserRole !== 'DepartmentHead') {
    res.status(403).json({ message: 'Forbidden: You do not have permission to reject leave requests.' }); return; // Add return void
  }

  try {
    const leaveRequest = await Leave.findByPk(requestId, {
       include: [{ model: Employee, as: 'employee', attributes: ['id', 'departmentId'] }] // Include employee for dept check
    });

    if (!leaveRequest) {
      res.status(404).json({ message: 'Leave request not found' }); return; // Add return void
    }

    // Department Head Check: Ensure they manage the employee's department
    if (requestingUserRole === 'DepartmentHead') {
      const managerDepartmentId = session.user?.departmentId; // Assuming departmentId is in session for managers
      if (!managerDepartmentId || leaveRequest.employee?.departmentId !== managerDepartmentId) {
         res.status(403).json({ message: 'Forbidden: You can only reject requests for employees in your department.' }); return; // Add return void
      }
    }

    // Check if the request is actually pending
    if (leaveRequest.status !== 'Pending') {
      res.status(400).json({ message: `Cannot reject a request with status: ${leaveRequest.status}` }); return; // Add return void
    }

    // Update the leave request
    await leaveRequest.update({
      status: 'Rejected',
      approverId: requestingUserId, // Set the rejecter ID
      approvedAt: new Date(), // Set the rejection timestamp (using same field for simplicity)
      comments: req.body.comments || null // Optional: Require/allow comments for rejection
    });

    // TODO: Trigger notification to the employee?

    res.status(200).json(leaveRequest); // Return the updated request

  } catch (error: any) {
    console.error(`Error rejecting leave request ${requestId}:`, error);
    res.status(500).json({ message: 'Internal Server Error' }); // No return
  }
};

// Apply authentication middleware
export default withAuth(handler);