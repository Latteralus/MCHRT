import { DataTypes, Model, Optional } from 'sequelize';
import { getSequelizeInstance } from '@/db/mockDbSetup'; // Import the getter function

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
interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt' | 'departmentId'> {}

// Define the User model class
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public passwordHash!: string;
  public role!: string;
  public departmentId?: number;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

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
    sequelize: getSequelizeInstance(), // Get the instance via the function
    tableName: 'Users', // Explicitly define table name
    // Optional: Add indexes here if needed
    // indexes: [{ unique: true, fields: ['username'] }]
  }
);

export default User;