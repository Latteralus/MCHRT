import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '@/db/sequelize'; // Adjust path as needed

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

  // Define associations here if needed (e.g., hasMany Employees)
  // public static associations: {
  //   employees: Association<Position, Employee>; // Assuming Employee model exists
  // };
}

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

export { Position }; // Export the class (value)
export type { PositionAttributes, PositionCreationAttributes }; // Export the types