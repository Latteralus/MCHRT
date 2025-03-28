// src/pages/api/cron/trigger-compliance-check.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { checkComplianceExpirations } from '@/modules/compliance/services/expirationService';
import { withRole, AuthenticatedNextApiHandler } from '@/lib/middleware/withRole';

// Define the core handler logic
const complianceCheckHandler: AuthenticatedNextApiHandler = async (req, res, session) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    console.log(`API trigger received for compliance expiration check by user ${session.user?.name} (Role: ${session.user?.role})...`);
    const results = await checkComplianceExpirations(); // Call the service function
    console.log('API triggered compliance check process completed successfully.', results);
    return res.status(200).json({ message: 'Compliance expiration check triggered and completed successfully.', results });
  } catch (error) {
    console.error('API trigger for compliance check failed:', error);
    return res.status(500).json({ message: 'Failed to run compliance expiration check.' });
  }
};

// Wrap the handler with role-based access control
// Only allow users with the 'Admin' role to access this endpoint
export default withRole(['Admin'], complianceCheckHandler);