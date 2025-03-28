// src/pages/api/leave/[id]/approve.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Leave, Employee, User, sequelize } from '@/db'; // Import models and sequelize instance
import { withAuth, AuthenticatedNextApiHandler } from '@/lib/middleware/withAuth';
import { deductLeaveBalance } from '@/modules/leave/services/leaveBalanceService'; // Import balance deduction function
import { calculateLeaveDuration } from '@/lib/dates/durationUtil'; // Import duration calculation
// Placeholder: Import role checking middleware or perform checks manually
// import { withRole } from '@/lib/middleware/withRole';

// Define the handler logic, wrapped with authentication
const handler: AuthenticatedNextApiHandler = async (req, res, session): Promise<void> => { // Explicit return type
  // Only allow POST (or PUT) method for this action
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`); // Remove return
    return; // Add return void
  }

  const { id } = req.query; // Get the leave request ID from the URL path
  const requestingUserId = session.user?.id; // ID of the user performing the action
  const requestingUserRole = session.user?.role;

  if (!id || typeof id !== 'string') {
    res.status(400).json({ message: 'Leave Request ID is required' }); return;
  }

  const requestId = parseInt(id, 10);
  if (isNaN(requestId)) {
    res.status(400).json({ message: 'Invalid Leave Request ID format' }); return;
  }

  // Authorization Check: Only Admins or Department Heads should approve
  if (requestingUserRole !== 'Admin' && requestingUserRole !== 'DepartmentHead') {
    res.status(403).json({ message: 'Forbidden: You do not have permission to approve leave requests.' }); return;
  }

  try {
    const leaveRequest = await Leave.findByPk(requestId, {
       include: [{ model: Employee, as: 'employee', attributes: ['id', 'departmentId'] }] // Include employee for dept check
    });

    if (!leaveRequest) {
      res.status(404).json({ message: 'Leave request not found' }); return;
    }

    // Department Head Check: Ensure they manage the employee's department
    if (requestingUserRole === 'DepartmentHead') {
      const managerDepartmentId = session.user?.departmentId; // Assuming departmentId is in session for managers
      if (!managerDepartmentId || leaveRequest.employee?.departmentId !== managerDepartmentId) {
         res.status(403).json({ message: 'Forbidden: You can only approve requests for employees in your department.' }); return;
      }
    }

    // Check if the request is actually pending
    if (leaveRequest.status !== 'Pending') {
      res.status(400).json({ message: `Cannot approve a request with status: ${leaveRequest.status}` }); return;
    }

    // Use a transaction to ensure atomicity
    const transaction = await sequelize.transaction();

    try {
      // Update the leave request status within the transaction
      await leaveRequest.update({
        status: 'Approved',
        approverId: requestingUserId, // Set the approver ID
        approvedAt: new Date(), // Set the approval timestamp
        comments: req.body.comments || leaveRequest.comments || null // Optional: Allow adding comments
      }, { transaction });
// Deduct leave balance within the same transaction
const amountToDeduct = calculateLeaveDuration(leaveRequest.startDate, leaveRequest.endDate);
 if (amountToDeduct <= 0) {
     // This should ideally not happen if dates were validated on submission, but good check
     throw new Error('Invalid leave duration calculated for deduction.');
 }
await deductLeaveBalance(
    leaveRequest.employeeId,
    leaveRequest.leaveType,
          leaveRequest.leaveType,
          amountToDeduct,
          transaction
      );

      // If all successful, commit the transaction
      await transaction.commit();

      // TODO: Trigger notification to the employee?

      // Re-fetch the updated record to include any changes from hooks/triggers if necessary
      const updatedRequest = await Leave.findByPk(requestId, { include: [{ model: Employee, as: 'employee' }, { model: User, as: 'approver' }] });
      res.status(200).json(updatedRequest); // Return the updated request

    } catch (transactionError: any) {
      // If any error occurred within the transaction, roll back
      await transaction.rollback();
      console.error(`Error during leave approval transaction ${requestId}:`, transactionError);
      // Provide specific feedback if it's an insufficient balance error
      if (transactionError.message.includes('Insufficient leave balance')) {
          res.status(400).json({ message: transactionError.message }); return;
      }
      // Re-throw other transaction errors to be caught by the outer catch
      throw transactionError;
    }
  } catch (error: any) { // Outer catch block
    // Catch errors from initial findByPk or re-thrown transaction errors
    console.error(`Error processing approve request ${requestId}:`, error);
    // Avoid sending specific transaction errors if already handled (like insufficient balance)
    if (!res.headersSent) { // Check if response already sent by inner catch
       res.status(500).json({ message: 'Internal Server Error' });
    }
  }
};

// Apply authentication middleware
export default withAuth(handler);