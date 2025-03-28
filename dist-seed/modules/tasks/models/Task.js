"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/modules/tasks/models/Task.ts
const sequelize_1 = require("sequelize");
const sequelize_2 = require("@/db/sequelize"); // Use runtime Sequelize instance
// Define the Task model class
class Task extends sequelize_1.Model {
}
// Initialize the Task model
Task.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('Pending', 'InProgress', 'Completed', 'Blocked'),
        allowNull: false,
        defaultValue: 'Pending',
    },
    dueDate: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: true,
    },
    assignedToId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true, // Tasks might be unassigned initially
        references: { model: 'Employees', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', // Keep task if employee is deleted, just unassign
    },
    createdById: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true, // System-generated tasks might not have a creator user
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    },
    relatedEntityType: {
        type: sequelize_1.DataTypes.ENUM('Onboarding', 'Offboarding', 'Compliance', 'General'),
        allowNull: true,
    },
    relatedEntityId: {
        type: sequelize_1.DataTypes.INTEGER,
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
    tableName: 'Tasks',
    // Optional: Add indexes
    // indexes: [{ fields: ['assignedToId', 'status'] }, { fields: ['relatedEntityType', 'relatedEntityId'] }]
});
exports.default = Task;
