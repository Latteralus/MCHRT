// tests/fixtures/leaveFixtures.ts
import { faker } from '@faker-js/faker';
import Leave, { LeaveCreationAttributes } from '@/modules/leave/models/Leave'; // Adjust path if needed
import { format } from 'date-fns';

// Re-define types here or import from a central types file if available
type LeaveType = 'Vacation' | 'Sick' | 'Personal' | 'Bereavement' | 'Other';
type LeaveStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

const leaveTypes: LeaveType[] = ['Vacation', 'Sick', 'Personal', 'Bereavement', 'Other'];
const leaveStatuses: LeaveStatus[] = ['Pending', 'Approved', 'Rejected', 'Cancelled'];

// Interface for overrides - employeeId is mandatory
interface LeaveOverrides {
  employeeId: number; // Mandatory
  startDate?: Date | string | undefined;
  endDate?: Date | string | undefined;
  leaveType?: LeaveType | undefined;
  status?: LeaveStatus | undefined;
  reason?: string | undefined;
  approverId?: number | null | undefined; // Allow null for optional FK
  approvedAt?: Date | undefined;
  comments?: string | undefined;
}

// Function to generate raw leave data
export const generateLeaveData = (overrides: LeaveOverrides): Partial<Leave> => {
  if (!overrides.employeeId) {
    throw new Error('employeeId is required to generate leave data.');
  }

  // Generate dates
  const startDate = overrides.startDate
    ? (overrides.startDate instanceof Date ? overrides.startDate : new Date(overrides.startDate))
    : faker.date.soon({ days: 30 }); // Start date within the next 30 days

  const endDate = overrides.endDate
    ? (overrides.endDate instanceof Date ? overrides.endDate : new Date(overrides.endDate))
    : faker.date.future({ refDate: startDate, years: 0.1 }); // End date shortly after start date

  const startDateString = format(startDate, 'yyyy-MM-dd');
  const endDateString = format(endDate, 'yyyy-MM-dd');

  // Determine status and related fields
  const status = overrides.status ?? faker.helpers.arrayElement(leaveStatuses);
  let approverId: number | null | undefined = overrides.approverId;
  let approvedAt: Date | undefined = overrides.approvedAt;

  if (status === 'Approved' || status === 'Rejected') {
    // If approved/rejected, set approverId and approvedAt if not provided
    approverId = approverId === undefined ? faker.number.int({ min: 1, max: 10 }) : approverId; // Placeholder ID, replace with actual user ID if needed
    approvedAt = approvedAt ?? faker.date.recent({ days: 5, refDate: startDate }); // Approval date near start date
  } else {
    // If Pending or Cancelled, ensure approverId and approvedAt are null/undefined
    approverId = status === 'Pending' ? undefined : approverId; // Allow override for Cancelled?
    approvedAt = status === 'Pending' ? undefined : approvedAt;
  }

  return {
    // Start with overrides
    ...overrides,
    // Ensure mandatory employeeId is set
    employeeId: overrides.employeeId,
    // Set defaults/calculated values if not provided in overrides
    startDate: startDateString as any, // Cast needed for Partial<Leave>
    endDate: endDateString as any,     // Cast needed for Partial<Leave>
    leaveType: overrides.leaveType ?? faker.helpers.arrayElement(leaveTypes),
    status: status,
    reason: overrides.reason ?? (faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.7 }) ?? undefined), // 70% chance of having a reason
    approverId: approverId === null ? undefined : approverId, // Ensure null becomes undefined
    approvedAt: approvedAt,
    comments: overrides.comments ?? (status !== 'Pending' && faker.helpers.maybe(() => faker.lorem.paragraph(), { probability: 0.5 }) ? faker.lorem.paragraph() : undefined), // 50% chance of comments if not pending
  };
};

// Function to create a leave record in the database
export const createTestLeave = async (overrides: LeaveOverrides): Promise<Leave> => {
  const leaveData = generateLeaveData(overrides);

  // Prepare data for creation, ensuring dates are strings
  const dataForCreate: any = {
    ...leaveData,
    startDate: leaveData.startDate, // Already string
    endDate: leaveData.endDate,     // Already string
    approverId: leaveData.approverId, // Directly use the value (number | undefined)
  };

  try {
    // Use Leave.create
    const leave = await Leave.create(dataForCreate as LeaveCreationAttributes);
    return leave;
  } catch (error) {
    console.error("Error creating test leave:", error);
    // Add specific error handling if needed
    throw error; // Re-throw other errors
  }
};

// Example usage:
// Assuming employee = await createTestEmployee();
// const pendingLeave = await createTestLeave({ employeeId: employee.id });
// const approvedVacation = await createTestLeave({
//   employeeId: employee.id,
//   leaveType: 'Vacation',
//   status: 'Approved',
//   approverId: managerUserId, // Use a real manager ID
// });