import { Model, DataTypes, Optional, Association, Sequelize } from 'sequelize'; // Added Sequelize import
import type { UserModelClass } from '@/modules/auth/models/User'; // Import User class type

// Define possible action types and entity types
type ActionType = 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'UPLOAD' | 'DOWNLOAD' | 'LOGIN' | 'LOGOUT' | 'COMPLETE' | 'START';
type EntityType = 'Employee' | 'Leave' | 'Document' | 'Onboarding' | 'Offboarding' | 'User' | 'Compliance' | 'Attendance' | 'Task' | 'System';

// Interface for ActivityLog attributes
interface ActivityLogAttributes {
  id: number;
  userId: number;
  actionType: ActionType;
  entityType?: EntityType;
  entityId?: number;
  description: string;
  details?: object; // For JSON data
  createdAt?: Date;
}

// Interface for creation attributes
interface ActivityLogCreationAttributes extends Optional<ActivityLogAttributes, 'id' | 'createdAt' | 'entityType' | 'entityId' | 'details'> {}

class ActivityLog extends Model<ActivityLogAttributes, ActivityLogCreationAttributes> implements ActivityLogAttributes {
  public id!: number;
  public userId!: number;
  public actionType!: ActionType;
  public entityType?: EntityType;
  public entityId?: number;
  public description!: string;
  public details?: object;

  // Timestamps
  public readonly createdAt!: Date;

  // Associations
  public readonly user?: UserModelClass; // Use imported class type

  // Define associations
  public static associate(models: {
    User: typeof UserModelClass;
    // Add other models as needed
  }) {
    // An ActivityLog belongs to one User
    ActivityLog.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user', // Allows ActivityLog.getUser()
    });
  }
}

// Export an initializer function
export const initializeActivityLog = (sequelize: Sequelize) => {
  ActivityLog.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users', // Use table name for references
          key: 'id',
        },
      },
      actionType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      entityType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      entityId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      details: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      // No updatedAt needed
    },
    {
      sequelize,
      tableName: 'ActivityLogs',
      timestamps: true, // Enables createdAt
      updatedAt: false, // Disable updatedAt
      indexes: [ // Re-define indexes here for model awareness
          { fields: ['userId'] },
          { fields: ['entityType', 'entityId'] },
          { fields: ['createdAt'] },
      ]
    }
  );

  return ActivityLog; // Return the initialized model
};

// Export the class type itself if needed elsewhere
export { ActivityLog as ActivityLogModelClass };
export type { ActivityLogAttributes, ActivityLogCreationAttributes, ActionType, EntityType };