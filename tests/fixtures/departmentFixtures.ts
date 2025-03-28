// tests/fixtures/departmentFixtures.ts
import { faker } from '@faker-js/faker';
import Department, { DepartmentCreationAttributes } from '@/modules/organization/models/Department'; // Import model and creation attributes
import { createTestUser } from './userFixtures'; // Import user fixture

// Interface for overrides, allowing optional managerId
interface DepartmentOverrides {
  name?: string;
  managerId?: number | null | undefined; // Allow null or undefined
}

// Function to generate raw department data
export const generateDepartmentData = (overrides: DepartmentOverrides = {}): Partial<DepartmentCreationAttributes> => { // Use CreationAttributes
  const defaultName = faker.commerce.department() + ` ${faker.string.uuid().substring(0, 4)}`;
  return {
    ...overrides, // Apply any specific overrides (name will be overwritten if provided)
    name: overrides.name ?? defaultName, // Ensure name is set, potentially overwriting override if it was undefined/null
    managerId: overrides.managerId ?? undefined, // Ensure managerId is number | undefined, potentially overwriting override
  };
};

// Function to create a department record in the database
export const createTestDepartment = async (overrides: DepartmentOverrides = {}): Promise<Department> => {
  // Ensure manager user exists if managerId is provided or needed
  let finalManagerId = overrides.managerId;
  if (finalManagerId === undefined) {
      // If no managerId override, create a default manager user for this department
      // Ensure the user has a role that can be a manager (e.g., DepartmentHead or Admin)
      const managerUser = await createTestUser({ role: 'DepartmentHead' }); // Adjust role if needed
      finalManagerId = managerUser.get('id') as number; // Use .get()
  } else if (finalManagerId !== null) {
      // If a managerId IS provided, we assume it should exist.
      // Optionally, add a check here to find the user and throw if not found,
      // but for simplicity, we'll rely on the FK constraint to catch issues.
  }

  // Generate data, ensuring managerId is set correctly
  const departmentData = generateDepartmentData({
      ...overrides,
      managerId: finalManagerId // Use the ensured managerId (can be null if explicitly passed)
  });
  try {
    // Use Department.create to ensure model hooks are triggered
    // Cast to DepartmentCreationAttributes, Sequelize handles internal type mapping
    const department = await Department.create(departmentData as DepartmentCreationAttributes);
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