// src/modules/leave/models/LeaveBalance.ts
import { DataTypes, Model, Optional, Sequelize } from 'sequelize'; // Added Sequelize import
import type { EmployeeModelClass } from '@/modules/employees/models/Employee'; // Import Employee class type

// Define the attributes for the LeaveBalance model
interface LeaveBalanceAttributes {
  id: number;
  employeeId: number; // Foreign key referencing Employee
  leaveType: string; // e.g., 'Vacation', 'Sick', 'Personal' (matches Leave.leaveType)
  balance: number; // Current balance (e.g., in hours or days)
  accruedYTD?: number; // Optional: Track year-to-date accrual
  usedYTD?: number; // Optional: Track year-to-date usage
  lastUpdated?: Date; // Optional: Track when the balance was last updated
  createdAt?: Date;
  updatedAt?: Date;
}

// Define creation attributes (optional fields for creation)
interface LeaveBalanceCreationAttributes extends Optional<LeaveBalanceAttributes, 'id' | 'createdAt' | 'updatedAt' | 'accruedYTD' | 'usedYTD' | 'lastUpdated'> {}

// Define the LeaveBalance model class
class LeaveBalance extends Model<LeaveBalanceAttributes, LeaveBalanceCreationAttributes> { // Removed 'implements LeaveBalanceAttributes'
  public id!: number;
  public employeeId!: number;
  public leaveType!: string;
  public balance!: number;
  public accruedYTD?: number;
  public usedYTD?: number;
  public lastUpdated?: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public readonly employee?: EmployeeModelClass; // Use imported class type

  // Define associations function
  public static associate(models: {
    Employee: typeof EmployeeModelClass;
    // Add other models as needed
  }) {
    // A LeaveBalance record belongs to one Employee
    LeaveBalance.belongsTo(models.Employee, {
      foreignKey: 'employeeId',
      as: 'employee', // Allows LeaveBalance.getEmployee()
    });
  }
}

// Export an initializer function
export const initializeLeaveBalance = (sequelize: Sequelize) => {
  LeaveBalance.init(
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
          model: 'Employees', // Assumes an 'Employees' table exists
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // If employee is deleted, delete their balances
      },
      leaveType: {
        type: DataTypes.STRING, // Consider ENUM if types are strictly defined
        allowNull: false,
      },
      balance: {
        type: DataTypes.FLOAT, // Use FLOAT or DECIMAL for hours/days
        allowNull: false,
        defaultValue: 0,
      },
      accruedYTD: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0,
      },
      usedYTD: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0,
      },
      lastUpdated: {
        type: DataTypes.DATE,
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
      sequelize: sequelize, // Use the passed instance
      tableName: 'LeaveBalances', // Explicitly define table name
      indexes: [
        // Ensure an employee can only have one balance record per leave type
        { unique: true, fields: ['employeeId', 'leaveType'] }
      ]
    }
  );

  return LeaveBalance; // Return the initialized model
};

// Export the class type itself if needed elsewhere
export { LeaveBalance as LeaveBalanceModelClass };