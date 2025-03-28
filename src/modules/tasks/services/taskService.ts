// src/modules/tasks/services/taskService.ts
import Task from '@/modules/tasks/models/Task';
import Employee from '@/modules/employees/models/Employee'; // For validation
import User from '@/modules/auth/models/User'; // For validation

// Define the structure for data needed to create a task
interface CreateTaskData {
    title: string;
    description?: string;
    status?: 'Pending' | 'InProgress' | 'Completed' | 'Blocked';
    dueDate?: Date | string; // Allow string for easier API input
    assignedToId?: number;
    createdById?: number;
    relatedEntityType?: 'Onboarding' | 'Offboarding' | 'Compliance' | 'General';
    relatedEntityId?: number;
}

/**
 * Creates a new task.
 * Performs basic validation.
 *
 * @param taskData - Data for the new task.
 * @returns The created Task object.
 * @throws Error if validation fails or database operation fails.
 */
export const createTask = async (taskData: CreateTaskData): Promise<Task> => {
    const {
        title,
        description,
        status = 'Pending', // Default status
        dueDate,
        assignedToId,
        createdById,
        relatedEntityType,
        relatedEntityId
    } = taskData;

    // Basic Validation
    if (!title) {
        throw new Error('Task title is required.');
    }

    // Optional: Validate assignedToId exists in Employees table
    if (assignedToId) {
        const employeeExists = await Employee.findByPk(assignedToId);
        if (!employeeExists) {
            throw new Error(`Assigned employee with ID ${assignedToId} not found.`);
        }
    }

    // Optional: Validate createdById exists in Users table
    if (createdById) {
        const userExists = await User.findByPk(createdById);
        if (!userExists) {
            throw new Error(`Creator user with ID ${createdById} not found.`);
        }
    }

    // Convert dueDate string to Date object if necessary
    let validDueDate: Date | undefined = undefined;
    if (dueDate) {
        try {
            validDueDate = new Date(dueDate);
            if (isNaN(validDueDate.getTime())) { // Check if date is valid
                 throw new Error('Invalid due date format.');
            }
        } catch (e) {
             throw new Error('Invalid due date format.');
        }
    }


    try {
        const newTask = await Task.create({
            title,
            description,
            status,
            dueDate: validDueDate,
            assignedToId,
            createdById,
            relatedEntityType,
            relatedEntityId,
        });
        return newTask;
    } catch (error) {
        console.error('Error creating task in service:', error);
        // Log more details or re-throw a more specific error
        throw new Error('Failed to create task.');
    }
};

// TODO: Add functions for updating, deleting, listing tasks as needed
// export const updateTask = async (taskId: number, updateData: Partial<CreateTaskData>): Promise<Task> => { ... };
// export const getTaskById = async (taskId: number): Promise<Task | null> => { ... };
// export const listTasks = async (filters: any): Promise<Task[]> => { ... };