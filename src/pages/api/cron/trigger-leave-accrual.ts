// src/pages/api/cron/trigger-leave-accrual.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { runMonthlyLeaveAccrual } from '@/modules/leave/services/leaveAccrualService';
// Removed non-existent withErrorHandling import
import { withRole, AuthenticatedNextApiHandler } from '@/lib/middleware/withRole';

// Define the core handler logic, assuming authentication and role check passed
const accrualHandler: AuthenticatedNextApiHandler = async (req, res, session) => {
  // Method check should still be done if the middleware doesn't handle it
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    console.log(`API trigger received for monthly leave accrual by user ${session.user?.name} (Role: ${session.user?.role})...`);
    await runMonthlyLeaveAccrual(); // Call the service function
    console.log('API triggered leave accrual process completed successfully.');
    return res.status(200).json({ message: 'Leave accrual process triggered and completed successfully.' });
  } catch (error) {
    console.error('API trigger for leave accrual failed:', error);
    // The service function should handle its own detailed logging and transaction rollback
    return res.status(500).json({ message: 'Failed to run leave accrual process.' });
  }
};

// Wrap the handler with role-based access control
// Only allow users with the 'Admin' role to access this endpoint
export default withRole(['Admin'], accrualHandler); // Removed withErrorHandling wrapper