// tests/fixtures/employeeFixtures.ts
import { faker } from '@faker-js/faker';
import Employee, { EmployeeCreationAttributes } from '@/modules/employees/models/Employee'; // Import model and creation attributes
// Import necessary fixtures to ensure dependencies exist
import { createTestDepartment } from './departmentFixtures';
import { createTestUser } from './userFixtures';

// Interface for overrides
interface EmployeeOverrides {
  firstName?: string;
  lastName?: string;
  ssnEncrypted?: string | undefined; // Use undefined for optional fields
  departmentId?: number | undefined;
  userId?: number | undefined;
  position?: string | undefined;
  hireDate?: Date | string | undefined; // Use undefined, allow string for input flexibility
}

// Function to generate raw employee data
export const generateEmployeeData = (overrides: EmployeeOverrides = {}): Partial<EmployeeCreationAttributes> => { // Use CreationAttributes
  const firstName = overrides.firstName ?? faker.person.firstName();
  const lastName = overrides.lastName ?? faker.person.lastName();

  // Generate a placeholder SSN-like string for the encrypted field
  const fakeSsnEncrypted = `encrypted_${faker.string.numeric(9)}`;

  // Prepare hireDate: use override if provided (converting string to Date), otherwise generate a past date.
  let finalHireDate: Date | undefined = undefined;
  if (overrides.hireDate !== undefined) {
    finalHireDate = overrides.hireDate instanceof Date ? overrides.hireDate : new Date(overrides.hireDate);
  } else {
    finalHireDate = faker.date.past({ years: 5 });
  }

  // Apply overrides first, then set defaults/calculated values ensuring correct types
  return {
    ...overrides, // Apply any specific overrides first
    firstName: firstName,
    lastName: lastName,
    ssnEncrypted: overrides.ssnEncrypted ?? fakeSsnEncrypted, // Use override or fake, allows undefined
    // departmentId and userId are handled by the spread if provided in overrides
    position: overrides.position ?? faker.person.jobTitle(), // Use override or fake, allows undefined
    hireDate: finalHireDate, // Ensure hireDate is Date | undefined, overwriting string from overrides if necessary
  };
};

// Function to create an employee record in the database
export const createTestEmployee = async (overrides: EmployeeOverrides = {}): Promise<Employee> => {
  // Ensure dependencies exist before generating final data
  let finalUserId = overrides.userId;
  if (finalUserId === undefined) {
    // If no userId override, create a default user for this employee
    const user = await createTestUser({});
    finalUserId = user.get('id') as number; // Use .get()
  }

  let finalDepartmentId = overrides.departmentId;
  if (finalDepartmentId === undefined) {
    // If no departmentId override, create a default department
    const dept = await createTestDepartment({});
    finalDepartmentId = dept.get('id') as number; // Use .get()
  }

  // Generate data, ensuring the required IDs are now set
  const employeeData = generateEmployeeData({
    ...overrides, // Pass original overrides
    userId: finalUserId, // Ensure userId is set
    departmentId: finalDepartmentId, // Ensure departmentId is set
  }); // hireDate is Date | undefined here
  // Prepare data specifically for the create method, matching EmployeeCreationAttributes
  // and handling DATEONLY formatting.
  // We use 'any' temporarily for the intermediate object to allow string assignment for hireDate.
  const dataForCreate: any = { ...employeeData };

  // Format hireDate specifically for creation if it exists and is a Date object
  if (dataForCreate.hireDate instanceof Date) {
    dataForCreate.hireDate = dataForCreate.hireDate.toISOString().split('T')[0]; // Convert to YYYY-MM-DD string
  }
  // Now dataForCreate.hireDate is string | undefined

  try {
    // Log the data just before attempting creation
    console.log('[createTestEmployee] Attempting to create employee with data:', JSON.stringify(dataForCreate, null, 2));
    // Use Employee.create with the prepared data.
    // Sequelize's create method should accept the string for DATEONLY.
    // We cast to EmployeeCreationAttributes which expects Date | undefined for hireDate,
    // but Sequelize handles the string conversion internally for DATEONLY.
    // A more explicit type matching EmployeeCreationAttributes but allowing string for hireDate could be defined.
    const employee = await Employee.create(dataForCreate as EmployeeCreationAttributes);
    return employee;
  } catch (error) {
    console.error("Error creating test employee:", error);
    // Add specific error handling if needed (e.g., FK constraints if IDs are invalid)
    throw error; // Re-throw other errors
  }
};

// Example usage:
// const defaultEmp = await createTestEmployee();
// const empInDept = await createTestEmployee({ departmentId: someDeptId });
// const empWithUser = await createTestEmployee({ userId: someUserId });