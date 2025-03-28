import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { withErrorHandling } from '@/lib/api/withErrorHandling';
import { withRole } from '@/lib/middleware/withRole';
import Employee from '@/modules/employees/models/Employee'; // Corrected default import
import Attendance from '@/modules/attendance/models/Attendance'; // Corrected default import
import Leave from '@/modules/leave/models/Leave'; // Corrected default import
import Department from '@/modules/organization/models/Department';
import { Op } from 'sequelize'; // Import Op for query operators

// Define the structure for the department report data
interface DepartmentReportData {
    departmentId: number;
    departmentName: string;
    employeeCount: number;
    averageAttendanceRate: number; // Placeholder calculation
    pendingLeaveRequests: number;
    // Add more relevant metrics as needed
}

const handler = async (req: NextApiRequest, res: NextApiResponse<DepartmentReportData | { message: string }>) => {
    const { method } = req;
    const { id } = req.query; // Department ID from the URL path

    if (method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ message: `Method ${method} Not Allowed` });
    }

    if (!id || typeof id !== 'string' || isNaN(parseInt(id))) {
        return res.status(400).json({ message: 'Invalid or missing Department ID.' });
    }

    const departmentId = parseInt(id);

    const session = await getSession({ req });
    if (!session?.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // Authorization: Allow Admins OR the Department Head of the requested department
    const userRole = session.user.role as string;
    const userDepartmentId = session.user.departmentId as number | undefined;

    if (userRole !== 'Admin' && !(userRole === 'DepartmentHead' && userDepartmentId === departmentId)) { // Corrected operator
         return res.status(403).json({ message: 'Forbidden: You do not have permission to view this department report.' });
    }

    try {
        // --- Fetch Department Info ---
        const department = await Department.findByPk(departmentId);
        if (!department) {
            return res.status(404).json({ message: `Department with ID ${departmentId} not found.` });
        }

        // --- Fetch Aggregated Data for the Department ---

        // 1. Employee Count
        const employeeCount = await Employee.count({ where: { departmentId } });

        // 2. Average Attendance Rate (Placeholder Logic)
        // TODO: Implement actual calculation (e.g., average daily attendance % over a period)
        const averageAttendanceRate = 95.0; // Placeholder

        // 3. Pending Leave Requests
        const pendingLeaveRequests = await Leave.count({
            where: {
                status: 'Pending',
                // Need to join with Employee to filter by departmentId
            },
            include: [{
                model: Employee,
                where: { departmentId },
                attributes: [], // Don't need employee attributes, just use for filtering
                required: true, // Ensures only leaves for employees in this dept are counted
            }]
        });

        // --- Construct Response ---
        // We already checked for null department above, but assert for TS certainty
        if (!department) throw new Error('Department became null unexpectedly');

        const reportData: DepartmentReportData = {
            departmentId: department.id,
            departmentName: department.name,
            employeeCount: employeeCount,
            averageAttendanceRate: averageAttendanceRate,
            pendingLeaveRequests: pendingLeaveRequests,
        };

        return res.status(200).json(reportData);

    } catch (error) {
        console.error(`Error fetching report for department ${departmentId}:`, error);
        // Let withErrorHandling manage the response
        throw error;
    }
};

// Wrap with error handling. Role check is handled inside the handler for more specific logic.
export default withErrorHandling(handler);