import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '@/db/sequelize'; // Import instance directly

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

  // Define associations here later
  // public static associate(models: any) {
  //   Document.belongsTo(models.User, { foreignKey: 'ownerId', as: 'owner' });
  //   Document.belongsTo(models.Employee, { foreignKey: 'employeeId', as: 'employee' });
  //   Document.belongsTo(models.Department, { foreignKey: 'departmentId', as: 'department' });
  //   // Potentially link to Compliance model if needed
  // }
}

// Initialize the Document model
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
    sequelize: sequelize, // Use the imported instance
    tableName: 'Documents', // Explicitly define table name
    // Optional: Add indexes here if needed
    // indexes: [{ fields: ['employeeId'] }, { fields: ['departmentId'] }]
  }
);

export default Document;