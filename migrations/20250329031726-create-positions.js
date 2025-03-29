'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Positions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true // Ensure position names are unique
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

    // Optional: Seed some initial positions
    await queryInterface.bulkInsert('Positions', [
      { name: 'Manager', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Pharmacist', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Pharmacy Technician', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Administrator', createdAt: new Date(), updatedAt: new Date() },
      { name: 'HR Specialist', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Operations Staff', createdAt: new Date(), updatedAt: new Date() },
      // Add other common positions as needed
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Positions');
  }
};
