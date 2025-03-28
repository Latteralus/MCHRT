// jest.setup.ts
import { clearTestDb } from './tests/db-setup'; // Adjust path if needed

// Optional: Clear data before each test for isolation
// beforeAll and afterAll are now handled by globalSetup/globalTeardown
beforeEach(async () => {
  await clearTestDb();
});