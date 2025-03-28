import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '@/db/mockDbSetup'; // Adjust path as needed
import type Employee from '@/modules/employees/models/Employee'; // Import Employee type
import type User from '@/modules/auth/models/User'; // Import User type

// Define possible leave types and statuses (consider using enums)
type LeaveType = 'Vacation' | 'Sick' | 'Personal' | 'Bereavement' | 'Other';
type LeaveStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

// Define the attributes for the Leave model
interface LeaveAttributes {
  id: number;
  employeeId: number; // Foreign key referencing Employee
  startDate: Date;
  endDate: Date;
  leaveType: LeaveType;
  status: LeaveStatus;
  reason?: string; // Optional reason provided by employee
  approverId?: number; // Foreign key referencing User (manager/admin who approved/rejected)
  approvedAt?: Date; // Timestamp of approval/rejection
  comments?: string; // Optional comments from approver
  createdAt?: Date;
  updatedAt?: Date;
}

// Define creation attributes (optional fields for creation)
export interface LeaveCreationAttributes extends Optional<LeaveAttributes, 'id' | 'createdAt' | 'updatedAt' | 'reason' | 'approverId' | 'approvedAt' | 'comments' | 'status'> {
  // Status typically defaults to 'Pending'
}

// Define the Leave model class
class Leave extends Model<LeaveAttributes, LeaveCreationAttributes> implements LeaveAttributes {
  public id!: number;
  public employeeId!: number;
  public startDate!: Date;
  public endDate!: Date;
  public leaveType!: LeaveType;
  public status!: LeaveStatus;
  public reason?: string;
  public approverId?: number;
  public approvedAt?: Date;
  public comments?: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations (these properties are populated by Sequelize 'include')
  public readonly employee?: Employee; // Added based on association 'as: employee'
  public readonly approver?: User; // Added based on association 'as: approver'

  // Define associations function (called from src/db/associations.ts)
  // public static associate(models: any) {
  //   Leave.belongsTo(models.Employee, { foreignKey: 'employeeId', as: 'employee' });
  //   Leave.belongsTo(models.User, { foreignKey: 'approverId', as: 'approver' });
  // }
}

// Initialize the Leave model
Leave.init(
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
      onDelete: 'CASCADE', // If an employee is deleted, delete their leave records
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    leaveType: {
      type: DataTypes.ENUM('Vacation', 'Sick', 'Personal', 'Bereavement', 'Other'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Approved', 'Rejected', 'Cancelled'),
      allowNull: false,
      defaultValue: 'Pending',
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    approverId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Null until approved/rejected
      references: {
        model: 'Users', // Assumes a 'Users' table exists
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // If approver is deleted, keep the record but nullify approverId
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true, // Null until approved/rejected
    },
    comments: {
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
    tableName: 'Leaves', // Explicitly define table name
    // Optional: Add indexes here if needed
    // indexes: [{ fields: ['employeeId', 'startDate'] }]
  }
);

export default Leave;