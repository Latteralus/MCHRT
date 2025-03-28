"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/modules/leave/models/LeaveBalance.ts
const sequelize_1 = require("sequelize");
const sequelize_2 = require("@/db/sequelize"); // Use runtime Sequelize instance
// Define the LeaveBalance model class
class LeaveBalance extends sequelize_1.Model {
}
// Initialize the LeaveBalance model
LeaveBalance.init({
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
        onDelete: 'CASCADE', // If employee is deleted, delete their balances
    },
    leaveType: {
        type: sequelize_1.DataTypes.STRING, // Consider ENUM if types are strictly defined
        allowNull: false,
    },
    balance: {
        type: sequelize_1.DataTypes.FLOAT, // Use FLOAT or DECIMAL for hours/days
        allowNull: false,
        defaultValue: 0,
    },
    accruedYTD: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0,
    },
    usedYTD: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0,
    },
    lastUpdated: {
        type: sequelize_1.DataTypes.DATE,
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
    tableName: 'LeaveBalances', // Explicitly define table name
    indexes: [
        // Ensure an employee can only have one balance record per leave type
        { unique: true, fields: ['employeeId', 'leaveType'] }
    ]
});
exports.default = LeaveBalance;
