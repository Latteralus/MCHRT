import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '@/db/mockDbSetup'; // Adjust path as needed

// Define the attributes for the Attendance model
interface AttendanceAttributes {
  id: number;
  employeeId: number; // Foreign key referencing Employee
  date: Date; // The specific date of the attendance record
  timeIn?: Date; // Timestamp for clocking in
  timeOut?: Date; // Timestamp for clocking out
  // Add other fields if needed, e.g., notes, status (Present, Late, Absent)
  createdAt?: Date;
  updatedAt?: Date;
}

// Define creation attributes (optional fields for creation)
interface AttendanceCreationAttributes extends Optional<AttendanceAttributes, 'id' | 'createdAt' | 'updatedAt' | 'timeIn' | 'timeOut'> {}

// Define the Attendance model class
class Attendance extends Model<AttendanceAttributes, AttendanceCreationAttributes> implements AttendanceAttributes {
  public id!: number;
  public employeeId!: number;
  public date!: Date;
  public timeIn?: Date;
  public timeOut?: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Define associations here later
  // public static associate(models: any) {
  //   Attendance.belongsTo(models.Employee, { foreignKey: 'employeeId', as: 'employee' });
  // }
}

// Initialize the Attendance model
Attendance.init(
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
      onDelete: 'CASCADE', // If an employee is deleted, delete their attendance records
    },
    date: {
      type: DataTypes.DATEONLY, // Use DATEONLY if only the date is relevant
      allowNull: false,
    },
    timeIn: {
      type: DataTypes.DATE, // Use DATE for timestamp including time
      allowNull: true, // Allow null if employee hasn't clocked in yet
    },
    timeOut: {
      type: DataTypes.DATE, // Use DATE for timestamp including time
      allowNull: true, // Allow null if employee hasn't clocked out yet
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
    tableName: 'Attendance', // Explicitly define table name
    // Optional: Add indexes here if needed, e.g., for querying by employee and date
    // indexes: [{ fields: ['employeeId', 'date'] }]
  }
);

export default Attendance;