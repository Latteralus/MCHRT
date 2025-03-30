import { Model, DataTypes, Optional, Sequelize } from 'sequelize'; // Added Sequelize import
import type { EmployeeModelClass } from '@/modules/employees/models/Employee'; // Import Employee class type

// Interface for Position attributes
interface PositionAttributes {
  id: number;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface for Position creation attributes (optional 'id', 'createdAt', 'updatedAt')
interface PositionCreationAttributes extends Optional<PositionAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Position extends Model<PositionAttributes, PositionCreationAttributes> implements PositionAttributes {
  public id!: number;
  public name!: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Define associations
  public static associate(models: {
    Employee: typeof EmployeeModelClass;
    // Add other models as needed
  }) {
    // A Position can have multiple Employees
    Position.hasMany(models.Employee, {
      foreignKey: 'positionId',
      as: 'employees', // Allows Position.getEmployees()
    });
  }
}

// Export an initializer function
export const initializePosition = (sequelize: Sequelize) => {
  Position.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
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
      tableName: 'Positions',
      timestamps: true, // Sequelize handles createdAt and updatedAt automatically
    }
  );

  return Position; // Return the initialized model
};

// Export the class type itself if needed elsewhere
export { Position as PositionModelClass };
export type { PositionAttributes, PositionCreationAttributes }; // Export the types