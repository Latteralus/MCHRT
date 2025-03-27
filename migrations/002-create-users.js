'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      passwordHash: {
        type: Sequelize.STRING,
        allowNull: false
      },
      role: {
        type: Sequelize.STRING, // Consider ENUM type if DB supports it well
        allowNull: false
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

    // Add index on username for faster lookups
    await queryInterface.addIndex('Users', ['username']);

    // Note: The foreign key constraint for Department.managerId referencing Users
    // needs to be added *after* the Users table is created.
    // We can do this here or in a separate migration file.
    // Adding it here for simplicity:
    await queryInterface.addConstraint('Departments', {
        fields: ['managerId'],
        type: 'foreign key',
        name: 'departments_managerId_fk', // optional constraint name
        references: {
          table: 'Users',
          field: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });

  },

  async down(queryInterface, Sequelize) {
    // Remove the constraint first before dropping the table
    await queryInterface.removeConstraint('Departments', 'departments_managerId_fk');
    await queryInterface.dropTable('Users');
  }
};