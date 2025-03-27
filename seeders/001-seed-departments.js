'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const departments = [
      { name: 'Administration', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Human Resources', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Operations', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Compounding', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Shipping', createdAt: new Date(), updatedAt: new Date() },
    ];

    await queryInterface.bulkInsert('Departments', departments, {});
  },

  async down (queryInterface, Sequelize) {
    // Remove only the specific departments inserted by this seeder
    await queryInterface.bulkDelete('Departments', {
      name: ['Administration', 'Human Resources', 'Operations', 'Compounding', 'Shipping']
    }, {});
  }
};