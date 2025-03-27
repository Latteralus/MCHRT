'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ComplianceItems', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      employeeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Employees', // Name of the target table
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // Delete compliance item if employee is deleted
      },
      itemType: {
        type: Sequelize.STRING,
        allowNull: false
      },
      itemName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      authority: {
        type: Sequelize.STRING,
        allowNull: true
      },
      licenseNumber: {
        type: Sequelize.STRING,
        allowNull: true
      },
      issueDate: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      expirationDate: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('Active', 'ExpiringSoon', 'Expired', 'PendingReview'),
        allowNull: false,
        defaultValue: 'PendingReview'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add index for faster querying by employee and expiration date
    await queryInterface.addIndex('ComplianceItems', ['employeeId', 'expirationDate']);
    // Add index for querying by status
    await queryInterface.addIndex('ComplianceItems', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ComplianceItems');
  }
};