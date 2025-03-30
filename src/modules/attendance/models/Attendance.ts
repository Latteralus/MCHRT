import { DataTypes, Model, Optional, Sequelize } from 'sequelize'; // Added Sequelize import
import type { EmployeeModelClass } from '@/modules/employees/models/Employee'; // Import Employee class type

// Define the attributes for the Attendance model
export interface AttendanceAttributes { // Add export keyword
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
export interface AttendanceCreationAttributes extends Optional<AttendanceAttributes, 'id' | 'createdAt' | 'updatedAt' | 'timeIn' | 'timeOut'> {}

// Define the Attendance model class
class Attendance extends Model<AttendanceAttributes, AttendanceCreationAttributes> { // Removed 'implements AttendanceAttributes'
  public id!: number;
  public employeeId!: number;
  public date!: Date;
  public timeIn?: Date;
  public timeOut?: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Define associations
  public static associate(models: {
    Employee: typeof EmployeeModelClass;
    // Add other models as needed
  }) {
    // An Attendance record belongs to one Employee
    Attendance.belongsTo(models.Employee, {
      foreignKey: 'employeeId',
      as: 'employee', // Allows Attendance.getEmployee()
    });
  }
}

// Export an initializer function
export const initializeAttendance = (sequelize: Sequelize) => {
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
      sequelize: sequelize, // Use the passed instance
      tableName: 'Attendance', // Explicitly define table name
      // Optional: Add indexes here if needed, e.g., for querying by employee and date
      // indexes: [{ fields: ['employeeId', 'date'] }]
    }
  );

  return Attendance; // Return the initialized model
};

// Export the class type itself if needed elsewhere
export { Attendance as AttendanceModelClass };