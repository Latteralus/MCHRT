// tests/db-setup.ts
import { Sequelize } from 'sequelize';
// Remove Umzug imports as we'll use sync() instead
// import { Umzug, SequelizeStorage } from 'umzug';
import { getSequelizeInstance } from '../src/db/mockDbSetup'; // Use relative path (setSequelizeInstance removed)
import path from 'path';

// Instance will be created and set inside setupTestDb

// Models and associations will be imported dynamically AFTER migrations run in setupTestDb.

// --- Umzug instance will be created inside setupTestDb after Sequelize is ready ---
export const setupTestDb = async () => {
  console.log('[setupTestDb] Starting setup...');
  // --- Get the already created instance ---
  const sequelize = getSequelizeInstance();
  // --- Instance is available ---

  try {
    // Ensure connection is established
    await sequelize.authenticate();
    console.log('[setupTestDb] Test DB Connection established.');

    // Dynamically import models HERE, BEFORE sync so Sequelize knows about them
    console.log('[setupTestDb] Importing models...');
    await import('../src/modules/auth/models/User');
    await import('../src/modules/organization/models/Department');
    await import('../src/modules/employees/models/Employee');
    await import('../src/modules/attendance/models/Attendance');
    await import('../src/modules/leave/models/Leave');
    await import('../src/modules/leave/models/LeaveBalance');
    await import('../src/modules/compliance/models/Compliance');
    await import('../src/modules/documents/models/Document');
    await import('../src/modules/tasks/models/Task');
    console.log('[setupTestDb] Models imported.');

    // --- Use sync({ force: true }) instead of migrations for test setup simplicity ---
    // Sync database schema AFTER models are known to Sequelize
    console.log('[setupTestDb] Syncing database schema (force: true)...');
    await sequelize.sync({ force: true }); // Drops and recreates tables based on models
    console.log('[setupTestDb] Database schema synced.');

    // Associations are defined in models, sync should handle them.
    // console.log('[setupTestDb] Importing associations...');
    // await import('../src/db/associations'); // Run association logic
    // console.log('[setupTestDb] Associations imported.');

    console.log('[setupTestDb] Models and associations loaded.');
    console.log('[setupTestDb] Setup complete.');
  } catch (error) {
    console.error('Error setting up test database:', error);
    throw error; // Re-throw to fail the test setup
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
    console.log('[clearTestDb] Starting database clearing...'); // Added log
    try {
        const models = sequelize.models;
        // Order based on potential dependencies (delete dependents first)
        const modelNames = [
            'Task',         // Depends on Employee? User?
            'Document',     // Depends on Employee, Department, User
            'Compliance',   // Depends on Employee
            'Attendance',   // Depends on Employee
            'Leave',        // Depends on Employee, LeaveBalance?
            'LeaveBalance', // Depends on Employee
            'Employee',     // Depends on Department, User
            'Department',   // Depends on User (managerId)
            'User'          // Base model
        ];

        for (const modelName of modelNames) {
            if (models[modelName]) {
                try { // Add inner try-catch for logging specific model errors
                    console.log(`[clearTestDb] Destroying ${modelName}...`); // Added log
                    await models[modelName].destroy({ where: {}, truncate: false, cascade: false }); // Explicitly disable cascade
                    console.log(`[clearTestDb] ${modelName} destroyed.`); // Added log
                } catch (modelError) {
                    console.error(`[clearTestDb] Error destroying ${modelName}:`, modelError);
                    // Continue clearing other tables even if one fails
                }
            } else {
                console.warn(`[clearTestDb] Model ${modelName} not found in sequelize.models during clearTestDb`);
            }
        }
        console.log('[clearTestDb] Database clearing finished.'); // Added log
    } catch (error) {
        console.error('[clearTestDb] General error during database clearing:', error);
        throw error; // Re-throw to fail the specific test
    }
};