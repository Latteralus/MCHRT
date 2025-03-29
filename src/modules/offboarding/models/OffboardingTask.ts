import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '@/db/sequelize';
import { Offboarding } from './Offboarding'; // Import Offboarding for association
import User from '@/modules/auth/models/User'; // Import User for association

// Define possible task statuses
type TaskStatus = 'Pending' | 'Completed';

// Interface for OffboardingTask attributes
interface OffboardingTaskAttributes {
  id: number;
  offboardingId: number;
  description: string;
  status: TaskStatus;
  assignedToUserId?: number; // FK to Users table
  assignedRole?: string; // e.g., 'IT', 'HR', 'Manager'
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface for OffboardingTask creation attributes
// Make status optional as it has a default value
interface OffboardingTaskCreationAttributes extends Optional<OffboardingTaskAttributes, 'id' | 'createdAt' | 'updatedAt' | 'assignedToUserId' | 'assignedRole' | 'status'> {}

class OffboardingTask extends Model<OffboardingTaskAttributes, OffboardingTaskCreationAttributes> implements OffboardingTaskAttributes {
  public id!: number;
  public offboardingId!: number;
  public description!: string;
  public status!: TaskStatus;
  public assignedToUserId?: number;
  public assignedRole?: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations (populated by eager loading)
  public readonly offboarding?: Offboarding;
  public readonly assignedUser?: User;
}

OffboardingTask.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    offboardingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Offboarding, // Reference the Offboarding model
        key: 'id',
      },
      onDelete: 'CASCADE', // If an offboarding process is deleted, delete its tasks
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Pending',
      validate: {
        isIn: [['Pending', 'Completed']], // Validate status values
      },
    },
    assignedToUserId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Task might be assigned to a role instead or unassigned initially
      references: {
        model: User, // Reference the User model
        key: 'id',
      },
      onDelete: 'SET NULL', // If assigned user is deleted, set task assignment to null
    },
    assignedRole: {
      type: DataTypes.STRING,
      allowNull: true, // Task might be assigned to a user instead or unassigned initially
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
    sequelize,
    tableName: 'OffboardingTasks',
    timestamps: true,
  }
);

// Define associations after models are initialized
// OffboardingTask.belongsTo(Offboarding, { foreignKey: 'offboardingId', as: 'offboarding' });
// Offboarding.hasMany(OffboardingTask, { foreignKey: 'offboardingId', as: 'tasks' }); // Add this in Offboarding.ts if needed

// OffboardingTask.belongsTo(User, { foreignKey: 'assignedToUserId', as: 'assignedUser' });
// User.hasMany(OffboardingTask, { foreignKey: 'assignedToUserId', as: 'assignedOffboardingTasks' }); // Add this in User.ts if needed


export { OffboardingTask };
export type { OffboardingTaskAttributes, OffboardingTaskCreationAttributes, TaskStatus };