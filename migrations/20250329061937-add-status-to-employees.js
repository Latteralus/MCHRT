'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Employees', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Onboarding',
      validate: {
        isIn: [['Onboarding', 'Active', 'Terminating', 'Terminated', 'On Leave', 'Vacation']],
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Employees', 'status');
  }
};
