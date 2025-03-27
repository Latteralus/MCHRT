'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Leaves', {
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
        onDelete: 'CASCADE', // Delete leave request if employee is deleted
      },
      startDate: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      endDate: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      leaveType: {
        type: Sequelize.ENUM('Vacation', 'Sick', 'Personal', 'Bereavement', 'Other'),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('Pending', 'Approved', 'Rejected', 'Cancelled'),
        allowNull: false,
        defaultValue: 'Pending'
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      approverId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users', // Name of the target table
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', // Keep record, but remove approver link if user deleted
      },
      approvedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      comments: {
        type: Sequelize.TEXT,
        allowNull: true
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

    // Add index for faster querying by employee and dates
    await queryInterface.addIndex('Leaves', ['employeeId', 'startDate', 'endDate']);
    // Add index for querying by status
    await queryInterface.addIndex('Leaves', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Leaves');
  }
};