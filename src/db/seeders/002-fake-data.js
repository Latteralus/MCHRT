'use strict';

const { faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');

// Require compiled JS models from dist-seed directory
const Department = require('../../../dist-seed/modules/organization/models/Department').default;
const User = require('../../../dist-seed/modules/auth/models/User').default;
const Employee = require('../../../dist-seed/modules/employees/models/Employee').default;
// const Attendance = require('../../../dist-seed/modules/attendance/models/Attendance').default; // Simplified for now
// const LeaveBalance = require('../../modules/leave/models/LeaveBalance').default; // Simplified for now

const NUM_FAKE_EMPLOYEES = 50;
const PASSWORD_SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = 'password123';

module.exports = {
  async up (queryInterface, Sequelize) {
    // Note: queryInterface is not used when interacting directly via models, but kept for structure
    try {
      console.log('Starting fake data seeding via Sequelize CLI seeder...');

      // --- 1. Ensure Departments Exist ---
      const departmentNames = ['Administration', 'Human Resources', 'Operations', 'Hospice', 'Wellness', 'Compounding'];
      const departments = [];
      for (const name of departmentNames) {
        const [dept, created] = await Department.findOrCreate({
          where: { name: name },
          defaults: { name: name } // No description field
        });
        departments.push(dept);
        if (created) {
          console.log(`Created department: ${name}`);
        }
      }
      console.log(`Found/Created ${departments.length} departments.`);
      if (departments.length === 0) {
        throw new Error("No departments found or created. Cannot proceed.");
      }

      // --- 2. Create Fake Users ---
      const usersData = [];
      const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, PASSWORD_SALT_ROUNDS);
      for (let i = 0; i < NUM_FAKE_EMPLOYEES; i++) {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        usersData.push({
          username: `user${i + 1}`, // Use username
          passwordHash: hashedPassword, // Use passwordHash
          role: 'employee',
          // Store temp names for Employee creation
          _tempFirstName: firstName,
          _tempLastName: lastName,
        });
      }

      // Check if users already exist by username
      const existingUsernames = usersData.map(u => u.username);
      const existingUsers = await User.findAll({ where: { username: existingUsernames } });
      const existingUsernamesSet = new Set(existingUsers.map(u => u.getDataValue('username')));
      const usersToCreate = usersData
        .filter(u => !existingUsernamesSet.has(u.username))
        .map(({ _tempFirstName, _tempLastName, ...rest }) => rest); // Remove temp fields

      let createdUsers = [];
      if (usersToCreate.length > 0) {
          createdUsers = await User.bulkCreate(usersToCreate, { returning: true });
          console.log(`Created ${createdUsers.length} new fake users.`);
      } else {
          console.log('All fake users already exist.');
      }
      const allUsers = [...existingUsers, ...createdUsers];

      // Map usernames to temp names for employee creation
      const userNamesMap = new Map(usersData.map(u => [u.username, { firstName: u._tempFirstName, lastName: u._tempLastName }]));


      // --- 3. Create Fake Employees ---
      const employeesData = [];
      const existingUserIdsWithEmployees = new Set((await Employee.findAll({ where: { userId: allUsers.map(u => u.getDataValue('id')) } })).map(e => e.getDataValue('userId'))); // Use getDataValue

      for (const user of allUsers) {
        const userId = user.getDataValue('id');
        const username = user.getDataValue('username');
        if (!existingUserIdsWithEmployees.has(userId)) {
            const department = departments[Math.floor(Math.random() * departments.length)];
            const names = userNamesMap.get(username);
            if (names) {
                employeesData.push({
                    userId: userId,
                    departmentId: department.getDataValue('id'), // Use getDataValue
                    firstName: names.firstName, // Add required firstName
                    lastName: names.lastName,   // Add required lastName
                    position: faker.person.jobTitle(), // Map jobTitle to position
                    hireDate: faker.date.past({ years: 5 }),
                });
            } else {
                 console.warn(`Could not find names for user ${username}`);
            }
        }
      }

      if (employeesData.length > 0) {
          await Employee.bulkCreate(employeesData);
          console.log(`Created ${employeesData.length} new fake employees.`);
      } else {
          console.log('All fake employees already exist.');
      }

      // --- 4. & 5. Attendance & Leave Balances (Simplified/Skipped) ---
      console.log('Skipping attendance & leave balance seeding for now.');

      console.log('Fake data seeding completed successfully.');

    } catch (error) {
      console.error('Error seeding fake data:', error);
      // Attempt to revert if error occurs (using the down method structure)
      // Note: The 'down' method in this file needs similar '.default' access if used.
      throw error; // Re-throw error to stop the seeding process
    }
  },

  async down (queryInterface, Sequelize) {
    // IMPORTANT: This 'down' method also needs updating to use '.default'
    // and potentially getDataValue if interacting with model instances.
    // For now, focusing on getting 'up' to work.
    try {
      console.log('Reverting fake data seeding (basic)...');
      // Basic revert, might need refinement based on dependencies and '.default' access
      const User = require('../../modules/auth/models/User').default;
      const Employee = require('../../modules/employees/models/Employee').default;

      const fakeUsers = await User.findAll({ where: { username: { [Sequelize.Op.like]: 'user%' } } });
      const fakeUserIds = fakeUsers.map(u => u.getDataValue('id'));

      if (fakeUserIds.length > 0) {
          console.log(`Deleting employees for ${fakeUserIds.length} fake users...`);
          await queryInterface.bulkDelete('Employees', { userId: fakeUserIds }, {});
      }

      console.log(`Deleting ${fakeUserIds.length} fake users...`);
      await queryInterface.bulkDelete('Users', { username: { [Sequelize.Op.like]: 'user%' } }, {});

      console.log('Fake data reverting completed (basic).');
    } catch (error) {
        console.error('Error reverting fake data:', error);
        throw error;
    }
  }
};