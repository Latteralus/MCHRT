Sea// src/modules/leave/services/leaveAccrualService.ts
import { Employee } from '@/db'; // Import Employee model
import { accrueLeaveBalance } from './leaveBalanceService'; // Import the single accrual function
import { getSequelizeInstance } from '@/db/mockDbSetup'; // Import the getter function

const LEAVE_TYPE_TO_ACCRUE = 'Vacation';
const AMOUNT_TO_ACCRUE = 8; // Example: 8 hours

/**
 * Runs the monthly leave accrual process for all active employees.
 * Assumes all employees in the DB are active for now.
 * Uses a transaction to ensure all accruals succeed or fail together.
 */
export const runMonthlyLeaveAccrual = async (): Promise<void> => {
  console.log(`Starting monthly leave accrual (${AMOUNT_TO_ACCRUE} hours of ${LEAVE_TYPE_TO_ACCRUE})...`);
  const sequelize = getSequelizeInstance(); // Get the instance
  const transaction = await sequelize.transaction(); // Start a transaction

  try {
    // Fetch all employees (assuming all are active)
    const employees = await Employee.findAll({ transaction });

    if (!employees || employees.length === 0) {
      console.log('No employees found to accrue leave for.');
      await transaction.commit(); // Commit even if no employees
      return;
    }

    console.log(`Found ${employees.length} employees. Processing accruals...`);

    let successCount = 0;
    let failureCount = 0;

    // Process accrual for each employee
    for (const employee of employees) {
      try {
        await accrueLeaveBalance(
          employee.id,
          LEAVE_TYPE_TO_ACCRUE,
          AMOUNT_TO_ACCRUE,
          transaction // Pass the transaction
        );
        successCount++;
        // Optional: Add more detailed logging per employee if needed
      } catch (error) {
        failureCount++;
        console.error(`Failed to accrue leave for employee ${employee.id} (${employee.firstName} ${employee.lastName}):`, error);
        // Decide if one failure should roll back all (throw error here) or just log and continue
        // For now, log and continue, but transaction will be rolled back on any error outside the loop catch
      } // <-- This closes the inner catch block
    } // <-- This closes the for loop

    if (failureCount > 0) {
        // If any individual accrual failed within the loop but didn't throw to stop,
        // we might still want to roll back depending on policy.
        // Throwing an error here ensures rollback.
        throw new Error(`${failureCount} accrual(s) failed. Rolling back transaction.`);
    }

    // If all successful, commit the transaction
    await transaction.commit();
    console.log(`Monthly leave accrual completed successfully for ${successCount} employees.`);

  } catch (error) {
    // Rollback transaction in case of any error during the process
    await transaction.rollback();
    console.error('Error during monthly leave accrual process. Transaction rolled back.', error);
    // Rethrow or handle as needed
    throw error;
  }
};