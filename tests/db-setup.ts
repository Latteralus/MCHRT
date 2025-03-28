// tests/db-setup.ts
import { Sequelize, QueryInterface } from 'sequelize';
import { Umzug, SequelizeStorage } from 'umzug'; // Import Umzug and SequelizeStorage from main
import { setSequelizeInstance, getSequelizeInstance } from '../src/db/mockDbSetup'; // Use relative path
import path from 'path';

// --- Create and set the instance SYNCHRONOUSLY ---
// Use require for config here as well for sync loading
const dbConfig = require('../src/config/config.js');
const testConfig = dbConfig.test;
if (!testConfig) {
  throw new Error('Test database configuration not found in config/config.js');
}
const sequelizeTestInstance = new Sequelize(testConfig);
setSequelizeInstance(sequelizeTestInstance);
// --- Instance is now set BEFORE any async operations ---

// Models and associations will be imported dynamically AFTER migrations run in setupTestDb.

// --- Umzug instance will be created inside setupTestDb after Sequelize is ready ---
export const setupTestDb = async () => {
  // Instance is already created and set above
  // Create and set the instance HERE
  if (!testConfig) { // Keep check just in case, though require should have failed earlier if config was bad
      throw new Error('Test database configuration not found in config/config.js');
  }

  const sequelize = getSequelizeInstance(); // Get the already created instance

  try {
    // Ensure connection is established
    await sequelize.authenticate();
    console.log('Test DB Connection established.');

    // --- Create Umzug instance HERE, now that Sequelize instance is set ---
    const umzug = new Umzug({
      migrations: {
        glob: path.join(__dirname, '../migrations/*.js'), // Path to migrations
        resolve: ({ name, path: migrationPath, context }: import('umzug').MigrationParams<QueryInterface>) => {
          // Handle potentially undefined path
          if (!migrationPath) {
            throw new Error(`Migration path is undefined for migration: ${name}`);
          }
          const migration = require(migrationPath);
          return {
            name,
            // Pass the actual Sequelize class, not an instance
            up: async () => migration.up(context, Sequelize),
            down: async () => migration.down(context, Sequelize),
          };
        },
      },
      // Pass the actual instance now
      context: sequelize.getQueryInterface(),
      storage: new SequelizeStorage({ sequelize: sequelize }), // Pass the instance directly
      logger: undefined, // Or console for debugging
    });

    // Run all migrations using the newly created umzug instance
    await umzug.up();
    console.log('Migrations applied successfully.');

    // Dynamically import models and associations HERE, AFTER migrations ensure tables exist
    await import('../src/modules/auth/models/User');
    await import('../src/modules/organization/models/Department');
    await import('../src/modules/employees/models/Employee');
    await import('../src/modules/attendance/models/Attendance');
    await import('../src/modules/leave/models/Leave');
    await import('../src/modules/leave/models/LeaveBalance');
    await import('../src/modules/compliance/models/Compliance');
    await import('../src/modules/documents/models/Document');
    await import('../src/modules/tasks/models/Task');
    await import('../src/db/associations'); // Run association logic

    console.log('Models and associations loaded dynamically after migrations.');
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