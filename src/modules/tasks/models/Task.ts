// src/modules/tasks/models/Task.ts
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '@/db/sequelize'; // Import instance directly
import Employee from '@/modules/employees/models/Employee'; // For assignee
import User from '@/modules/auth/models/User'; // For creator

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

    // Associations (added via include)
    assignedTo?: Employee;
    createdBy?: User;
}

// Define creation attributes (optional fields for creation)
interface TaskCreationAttributes extends Optional<TaskAttributes, 'id' | 'createdAt' | 'updatedAt' | 'description' | 'dueDate' | 'assignedToId' | 'createdById' | 'relatedEntityType' | 'relatedEntityId' | 'status'> {}

// Define the Task model class
class Task extends Model<TaskAttributes, TaskCreationAttributes> { // Removed 'implements TaskAttributes'
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

    // Define associations here later
    // public static associate(models: any) {
    //   Task.belongsTo(models.Employee, { foreignKey: 'assignedToId', as: 'assignedTo' });
    //   Task.belongsTo(models.User, { foreignKey: 'createdById', as: 'createdBy' });
    // }
}

// Initialize the Task model
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
        sequelize: sequelize, // Use the imported instance
        tableName: 'Tasks',
        // Optional: Add indexes
        // indexes: [{ fields: ['assignedToId', 'status'] }, { fields: ['relatedEntityType', 'relatedEntityId'] }]
    }
);

export default Task;