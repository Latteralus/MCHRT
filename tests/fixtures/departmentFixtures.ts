// tests/fixtures/departmentFixtures.ts
import { faker } from '@faker-js/faker';
import Department from '@/modules/organization/models/Department'; // Adjust path if needed

// Interface for overrides, allowing optional managerId
interface DepartmentOverrides {
  name?: string;
  managerId?: number | null | undefined; // Allow null or undefined
}

// Function to generate raw department data
export const generateDepartmentData = (overrides: DepartmentOverrides = {}): Partial<Department> => {
  const defaultName = faker.commerce.department() + ` ${faker.string.uuid().substring(0, 4)}`;
  return {
    ...overrides, // Apply any specific overrides (name will be overwritten if provided)
    name: overrides.name ?? defaultName, // Ensure name is set, potentially overwriting override if it was undefined/null
    managerId: overrides.managerId ?? undefined, // Ensure managerId is number | undefined, potentially overwriting override
  };
};

// Function to create a department record in the database
export const createTestDepartment = async (overrides: DepartmentOverrides = {}): Promise<Department> => {
  const departmentData = generateDepartmentData(overrides);
  try {
    // Use Department.create to ensure model hooks are triggered
    const department = await Department.create(departmentData as Department); // Cast needed
    return department;
  } catch (error) {
    console.error("Error creating test department:", error);
    // If name uniqueness constraint fails, try again with a different name
    if (error instanceof Error && error.name === 'SequelizeUniqueConstraintError') {
      console.warn("Unique constraint violation for department name, retrying department creation...");
      // Ensure the override doesn't force the same failing name
      const newOverrides = { ...overrides };
      delete newOverrides.name; // Remove potentially conflicting name override
      return createTestDepartment(newOverrides); // Retry without the specific name override
    }
    throw error; // Re-throw other errors
  }
};

// Example usage:
// const defaultDept = await createTestDepartment();
// const hrDept = await createTestDepartment({ name: 'Human Resources' });
// const opsDept = await createTestDepartment({ managerId: someManagerUserId });