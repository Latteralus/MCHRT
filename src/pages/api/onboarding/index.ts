import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react'; // Import getSession
import { Op } from 'sequelize';
import { format } from 'date-fns'; // Import format
import { subDays } from 'date-fns'; // For date filtering
import Employee from '@/modules/employees/models/Employee';
import Task from '@/modules/tasks/models/Task';
import { withErrorHandling } from '@/lib/api/withErrorHandling';
import { AuthenticatedNextApiHandler, withAuth } from '@/lib/middleware/withAuth';
import { defineAssociations } from '@/db/associations';

// Define associations
defineAssociations();

// Define the expected response data structure for the list
interface OnboardingListItem {
    id: number; // Employee ID
    name: string; // Employee name
    startDate: string; // Hire date
    progress: number; // Percentage
}

// Define handler with explicit types for req, res, session
const handler = async (
    req: NextApiRequest,
    res: NextApiResponse,
    session: NonNullable<Awaited<ReturnType<typeof getSession>>> // Ensure session is not null
) => {
    const { method } = req;
    const userRole = session.user?.role;

    // Authorization check (e.g., only Admins/Managers can view)
    if (userRole !== 'Admin' && userRole !== 'Manager' && userRole !== 'DepartmentHead') {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions.' });
    }

    if (method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ message: `Method ${method} Not Allowed` });
    }

    try {
        // --- Determine which employees are "actively onboarding" ---
        // Initial simple logic: Hired within the last 90 days
        // TODO: Refine this logic, perhaps using an explicit Employee status
        const onboardingCutoffDate = subDays(new Date(), 90);
        const whereClause: any = {
            hireDate: {
                [Op.gte]: onboardingCutoffDate
            }
            // Add department filter if needed based on userRole/departmentId
        };

        const onboardingEmployees = await Employee.findAll({
            where: whereClause,
            attributes: ['id', 'firstName', 'lastName', 'hireDate'],
            order: [['hireDate', 'DESC']],
        });

        // --- Calculate progress for each employee ---
        const responseData: OnboardingListItem[] = [];
        for (const emp of onboardingEmployees) {
            const tasks = await Task.findAndCountAll({
                where: {
                    relatedEntityType: 'Onboarding',
                    relatedEntityId: emp.id
                }
            });
            const totalTasks = tasks.count;
            const completedTasks = tasks.rows.filter(t => t.status === 'Completed').length;
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            responseData.push({
                id: emp.id,
                name: `${emp.lastName}, ${emp.firstName}`,
                startDate: emp.hireDate ? format(new Date(emp.hireDate), 'MM/dd/yyyy') : 'N/A', // Format date
                progress: progress,
            });
        }

        res.status(200).json(responseData);

    } catch (error) {
        console.error('Error fetching onboarding list:', error);
        // Let the error handler manage the response
        throw error;
    }
};

// Explicitly cast handler type for withAuth if needed, or ensure withAuth correctly infers it.
// Assuming withAuth correctly handles the session injection and typing.
export default withErrorHandling(withAuth(handler as AuthenticatedNextApiHandler));