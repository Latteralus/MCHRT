"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = require("../../../db/sequelize"); // Use relative path
// Define the Department model class
class Department extends sequelize_1.Model {
}
// Initialize the Department model
Department.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true, // Department names should likely be unique
    },
    managerId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true, // A department might not have a manager assigned initially
        references: {
            model: 'Users', // Assumes a 'Users' table exists
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', // If a manager user is deleted, set the managerId to null
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
    tableName: 'Departments', // Explicitly define table name
    // Optional: Add indexes here if needed
    // indexes: [{ unique: true, fields: ['name'] }]
});
exports.default = Department;
