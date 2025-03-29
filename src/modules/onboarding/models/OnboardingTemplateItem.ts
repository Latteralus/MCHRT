import { Model, DataTypes, Optional, Association } from 'sequelize';
import { sequelize } from '@/db/sequelize';
// import { OnboardingTemplate } from './OnboardingTemplate'; // Removed direct import to break cycle

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
  // public readonly template?: OnboardingTemplate; // Type definition might need adjustment depending on association setup

  // Static associations property might be populated by defineAssociations
  // public static associations: {
  //   template: Association<OnboardingTemplateItem, OnboardingTemplate>;
  // };
}

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

export { OnboardingTemplateItem };
export type { OnboardingTemplateItemAttributes, OnboardingTemplateItemCreationAttributes, ResponsibleRole };