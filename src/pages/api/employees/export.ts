import type { NextApiRequest, NextApiResponse } from 'next';
import { Employee } from '@/db';
import { withRole, AuthenticatedNextApiHandler } from '@/lib/middleware/withRole';
import { Op } from 'sequelize';

// Helper function to convert data to CSV format (basic example)
const convertToCSV = (data: any[]): string => {
    if (!data || data.length === 0) {
        return '';
    }
    const headers = Object.keys(data[0]);
    const csvRows = [
        headers.join(','), // Header row
        ...data.map(row =>
            headers.map(header => JSON.stringify(row[header] ?? '', (key, value) => value ?? '')).join(',')
        )
    ];
    return csvRows.join('\n');
};


const handler: AuthenticatedNextApiHandler = async (req, res, session) => {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

    const userRole = session.user?.role;
    const userDepartmentId = session.user?.departmentId;

    try {
        // Apply similar RBAC filtering as the main GET /api/employees endpoint
        let whereClause = {};
        if (userRole === 'DepartmentHead') {
            if (!userDepartmentId) {
                return res.status(403).json({ message: 'Forbidden: Department information missing.' });
            }
            whereClause = { departmentId: userDepartmentId };
        } else if (userRole !== 'Admin') {
            // Only Admins and Dept Heads can export lists
            return res.status(403).json({ message: 'Forbidden: Insufficient permissions.' });
        }

        // Fetch employees (exclude sensitive data like SSN)
        const employees = await Employee.findAll({
            where: whereClause,
            attributes: { exclude: ['ssnEncrypted', 'userId'] }, // Exclude sensitive/internal fields
            // Include department name if needed
            // include: [{ model: Department, as: 'department', attributes: ['name'] }],
            raw: true, // Get plain data objects for easier CSV conversion
            order: [['lastName', 'ASC'], ['firstName', 'ASC']]
        });

        if (employees.length === 0) {
            // Return empty CSV or a message? Returning empty CSV for now.
             res.setHeader('Content-Type', 'text/csv');
             res.setHeader('Content-Disposition', 'attachment; filename="employees.csv"');
             return res.status(200).send('');
        }

        // Convert data to CSV
        const csvData = convertToCSV(employees);

        // Set headers for CSV download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="employees.csv"');
        res.status(200).send(csvData);

    } catch (error) {
        console.error('Error exporting employees:', error);
        res.status(500).json({ message: 'Internal Server Error during export.' });
    }
};

// Restrict export functionality to Admins and Department Heads
export default withRole(['Admin', 'DepartmentHead'], handler);