// src/pages/api/compliance/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Compliance, Employee } from '@/db'; // Import models
import { withRole, AuthenticatedNextApiHandler, UserRole } from '@/lib/middleware/withRole';

// Define an interface that includes the associated employee
interface ComplianceWithEmployee extends Compliance {
  employee?: Employee; // Define the included association
}

// Discriminated union for the access check result
type AccessCheckResult =
  | { allowed: true; item: ComplianceWithEmployee; employee: Employee }
  | { allowed: false; item?: ComplianceWithEmployee | null };

// Helper function to check if user can access/modify a specific compliance item
const checkAccess = async (
    complianceItemId: number,
    userRole: UserRole,
    userId: number | undefined, // Assuming user ID is stored in session
    userDepartmentId: number | undefined // Assuming department ID is stored
): Promise<AccessCheckResult> => { // Use the discriminated union return type

    // Fetch item first, let TS infer initially
    const itemResult = await Compliance.findByPk(complianceItemId, {
        include: [{ model: Employee, as: 'employee', attributes: ['id', 'userId', 'departmentId'] }]
    });

    // Explicitly check if item and the included employee exist
    // Add direct assertion here as a workaround for persistent TS error
    if (!itemResult || !(itemResult as ComplianceWithEmployee).employee) {
        // If either is missing, return not allowed. Pass itemResult in case caller needs it.
        return { allowed: false, item: itemResult as ComplianceWithEmployee | null };
    }

    // If checks pass, we know itemResult and itemResult.employee are valid.
    // Assert the type for clarity and use within the function.
    const item = itemResult as ComplianceWithEmployee;
    const employee = item.employee; // Now employee is guaranteed non-null here

    if (userRole === 'Admin') {
        return { allowed: true, item, employee: employee! }; // Conforms to AccessCheckResult
    }

    if (userRole === 'Employee') {
        // Employee can only access their own items (check via linked userId)
        if (employee!.userId === userId) {
            return { allowed: true, item, employee: employee! }; // Conforms to AccessCheckResult
        }
    }

    if (userRole === 'DepartmentHead') {
        // Dept Head can access items of employees in their department
        if (employee.departmentId === userDepartmentId) {
            return { allowed: true, item, employee }; // Conforms to AccessCheckResult
        }
    }

    return { allowed: false, item }; // Default deny, include item for context if needed
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
    const accessResult = await checkAccess(complianceItemId, userRole, userId, userDepartmentId);

    // Check allowed status first using the discriminated union
    if (!accessResult.allowed) {
        // If not allowed, check if item exists to return 404 vs 403
        if (!accessResult.item) {
            return res.status(404).json({ message: 'Compliance item not found.' });
        } else {
            // Don't reveal if item exists but user lacks permission
            return res.status(403).json({ message: 'Forbidden: You do not have permission to access this item.' });
        }
    }

    // If we reach here, accessResult.allowed is true, so item and employee are guaranteed by the type
    const { item, employee } = accessResult; // Destructure the guaranteed properties

    // --- GET: Fetch Single Compliance Item ---
    if (method === 'GET') {
        // Access already checked, item is available and correctly typed
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