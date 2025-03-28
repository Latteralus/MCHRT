// src/pages/api/tasks/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { withErrorHandling } from '@/lib/api/withErrorHandling';
import { withRole } from '@/lib/middleware/withRole'; // Assuming role middleware exists
import Task from '@/modules/tasks/models/Task';
import { createTask } from '@/modules/tasks/services/taskService'; // Import service function
import { Op } from 'sequelize'; // For filtering

// Define expected structure for Task data returned by API (might differ slightly from model)
interface TaskApiResponse extends Omit<Task, 'assignedTo' | 'createdBy'> { // Exclude full associated objects by default
    // Optionally include simplified associated data if needed
    assignedToName?: string;
    createdByName?: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getSession({ req });
    if (!session?.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const userId = session.user.id as number; // Assuming user ID is available in session
    const userRole = session.user.role as string;

    switch (req.method) {
        case 'GET':
            // List tasks - Apply filtering based on user role/query params
            try {
                const { assignedTo, status, relatedEntityType, relatedEntityId } = req.query;
                let whereClause: any = {};

                // Basic RBAC: Users see tasks assigned to them, Admins/Managers see more?
                // This is a simple example; refine based on requirements
                if (userRole === 'Employee') {
                    // Find employee ID associated with user ID - requires Employee model access
                    // const employee = await Employee.findOne({ where: { userId } });
                    // if (!employee) return res.status(403).json({ message: 'Employee record not found for user.' });
                    // whereClause.assignedToId = employee.id;
                    // For now, let's assume Employee role can't list all tasks via this endpoint
                     return res.status(403).json({ message: 'Access denied for this role.' });
                }
                // Admins/Managers can potentially see all or filter
                // Add filters from query params if provided
                if (assignedTo && typeof assignedTo === 'string') whereClause.assignedToId = parseInt(assignedTo); // Corrected operator
                if (status && typeof status === 'string') whereClause.status = status; // Corrected operator
                if (relatedEntityType && typeof relatedEntityType === 'string') whereClause.relatedEntityType = relatedEntityType; // Corrected operator
                if (relatedEntityId && typeof relatedEntityId === 'string') whereClause.relatedEntityId = parseInt(relatedEntityId); // Corrected operator

                const tasks = await Task.findAll({
                    where: whereClause,
                    // Optionally include simplified associated data
                    // include: [ { model: Employee, as: 'assignedTo', attributes: ['firstName', 'lastName'] } ],
                    order: [['dueDate', 'ASC'], ['createdAt', 'DESC']],
                });
                // TODO: Map tasks to TaskApiResponse if needed
                res.status(200).json(tasks);
            } catch (error) {
                console.error('Error fetching tasks:', error);
                res.status(500).json({ message: 'Internal Server Error' }); // Let wrapper handle?
                throw error; // Re-throw for centralized handling
            }
            break;

        case 'POST':
            // Create a new task - Generally restricted (e.g., Admins, Managers, or specific workflows)
            // Applying Admin/Manager restriction here for simplicity
             if (userRole !== 'Admin' && userRole !== 'Manager' && userRole !== 'DepartmentHead') { // Corrected operators
                 return res.status(403).json({ message: 'Forbidden: Insufficient permissions to create tasks.' });
             }
            try {
                // Add createdById based on the logged-in user
                const taskData = { ...req.body, createdById: userId };
                const newTask = await createTask(taskData); // Use the service function
                res.status(201).json(newTask);
            } catch (error: any) {
                console.error('Error creating task:', error);
                 // Check for specific service errors (like validation)
                 if (error.message.includes('required') || error.message.includes('not found') || error.message.includes('Invalid')) {
                     return res.status(400).json({ message: error.message });
                 }
                res.status(500).json({ message: 'Internal Server Error' }); // Let wrapper handle?
                throw error; // Re-throw for centralized handling
            }
            break;

        default:
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
};

// Apply error handling. Role checks are partially done inside for more granular control.
export default withErrorHandling(handler);
// Could wrap with a base authentication check if not done elsewhere:
// export default withAuth(withErrorHandling(handler));