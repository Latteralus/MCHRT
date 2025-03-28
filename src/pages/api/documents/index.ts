// src/pages/api/documents/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Document, Employee, User } from '@/db'; // Import models
import { withRole, AuthenticatedNextApiHandler, UserRole } from '@/lib/middleware/withRole';
import { sequelize } from '@/db/mockDbSetup';
import { Op } from 'sequelize';

// Define the handler logic
const handler: AuthenticatedNextApiHandler = async (req, res, session) => {
    const { method } = req;
    const userRole = session.user?.role as UserRole;
    const userId = session.user?.id;
    const userDepartmentId = session.user?.departmentId;

    // --- GET: List Documents ---
    if (method === 'GET') {
        const { employeeId, departmentId, title, page = 1, limit = 20 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        const whereClause: any = {};
        if (title) whereClause.title = { [Op.iLike]: `%${title}%` }; // Case-insensitive search

        // RBAC Filtering Logic:
        if (userRole === 'Employee') {
            // Employees see their own docs + general docs (no employee/dept association)
            const employee = await Employee.findOne({ where: { userId } });
            whereClause[Op.or] = [
                { employeeId: employee ? employee.id : null }, // Their specific docs
                { ownerId: userId }, // Docs they uploaded
                { employeeId: null, departmentId: null } // General company docs
            ];
            // Prevent employee from filtering by other employee/department IDs
            if (employeeId && employeeId !== (employee?.id?.toString())) {
                 return res.status(403).json({ message: 'Forbidden: Cannot filter by other employees.' });
            }
             if (departmentId) {
                 return res.status(403).json({ message: 'Forbidden: Cannot filter by department.' });
            }

        } else if (userRole === 'DepartmentHead') {
            if (!userDepartmentId) return res.status(403).json({ message: 'Forbidden: Department information missing.' });

            // Dept Heads see their own docs, their dept docs, their employees' docs, and general docs
            const departmentEmployeeIds = await Employee.findAll({
                where: { departmentId: userDepartmentId },
                attributes: ['id']
            }).then(emps => emps.map(e => e.id));

            const deptHeadEmployee = await Employee.findOne({ where: { userId } });


            whereClause[Op.or] = [
                 { ownerId: userId }, // Docs they uploaded
                 { departmentId: userDepartmentId }, // Department docs
                 { employeeId: { [Op.in]: departmentEmployeeIds } }, // Their employees' docs
                 { employeeId: deptHeadEmployee ? deptHeadEmployee.id : null }, // Their own employee docs
                 { employeeId: null, departmentId: null } // General docs
            ];

            // Allow filtering, but ensure requested employee/dept is within their scope
             if (employeeId && !departmentEmployeeIds.includes(parseInt(employeeId as string, 10)) && employeeId !== (deptHeadEmployee?.id?.toString())) {
                 return res.status(403).json({ message: 'Forbidden: Cannot filter by employee outside your department.' });
             }
             if (departmentId && departmentId !== userDepartmentId.toString()) {
                  return res.status(403).json({ message: 'Forbidden: Cannot filter by other departments.' });
             }
             // Apply specific filters if provided within scope
             if (employeeId) whereClause.employeeId = employeeId;
             if (departmentId) whereClause.departmentId = departmentId;


        } else if (userRole === 'Admin') {
            // Admin sees all. Apply filters if provided.
            if (employeeId) whereClause.employeeId = employeeId;
            if (departmentId) whereClause.departmentId = departmentId;
        } else {
             return res.status(403).json({ message: 'Forbidden: Invalid role.' });
        }

        try {
            const { count, rows } = await Document.findAndCountAll({
                where: whereClause,
                limit: Number(limit),
                offset: offset,
                order: [['updatedAt', 'DESC']], // Example order
                // Include owner/employee/department details if needed
                include: [
                    { model: User, as: 'owner', attributes: ['id', 'username'] }, // Assuming username exists
                    { model: Employee, as: 'employee', attributes: ['id', 'firstName', 'lastName'] }
                ]
            });
            const totalPages = Math.ceil(count / Number(limit));
            return res.status(200).json({ documents: rows, totalPages, currentPage: Number(page) });
        } catch (error) {
            console.error('Error fetching documents:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    // --- Method Not Allowed ---
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${method} Not Allowed` });
};

// Apply middleware - Allow relevant roles to access the list endpoint
export default withRole(['Admin', 'DepartmentHead', 'Employee'], handler); // Adjust as needed