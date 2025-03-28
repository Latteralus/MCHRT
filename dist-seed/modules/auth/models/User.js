"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = require("../../../db/sequelize"); // Use relative path
// Define the User model class
class User extends sequelize_1.Model {
}
// Initialize the User model
User.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    username: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    passwordHash: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: sequelize_1.DataTypes.STRING, // Consider DataTypes.ENUM('Admin', 'DepartmentHead', 'Employee')
        allowNull: false,
    },
    departmentId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true, // Allow null for roles like Admin? Or handle association differently.
        references: {
            model: 'Departments', // This assumes a 'Departments' table exists
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', // Or 'RESTRICT' depending on requirements
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
    tableName: 'Users', // Explicitly define table name
    // Optional: Add indexes here if needed
    // indexes: [{ unique: true, fields: ['username'] }]
});
exports.default = User;
