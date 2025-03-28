// tests/db-setup.ts
import { Sequelize, QueryInterface } from 'sequelize';
import { Umzug, SequelizeStorage } from 'umzug';
import { sequelize } from '@/db'; // Import the named export
import path from 'path';

// Import all models to ensure they are registered with Sequelize
// Adjust paths as necessary based on actual model locations
import '@/modules/auth/models/User';
import '@/modules/organization/models/Department';
import '@/modules/employees/models/Employee';
import '@/modules/attendance/models/Attendance';
import '@/modules/leave/models/Leave';
import '@/modules/leave/models/LeaveBalance'; // Added
import '@/modules/compliance/models/Compliance';
import '@/modules/documents/models/Document';
import '@/modules/tasks/models/Task'; // Added

// Ensure associations are loaded
import '@/db/associations';

const umzug = new Umzug({
  migrations: {
    glob: path.join(__dirname, '../migrations/*.js'), // Path to migrations
    resolve: ({ name, path, context }: { name: string; path: string; context: QueryInterface }) => {
      // Adjust the migration resolution as needed, especially if context is required
      const migration = require(path);
      return {
        name,
        up: async () => migration.up(context, Sequelize),
        down: async () => migration.down(context, Sequelize),
      };
    },
  },
  context: sequelize.getQueryInterface(), // Pass queryInterface as context
  storage: new SequelizeStorage({ sequelize }),
  logger: undefined, // Disable Umzug logging for tests, or use console.log for debugging
});

export const setupTestDb = async () => {
  try {
    // Ensure connection is established (sync might do this, but explicit connect is safer)
    await sequelize.authenticate();
    console.log('Test DB Connection established.');

    // Run all migrations
    await umzug.up();
    console.log('Migrations applied successfully.');

  } catch (error) {
    console.error('Error setting up test database:', error);
    throw error; // Re-throw to fail test setup
  }
};

export const teardownTestDb = async () => {
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