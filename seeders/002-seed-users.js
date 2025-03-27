'use strict';
// IMPORTANT: Replace placeholder password hashes with actual bcrypt hashes!
// You can use a script like this (run separately):
// const bcrypt = require('bcrypt');
// const saltRounds = 10;
// const password = 'password'; // Replace with desired password
// bcrypt.hash(password, saltRounds).then(hash => console.log(hash));

// Placeholder Hashes (REPLACE THESE!)
const adminPasswordHash = '$2b$10$PLACEHOLDER_HASH_FOR_ADMIN_PASSWORD'; // Hash for 'password'
const managerPasswordHash = '$2b$10$PLACEHOLDER_HASH_FOR_MANAGER_PASSWORD'; // e.g., hash for 'managerpass'
const employeePasswordHash = '$2b$10$PLACEHOLDER_HASH_FOR_EMPLOYEE_PASSWORD'; // e.g., hash for 'employeepass'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Get Department IDs (assuming the first seeder ran)
    // This is a bit fragile; ideally, use a more robust way to get IDs if possible
    const departments = await queryInterface.sequelize.query(
      `SELECT id, name FROM "Departments";`, { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const deptMap = departments.reduce((acc, dept) => {
      acc[dept.name] = dept.id;
      return acc;
    }, {});

    const users = [
      // Admin User (matches hardcoded user in [...nextauth].ts)
      {
        username: 'admin',
        passwordHash: adminPasswordHash, // REPLACE HASH
        role: 'Admin',
        departmentId: deptMap['Administration'] || null, // Assign to Admin dept if exists
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Example Department Heads/Managers
      {
        username: 'hr_manager',
        passwordHash: managerPasswordHash, // REPLACE HASH
        role: 'DepartmentHead', // Or 'Admin' if HR Managers are Admins
        departmentId: deptMap['Human Resources'] || null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'ops_manager',
        passwordHash: managerPasswordHash, // REPLACE HASH
        role: 'DepartmentHead',
        departmentId: deptMap['Operations'] || null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Example Employee
      {
        username: 'jdoe',
        passwordHash: employeePasswordHash, // REPLACE HASH
        role: 'Employee',
        departmentId: deptMap['Compounding'] || null, // Assign to a specific dept
        createdAt: new Date(),
        updatedAt: new Date()
      },
       {
        username: 'fcal', // Faith Calkins from example.md
        passwordHash: managerPasswordHash, // REPLACE HASH - Assuming HR Director is a manager/admin
        role: 'Admin', // Assuming HR Director is Admin role
        departmentId: deptMap['Human Resources'] || null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ];

    await queryInterface.bulkInsert('Users', users, {});
  },

  async down (queryInterface, Sequelize) {
    // Remove only the specific users inserted by this seeder
    await queryInterface.bulkDelete('Users', {
      username: ['admin', 'hr_manager', 'ops_manager', 'jdoe', 'fcal']
    }, {});
  }
};