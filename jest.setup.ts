// jest.setup.ts
import { setupTestDb, teardownTestDb, clearTestDb } from './tests/db-setup'; // Adjust path if needed

// Setup the database once before all tests in this file run
beforeAll(async () => {
  await setupTestDb();
});

// Clear data before each test for isolation
beforeEach(async () => {
  await clearTestDb();
});

// Teardown the database once after all tests in this file have run
afterAll(async () => {
  await teardownTestDb();
});