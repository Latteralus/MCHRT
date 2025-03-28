import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../../db/sequelize'; // Import instance directly
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

  // Define associations here later
  // public static associate(models: any) {
  //   Employee.belongsTo(models.Department, { foreignKey: 'departmentId', as: 'department' });
  //   // Add associations for Attendance, Leave, Compliance, Documents etc.
  // }
}

// Initialize the Employee model
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
    sequelize: sequelize, // Use the imported instance
    tableName: 'Employees', // Explicitly define table name
    // Optional: Add indexes here if needed
    // indexes: [{ fields: ['lastName', 'firstName'] }]
  }
);

export default Employee;