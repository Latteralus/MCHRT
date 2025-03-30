// src/modules/tasks/services/taskService.ts
import {
    Task,
    Employee,
    User,
    Position,
    OnboardingTemplate,
    OnboardingTemplateItem
} from '@/db'; // Import initialized models from central index
import { addDays, format } from 'date-fns'; // For due date calculation
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


/**
 * Creates standard onboarding tasks for a newly created employee based on their position.
 * Fetches the appropriate template from the database and creates Task records.
 *
 * @param employee - The newly created Employee object (must include id, hireDate, positionId).
 * @param creatorUserId - The ID of the user who initiated the employee creation.
 */
export const createOnboardingTasksForEmployee = async (employee: Employee, creatorUserId: number): Promise<void> => {
    if (!employee?.id || !employee.hireDate || !employee.positionId) {
        console.error('Cannot create onboarding tasks: Employee data is incomplete.', employee);
        return; // Or throw an error
    }

    let templateCode = 'standard-employee-v1'; // Default template

    try {
        // Determine template based on position
        const position = await Position.findByPk(employee.positionId);
        if (position?.name === 'Compounding Technician') { // Match by name (or use a code if positions had codes)
            templateCode = 'compounding-tech-v1';
        }
        // Add more else if conditions for other position-specific templates

        // Fetch the template and its items from the database
        const template = await OnboardingTemplate.findOne({
            where: { templateCode },
            include: [{
                model: OnboardingTemplateItem,
                as: 'items',
                required: true // Ensure template has items
            }]
        });

        if (!template || !template.items || template.items.length === 0) {
            console.warn(`Onboarding template '${templateCode}' not found or has no items. No tasks created for employee ${employee.id}.`);
            return;
        }

        console.log(`Applying onboarding template '${template.name}' for employee ${employee.id}...`);

        // Create tasks based on template items
        for (const item of template.items) {
            try {
                // Calculate Due Date
                let dueDate: Date | undefined = undefined;
                if (typeof item.dueDays === 'number') {
                    // Ensure hireDate is treated as a Date object
                    const hireDateObj = typeof employee.hireDate === 'string' ? new Date(employee.hireDate) : employee.hireDate;
                    if (hireDateObj && !isNaN(hireDateObj.getTime())) {
                         dueDate = addDays(hireDateObj, item.dueDays);
                    } else {
                        console.warn(`Invalid hire date for employee ${employee.id}, cannot calculate due date for task: ${item.taskDescription}`);
                    }
                }

                // Determine Assignee (Placeholder Logic)
                let assignedToId: number | undefined = undefined;
                if (item.responsibleRole === 'Employee') {
                    assignedToId = employee.id;
                } else if (item.responsibleRole === 'Manager') {
                    // TODO: Implement logic to find the actual manager's employee ID
                    // assignedToId = findManagerEmployeeId(employee.departmentId);
                    console.warn(`Assignee logic for Manager role not fully implemented for task: ${item.taskDescription}. Assigning to creator ${creatorUserId} as placeholder.`);
                    assignedToId = creatorUserId; // Placeholder
                } else if (item.responsibleRole === 'HR' || item.responsibleRole === 'IT') {
                    // TODO: Implement logic to find a designated HR/IT user/employee ID
                    // assignedToId = findDesignatedRoleEmployeeId(item.responsibleRole);
                     console.warn(`Assignee logic for ${item.responsibleRole} role not fully implemented for task: ${item.taskDescription}. Assigning to creator ${creatorUserId} as placeholder.`);
                    assignedToId = creatorUserId; // Placeholder
                }

                // Prepare Task Data
                const taskData: CreateTaskData = {
                    title: item.taskDescription,
                    description: item.notes,
                    dueDate: dueDate ? format(dueDate, 'yyyy-MM-dd') : undefined, // Format for DB if needed, or pass Date obj
                    assignedToId: assignedToId,
                    createdById: creatorUserId,
                    relatedEntityType: 'Onboarding',
                    relatedEntityId: employee.id,
                    status: 'Pending',
                };

                // Create the task using the existing service function
                await createTask(taskData);
                console.log(`Created onboarding task: "${item.taskDescription}" for employee ${employee.id}`);

            } catch (taskError) {
                console.error(`Failed to create onboarding task "${item.taskDescription}" for employee ${employee.id}:`, taskError);
                // Continue creating other tasks even if one fails
            }
        }
        console.log(`Finished applying onboarding template for employee ${employee.id}.`);

    } catch (error) {
        console.error(`Failed to create onboarding tasks for employee ${employee.id}:`, error);
        // Decide if this failure should prevent employee creation or just be logged
    }
};


// TODO: Add functions for updating, deleting, listing tasks as needed
// export const updateTask = async (taskId: number, updateData: Partial<CreateTaskData>): Promise<Task> => { ... };
// export const getTaskById = async (taskId: number): Promise<Task | null> => { ... };
// export const listTasks = async (filters: any): Promise<Task[]> => { ... };