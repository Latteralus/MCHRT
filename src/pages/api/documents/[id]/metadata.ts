import type { NextApiRequest, NextApiResponse } from 'next';
import { Document, Employee, User } from '@/db'; // Import models
import { withAuth, AuthenticatedNextApiHandler } from '@/lib/middleware/withAuth';
import { UserRole } from '@/lib/middleware/withRole'; // Import UserRole type

// Define the handler logic, wrapped with authentication
const handler: AuthenticatedNextApiHandler = async (req, res, session) => {
    const { method } = req;
    const { id } = req.query; // Get the document ID from the URL path
    const requestingUserId = session.user?.id;
    const requestingUserRole = session.user?.role as UserRole;
    const requestingUserDepartmentId = session.user?.departmentId;

    if (method !== 'PUT') {
        res.setHeader('Allow', ['PUT']);
        return res.status(405).json({ message: `Method ${method} Not Allowed` });
    }

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'Document ID is required' });
    }

    const documentId = parseInt(id, 10);
    if (isNaN(documentId)) {
        return res.status(400).json({ message: 'Invalid Document ID format' });
    }

    try {
        const document = await Document.findByPk(documentId, {
            include: [{ model: Employee, as: 'employee', attributes: ['id', 'departmentId'] }] // Include for dept check
        });

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // --- Authorization Check ---
        let authorized = false;
        if (requestingUserRole === 'Admin') {
            authorized = true; // Admins can edit any metadata
        } else if (document.ownerId === requestingUserId) {
            authorized = true; // Owner can edit their own document's metadata
        } else if (requestingUserRole === 'DepartmentHead') {
            // Dept Head can edit if doc belongs to their dept or one of their employees
            if (!requestingUserDepartmentId) {
                console.warn(`DepartmentHead ${requestingUserId} missing departmentId in session.`);
                // authorized remains false
           } else if (document.departmentId === requestingUserDepartmentId) {
                authorized = true; // Document belongs to the department
           } else if (document.employeeId) {
                // Check if the associated employee belongs to the manager's department
                const employee = await Employee.findByPk(document.employeeId, { attributes: ['departmentId'] });
                if (employee && employee.departmentId === requestingUserDepartmentId) {
                    authorized = true; // Document belongs to an employee in their department
                }
           }
       }

        if (!authorized) {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to update this document metadata.' });
        }
        // --- End Authorization Check ---

        // Extract updatable fields from request body
        const { title, description, employeeId, departmentId } = req.body;

        // Prepare update data - allow clearing associations by passing undefined
        const updateData: Partial<Document> = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        // Use undefined for clearing, matching potential model expectations
        if (employeeId !== undefined) updateData.employeeId = employeeId === '' || employeeId === null ? undefined : parseInt(employeeId, 10) || undefined;
        if (departmentId !== undefined) updateData.departmentId = departmentId === '' || departmentId === null ? undefined : parseInt(departmentId, 10) || undefined;

        // TODO: Add validation - e.g., ensure employeeId/departmentId exist if provided?
        // TODO: Ensure employeeId and departmentId are not set simultaneously if that's a rule.

        // Perform the update
        await document.update(updateData);

        // Re-fetch to include associations if needed for response
        const updatedDocument = await Document.findByPk(documentId, {
             include: [
                 { model: Employee, as: 'employee', attributes: ['id', 'firstName', 'lastName'] },
                 { model: User, as: 'owner', attributes: ['id', 'username'] } // Assuming username exists
             ]
        });

        return res.status(200).json(updatedDocument);

    } catch (error: any) {
        console.error(`Error updating document metadata ${documentId}:`, error);
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ message: 'Validation Error', errors: error.errors });
        }
        // Handle potential foreign key constraint errors if employeeId/departmentId is invalid
        if (error.name === 'SequelizeForeignKeyConstraintError') {
             return res.status(400).json({ message: 'Invalid Employee or Department ID provided.' });
        }
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Apply authentication middleware
export default withAuth(handler);