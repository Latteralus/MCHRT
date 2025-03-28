"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = require("@/db/sequelize"); // Use runtime Sequelize instance
// Define the Compliance model class
class Compliance extends sequelize_1.Model {
}
// Initialize the Compliance model
Compliance.init({
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
        onDelete: 'CASCADE', // If an employee is deleted, delete their compliance records
    },
    itemType: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    itemName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    authority: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    licenseNumber: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    issueDate: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: true,
    },
    expirationDate: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: true, // Some items might not expire
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('Active', 'ExpiringSoon', 'Expired', 'PendingReview'),
        allowNull: false,
        defaultValue: 'PendingReview', // Or determine based on dates
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
    tableName: 'ComplianceItems', // Explicitly define table name
    // Optional: Add indexes here if needed
    // indexes: [{ fields: ['employeeId', 'expirationDate'] }]
});
exports.default = Compliance;
