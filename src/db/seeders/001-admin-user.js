// src/db/seeders/001-admin-user.js
'use strict';
const bcrypt = require('bcrypt');
// const { Role } = require('../../types/roles'); // Cannot require TS enum directly

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const saltRounds = 10; // Consistent salt rounds
    const passwordHash = await bcrypt.hash('admin123', saltRounds);

    // Check if user already exists to prevent errors on re-seed
    const existingUser = await queryInterface.rawSelect('Users', {
      where: { username: 'admin' },
    }, ['id']);

    if (!existingUser) {
      await queryInterface.bulkInsert('Users', [{
        username: 'admin',
        passwordHash: passwordHash,
        role: 'Admin', // Use the string value directly
        // departmentId: null, // Explicitly set if needed, otherwise relies on table default
        createdAt: new Date(),
        updatedAt: new Date()
      }], {});
      console.log("Admin user 'admin' created.");
    } else {
      console.log("Admin user 'admin' already exists, skipping creation.");
    }
  },

  async down (queryInterface, Sequelize) {
    console.log("Removing admin user 'admin'.");
    await queryInterface.bulkDelete('Users', { username: 'admin' }, {});
  }
};