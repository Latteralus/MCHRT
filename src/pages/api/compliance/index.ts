// src/pages/api/compliance/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Compliance, Employee } from '@/db'; // Import models
import { withRole, AuthenticatedNextApiHandler, UserRole } from '@/lib/middleware/withRole';
import { sequelize } from '@/db/mockDbSetup'; // For potential transactions or complex queries
import { Op } from 'sequelize'; // For query operators

// Define the handler logic
const handler: AuthenticatedNextApiHandler = async (req, res, session) => {
    const { method } = req;
    const userRole = session.user?.role as UserRole;
    const userId = session.user?.id; // Assuming user ID is stored in session
    const userDepartmentId = session.user?.departmentId; // Assuming department ID is stored

    // --- GET: List Compliance Items ---
    if (method === 'GET') {
        const { employeeId, status, itemType, page = 1, limit = 20 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        const whereClause: any = {};
        if (status) whereClause.status = status;
        if (itemType) whereClause.itemType = itemType;

        // RBAC: Filter based on role
        if (userRole === 'Employee') {
            // Find the employee record linked to the user
            const employee = await Employee.findOne({ where: { userId } });
            if (!employee) return res.status(403).json({ message: 'Forbidden: Employee record not found for user.' });
            whereClause.employeeId = employee.id; // Only show own items
        } else if (userRole === 'DepartmentHead') {
            if (!userDepartmentId) return res.status(403).json({ message: 'Forbidden: Department information missing.' });
            // Filter by specific employee ID if provided AND they are in the user's department
            if (employeeId) {
                 const targetEmployee = await Employee.findOne({ where: { id: employeeId, departmentId: userDepartmentId } });
                 if (!targetEmployee) return res.status(404).json({ message: 'Employee not found or not in your department.' });
                 whereClause.employeeId = employeeId;
            } else {
                // Show all employees within the department head's department
                 whereClause.employeeId = {
                     [Op.in]: sequelize.literal(`(SELECT id FROM "Employees" WHERE "departmentId" = ${userDepartmentId})`)
                 };
            }
        } else if (userRole === 'Admin') {
            // Admin can see all, but can still filter by employeeId if provided
            if (employeeId) whereClause.employeeId = employeeId;
        } else {
             return res.status(403).json({ message: 'Forbidden: Invalid role.' });
        }


        try {
            const { count, rows } = await Compliance.findAndCountAll({
                where: whereClause,
                limit: Number(limit),
                offset: offset,
                order: [['expirationDate', 'ASC'], ['itemName', 'ASC']], // Example order
                // Include Employee details if needed
                 include: [{ model: Employee, as: 'employee', attributes: ['id', 'firstName', 'lastName'] }]
            });
            const totalPages = Math.ceil(count / Number(limit));
            return res.status(200).json({ items: rows, totalPages, currentPage: Number(page) });
        } catch (error) {
            console.error('Error fetching compliance items:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    // --- POST: Create Compliance Item ---
    if (method === 'POST') {
        // RBAC: Only Admin/HR/DeptHead should create items? Adjust as needed.
        if (!['Admin', 'DepartmentHead'].includes(userRole)) { // Example restriction
            return res.status(403).json({ message: 'Forbidden: You do not have permission to create compliance items.' });
        }

        const { employeeId, itemType, itemName, authority, licenseNumber, issueDate, expirationDate, status } = req.body;

        // Validation (basic example)
        if (!employeeId || !itemType || !itemName) {
            return res.status(400).json({ message: 'Missing required fields: employeeId, itemType, itemName' });
        }

        // RBAC Check: If DeptHead, ensure employeeId is within their department
        if (userRole === 'DepartmentHead') {
             if (!userDepartmentId) return res.status(403).json({ message: 'Forbidden: Department information missing.' });
             const targetEmployee = await Employee.findOne({ where: { id: employeeId, departmentId: userDepartmentId } });
             if (!targetEmployee) return res.status(403).json({ message: 'Forbidden: Cannot add item for employee outside your department.' });
        }

        try {
            // TODO: Add logic to auto-determine status based on dates if not provided
            const newItem = await Compliance.create({
                employeeId,
                itemType,
                itemName,
                authority,
                licenseNumber,
                issueDate: issueDate || null,
                expirationDate: expirationDate || null,
                status: status || 'PendingReview', // Default status
            });
            return res.status(201).json(newItem);
        } catch (error: any) {
            console.error('Error creating compliance item:', error);
             if (error.name === 'SequelizeValidationError') {
                return res.status(400).json({ message: 'Validation Error', errors: error.errors.map((e: any) => e.message) });
            }
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    // --- Method Not Allowed ---
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ message: `Method ${method} Not Allowed` });
};

// Apply middleware (assuming Admins, DeptHeads, and Employees can access - GET needs finer control inside)
// Adjust roles as needed for overall access to the endpoint itself.
export default withRole(['Admin', 'DepartmentHead', 'Employee'], handler);