import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import { getSession } from 'next-auth/react';
import type { Session } from 'next-auth'; // Import Session type for clarity

// Define and export a type for API handlers that receive session info
export type AuthenticatedNextApiHandler = (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session // Use the imported Session type
) => void | Promise<void>;


/**
 * Middleware to ensure the user is authenticated.
 * If authenticated, it passes the session object to the handler.
 * If not authenticated, it returns a 401 Unauthorized error.
 *
 * @param handler The API route handler to wrap.
 * @returns A new handler function with authentication check.
 */
export const withAuth = (handler: AuthenticatedNextApiHandler): NextApiHandler => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getSession({ req });

    if (!session) {
      return res.status(401).json({ message: 'Unauthorized: Authentication required.' });
    }

    // User is authenticated, call the original handler with the session
    try {
      await handler(req, res, session);
    } catch (error) {
      // Basic error handling for the wrapped handler
      console.error('Error in authenticated API handler:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
};

// Example Usage (in an API route file):
//
// import { withAuth, AuthenticatedNextApiHandler } from '@/lib/middleware/withAuth';
//
// const handler: AuthenticatedNextApiHandler = async (req, res, session) => {
//   // session object is available here
//   res.status(200).json({ message: `Hello ${session.user?.name}` });
// };
//
// export default withAuth(handler);