// tests/fixtures/attendanceFixtures.ts
import { faker } from '@faker-js/faker';
import Attendance, { AttendanceCreationAttributes } from '@/modules/attendance/models/Attendance'; // Adjust path if needed
import { format } from 'date-fns'; // For formatting DATEONLY

// Interface for overrides - employeeId is mandatory for creation
interface AttendanceOverrides {
  employeeId: number; // Mandatory
  date?: Date | string | undefined;
  timeIn?: Date | undefined;
  timeOut?: Date | undefined;
}

// Function to generate raw attendance data
export const generateAttendanceData = (overrides: AttendanceOverrides): Partial<Attendance> => {
  if (!overrides.employeeId) {
    throw new Error('employeeId is required to generate attendance data.');
  }

  // Generate date and times
  const generatedDate = overrides.date ? (overrides.date instanceof Date ? overrides.date : new Date(overrides.date)) : faker.date.recent({ days: 30 });
  const dateString = format(generatedDate, 'yyyy-MM-dd'); // Format for DATEONLY

  // Generate timeIn and timeOut within the same day
  const timeIn = overrides.timeIn ?? faker.date.between({ from: new Date(generatedDate).setHours(7, 0, 0, 0), to: new Date(generatedDate).setHours(9, 30, 0, 0) });
  // Ensure timeOut is after timeIn, or potentially undefined/null
  const timeOut = overrides.timeOut !== undefined
    ? overrides.timeOut
    : faker.helpers.maybe(() => faker.date.between({ from: new Date(timeIn), to: new Date(timeIn).setHours(18, 0, 0, 0) }), { probability: 0.8 }); // 80% chance of having a timeOut, ensure 'to' is based on 'timeIn' day

  // Determine the final date string, prioritizing override
  const finalDateString = overrides.date
    ? (overrides.date instanceof Date ? format(overrides.date, 'yyyy-MM-dd') : overrides.date)
    : dateString;

  // Determine final timeIn and timeOut, prioritizing overrides
  const finalTimeIn = overrides.timeIn ?? timeIn;
  const finalTimeOut = overrides.timeOut !== undefined ? overrides.timeOut : (timeOut ?? undefined); // Use calculated timeOut if override is undefined

  return {
    // Start with overrides
    ...overrides,
    // Ensure mandatory employeeId is set (already checked above)
    employeeId: overrides.employeeId,
    // Set defaults only if not provided in overrides
    date: finalDateString as any, // Use final string, cast needed for Partial<Attendance>
    timeIn: finalTimeIn,
    timeOut: finalTimeOut,
  };
};

// Function to create an attendance record in the database
export const createTestAttendance = async (overrides: AttendanceOverrides): Promise<Attendance> => {
  const attendanceData = generateAttendanceData(overrides);

  // Prepare data for creation - ensure date is string, times are Date or undefined
  const dataForCreate: any = {
      ...attendanceData,
      date: attendanceData.date, // Already formatted as string
      timeIn: attendanceData.timeIn instanceof Date ? attendanceData.timeIn : undefined,
      timeOut: attendanceData.timeOut instanceof Date ? attendanceData.timeOut : undefined,
  };


  try {
    // Use Attendance.create
    const attendance = await Attendance.create(dataForCreate as AttendanceCreationAttributes);
    return attendance;
  } catch (error) {
    console.error("Error creating test attendance:", error);
    // Add specific error handling if needed (e.g., FK constraints if employeeId is invalid)
    throw error; // Re-throw other errors
  }
};

// Example usage:
// Assuming employee = await createTestEmployee();
// const attendanceRecord = await createTestAttendance({ employeeId: employee.id });
// const specificDateRecord = await createTestAttendance({
//   employeeId: employee.id,
//   date: '2024-01-15',
//   timeIn: new Date('2024-01-15T08:30:00Z'),
//   timeOut: new Date('2024-01-15T17:05:00Z'),
// });