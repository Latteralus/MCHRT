import { Model, DataTypes, Optional, Sequelize } from 'sequelize'; // Added Sequelize import
import type { EmployeeModelClass } from '@/modules/employees/models/Employee'; // Import Employee class type
import type { OffboardingTaskModelClass } from './OffboardingTask'; // Import OffboardingTask class type

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
  public readonly employee?: EmployeeModelClass; // Use imported class type
  // public readonly tasks?: OffboardingTaskModelClass[]; // For hasMany association

  // Define associations
  public static associate(models: {
    Employee: typeof EmployeeModelClass;
    OffboardingTask: typeof OffboardingTaskModelClass;
    // Add other models as needed
  }) {
    // An Offboarding process belongs to one Employee
    Offboarding.belongsTo(models.Employee, {
      foreignKey: 'employeeId',
      as: 'employee', // Allows Offboarding.getEmployee()
    });
    // An Offboarding process can have many Tasks
    // Offboarding.hasMany(models.OffboardingTask, {
    //   foreignKey: 'offboardingId',
    //   as: 'tasks', // Allows Offboarding.getTasks()
    // });
  }
}

// Export an initializer function
export const initializeOffboarding = (sequelize: Sequelize) => {
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
          model: 'Employees', // Use table name for references
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

  return Offboarding; // Return the initialized model
};

// Export the class type itself if needed elsewhere
export { Offboarding as OffboardingModelClass };
export type { OffboardingAttributes, OffboardingCreationAttributes }; // Export the types