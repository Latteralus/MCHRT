import { Model, DataTypes, Optional, Association, Sequelize } from 'sequelize'; // Added Sequelize import
import type { OnboardingTemplateModelClass } from './OnboardingTemplate'; // Import Template class type

// Define responsible roles type
type ResponsibleRole = 'Employee' | 'Manager' | 'HR' | 'IT';

// Interface for OnboardingTemplateItem attributes
interface OnboardingTemplateItemAttributes {
  id: number;
  templateId: number;
  taskDescription: string;
  responsibleRole: ResponsibleRole;
  dueDays?: number;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface for creation attributes
interface OnboardingTemplateItemCreationAttributes extends Optional<OnboardingTemplateItemAttributes, 'id' | 'createdAt' | 'updatedAt' | 'dueDays' | 'notes'> {}

class OnboardingTemplateItem extends Model<OnboardingTemplateItemAttributes, OnboardingTemplateItemCreationAttributes> implements OnboardingTemplateItemAttributes {
  public id!: number;
  public templateId!: number;
  public taskDescription!: string;
  public responsibleRole!: ResponsibleRole;
  public dueDays?: number;
  public notes?: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  // Association types can be defined later or inferred if using associate methods
  public readonly template?: OnboardingTemplateModelClass; // Use imported class type

  // Define associations
  public static associate(models: {
    OnboardingTemplate: typeof OnboardingTemplateModelClass;
    // Add other models as needed
  }) {
    // An Item belongs to one Template
    OnboardingTemplateItem.belongsTo(models.OnboardingTemplate, {
      foreignKey: 'templateId',
      as: 'template', // Allows OnboardingTemplateItem.getTemplate()
    });
  }
}

// Export an initializer function
export const initializeOnboardingTemplateItem = (sequelize: Sequelize) => {
  OnboardingTemplateItem.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      templateId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'OnboardingTemplates', // Use table name (string) instead of imported model
          key: 'id',
        },
      },
      taskDescription: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      responsibleRole: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: [['Employee', 'Manager', 'HR', 'IT']], // Validate role values
        },
      },
      dueDays: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
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
      tableName: 'OnboardingTemplateItems',
      timestamps: true,
    }
  );

  return OnboardingTemplateItem; // Return the initialized model
};

// Export the class type itself if needed elsewhere
export { OnboardingTemplateItem as OnboardingTemplateItemModelClass };
export type { OnboardingTemplateItemAttributes, OnboardingTemplateItemCreationAttributes, ResponsibleRole };