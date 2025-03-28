// tests/db-setup.ts
import { Sequelize, QueryInterface } from 'sequelize';
import { Umzug, SequelizeStorage } from 'umzug'; // Import Umzug and SequelizeStorage from main
import { setSequelizeInstance, getSequelizeInstance } from '@/db/mockDbSetup'; // Import setter and getter
// Config will be imported inside setupTestDb
import path from 'path';

// --- Sequelize instance will be created and set in setupTestDb ---

// Models and associations will be imported inside setupTestDb

// Define umzug instance outside setup
// or ensure sequelize instance is set before umzug uses it.
// For simplicity, we'll assume umzug can be defined here and uses the getter which works *after* setupTestDb runs.
const umzug = new Umzug({
  migrations: {
    glob: path.join(__dirname, '../migrations/*.js'), // Path to migrations
    resolve: ({ name, path: migrationPath, context }: { name: string; path: string; context: QueryInterface }) => {
      const migration = require(migrationPath);
      return {
        name,
        up: async () => migration.up(context, Sequelize),
        down: async () => migration.down(context, Sequelize),
      };
    },
  },
  // These will use getSequelizeInstance(), which requires the instance to be set first
  context: () => getSequelizeInstance().getQueryInterface(),
  storage: new SequelizeStorage({ sequelize: () => getSequelizeInstance() }),
  logger: undefined,
});


export const setupTestDb = async () => {
  // Import config HERE, inside the async function run by beforeAll, using alias
  const { dbConfig } = await import('@/config/config');
  const testConfig = dbConfig.test;
  if (!testConfig) {
      throw new Error('Test database configuration not found in config/config.ts');
  }

  // Create and set the instance HERE
  const sequelizeTestInstance = new Sequelize(testConfig);
  setSequelizeInstance(sequelizeTestInstance);

  // Dynamically import models and associations HERE, AFTER instance is set
  // This ensures models use the correct, initialized Sequelize instance
  await import('@/modules/auth/models/User');
  await import('@/modules/organization/models/Department');
  await import('@/modules/employees/models/Employee');
  await import('@/modules/attendance/models/Attendance');
  await import('@/modules/leave/models/Leave');
  await import('@/modules/leave/models/LeaveBalance');
  await import('@/modules/compliance/models/Compliance');
  await import('@/modules/documents/models/Document');
  await import('@/modules/tasks/models/Task');
  await import('@/db/associations'); // Run association logic

  const sequelize = getSequelizeInstance(); // Now we can get the instance safely
  try {
    // Ensure connection is established
    await sequelize.authenticate();
    console.log('Test DB Connection established.');

    // Run all migrations using the now-initialized instance
    await umzug.up();
    console.log('Migrations applied successfully.');

  } catch (error) {
    console.error('Error setting up test database:', error);
    throw error; // Re-throw to fail test setup
  }
};

export const teardownTestDb = async () => {
  const sequelize = getSequelizeInstance(); // Get instance
  try {
    // Close the database connection
    await sequelize.close();
    console.log('Test DB Connection closed.');
  } catch (error) {
    console.error('Error tearing down test database:', error);
    // Don't throw here, as it might mask test failures
  }
};

// Optional: Function to clear data between tests for isolation
export const clearTestDb = async () => {
    const sequelize = getSequelizeInstance(); // Get instance
    try {
        const models = sequelize.models;
        // Need to delete in an order that respects foreign key constraints,
        // or temporarily disable constraints if the DB supports it.
        // For SQLite, deleting in reverse order of creation or dependency is often needed.
        // This order might need adjustment based on specific FK relationships.
        const modelNames = [
            'Task', 'Document', 'Compliance', 'Leave', 'Attendance',
            'LeaveBalance', 'Employee', 'Department', 'User' // User likely last if others depend on it
        ];

        for (const modelName of modelNames) {
            if (models[modelName]) {
                await models[modelName].destroy({ where: {}, truncate: false }); // truncate: false for SQLite compatibility with constraints
            } else {
                console.warn(`Model ${modelName} not found in sequelize.models during clearTestDb`);
            }
        }
        // console.log('Test DB cleared.'); // Optional: uncomment for debugging
    } catch (error) {
        console.error('Error clearing test database:', error);
        throw error; // Re-throw to fail the specific test
    }
};