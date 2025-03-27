// utils/apiHandler.js
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../pages/api/auth/[...nextauth]';
import { dbService } from './dbService';

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
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return res.status(200).end();
    }

    // Check request method is supported
    const handler = handlers[req.method?.toLowerCase()];
    if (!handler) {
      return res.status(405).json({
        success: false,
        error: `Method ${req.method} not allowed`,
      });
    }

    // Authenticate request if required
    let session = null;
    if (options.requireAuth) {
      // Use try/catch as getServerSession might throw if parameters are incorrect
      try {
        // Pass the authOptions correctly
        session = await getServerSession(req, res, authOptions);
      } catch (error) {
        console.error("Authentication error:", error);
      }
      
      if (!session) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      // Check allowed roles if specified
      if (options.allowedRoles && options.allowedRoles.length > 0) {
        // Allow if user role is Admin (they can access everything)
        if (session.user.role !== 'Admin' && !options.allowedRoles.includes(session.user.role)) {
          return res.status(403).json({
            success: false,
            error: 'Forbidden - Insufficient permissions',
          });
        }
      }
      
      // Add isMockDb flag in development for UI hints
      if (process.env.NODE_ENV !== 'production') {
        session.isMockDb = dbService.isMockDb();
      }
    }

    try {
      // Add session to request for handler use
      req.session = session;
      
      // Execute the handler function
      await handler(req, res);
    } catch (error) {
      console.error(`API Error [${req.method} ${req.url}]:`, error);

      // Determine status code and message
      const status = error.statusCode || 500;
      const message = error.message || 'Internal server error';
      
      // Include stack trace in development
      const errorResponse = {
        success: false,
        error: message,
      };
      
      if (process.env.NODE_ENV !== 'production' && status === 500) {
        errorResponse.stack = error.stack;
      }
      
      return res.status(status).json(errorResponse);
    }
  };
};

// Helper function to parse query parameters
export const parseQueryParams = (query) => {
  const params = {};
  
  // Handle pagination
  params.skip = query.skip ? parseInt(query.skip, 10) : 0;
  params.take = query.take ? parseInt(query.take, 10) : 10;
  
  // Handle sorting
  if (query.sortBy) {
    params.order = {
      [query.sortBy]: (query.order?.toLowerCase() === 'desc' ? 'DESC' : 'ASC'),
    };
  }
  
  // Handle search and filters
  if (query.search) {
    params.search = query.search;
  }
  
  // Department filter
  if (query.departmentId) {
    params.departmentId = query.departmentId;
  }
  
  // Status filter
  if (query.status) {
    params.status = query.status;
  }
  
  // Date range filters
  if (query.startDate) {
    params.startDate = new Date(query.startDate);
  }
  
  if (query.endDate) {
    params.endDate = new Date(query.endDate);
  }
  
  return params;
};

/**
 * Validate access to department data based on user role and department
 * @param {Object} session - User session data
 * @param {string} departmentId - Department ID to check access for
 * @returns {boolean} - Whether user has access
 */
export const validateDepartmentAccess = (session, departmentId) => {
  // Skip validation if no department ID is provided
  if (!departmentId) return true;
  
  // Admins can access all departments
  if (session.user.role === 'Admin') {
    return true;
  }
  
  // Department managers can only access their own department
  if (session.user.role === 'Manager') {
    return session.user.departmentId === departmentId;
  }
  
  // Regular employees can access their own department data if needed
  if (session.user.departmentId === departmentId) {
    return true;
  }
  
  // Deny access in all other cases
  return false;
};

/**
 * Validate access to employee data based on user role and departments
 * @param {Object} session - User session data
 * @param {Object|string} employee - Employee data or employee ID
 * @returns {boolean} - Whether user has access
 */
export const validateEmployeeAccess = async (session, employee) => {
  // Admins can access all employee data
  if (session.user.role === 'Admin') {
    return true;
  }
  
  // Get employee data if only ID was provided
  let employeeData = employee;
  if (typeof employee === 'string') {
    employeeData = await dbService.getEmployeeById(employee);
    if (!employeeData) return false;
  }
  
  // Department managers can access employees in their department
  if (session.user.role === 'Manager' && 
      session.user.departmentId === employeeData.departmentId) {
    return true;
  }
  
  // Users can access their own data
  if (session.user.id === employeeData.id) {
    return true;
  }
  
  // Deny access in all other cases
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
  conflict: (message = 'Resource already exists') => {
    throw new ApiError(message, 409);
  },
};