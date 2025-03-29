import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '@/db/sequelize';
import Employee from '@/modules/employees/models/Employee'; // Import Employee for association type

// Interface for Offboarding attributes
interface OffboardingAttributes {
  id: number;
  employeeId: number;
  exitDate: string; // Stored as DATEONLY, represented as string YYYY-MM-DD
  reason?: string;
  status: 'Pending' | 'InProgress' | 'Completed' | 'Cancelled'; // Define possible statuses
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface for Offboarding creation attributes
interface OffboardingCreationAttributes extends Optional<OffboardingAttributes, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'reason'> {}

class Offboarding extends Model<OffboardingAttributes, OffboardingCreationAttributes> implements OffboardingAttributes {
  public id!: number;
  public employeeId!: number;
  public exitDate!: string;
  public reason?: string;
  public status!: 'Pending' | 'InProgress' | 'Completed' | 'Cancelled';

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations (populated by eager loading)
  public readonly employee?: Employee;
  // public readonly employee?: Employee; // For eager loading
}

Offboarding.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Employee, // Reference the Employee model directly
        key: 'id',
      },
      unique: true, // Ensure one offboarding per employee
    },
    exitDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Pending',
      validate: {
        isIn: [['Pending', 'InProgress', 'Completed', 'Cancelled']], // Validate status values
      },
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
    tableName: 'Offboardings',
    timestamps: true,
  }
);

export { Offboarding }; // Export the class (value)
export type { OffboardingAttributes, OffboardingCreationAttributes }; // Export the types