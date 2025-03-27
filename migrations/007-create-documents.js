'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Documents', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      filePath: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true // Ensure file paths are unique
      },
      fileType: {
        type: Sequelize.STRING,
        allowNull: true
      },
      fileSize: {
        type: Sequelize.INTEGER, // Size in bytes
        allowNull: true
      },
      ownerId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users', // Name of the target table
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      employeeId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Employees', // Name of the target table
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', // Keep document if employee deleted? Or CASCADE?
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
      version: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 1
      },
      description: {
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

    // Add indexes for faster querying on foreign keys
    await queryInterface.addIndex('Documents', ['ownerId']);
    await queryInterface.addIndex('Documents', ['employeeId']);
    await queryInterface.addIndex('Documents', ['departmentId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Documents');
  }
};