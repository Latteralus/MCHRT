'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ActivityLogs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: { // User who performed the action
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users', // Assuming a Users table exists
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL' // Keep log even if user is deleted, just nullify the reference
      },
      actionType: { // e.g., 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'UPLOAD', 'LOGIN'
        type: Sequelize.STRING,
        allowNull: false
      },
      entityType: { // e.g., 'Employee', 'Leave', 'Document', 'Onboarding', 'Offboarding', 'User'
        type: Sequelize.STRING,
        allowNull: true // May not always relate to a specific DB entity type (e.g., login)
      },
      entityId: { // ID of the related entity (if applicable)
        type: Sequelize.INTEGER,
        allowNull: true
      },
      description: { // Human-readable description of the action
        type: Sequelize.TEXT,
        allowNull: false
      },
      details: { // Optional JSON blob for extra context/data changes
        type: Sequelize.JSON,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      // No updatedAt needed for logs typically
    });

    // Add index for faster querying by user or entity
    await queryInterface.addIndex('ActivityLogs', ['userId']);
    await queryInterface.addIndex('ActivityLogs', ['entityType', 'entityId']);
    await queryInterface.addIndex('ActivityLogs', ['createdAt']);

  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ActivityLogs');
  }
};
