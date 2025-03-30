import { DataTypes, Model, Optional, Sequelize } from 'sequelize'; // Added Sequelize import
import type { DepartmentModelClass } from '@/modules/organization/models/Department'; // Import Department class type
import type { UserModelClass } from '@/modules/auth/models/User'; // Import User class type
import type { PositionModelClass } from '@/modules/organization/models/Position'; // Import Position class type
import type { AttendanceModelClass } from '@/modules/attendance/models/Attendance'; // Import Attendance class type
import type { LeaveModelClass } from '@/modules/leave/models/Leave'; // Import Leave class type
import type { LeaveBalanceModelClass } from '@/modules/leave/models/LeaveBalance'; // Import LeaveBalance class type
import type { ComplianceModelClass } from '@/modules/compliance/models/Compliance'; // Import Compliance class type
import type { OffboardingModelClass } from '@/modules/offboarding/models/Offboarding'; // Import Offboarding class type
import type { DocumentModelClass } from '@/modules/documents/models/Document'; // Import Document class type

// Define the attributes for the Employee model
interface EmployeeAttributes {
  id: number;
  firstName: string;
  lastName: string;
  ssnEncrypted?: string; // Store encrypted SSN - Requires encryption logic implementation
  departmentId?: number; // Foreign key to Departments table
  userId?: number; // Foreign key to Users table (for linking login user to employee record)
  positionId: number; // Foreign key to Positions table
  hireDate?: Date;
  status: 'Onboarding' | 'Active' | 'Terminating' | 'Terminated' | 'On Leave' | 'Vacation'; // Added status field
  // Add other relevant fields like dateOfBirth, contactInfo, address, etc. later
  createdAt?: Date;
  updatedAt?: Date;
}

// Define creation attributes (optional fields for creation)
// Make ssnEncrypted optional here as it might be set via a setter or hook after encryption
// positionId is now required for creation, so it's not listed in Optional<>
export interface EmployeeCreationAttributes extends Optional<EmployeeAttributes, 'id' | 'createdAt' | 'updatedAt' | 'departmentId' | 'hireDate' | 'ssnEncrypted' | 'status'> {} // Added status to Optional

// Define the Employee model class
class Employee extends Model<EmployeeAttributes, EmployeeCreationAttributes> { // Removed 'implements EmployeeAttributes'
  public id!: number;
  public firstName!: string;
  public lastName!: string;
  public ssnEncrypted?: string; // Actual storage field
  public departmentId?: number;
  public userId?: number; // Foreign key to User
  public positionId!: number; // Foreign key to Position
  public hireDate?: Date;
  public status!: 'Onboarding' | 'Active' | 'Terminating' | 'Terminated' | 'On Leave' | 'Vacation'; // Added status field

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Virtual field for SSN (getter/setter for encryption/decryption - implement later)
  // public get ssn(): string | undefined {
  //   // Decryption logic here using this.ssnEncrypted
  //   return this.getDataValue('ssnEncrypted'); // Placeholder
  // }
  // public set ssn(value: string | undefined) {
  //   // Encryption logic here before setting this.ssnEncrypted
  //   this.setDataValue('ssnEncrypted', value); // Placeholder
  // }

  // Define associations
  public static associate(models: {
    Department: typeof DepartmentModelClass;
    User: typeof UserModelClass;
    Position: typeof PositionModelClass;
    Attendance: typeof AttendanceModelClass;
    Leave: typeof LeaveModelClass;
    LeaveBalance: typeof LeaveBalanceModelClass;
    Compliance: typeof ComplianceModelClass;
    Offboarding: typeof OffboardingModelClass;
    Document: typeof DocumentModelClass;
    // Add other models as needed
  }) {
    // An Employee belongs to one User account
    Employee.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'userAccount', // Allows Employee.getUserAccount()
    });
    // An Employee belongs to one Department
    Employee.belongsTo(models.Department, {
      foreignKey: 'departmentId',
      as: 'department', // Allows Employee.getDepartment()
    });
    // An Employee belongs to one Position
    Employee.belongsTo(models.Position, {
      foreignKey: 'positionId',
      as: 'position', // Allows Employee.getPosition()
    });
    // An Employee can have multiple Attendance records
    Employee.hasMany(models.Attendance, {
      foreignKey: 'employeeId',
      as: 'attendanceRecords', // Allows Employee.getAttendanceRecords()
    });
    // An Employee can have multiple Leave records
    Employee.hasMany(models.Leave, {
      foreignKey: 'employeeId',
      as: 'leaveRecords', // Allows Employee.getLeaveRecords()
    });
    // An Employee can have multiple LeaveBalance records (one per type)
    Employee.hasMany(models.LeaveBalance, {
      foreignKey: 'employeeId',
      as: 'leaveBalances', // Allows Employee.getLeaveBalances()
    });
    // An Employee can have multiple Compliance items
    Employee.hasMany(models.Compliance, {
      foreignKey: 'employeeId',
      as: 'complianceItems', // Allows Employee.getComplianceItems()
    });
    // An Employee has one Offboarding process
    Employee.hasOne(models.Offboarding, {
      foreignKey: 'employeeId',
      as: 'offboardingProcess', // Allows Employee.getOffboardingProcess()
    });
    // Optional: An Employee can have multiple Documents associated
    // Employee.hasMany(models.Document, { foreignKey: 'employeeId', as: 'documents' });
  }
}

// Export an initializer function
export const initializeEmployee = (sequelize: Sequelize) => {
  Employee.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      // IMPORTANT: SSN requires encryption at rest (HIPAA).
      // This field stores the encrypted value. Actual encryption/decryption
      // should be handled in application logic (e.g., hooks or service layer).
      ssnEncrypted: {
        type: DataTypes.STRING, // Store as string (or BLOB depending on encryption output)
        allowNull: true, // Or false if SSN is mandatory
        // Add comment about encryption requirement
      },
      departmentId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Or false if every employee must have a department
        references: {
          model: 'Departments', // Assumes a 'Departments' table exists
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', // Or 'RESTRICT' / 'CASCADE' based on requirements
      },
      userId: { // Link to the User model (for login/employee association)
        type: DataTypes.INTEGER,
        allowNull: true, // Or false if every employee must be linked to a user account
        references: {
          model: 'Users', // Assumes a 'Users' table exists
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', // Or 'RESTRICT' if a User shouldn't be deleted if linked to an Employee
      },
      positionId: {
        type: DataTypes.INTEGER,
        allowNull: false, // Position is mandatory
        references: {
          model: 'Positions', // Assumes a 'Positions' table exists
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT', // Prevent deleting a Position if Employees are assigned
      },
      hireDate: {
        type: DataTypes.DATEONLY, // Use DATEONLY if time is not relevant
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Onboarding',
        validate: {
          isIn: [['Onboarding', 'Active', 'Terminating', 'Terminated', 'On Leave', 'Vacation']],
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
      sequelize: sequelize, // Use the passed instance
      tableName: 'Employees', // Explicitly define table name
      // Optional: Add indexes here if needed
      // indexes: [{ fields: ['lastName', 'firstName'] }]
    }
  );

  return Employee; // Return the initialized model
};

// Export the class type itself if needed elsewhere
export { Employee as EmployeeModelClass };