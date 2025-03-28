// tests/fixtures/userFixtures.ts
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import User, { UserCreationAttributes } from '@/modules/auth/models/User'; // Import model and creation attributes
import { Role } from '@/types/roles'; // Corrected path based on Project.md structure

// Function to generate raw user data (without saving to DB)
export const generateUserData = (overrides: Partial<UserCreationAttributes> = {}): UserCreationAttributes => {
  const password = faker.internet.password();
  // Note: Hashing should ideally happen in the service or model hook,
  // but we might need to hash here for direct DB insertion in tests.
  // Consider if your User model handles hashing automatically.
  const hashedPassword = bcrypt.hashSync(password, 10); // Sync for simplicity in fixtures
  const fakeUsername = faker.internet.userName().toLowerCase() + faker.string.numeric(4); // Ensure uniqueness (Reverted)

  return {
    username: fakeUsername,
    passwordHash: hashedPassword, // Match model property name
    role: faker.helpers.arrayElement(Object.values(Role)), // Assign a random role
    ...overrides, // Apply any specific overrides
  };
};

// Function to create a user record in the database
export const createTestUser = async (overrides: Partial<UserCreationAttributes> = {}): Promise<User> => {
  const userData = generateUserData(overrides);
  // Simplified: Attempt creation once and let errors propagate
  try {
    const user = await User.create(userData); // Removed incorrect 'as User' assertion
    return user;
  } catch (error) {
    console.error("Error creating test user:", error);
    throw error; // Re-throw any error
  }
};

// Example usage:
// const defaultUser = await createTestUser();
// const adminUser = await createTestUser({ role: Role.ADMIN });