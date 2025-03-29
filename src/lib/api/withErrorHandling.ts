import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next'; // Import NextApiHandler
import { ZodError } from 'zod'; // Assuming Zod is used for validation errors
// Import custom error types if they exist, e.g.,
// import { AuthenticationError, AuthorizationError, NotFoundError, ValidationError } from '@/lib/errors/appErrors';

// Define a standard error response structure
interface ErrorResponse {
    message: string;
    details?: any; // Optional field for more specific error details (like validation errors)
}

// Define the type for the handler *returned* by withErrorHandling
type ApiHandler<T = any> = (
    req: NextApiRequest,
    res: NextApiResponse<T | ErrorResponse>
) => Promise<void | NextApiResponse<T | ErrorResponse>>;

/**
 * Wraps an API handler with centralized error handling.
 * Catches errors, logs them, and sends a standardized JSON response.
 *
 * @param handler The API handler function to wrap.
 * @returns A new handler function with error handling.
 */
// Accept a standard NextApiHandler (or compatible) as input
export function withErrorHandling<T = any>(
    handler: NextApiHandler<T> // Changed from ApiHandler<T>
): ApiHandler<T> { // Return type remains ApiHandler<T> as it *can* send ErrorResponse
    return async (req: NextApiRequest, res: NextApiResponse<T | ErrorResponse>) => {
        try {
            // Execute the original handler
            await handler(req, res);
        } catch (error: unknown) {
            // Log the error (consider using a more robust logger like Winston)
            console.error(`[API Error] ${req.method} ${req.url}:`, error);

            // Determine the status code and response message based on the error type
            let statusCode = 500;
            let message = 'An unexpected internal server error occurred.';
            let details: any | undefined = undefined;

            if (error instanceof ZodError) {
                statusCode = 400; // Bad Request
                message = 'Validation failed.';
                details = error.errors.map(e => ({ path: e.path.join('.'), message: e.message }));
            }
            // Example handling for custom errors (Uncomment and adjust if using custom error classes)
            /*
            else if (error instanceof ValidationError) { // Assuming ValidationError extends Error
                statusCode = 400;
                message = error.message || 'Validation failed.';
                details = error.details; // Assuming ValidationError has a details property
            } else if (error instanceof AuthenticationError) {
                statusCode = 401;
                message = error.message || 'Authentication required.';
            } else if (error instanceof AuthorizationError) {
                statusCode = 403;
                message = error.message || 'You do not have permission to perform this action.';
            } else if (error instanceof NotFoundError) {
                statusCode = 404;
                message = error.message || 'The requested resource was not found.';
            }
            */
            else if (error instanceof Error) {
                // Handle generic Error instances - you might want to avoid exposing generic messages
                // message = error.message; // Use with caution in production
            }

            // Ensure response hasn't already been sent
            if (!res.headersSent) {
                res.status(statusCode).json({ message, details });
            } else {
                console.error("[API Error] Headers already sent, couldn't send error response.");
            }
        }
    };
}