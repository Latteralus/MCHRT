import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '@/db/sequelize';

// Interface for TaskTemplate attributes
interface TaskTemplateAttributes {
  id: number;
  description: string;
  defaultAssignedRole?: string; // e.g., 'IT', 'HR', 'Manager'
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface for TaskTemplate creation attributes
interface TaskTemplateCreationAttributes extends Optional<TaskTemplateAttributes, 'id' | 'createdAt' | 'updatedAt' | 'defaultAssignedRole'> {}

class TaskTemplate extends Model<TaskTemplateAttributes, TaskTemplateCreationAttributes> implements TaskTemplateAttributes {
  public id!: number;
  public description!: string;
  public defaultAssignedRole?: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

TaskTemplate.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    }, // Added comma
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    }, // Added comma
    defaultAssignedRole: {
      type: DataTypes.STRING,
      allowNull: true,
    }, // Added comma
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    }, // Added comma
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'TaskTemplates',
    timestamps: true,
  }
);

export { TaskTemplate };
export type { TaskTemplateAttributes, TaskTemplateCreationAttributes };