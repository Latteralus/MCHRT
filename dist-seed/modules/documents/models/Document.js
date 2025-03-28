"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = require("@/db/sequelize"); // Use runtime Sequelize instance
// Define the Document model class
class Document extends sequelize_1.Model {
}
// Initialize the Document model
Document.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    filePath: {
        type: sequelize_1.DataTypes.STRING, // Store the relative or absolute path on the server
        allowNull: false,
        unique: true, // File paths should ideally be unique
    },
    fileType: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    fileSize: {
        type: sequelize_1.DataTypes.INTEGER, // Store size in bytes
        allowNull: true,
    },
    ownerId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true, // Or false if owner is mandatory
        references: {
            model: 'Users', // Assumes a 'Users' table exists
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', // Or 'RESTRICT'
    },
    employeeId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true, // Document might not be specific to one employee
        references: {
            model: 'Employees', // Assumes an 'Employees' table exists
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', // Or 'CASCADE' if docs should be deleted with employee
    },
    departmentId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true, // Document might not be specific to one department
        references: {
            model: 'Departments', // Assumes a 'Departments' table exists
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    },
    version: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1,
    },
    description: {
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
    tableName: 'Documents', // Explicitly define table name
    // Optional: Add indexes here if needed
    // indexes: [{ fields: ['employeeId'] }, { fields: ['departmentId'] }]
});
exports.default = Document;
