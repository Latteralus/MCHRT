"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTask = void 0;
// src/modules/tasks/services/taskService.ts
const Task_1 = __importDefault(require("@/modules/tasks/models/Task"));
const Employee_1 = __importDefault(require("@/modules/employees/models/Employee")); // For validation
const User_1 = __importDefault(require("@/modules/auth/models/User")); // For validation
/**
 * Creates a new task.
 * Performs basic validation.
 *
 * @param taskData - Data for the new task.
 * @returns The created Task object.
 * @throws Error if validation fails or database operation fails.
 */
const createTask = async (taskData) => {
    const { title, description, status = 'Pending', // Default status
    dueDate, assignedToId, createdById, relatedEntityType, relatedEntityId } = taskData;
    // Basic Validation
    if (!title) {
        throw new Error('Task title is required.');
    }
    // Optional: Validate assignedToId exists in Employees table
    if (assignedToId) {
        const employeeExists = await Employee_1.default.findByPk(assignedToId);
        if (!employeeExists) {
            throw new Error(`Assigned employee with ID ${assignedToId} not found.`);
        }
    }
    // Optional: Validate createdById exists in Users table
    if (createdById) {
        const userExists = await User_1.default.findByPk(createdById);
        if (!userExists) {
            throw new Error(`Creator user with ID ${createdById} not found.`);
        }
    }
    // Convert dueDate string to Date object if necessary
    let validDueDate = undefined;
    if (dueDate) {
        try {
            validDueDate = new Date(dueDate);
            if (isNaN(validDueDate.getTime())) { // Check if date is valid
                throw new Error('Invalid due date format.');
            }
        }
        catch (e) {
            throw new Error('Invalid due date format.');
        }
    }
    try {
        const newTask = await Task_1.default.create({
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
    }
    catch (error) {
        console.error('Error creating task in service:', error);
        // Log more details or re-throw a more specific error
        throw new Error('Failed to create task.');
    }
};
exports.createTask = createTask;
// TODO: Add functions for updating, deleting, listing tasks as needed
// export const updateTask = async (taskId: number, updateData: Partial<CreateTaskData>): Promise<Task> => { ... };
// export const getTaskById = async (taskId: number): Promise<Task | null> => { ... };
// export const listTasks = async (filters: any): Promise<Task[]> => { ... };
