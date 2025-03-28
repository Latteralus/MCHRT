// src/pages/api/compliance/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Compliance, Employee } from '@/db'; // Import models
import { withRole, AuthenticatedNextApiHandler, UserRole } from '@/lib/middleware/withRole';

// Helper function to check if user can access/modify a specific compliance item
const checkAccess = async (
    complianceItemId: number,
    userRole: UserRole,
    userId: number | undefined, // Assuming user ID is stored in session
    userDepartmentId: number | undefined // Assuming department ID is stored
): Promise<{ allowed: boolean; item?: Compliance | null; employee?: Employee | null }> => {

    const item = await Compliance.findByPk(complianceItemId, {
        include: [{ model: Employee, as: 'employee', attributes: ['id', 'userId', 'departmentId'] }]
    });

    if (!item || !item.employee) {
        return { allowed: false }; // Item or associated employee not found
    }

    const employee = item.employee;

    if (userRole === 'Admin') {
        return { allowed: true, item, employee }; // Admin can access anything
    }

    if (userRole === 'Employee') {
        // Employee can only access their own items (check via linked userId)
        return { allowed: employee.userId === userId, item, employee };
    }

    if (userRole === 'DepartmentHead') {
        // Dept Head can access items of employees in their department
        return { allowed: employee.departmentId === userDepartmentId, item, employee };
    }

    return { allowed: false }; // Default deny
};


// Define the main handler logic
const handler: AuthenticatedNextApiHandler = async (req, res, session) => {
    const { method } = req;
    const { id } = req.query; // Compliance Item ID from URL
    const complianceItemId = parseInt(id as string, 10);

    if (isNaN(complianceItemId)) {
        return res.status(400).json({ message: 'Invalid Compliance Item ID.' });
    }

    const userRole = session.user?.role as UserRole;
    const userId = session.user?.id;
    const userDepartmentId = session.user?.departmentId;

    // --- Check access for the specific item ---
    const { allowed, item, employee } = await checkAccess(complianceItemId, userRole, userId, userDepartmentId);

    if (!item) {
         return res.status(404).json({ message: 'Compliance item not found.' });
    }
    if (!allowed) {
        // Don't reveal if item exists but user lacks permission, could use 404 for both
        return res.status(403).json({ message: 'Forbidden: You do not have permission to access this item.' });
    }

    // --- GET: Fetch Single Compliance Item ---
    if (method === 'GET') {
        // Access already checked, item is available
        return res.status(200).json(item);
    }

    // --- PUT: Update Compliance Item ---
    if (method === 'PUT') {
        // RBAC: Only Admin/DeptHead can update?
        if (!['Admin', 'DepartmentHead'].includes(userRole)) {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to update compliance items.' });
        }
        // If DeptHead, access check already confirmed item belongs to their dept employee

        const { itemType, itemName, authority, licenseNumber, issueDate, expirationDate, status } = req.body;

        // Basic validation
        if (!itemType && !itemName && !status /* ... etc */) {
             return res.status(400).json({ message: 'No update data provided.' });
        }

        try {
            // Selectively update fields that are provided
            const updateData: Partial<Compliance> = {};
            if (itemType !== undefined) updateData.itemType = itemType;
            if (itemName !== undefined) updateData.itemName = itemName;
            if (authority !== undefined) updateData.authority = authority;
            if (licenseNumber !== undefined) updateData.licenseNumber = licenseNumber;
            if (issueDate !== undefined) updateData.issueDate = issueDate || null;
            if (expirationDate !== undefined) updateData.expirationDate = expirationDate || null;
            if (status !== undefined) updateData.status = status;

            const [updateCount] = await Compliance.update(updateData, {
                where: { id: complianceItemId }
            });

            if (updateCount === 0) {
                 // Should not happen if access check passed, but good practice
                 return res.status(404).json({ message: 'Compliance item not found for update.' });
            }

            const updatedItem = await Compliance.findByPk(complianceItemId); // Fetch updated item
            return res.status(200).json(updatedItem);

        } catch (error: any) {
            console.error(`Error updating compliance item ${complianceItemId}:`, error);
             if (error.name === 'SequelizeValidationError') {
                return res.status(400).json({ message: 'Validation Error', errors: error.errors.map((e: any) => e.message) });
            }
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    // --- DELETE: Delete Compliance Item ---
    if (method === 'DELETE') {
        // RBAC: Only Admin/DeptHead can delete?
        if (!['Admin', 'DepartmentHead'].includes(userRole)) {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to delete compliance items.' });
        }
        // If DeptHead, access check already confirmed item belongs to their dept employee

        try {
            const deleteCount = await Compliance.destroy({
                where: { id: complianceItemId }
            });

            if (deleteCount === 0) {
                // Should not happen if access check passed
                return res.status(404).json({ message: 'Compliance item not found for deletion.' });
            }

            return res.status(204).end(); // No content on successful delete

        } catch (error) {
            console.error(`Error deleting compliance item ${complianceItemId}:`, error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    // --- Method Not Allowed ---
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).json({ message: `Method ${method} Not Allowed` });
};

// Apply middleware (assuming Admins, DeptHeads, and Employees might access - finer control inside)
export default withRole(['Admin', 'DepartmentHead', 'Employee'], handler);