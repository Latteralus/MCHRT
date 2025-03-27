'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Employees', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      ssnEncrypted: {
        type: Sequelize.STRING, // Or BLOB depending on encryption output
        allowNull: true, // Adjust if SSN is mandatory
        comment: 'Stores encrypted SSN. Decrypt in application layer.'
      },
      departmentId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Departments', // Name of the target table
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      position: {
        type: Sequelize.STRING,
        allowNull: true
      },
      hireDate: {
        type: Sequelize.DATEONLY,
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

    // Optional: Add index on name for faster sorting/searching
    await queryInterface.addIndex('Employees', ['lastName', 'firstName']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Employees');
  }
};