import { Model, DataTypes, Optional, Sequelize } from 'sequelize'; // Added Sequelize import

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

  // Define associations
  public static associate(models: {
    // Add other models as needed if associations are added later
  }) {
    // No direct associations defined for TaskTemplate currently
  }
}

// Export an initializer function
export const initializeTaskTemplate = (sequelize: Sequelize) => {
  TaskTemplate.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      defaultAssignedRole: {
        type: DataTypes.STRING,
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
      sequelize,
      tableName: 'TaskTemplates',
      timestamps: true,
    }
  );

  return TaskTemplate; // Return the initialized model
};

// Export the class type itself if needed elsewhere
export { TaskTemplate as TaskTemplateModelClass };
export type { TaskTemplateAttributes, TaskTemplateCreationAttributes };