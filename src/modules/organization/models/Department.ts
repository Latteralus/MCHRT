import { DataTypes, Model, Optional } from 'sequelize';
import { getSequelizeInstance } from '@/db/mockDbSetup'; // Import the getter function

// Define the attributes for the Department model
interface DepartmentAttributes {
  id: number;
  name: string; // e.g., Administration, Human Resources, Operations, Compounding, Shipping
  managerId?: number; // Foreign key referencing the User model (Department Head)
  createdAt?: Date;
  updatedAt?: Date;
}

// Define creation attributes (optional fields for creation)
interface DepartmentCreationAttributes extends Optional<DepartmentAttributes, 'id' | 'createdAt' | 'updatedAt' | 'managerId'> {}

// Define the Department model class
class Department extends Model<DepartmentAttributes, DepartmentCreationAttributes> implements DepartmentAttributes {
  public id!: number;
  public name!: string;
  public managerId?: number;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Define associations here later
  // public static associate(models: any) {
  //   Department.hasMany(models.User, { foreignKey: 'departmentId', as: 'users' });
  //   Department.belongsTo(models.User, { foreignKey: 'managerId', as: 'manager' });
  //   Department.hasMany(models.Employee, { foreignKey: 'departmentId', as: 'employees' });
  // }
}

// Initialize the Department model
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
    sequelize: getSequelizeInstance(), // Get the instance via the function
    tableName: 'Departments', // Explicitly define table name
    // Optional: Add indexes here if needed
    // indexes: [{ unique: true, fields: ['name'] }]
  }
);

export default Department;