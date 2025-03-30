import { Model, DataTypes, Optional, Association, Sequelize } from 'sequelize'; // Added Sequelize import
import type { OnboardingTemplateItemModelClass } from './OnboardingTemplateItem'; // Import Item class type

// Interface for OnboardingTemplate attributes
interface OnboardingTemplateAttributes {
  id: number;
  templateCode: string;
  name: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface for creation attributes
interface OnboardingTemplateCreationAttributes extends Optional<OnboardingTemplateAttributes, 'id' | 'createdAt' | 'updatedAt' | 'description'> {}

class OnboardingTemplate extends Model<OnboardingTemplateAttributes, OnboardingTemplateCreationAttributes> implements OnboardingTemplateAttributes {
  public id!: number;
  public templateCode!: string;
  public name!: string;
  public description?: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  // Association types can be defined later or inferred if using associate methods
  public readonly items?: OnboardingTemplateItemModelClass[]; // Use imported class type

  // Define associations
  public static associate(models: {
    OnboardingTemplateItem: typeof OnboardingTemplateItemModelClass;
    // Add other models as needed
  }) {
    // An OnboardingTemplate has many Items
    OnboardingTemplate.hasMany(models.OnboardingTemplateItem, {
      foreignKey: 'templateId',
      as: 'items', // Allows OnboardingTemplate.getItems()
    });
  }
}

// Export an initializer function
export const initializeOnboardingTemplate = (sequelize: Sequelize) => {
  OnboardingTemplate.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      templateCode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
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
      tableName: 'OnboardingTemplates',
      timestamps: true,
    }
  );

  return OnboardingTemplate; // Return the initialized model
};

// Export the class type itself if needed elsewhere
export { OnboardingTemplate as OnboardingTemplateModelClass };
export type { OnboardingTemplateAttributes, OnboardingTemplateCreationAttributes };