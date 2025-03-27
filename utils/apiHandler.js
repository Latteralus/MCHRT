// utils/apiHandler.js
import { getServerSession } from 'next-auth/next';
// Corrected import: Use named import and path alias
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { dbService } from './dbService'; // Assuming dbService is in the same directory

// ... (rest of the apiHandler code remains the same)
/**
 * A wrapper for API route handlers to provide consistent error handling and response format
 * @param {Object} handlers - Object containing handler functions for different HTTP methods
 * @param {Object} options - Configuration options
 * @param {boolean} options.requireAuth - Whether the endpoint requires authentication
 * @param {Array<string>} options.allowedRoles - Roles allowed to access this endpoint
 */
export const apiHandler = (
  handlers,
  options = { requireAuth: true, allowedRoles: null }
) => {
  return async (req, res) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*'); // Adjust origin policy as needed
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      // Add other headers if needed, e.g., 'X-Requested-With'
      return res.status(204).end(); // Use 204 No Content for OPTIONS
    }

    // Check request method is supported
    const method = req.method?.toLowerCase();
    const handler = handlers[method];
    if (!handler) {
      return res.status(405).json({
        success: false,
        error: `Method ${req.method} not allowed`,
      });
    }

    // Authenticate request if required
    let session = null;
    if (options.requireAuth) {
      try {
        // Use the imported authOptions
        session = await getServerSession(req, res, authOptions);
      } catch (error) {
        console.error("Error fetching session in apiHandler:", error);
        // Return 500 if session fetching fails unexpectedly
         return res.status(500).json({
          success: false,
          error: 'Failed to retrieve session',
        });
      }

      if (!session) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized - Session required',
        });
      }

      // Check allowed roles if specified
      if (options.allowedRoles && options.allowedRoles.length > 0) {
        // Allow if user role is 'admin' (or any other globally allowed role)
        const userRole = session.user?.role; // Use optional chaining
        if (userRole !== 'admin' && !options.allowedRoles.includes(userRole)) {
          return res.status(403).json({
            success: false,
            error: 'Forbidden - Insufficient permissions',
          });
        }
      }

      // Add isMockDb flag in development for UI hints
      // Moved this inside requireAuth block as it depends on session logic potentially
      if (process.env.NODE_ENV === 'development') {
         try {
            session.isMockDb = dbService.isMockDb();
         } catch (dbError) {
            console.error("Error checking dbService state in apiHandler:", dbError);
            session.isMockDb = undefined;
         }
      } else {
         session.isMockDb = false;
      }
    }

    try {
      // Add session to request for handler use (even if auth not strictly required, session might exist)
      req.session = session;

      // Execute the handler function
      await handler(req, res);
    } catch (error) {
      // Log the full error for server-side debugging
      console.error(`API Error [${req.method} ${req.url}]:`, error);

      // Determine status code and message
      // Use ApiError specific status code if available
      const status = error instanceof ApiError ? error.statusCode : 500;
      const message = error.message || 'Internal server error';

      // Basic error response structure
      const errorResponse = {
        success: false,
        error: message,
      };

      // Add stack trace only in development for internal server errors
      if (process.env.NODE_ENV === 'development' && status === 500 && error.stack) {
        errorResponse.stack = error.stack;
      }

      // Ensure headers aren't already sent before sending error response
       if (!res.headersSent) {
           return res.status(status).json(errorResponse);
       } else {
           console.error("Headers already sent, could not send error response JSON.");
           // If headers are sent, we can't send a JSON response, but ensure the response ends.
           res.end();
       }
    }
  };
};

// ... (rest of the helper functions like parseQueryParams, validateDepartmentAccess, etc.)

