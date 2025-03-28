"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = require("../../../db/sequelize"); // Use relative path
// Define the Employee model class
class Employee extends sequelize_1.Model {
}
// Initialize the Employee model
Employee.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    firstName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    lastName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    // IMPORTANT: SSN requires encryption at rest (HIPAA).
    // This field stores the encrypted value. Actual encryption/decryption
    // should be handled in application logic (e.g., hooks or service layer).
    ssnEncrypted: {
        type: sequelize_1.DataTypes.STRING, // Store as string (or BLOB depending on encryption output)
        allowNull: true, // Or false if SSN is mandatory
        // Add comment about encryption requirement
    },
    departmentId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true, // Or false if every employee must have a department
        references: {
            model: 'Departments', // Assumes a 'Departments' table exists
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', // Or 'RESTRICT' / 'CASCADE' based on requirements
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true, // Or false if every employee must be linked to a user account
        references: {
            model: 'Users', // Assumes a 'Users' table exists
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', // Or 'RESTRICT' if a User shouldn't be deleted if linked to an Employee
    },
    position: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    hireDate: {
        type: sequelize_1.DataTypes.DATEONLY, // Use DATEONLY if time is not relevant
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
    tableName: 'Employees', // Explicitly define table name
    // Optional: Add indexes here if needed
    // indexes: [{ fields: ['lastName', 'firstName'] }]
});
exports.default = Employee;
