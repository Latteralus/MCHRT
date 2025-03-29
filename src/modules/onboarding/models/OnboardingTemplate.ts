import { Model, DataTypes, Optional, Association } from 'sequelize';
import { sequelize } from '@/db/sequelize';
// import { OnboardingTemplateItem } from './OnboardingTemplateItem'; // Removed direct import to break cycle

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
  // public readonly items?: OnboardingTemplateItem[]; // Type definition might need adjustment depending on association setup

  // Static associations property might be populated by defineAssociations
  // public static associations: {
  //   items: Association<OnboardingTemplate, OnboardingTemplateItem>;
  // };
}

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

export { OnboardingTemplate };
export type { OnboardingTemplateAttributes, OnboardingTemplateCreationAttributes };