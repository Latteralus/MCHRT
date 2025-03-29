'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('OffboardingTasks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      offboardingId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Offboardings', // Name of the target table
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // Delete tasks if the offboarding process is deleted
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Pending',
        validate: { // Note: Validation is primarily enforced at the model level
          isIn: [['Pending', 'Completed']],
        },
      },
      assignedToUserId: {
        type: Sequelize.INTEGER,
        allowNull: true, // Can be null
        references: {
          model: 'Users', // Name of the target table
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', // Keep task if user is deleted, just remove assignment
      },
      assignedRole: {
        type: Sequelize.STRING,
        allowNull: true // Can be null
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('OffboardingTasks');
  }
};
