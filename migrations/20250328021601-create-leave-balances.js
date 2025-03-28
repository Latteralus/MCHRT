'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('LeaveBalances', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      employeeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Employees', // Name of the target table
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // If employee is deleted, delete their balances
      },
      leaveType: {
        type: Sequelize.STRING, // Consider ENUM if types are strictly defined and match Leave model
        allowNull: false,
      },
      balance: {
        type: Sequelize.FLOAT, // Use FLOAT or DECIMAL for hours/days
        allowNull: false,
        defaultValue: 0,
      },
      accruedYTD: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0,
      },
      usedYTD: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0,
      },
      lastUpdated: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Add unique constraint separately for potential compatibility issues
    await queryInterface.addConstraint('LeaveBalances', {
      fields: ['employeeId', 'leaveType'],
      type: 'unique',
      name: 'unique_employee_leaveType'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('LeaveBalances');
  }
};
