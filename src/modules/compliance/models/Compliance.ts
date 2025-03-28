import { DataTypes, Model, Optional } from 'sequelize';
import { getSequelizeInstance } from '@/db/mockDbSetup'; // Import the getter function
import Employee from '@/modules/employees/models/Employee'; // Import Employee model for association typing

// Define possible compliance item statuses (consider using enums)
type ComplianceStatus = 'Active' | 'ExpiringSoon' | 'Expired' | 'PendingReview';

// Define the attributes for the Compliance model
interface ComplianceAttributes {
  id: number;
  employeeId: number; // Foreign key referencing Employee
  itemType: string; // e.g., 'License', 'Certification', 'Training', 'Review'
  itemName: string; // e.g., 'Pharmacist License', 'HIPAA Training', '90 Day Review'
  authority?: string; // e.g., 'State Board of Pharmacy', 'Internal HR'
  licenseNumber?: string; // Optional license/cert number
  issueDate?: Date;
  expirationDate?: Date; // Important for tracking expiry
  status: ComplianceStatus;
  // Add fields for associated documents if needed (e.g., documentId)
  createdAt?: Date;
  updatedAt?: Date;

  // Associations (added via include)
  employee?: Employee; // Add the associated employee type
}

// Define creation attributes (optional fields for creation)
export interface ComplianceCreationAttributes extends Optional<ComplianceAttributes, 'id' | 'createdAt' | 'updatedAt' | 'authority' | 'licenseNumber' | 'issueDate' | 'expirationDate' | 'status'> {
  // Status might default based on dates or require manual setting
}

// Define the Compliance model class
class Compliance extends Model<ComplianceAttributes, ComplianceCreationAttributes> implements ComplianceAttributes {
  public id!: number;
  public employeeId!: number;
  public itemType!: string;
  public itemName!: string;
  public authority?: string;
  public licenseNumber?: string;
  public issueDate?: Date;
  public expirationDate?: Date;
  public status!: ComplianceStatus;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Define associations here later
  // public static associate(models: any) {
  //   Compliance.belongsTo(models.Employee, { foreignKey: 'employeeId', as: 'employee' });
  //   // Potentially link to Document model if uploads are associated
  // }
}

// Initialize the Compliance model
Compliance.init(
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
      onDelete: 'CASCADE', // If an employee is deleted, delete their compliance records
    },
    itemType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    itemName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    authority: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    licenseNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    issueDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    expirationDate: {
      type: DataTypes.DATEONLY,
      allowNull: true, // Some items might not expire
    },
    status: {
      type: DataTypes.ENUM('Active', 'ExpiringSoon', 'Expired', 'PendingReview'),
      allowNull: false,
      defaultValue: 'PendingReview', // Or determine based on dates
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
    sequelize: getSequelizeInstance(), // Get the instance via the function
    tableName: 'ComplianceItems', // Explicitly define table name
    // Optional: Add indexes here if needed
    // indexes: [{ fields: ['employeeId', 'expirationDate'] }]
  }
);

export default Compliance;