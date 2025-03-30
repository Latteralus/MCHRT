// src/modules/tasks/models/Task.ts
import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import type { EmployeeModelClass } from '@/modules/employees/models/Employee'; // For assignee type
import type { UserModelClass } from '@/modules/auth/models/User'; // For creator type

// Define possible task statuses
type TaskStatus = 'Pending' | 'InProgress' | 'Completed' | 'Blocked';

// Define the attributes for the Task model
interface TaskAttributes {
    id: number;
    title: string;
    description?: string;
    status: TaskStatus;
    dueDate?: Date;
    assignedToId?: number; // Foreign key referencing Employee
    createdById?: number; // Foreign key referencing User
    relatedEntityType?: 'Onboarding' | 'Offboarding' | 'Compliance' | 'General'; // Type of related entity
    relatedEntityId?: number; // ID of the related entity (e.g., OnboardingProcess ID, ComplianceItem ID)
    createdAt?: Date;
    updatedAt?: Date;
}

// Define creation attributes (optional fields for creation)
export interface TaskCreationAttributes extends Optional<TaskAttributes, 'id' | 'createdAt' | 'updatedAt' | 'description' | 'dueDate' | 'assignedToId' | 'createdById' | 'relatedEntityType' | 'relatedEntityId' | 'status'> {}

// Define the Task model class
class Task extends Model<TaskAttributes, TaskCreationAttributes> {
    public id!: number;
    public title!: string;
    public description?: string;
    public status!: TaskStatus;
    public dueDate?: Date;
    public assignedToId?: number;
    public createdById?: number;
    public relatedEntityType?: 'Onboarding' | 'Offboarding' | 'Compliance' | 'General';
    public relatedEntityId?: number;

    // Timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    // Define associations
    public static associate(models: {
        Employee: typeof EmployeeModelClass;
        User: typeof UserModelClass;
        // Add other models if Task relates to them directly
    }) {
      Task.belongsTo(models.Employee, { foreignKey: 'assignedToId', as: 'assignedTo' });
      Task.belongsTo(models.User, { foreignKey: 'createdById', as: 'createdBy' });
      // Define other associations if needed (e.g., polymorphic for relatedEntity)
    }
}

// Export an initializer function
export const initializeTask = (sequelize: Sequelize) => {
    Task.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            status: {
                type: DataTypes.ENUM('Pending', 'InProgress', 'Completed', 'Blocked'),
                allowNull: false,
                defaultValue: 'Pending',
            },
            dueDate: {
                type: DataTypes.DATEONLY,
                allowNull: true,
            },
            assignedToId: {
                type: DataTypes.INTEGER,
                allowNull: true, // Tasks might be unassigned initially
                references: { model: 'Employees', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL', // Keep task if employee is deleted, just unassign
            },
            createdById: {
                type: DataTypes.INTEGER,
                allowNull: true, // System-generated tasks might not have a creator user
                references: { model: 'Users', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
            },
            relatedEntityType: {
                type: DataTypes.ENUM('Onboarding', 'Offboarding', 'Compliance', 'General'),
                allowNull: true,
            },
            relatedEntityId: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            sequelize: sequelize, // Use the passed instance
            tableName: 'Tasks',
            // Optional: Add indexes
            // indexes: [{ fields: ['assignedToId', 'status'] }, { fields: ['relatedEntityType', 'relatedEntityId'] }]
        }
    );

    return Task; // Return the initialized model
};

// Export the class type itself if needed elsewhere
export { Task as TaskModelClass };