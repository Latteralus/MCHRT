import { DataTypes, Model, Optional, Sequelize } from 'sequelize'; // Added Sequelize import
import type { UserModelClass } from '@/modules/auth/models/User'; // Import User class type for association
import type { EmployeeModelClass } from '@/modules/employees/models/Employee'; // Import Employee class type for association
import type { DocumentModelClass } from '@/modules/documents/models/Document'; // Import Document class type for association

// Define the attributes for the Department model
interface DepartmentAttributes {
  id: number;
  name: string; // e.g., Administration, Human Resources, Operations, Compounding, Shipping
  managerId?: number; // Foreign key referencing the User model (Department Head)
  createdAt?: Date;
  updatedAt?: Date;
}

// Define creation attributes (optional fields for creation)
export interface DepartmentCreationAttributes extends Optional<DepartmentAttributes, 'id' | 'createdAt' | 'updatedAt' | 'managerId'> {} // Added export

// Define the Department model class
// Note: We define the class outside the initializer function
class Department extends Model<DepartmentAttributes, DepartmentCreationAttributes> { // Removed 'implements DepartmentAttributes'
  public id!: number;
  public name!: string;
  public managerId?: number;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Define associations
  public static associate(models: {
    User: typeof UserModelClass;
    Employee: typeof EmployeeModelClass;
    Document: typeof DocumentModelClass;
    // Add other models as needed for associations
  }) {
    // A Department can have multiple Users
    Department.hasMany(models.User, {
      foreignKey: 'departmentId',
      as: 'users', // Allows Department.getUsers()
    });
    // A Department has one Manager (who is a User)
    Department.belongsTo(models.User, {
      foreignKey: 'managerId',
      as: 'manager', // Allows Department.getManager()
    });
    // A Department can have multiple Employees
    Department.hasMany(models.Employee, {
      foreignKey: 'departmentId',
      as: 'employees', // Allows Department.getEmployees()
    });
    // Optional: A Department can have multiple Documents associated
    // Department.hasMany(models.Document, { foreignKey: 'departmentId', as: 'documents' });
  }
}

// Export an initializer function
export const initializeDepartment = (sequelize: Sequelize) => {
  Department.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Department names should likely be unique
      },
      managerId: {
        type: DataTypes.INTEGER,
        allowNull: true, // A department might not have a manager assigned initially
        references: {
          model: 'Users', // Assumes a 'Users' table exists
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', // If a manager user is deleted, set the managerId to null
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
      tableName: 'Departments', // Explicitly define table name
      // Optional: Add indexes here if needed
      // indexes: [{ unique: true, fields: ['name'] }]
    }
  );

  return Department; // Return the initialized model
};

// Export the class type itself if needed elsewhere (e.g., for type hints)
export { Department as DepartmentModelClass };