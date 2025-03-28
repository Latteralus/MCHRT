// global-setup.ts
// Runs ONCE before all test suites

import { setupTestDb } from './tests/db-setup'; // Adjust path as necessary

export default async () => {
  console.log('\nRunning Jest Global Setup...');
  try {
    await setupTestDb();
    console.log('Jest Global Setup completed successfully.');
    // You could potentially store the Sequelize instance globally if needed,
    // but the current mockDbSetup approach should work if setupTestDb runs first.
  } catch (error) {
    console.error('!!! Jest Global Setup Failed !!!', error);
    process.exit(1); // Exit test run if global setup fails
  }
};