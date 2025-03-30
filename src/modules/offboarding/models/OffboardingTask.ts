import { Model, DataTypes, Optional, Sequelize } from 'sequelize'; // Added Sequelize import
import type { OffboardingModelClass } from './Offboarding'; // Import Offboarding class type
import type { UserModelClass } from '@/modules/auth/models/User'; // Import User class type

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
  public readonly offboarding?: OffboardingModelClass; // Use imported class type
  public readonly assignedUser?: UserModelClass; // Use imported class type

  // Define associations
  public static associate(models: {
    Offboarding: typeof OffboardingModelClass;
    User: typeof UserModelClass;
    // Add other models as needed
  }) {
    // An OffboardingTask belongs to one Offboarding process
    OffboardingTask.belongsTo(models.Offboarding, {
      foreignKey: 'offboardingId',
      as: 'offboarding',
    });
    // An OffboardingTask can be assigned to one User
    OffboardingTask.belongsTo(models.User, {
      foreignKey: 'assignedToUserId',
      as: 'assignedUser',
    });
  }
}

// Export an initializer function
export const initializeOffboardingTask = (sequelize: Sequelize) => {
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
          model: 'Offboardings', // Use table name for references
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
          model: 'Users', // Use table name for references
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

  return OffboardingTask; // Return the initialized model
};

// Export the class type itself if needed elsewhere
export { OffboardingTask as OffboardingTaskModelClass };
export type { OffboardingTaskAttributes, OffboardingTaskCreationAttributes, TaskStatus };