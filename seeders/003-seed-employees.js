'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Get Department IDs
    const departments = await queryInterface.sequelize.query(
      `SELECT id, name FROM "Departments";`, { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const deptMap = departments.reduce((acc, dept) => {
      acc[dept.name] = dept.id;
      return acc;
    }, {});

    const employees = [
      {
        firstName: 'James',
        lastName: 'Kirk',
        // ssnEncrypted: null, // Add encrypted SSN later
        departmentId: deptMap['Compounding'] || null,
        position: 'Pharmacist',
        hireDate: new Date('2022-05-15'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        firstName: 'Leonard',
        lastName: 'McCoy',
        // ssnEncrypted: null,
        departmentId: deptMap['Compounding'] || null,
        position: 'Pharmacy Technician',
        hireDate: new Date('2023-01-20'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        firstName: 'Nyota',
        lastName: 'Uhura',
        // ssnEncrypted: null,
        departmentId: deptMap['Operations'] || null,
        position: 'Operations Specialist',
        hireDate: new Date('2022-11-01'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        firstName: 'William',
        lastName: 'Manager', // Example manager name from example.md license list
        // ssnEncrypted: null,
        departmentId: deptMap['Operations'] || null, // Assuming Ops Manager
        position: 'Operations Manager',
        hireDate: new Date('2021-08-10'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
       {
        firstName: 'Faith',
        lastName: 'Calkins', // From example.md sidebar
        // ssnEncrypted: null,
        departmentId: deptMap['Human Resources'] || null,
        position: 'HR Director',
        hireDate: new Date('2020-03-01'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Add more employees as needed for testing different departments/roles
    ];

    await queryInterface.bulkInsert('Employees', employees, {});
  },

  async down (queryInterface, Sequelize) {
    // Remove only the specific employees inserted by this seeder
    // Using lastName as a simple way to identify them for deletion
    await queryInterface.bulkDelete('Employees', {
      lastName: ['Kirk', 'McCoy', 'Uhura', 'Manager', 'Calkins']
    }, {});
  }
};