// Helper function to parse query parameters (Example refinement)
export const parseQueryParams = (query) => {
  const params = {};

  // Handle pagination
  const page = parseInt(query.page, 10);
  const limit = parseInt(query.limit, 10);
  params.page = !isNaN(page) && page > 0 ? page : 1;
  params.limit = !isNaN(limit) && limit > 0 ? limit : 20; // Default limit
  params.skip = (params.page - 1) * params.limit;
  params.take = params.limit; // For TypeORM

  // Handle sorting
  if (query.sortBy) {
      const validSortFields = ['name', 'email', 'role', 'status', 'date', 'createdAt', 'updatedAt', 'firstName', 'lastName', 'hireDate', 'expirationDate', 'startDate', 'endDate', 'requestDate', 'title', 'documentType']; // Add valid fields
      const safeField = validSortFields.includes(query.sortBy) ? query.sortBy : 'createdAt'; // Default sort field
      const safeOrder = query.order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      params.order = { [safeField]: safeOrder };
  } else {
      params.order = { createdAt: 'DESC' }; // Default sort order
  }


  // Handle search
  if (query.search && typeof query.search === 'string') {
    params.search = query.search.trim();
  }

  // Generic filter handling (add specific filters as needed)
   if (query.departmentId) params.departmentId = query.departmentId;
   if (query.status) params.status = query.status;
   if (query.role) params.role = query.role;
   if (query.employeeId) params.employeeId = query.employeeId;
   if (query.leaveType) params.leaveType = query.leaveType;
   if (query.licenseType) params.licenseType = query.licenseType;
   if (query.documentType) params.documentType = query.documentType;
   if (query.accessLevel) params.accessLevel = query.accessLevel;


  // Date range filters
  try {
      if (query.startDate) params.startDate = new Date(query.startDate);
      if (query.endDate) params.endDate = new Date(query.endDate);
       if (query.expiringBefore) params.expiringBefore = new Date(query.expiringBefore);
       if (query.expiresBefore) params.expiresBefore = new Date(query.expiresBefore);
       if (query.expiresAfter) params.expiresAfter = new Date(query.expiresAfter);
       // Validate dates if needed: !isNaN(params.startDate.getTime())
  } catch (dateError) {
      console.warn("Invalid date format received in query params:", dateError);
      // Optionally remove invalid dates or handle error
  }


  return params;
};

// ... (validateDepartmentAccess, validateEmployeeAccess as before) ...
export const validateDepartmentAccess = (session, departmentId) => {
  if (!session?.user || !departmentId) return false; // Need session and ID
  const userRole = session.user.role;
  const userDeptId = session.user.departmentId;

  if (userRole === 'admin' || userRole === 'hr_manager') return true;
  if ((userRole === 'department_manager' || userRole === 'employee') && userDeptId === departmentId) return true; // Dept Mgr or Employee in their own dept

  return false;
};

export const validateEmployeeAccess = async (session, employeeOrId) => {
   if (!session?.user || !employeeOrId) return false;
   const userRole = session.user.role;
   const userDeptId = session.user.departmentId;
   const userEmployeeId = session.user.employeeId; // Assuming employeeId is on session.user

   if (userRole === 'admin' || userRole === 'hr_manager') return true;

   let employeeData = null;
   try {
       if (typeof employeeOrId === 'string') {
           employeeData = await dbService.getEmployeeById(employeeOrId);
       } else {
           employeeData = employeeOrId; // Assume object is passed
       }
   } catch(e) { console.error("DB error fetching employee for access check:", e); return false; }


   if (!employeeData) return false; // Employee not found

   // Employees can access their own record
   if (userEmployeeId === employeeData.id) return true;

   // Department managers can access employees in their department
   if (userRole === 'department_manager' && userDeptId === employeeData.departmentId) return true;

   return false;
};


// Error class for API errors
export class ApiError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

// Helper to throw common API errors
export const throwApiError = {
  notFound: (message = 'Resource not found') => {
    throw new ApiError(message, 404);
  },
  badRequest: (message = 'Bad request') => {
    throw new ApiError(message, 400);
  },
  unauthorized: (message = 'Unauthorized') => {
    throw new ApiError(message, 401);
  },
  forbidden: (message = 'Forbidden') => {
    throw new ApiError(message, 403);
  },
  conflict: (message = 'Resource conflict or already exists') => {
    throw new ApiError(message, 409);
  },
   internal: (message = 'Internal server error') => {
    throw new ApiError(message, 500);
  }
};