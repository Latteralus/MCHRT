import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import { getSession } from 'next-auth/react';
import { withAuth, AuthenticatedNextApiHandler } from './withAuth'; // Import the base auth middleware

// Define role types (consider moving to a central types file, e.g., src/types/roles.ts)
export type UserRole = 'Admin' | 'DepartmentHead' | 'Employee';

/**
 * Middleware factory to ensure the user is authenticated and has one of the specified roles.
 * If authenticated and authorized, it passes the session object to the handler.
 * Otherwise, it returns a 401 (Unauthorized) or 403 (Forbidden) error.
 *
 * @param allowedRoles An array of roles allowed to access the route.
 * @param handler The API route handler to wrap.
 * @returns A new handler function with authentication and role check.
 */
export const withRole = (allowedRoles: UserRole[], handler: AuthenticatedNextApiHandler): NextApiHandler => {
  // First, wrap the handler with the basic authentication check
  const authenticatedHandler = withAuth(async (req, res, session) => {
    // User is authenticated, now check the role
    const userRole = session.user?.role as UserRole | undefined; // Role added in [...nextauth].ts callbacks

    if (!userRole) {
      console.warn('User session found but role is missing:', session.user);
      return res.status(403).json({ message: 'Forbidden: User role information is missing.' });
    }

    if (!allowedRoles.includes(userRole)) {
      console.log(`Access denied for user ${session.user?.name} (Role: ${userRole}). Required roles: ${allowedRoles.join(', ')}`);
      return res.status(403).json({ message: 'Forbidden: You do not have permission to access this resource.' });
    }

    // User is authenticated and has an allowed role, call the original handler
    await handler(req, res, session);
  });

  return authenticatedHandler;
};

// Example Usage (in an API route file):
//
// import { withRole, AuthenticatedNextApiHandler } from '@/lib/middleware/withRole';
//
// // Only Admins can access this route
// const handler: AuthenticatedNextApiHandler = async (req, res, session) => {
//   res.status(200).json({ message: `Admin content for ${session.user?.name}` });
// };
//
// export default withRole(['Admin'], handler);
//
// // Admins and Department Heads can access this route
// const anotherHandler: AuthenticatedNextApiHandler = async (req, res, session) => {
//    res.status(200).json({ message: `Manager content for ${session.user?.name}` });
// };
// export default withRole(['Admin', 'DepartmentHead'], anotherHandler);