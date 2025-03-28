"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = require("@/db/sequelize"); // Use runtime Sequelize instance
// Define the Attendance model class
class Attendance extends sequelize_1.Model {
}
// Initialize the Attendance model
Attendance.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    employeeId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Employees', // Assumes an 'Employees' table exists
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // If an employee is deleted, delete their attendance records
    },
    date: {
        type: sequelize_1.DataTypes.DATEONLY, // Use DATEONLY if only the date is relevant
        allowNull: false,
    },
    timeIn: {
        type: sequelize_1.DataTypes.DATE, // Use DATE for timestamp including time
        allowNull: true, // Allow null if employee hasn't clocked in yet
    },
    timeOut: {
        type: sequelize_1.DataTypes.DATE, // Use DATE for timestamp including time
        allowNull: true, // Allow null if employee hasn't clocked out yet
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: (0, sequelize_2.getSequelizeInstance)(), // Get the instance via the function
    tableName: 'Attendance', // Explicitly define table name
    // Optional: Add indexes here if needed, e.g., for querying by employee and date
    // indexes: [{ fields: ['employeeId', 'date'] }]
});
exports.default = Attendance;
