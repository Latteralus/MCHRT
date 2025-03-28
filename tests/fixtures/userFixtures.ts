// tests/fixtures/userFixtures.ts
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import User from '@/modules/auth/models/User'; // Use default import
import { Role } from '@/types/roles'; // Corrected path based on Project.md structure

// Function to generate raw user data (without saving to DB)
export const generateUserData = (overrides: Partial<User> = {}): Partial<User> => {
  const password = faker.internet.password();
  // Note: Hashing should ideally happen in the service or model hook,
  // but we might need to hash here for direct DB insertion in tests.
  // Consider if your User model handles hashing automatically.
  const hashedPassword = bcrypt.hashSync(password, 10); // Sync for simplicity in fixtures
  const fakeUsername = faker.internet.userName().toLowerCase() + faker.string.numeric(4); // Ensure uniqueness

  return {
    username: fakeUsername,
    passwordHash: hashedPassword, // Match model property name
    role: faker.helpers.arrayElement(Object.values(Role)), // Assign a random role
    ...overrides, // Apply any specific overrides
  };
};

// Function to create a user record in the database
export const createTestUser = async (overrides: Partial<User> = {}): Promise<User> => {
  const userData = generateUserData(overrides);
  try {
    // Use User.create to ensure model hooks (like hashing, if any) are triggered
    const user = await User.create(userData as User); // Cast needed if generateUserData returns Partial<User>
    return user;
  } catch (error) {
    console.error("Error creating test user:", error);
    // If email uniqueness constraint fails, try again with a different email
    // Check if error is an instance of Error and has the correct name property
    if (error instanceof Error && error.name === 'SequelizeUniqueConstraintError') {
        console.warn("Unique constraint violation for email, retrying user creation...");
        return createTestUser(overrides); // Recursive call - potential infinite loop if always fails, but unlikely with faker
    }
    throw error; // Re-throw other errors
  }
};

// Example usage:
// const defaultUser = await createTestUser();
// const adminUser = await createTestUser({ role: Role.ADMIN });