import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../../db/sequelize'; // Import instance directly
// Define the attributes for the User model
interface UserAttributes {
  id: number;
  username: string;
  passwordHash: string;
  role: string; // Consider using an enum later (e.g., 'Admin', 'DepartmentHead', 'Employee')
  departmentId?: number; // Foreign key, optional for some roles?
  createdAt?: Date;
  updatedAt?: Date;
}

// Define creation attributes (optional fields for creation)
export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt' | 'departmentId'> {} // Added export

// Define the User model class
class User extends Model<UserAttributes, UserCreationAttributes> { // Removed 'implements UserAttributes'
  // Attributes are defined and typed by UserAttributes and UserCreationAttributes
  // Public class fields are removed to avoid shadowing Sequelize's getters/setters
  // See: https://sequelize.org/main/manual/model-basics.html#caveat-with-public-class-fields

  // Timestamps are managed by Sequelize based on model options and DB schema
  // public readonly createdAt!: Date; // Removed
  // public readonly updatedAt!: Date; // Removed

  // Define associations here later if needed
  // public static associate(models: any) {
  //   User.belongsTo(models.Department, { foreignKey: 'departmentId', as: 'department' });
  // }
}

// Initialize the User model
User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING, // Consider DataTypes.ENUM('Admin', 'DepartmentHead', 'Employee')
      allowNull: false,
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Allow null for roles like Admin? Or handle association differently.
      references: {
        model: 'Departments', // This assumes a 'Departments' table exists
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // Or 'RESTRICT' depending on requirements
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
    tableName: 'Users', // Explicitly define table name
    // Optional: Add indexes here if needed
    // indexes: [{ unique: true, fields: ['username'] }]
  }
);

export default User;