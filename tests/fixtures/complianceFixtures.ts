// tests/fixtures/complianceFixtures.ts
import { faker } from '@faker-js/faker';
import Compliance, { ComplianceCreationAttributes } from '@/modules/compliance/models/Compliance'; // Adjust path if needed
import { format } from 'date-fns';

// Re-define types here or import if available
type ComplianceStatus = 'Active' | 'ExpiringSoon' | 'Expired' | 'PendingReview';
const complianceStatuses: ComplianceStatus[] = ['Active', 'ExpiringSoon', 'Expired', 'PendingReview'];
const itemTypes = ['License', 'Certification', 'Training', 'Review'];

// Interface for overrides - employeeId is mandatory
interface ComplianceOverrides {
  employeeId: number; // Mandatory
  itemType?: string | undefined;
  itemName?: string | undefined;
  authority?: string | undefined;
  licenseNumber?: string | undefined;
  issueDate?: Date | string | undefined;
  expirationDate?: Date | string | undefined;
  status?: ComplianceStatus | undefined;
}

// Function to generate raw compliance data
export const generateComplianceData = (overrides: ComplianceOverrides): Partial<Compliance> => {
  if (!overrides.employeeId) {
    throw new Error('employeeId is required to generate compliance data.');
  }

  // Generate dates
  const issueDate = overrides.issueDate
    ? (overrides.issueDate instanceof Date ? overrides.issueDate : new Date(overrides.issueDate))
    : faker.date.past({ years: 2 });

  // Expiration date: maybe exists, maybe in future or past
  const expirationDate = overrides.expirationDate !== undefined
    ? (overrides.expirationDate instanceof Date ? overrides.expirationDate : new Date(overrides.expirationDate))
    : faker.helpers.maybe(() => faker.date.between({ from: issueDate, to: faker.date.future({ years: 3, refDate: issueDate }) }), { probability: 0.8 }); // 80% chance of having an expiration

  const issueDateString = format(issueDate, 'yyyy-MM-dd');
  const expirationDateString = expirationDate ? format(expirationDate, 'yyyy-MM-dd') : undefined;

  // Determine status based on dates if not provided
  let status = overrides.status;
  if (!status) {
    if (!expirationDate) {
      status = 'Active'; // Assume active if no expiration
    } else {
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.setDate(now.getDate() + 30));
      if (expirationDate < new Date()) {
        status = 'Expired';
      } else if (expirationDate <= thirtyDaysFromNow) {
        status = 'ExpiringSoon';
      } else {
        status = 'Active';
      }
    }
  }

  const itemType = overrides.itemType ?? faker.helpers.arrayElement(itemTypes);
  let itemName = overrides.itemName;
  if (!itemName) {
      switch(itemType) {
          case 'License': itemName = `${faker.location.state()} ${faker.person.jobArea()} License`; break;
          case 'Certification': itemName = `${faker.company.buzzNoun()} Certification`; break;
          case 'Training': itemName = `${faker.company.catchPhraseAdjective()} Training`; break;
          case 'Review': itemName = `${faker.number.int({min: 30, max: 180})} Day Review`; break;
          default: itemName = 'Compliance Item';
      }
  }


  return {
    // Start with overrides
    ...overrides,
    // Ensure mandatory employeeId is set
    employeeId: overrides.employeeId,
    // Set defaults/calculated values if not provided in overrides
    itemType: itemType,
    itemName: itemName,
    authority: overrides.authority ?? (itemType === 'License' ? `${faker.location.state()} State Board` : 'Internal HR'),
    licenseNumber: overrides.licenseNumber ?? (itemType === 'License' ? faker.string.alphanumeric(10).toUpperCase() : undefined),
    issueDate: issueDateString as any, // Cast needed
    expirationDate: expirationDateString as any, // Cast needed
    status: status,
  };
};

// Function to create a compliance record in the database
export const createTestCompliance = async (overrides: ComplianceOverrides): Promise<Compliance> => {
  const complianceData = generateComplianceData(overrides);

  // Prepare data for creation, ensuring dates are strings or undefined
  const dataForCreate: any = {
    ...complianceData,
    issueDate: complianceData.issueDate, // Already string
    expirationDate: complianceData.expirationDate, // String or undefined
  };

  try {
    // Use Compliance.create
    const compliance = await Compliance.create(dataForCreate as ComplianceCreationAttributes);
    return compliance;
  } catch (error) {
    console.error("Error creating test compliance item:", error);
    // Add specific error handling if needed
    throw error; // Re-throw other errors
  }
};

// Example usage:
// Assuming employee = await createTestEmployee();
// const license = await createTestCompliance({
//   employeeId: employee.id,
//   itemType: 'License',
//   itemName: 'Pharmacist License',
//   expirationDate: '2025-12-31',
// });
// const training = await createTestCompliance({ employeeId: employee.id, itemType: 'Training' });