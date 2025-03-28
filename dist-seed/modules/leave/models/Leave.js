"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = require("@/db/sequelize"); // Use runtime Sequelize instance
// Define the Leave model class
class Leave extends sequelize_1.Model {
}
// Initialize the Leave model
Leave.init({
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
        onDelete: 'CASCADE', // If an employee is deleted, delete their leave records
    },
    startDate: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    endDate: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    leaveType: {
        type: sequelize_1.DataTypes.ENUM('Vacation', 'Sick', 'Personal', 'Bereavement', 'Other'),
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('Pending', 'Approved', 'Rejected', 'Cancelled'),
        allowNull: false,
        defaultValue: 'Pending',
    },
    reason: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    approverId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true, // Null until approved/rejected
        references: {
            model: 'Users', // Assumes a 'Users' table exists
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', // If approver is deleted, keep the record but nullify approverId
    },
    approvedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true, // Null until approved/rejected
    },
    comments: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
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
    tableName: 'Leaves', // Explicitly define table name
    // Optional: Add indexes here if needed
    // indexes: [{ fields: ['employeeId', 'startDate'] }]
});
exports.default = Leave;
