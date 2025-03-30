import { ActivityLog, User } from '@/db'; // Import initialized models from central index
import type { ActivityLogCreationAttributes, ActionType, EntityType } from '@/modules/logging/models/ActivityLog'; // Import types separately

/**
 * Logs an activity performed by a user.
 *
 * @param userId - The ID of the user performing the action.
 * @param actionType - The type of action performed.
 * @param description - A human-readable description of the action.
 * @param options - Optional parameters including entityType, entityId, and details.
 */
export const logActivity = async (
    userId: number,
    actionType: ActionType,
    description: string,
    options?: {
        entityType?: EntityType;
        entityId?: number;
        details?: object;
    }
): Promise<void> => {
    try {
        const logData: ActivityLogCreationAttributes = {
            userId,
            actionType,
            description,
            entityType: options?.entityType,
            entityId: options?.entityId,
            details: options?.details,
        };
        await ActivityLog.create(logData);
        console.log(`Activity logged: User ${userId} - ${actionType} - ${description}`);
    } catch (error) {
        console.error('Failed to log activity:', {
            userId,
            actionType,
            description,
            options,
            error,
        });
        // Decide if this error should propagate or just be logged
    }
};

// Example usage (from another API endpoint):
// import { logActivity } from '@/modules/logging/services/activityLogService';
//
// // Inside an API handler after an action...
// const userId = session.user.id;
// await logActivity(
//     userId,
//     'UPDATE',
//     `Updated employee profile for Employee ID ${employeeId}`,
//     { entityType: 'Employee', entityId: employeeId, details: { changedFields: ['position'] } }
// );