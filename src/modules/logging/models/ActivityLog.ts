import { Model, DataTypes, Optional, Association } from 'sequelize';
import { sequelize } from '@/db/sequelize';
import User from '@/modules/auth/models/User'; // Import User for association

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
  public readonly user?: User; // For eager loading

  public static associations: {
    user: Association<ActivityLog, User>;
  };
}

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
        model: User, // Reference the User model
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

export { ActivityLog };
export type { ActivityLogAttributes, ActivityLogCreationAttributes, ActionType, EntityType };