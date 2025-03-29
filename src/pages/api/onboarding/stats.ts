import type { NextApiRequest, NextApiResponse } from 'next';
import { Op } from 'sequelize';
import { subDays, startOfMonth, endOfMonth } from 'date-fns';
import Employee from '@/modules/employees/models/Employee';
import Task from '@/modules/tasks/models/Task';
import { withErrorHandling } from '@/lib/api/withErrorHandling';
import { AuthenticatedNextApiHandler, withAuth } from '@/lib/middleware/withAuth';
import { defineAssociations } from '@/db/associations';

// Define associations
defineAssociations();

// Define the expected response data structure
interface OnboardingStatData {
    active: number;
    completedThisMonth: number; // Placeholder for now
    overdueTasks: number;
}

import { getSession } from 'next-auth/react'; // Import getSession to help with type inference

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
        // --- Calculate Active Onboardings ---
        // Initial simple logic: Hired within the last 90 days
        const onboardingCutoffDate = subDays(new Date(), 90);
        const activeCount = await Employee.count({
            where: {
                hireDate: { [Op.gte]: onboardingCutoffDate }
                // Add department filter if needed
            }
        });

        // --- Calculate Completed This Month ---
        // TODO: Implement this accurately. Requires tracking onboarding completion status.
        // Placeholder: Returning 0 for now.
        const completedThisMonthCount = 0;
        // Example (if Employee had onboardingStatus):
        // const start = startOfMonth(new Date());
        // const end = endOfMonth(new Date());
        // const completedThisMonthCount = await Employee.count({
        //     where: {
        //         onboardingStatus: 'Completed',
        //         onboardingCompletedAt: { // Assuming a completion date field exists
        //             [Op.between]: [start, end]
        //         }
        //     }
        // });


        // --- Calculate Overdue Tasks ---
        const overdueTasksCount = await Task.count({
            where: {
                relatedEntityType: 'Onboarding',
                status: { [Op.ne]: 'Completed' }, // Not completed
                dueDate: { [Op.lt]: new Date() } // Due date is in the past
            }
        });

        // --- Prepare Response ---
        const responseData: OnboardingStatData = {
            active: activeCount,
            completedThisMonth: completedThisMonthCount, // Using placeholder
            overdueTasks: overdueTasksCount,
        };

        res.status(200).json(responseData);

    } catch (error) {
        console.error('Error fetching onboarding stats:', error);
        throw error; // Let the error handler manage the response
    }
};

export default withErrorHandling(withAuth(handler as AuthenticatedNextApiHandler)); // Cast type if needed