import { DataTypes, Model, Optional, Sequelize } from 'sequelize'; // Added Sequelize import
import type { UserModelClass } from '@/modules/auth/models/User'; // Import User class type
import type { EmployeeModelClass } from '@/modules/employees/models/Employee'; // Import Employee class type
import type { DepartmentModelClass } from '@/modules/organization/models/Department'; // Import Department class type

// Define the attributes for the Document model
interface DocumentAttributes {
  id: number;
  title: string;
  filePath: string; // Path to the file on the local server filesystem
  fileType?: string; // e.g., 'application/pdf', 'image/jpeg' (MIME type)
  fileSize?: number; // Size in bytes
  ownerId?: number; // Foreign key referencing User (who uploaded/owns the doc)
  employeeId?: number; // Optional foreign key if document relates to a specific employee
  departmentId?: number; // Optional foreign key if document relates to a specific department
  version?: number; // Simple version tracking
  description?: string; // Optional description
  createdAt?: Date;
  updatedAt?: Date;
}

// Define creation attributes (optional fields for creation)
export interface DocumentCreationAttributes extends Optional<DocumentAttributes, 'id' | 'createdAt' | 'updatedAt' | 'fileType' | 'fileSize' | 'ownerId' | 'employeeId' | 'departmentId' | 'version' | 'description'> {}

// Define the Document model class
class Document extends Model<DocumentAttributes, DocumentCreationAttributes> { // Removed 'implements DocumentAttributes'
  public id!: number;
  public title!: string;
  public filePath!: string;
  public fileType?: string;
  public fileSize?: number;
  public ownerId?: number;
  public employeeId?: number;
  public departmentId?: number;
  public version?: number;
  public description?: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Define associations
  public static associate(models: {
    User: typeof UserModelClass;
    Employee: typeof EmployeeModelClass;
    Department: typeof DepartmentModelClass;
    // Add other models as needed
  }) {
    // A Document belongs to one Owner (User)
    Document.belongsTo(models.User, {
      foreignKey: 'ownerId',
      as: 'owner', // Allows Document.getOwner()
    });
    // A Document can belong to one Employee
    Document.belongsTo(models.Employee, {
      foreignKey: 'employeeId',
      as: 'employee', // Allows Document.getEmployee()
    });
    // A Document can belong to one Department
    Document.belongsTo(models.Department, {
      foreignKey: 'departmentId',
      as: 'department', // Allows Document.getDepartment()
    });
    // Potentially link to Compliance model if needed
  }
}

// Export an initializer function
export const initializeDocument = (sequelize: Sequelize) => {
  Document.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      filePath: {
        type: DataTypes.STRING, // Store the relative or absolute path on the server
        allowNull: false,
        unique: true, // File paths should ideally be unique
      },
      fileType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      fileSize: {
        type: DataTypes.INTEGER, // Store size in bytes
        allowNull: true,
      },
      ownerId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Or false if owner is mandatory
        references: {
          model: 'Users', // Assumes a 'Users' table exists
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', // Or 'RESTRICT'
      },
      employeeId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Document might not be specific to one employee
        references: {
          model: 'Employees', // Assumes an 'Employees' table exists
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', // Or 'CASCADE' if docs should be deleted with employee
      },
      departmentId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Document might not be specific to one department
        references: {
          model: 'Departments', // Assumes a 'Departments' table exists
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      version: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1,
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
      sequelize: sequelize, // Use the passed instance
      tableName: 'Documents', // Explicitly define table name
      // Optional: Add indexes here if needed
      // indexes: [{ fields: ['employeeId'] }, { fields: ['departmentId'] }]
    }
  );

  return Document; // Return the initialized model
};

// Export the class type itself if needed elsewhere
export { Document as DocumentModelClass };