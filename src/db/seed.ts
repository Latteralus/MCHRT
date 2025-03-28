// src/db/seed.ts
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
// Import values (classes)
import Department from '../modules/organization/models/Department';
import User from '../modules/auth/models/User';
import Employee from '../modules/employees/models/Employee';
// Import types separately
import type { DepartmentCreationAttributes } from '../modules/organization/models/Department';
import type { UserCreationAttributes } from '../modules/auth/models/User';
import type { EmployeeCreationAttributes } from '../modules/employees/models/Employee';
// import { Attendance } from '../modules/attendance/models/Attendance'; // Simplified for now
// import { LeaveBalance } from '../modules/leave/models/LeaveBalance'; // Simplified for now
import { getSequelizeInstance } from './sequelize'; // Import the initialized instance

const NUM_FAKE_EMPLOYEES = 50;
const PASSWORD_SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = 'password123';

const seedDatabase = async () => {
  const sequelize = getSequelizeInstance(); // Get the initialized instance

  // Optional: Sync database (useful for development, be careful in production)
  // await sequelize.sync({ force: true }); // This will drop existing tables! Use with caution.
  // console.log("Database synced!");

  try {
    console.log('Starting fake data seeding via script...');

    // --- 1. Ensure Departments Exist ---
    const departmentNames = ['Administration', 'Human Resources', 'Operations', 'Hospice', 'Wellness', 'Compounding'];
    const departments = [];
    const findOrCreateDepartment = Department.findOrCreate.bind(Department); // Bind the method
    for (const name of departmentNames) {
      const [dept, created] = await findOrCreateDepartment({ // Use the bound method
        where: { name: name },
        defaults: { name: name } // Remove non-existent description field
      }) as [Department, boolean]; // Explicitly cast the result tuple
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
      // User model requires username and passwordHash
      usersData.push({
        username: `user${i + 1}`, // Use generated username
        passwordHash: hashedPassword, // Use the hashed password
        role: 'employee',
        // Store firstName/lastName temporarily for Employee creation later
        _tempFirstName: firstName,
        _tempLastName: lastName,
      });
    }
    // Check if users already exist by username before creating
    const existingUsernames = usersData.map(u => u.username);
    const existingUsers = await User.findAll({ where: { username: existingUsernames } });
    const existingUsernamesSet = new Set(existingUsers.map((u: User) => u.getDataValue('username'))); // Type User should now work
    // Filter out users that already exist and remove temporary fields before creation
    const usersToCreate = usersData
        .filter(u => !existingUsernamesSet.has(u.username))
        .map(({ _tempFirstName, _tempLastName, ...rest }) => rest); // Remove temp fields

    let createdUsers: User[] = []; // Type User should now work
    if (usersToCreate.length > 0) {
        createdUsers = await User.bulkCreate(usersToCreate, { returning: true });
        console.log(`Created ${createdUsers.length} new fake users.`);
    } else {
        console.log('All fake users already exist.');
    }
    // Combine existing and newly created for employee creation step
    const allUsers = [...existingUsers, ...createdUsers];


    // --- 3. Create Fake Employees ---
    const employeesData = [];
    // Fetch temporary names stored earlier for employee creation
    const userNamesMap = new Map(usersData.map(u => [u.username, { firstName: u._tempFirstName, lastName: u._tempLastName }]));
    const existingUserIdsWithEmployees = new Set((await Employee.findAll({ where: { userId: allUsers.map((u: User) => u.getDataValue('id')) } })).map((e: Employee) => e.userId)); // Types User and Employee should now work

    for (const user of allUsers) {
        // Only create employee if one doesn't exist for this user
        if (!existingUserIdsWithEmployees.has(user.getDataValue('id'))) { // Use getDataValue
            const department = departments[Math.floor(Math.random() * departments.length)];
            const names = userNamesMap.get(user.getDataValue('username')); // Use getDataValue
            if (names) {
                employeesData.push({
                    userId: user.getDataValue('id'), // Use getDataValue
                    departmentId: department.id,
                    firstName: names.firstName, // Add required firstName
                    lastName: names.lastName,   // Add required lastName
                    position: faker.person.jobTitle(), // Map jobTitle to position
                    hireDate: faker.date.past({ years: 5 }),
                    // Remove fields not in Employee model: phoneNumber, address, city, state, zipCode, status
                });
            } else {
                 console.warn(`Could not find names for user ${user.getDataValue('username')}`); // Use getDataValue
            }
        }
    }

    let createdEmployees = [];
    if (employeesData.length > 0) {
        createdEmployees = await Employee.bulkCreate(employeesData, { returning: true });
        console.log(`Created ${createdEmployees.length} new fake employees.`);
    } else {
        console.log('All fake employees already exist.');
    }
    // const allEmployees = [...(await Employee.findAll({ where: { userId: allUsers.map(u => u.id) } }))]; // Fetch all relevant employees


    // --- 4. Create Fake Attendance Records (Last 30 days) ---
    // Consider skipping if data exists to avoid duplicates or use findOrCreate
    console.log('Skipping attendance seeding for now to simplify.'); // Simplify for debugging

    // --- 5. Create Fake Leave Balances ---
    // Consider skipping if data exists or use findOrCreate
    console.log('Skipping leave balance seeding for now to simplify.'); // Simplify for debugging


    console.log('Fake data seeding script completed successfully.');

  } catch (error) {
    console.error('Error seeding fake data via script:', error);
    process.exit(1); // Exit with error code
  } finally {
    // await sequelize.close(); // Close connection if needed
    // console.log('Database connection closed.');
  }
};

// Execute the seeding function
seedDatabase();