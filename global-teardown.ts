// global-teardown.ts
// Runs ONCE after all test suites

import { teardownTestDb } from './tests/db-setup'; // Adjust path as necessary

export default async () => {
  console.log('\nRunning Jest Global Teardown...');
  try {
    await teardownTestDb();
    console.log('Jest Global Teardown completed successfully.');
  } catch (error) {
    console.error('!!! Jest Global Teardown Failed !!!', error);
    // Don't necessarily exit here, as tests might have already run
  }
};