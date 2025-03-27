'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Attendance', {
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
        onDelete: 'CASCADE', // Delete attendance if employee is deleted
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      timeIn: {
        type: Sequelize.DATE, // Use DATE for timestamp
        allowNull: true
      },
      timeOut: {
        type: Sequelize.DATE, // Use DATE for timestamp
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

    // Add index for faster querying by employee and date
    await queryInterface.addIndex('Attendance', ['employeeId', 'date']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Attendance');
  }
};