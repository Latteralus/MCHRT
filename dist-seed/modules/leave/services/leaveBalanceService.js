"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accrueLeaveBalance = exports.deductLeaveBalance = exports.checkLeaveBalance = exports.getLeaveBalance = void 0;
// src/modules/leave/services/leaveBalanceService.ts
const db_1 = require("../../../db"); // Use relative path
/**
 * Fetches the current leave balance for a specific employee and leave type.
 * Creates a balance record with 0 balance if one doesn't exist.
 *
 * @param employeeId The ID of the employee.
 * @param leaveType The type of leave (e.g., 'Vacation', 'Sick').
 * @returns The leave balance record (or null if employeeId is invalid - though should ideally throw).
 */
const getLeaveBalance = async (employeeId, leaveType) => {
    if (!employeeId || !leaveType) {
        console.error('getLeaveBalance requires valid employeeId and leaveType');
        return null; // Or throw an error
    }
    try {
        // Find or create the balance record for the employee and leave type
        const [balanceRecord, created] = await db_1.LeaveBalance.findOrCreate({
            where: { employeeId, leaveType },
            defaults: {
                employeeId,
                leaveType,
                balance: 0, // Default balance to 0 if created
                // Set other defaults if necessary
            },
        });
        if (created) {
            console.log(`Created initial leave balance record for employee ${employeeId}, type ${leaveType}`);
        }
        return balanceRecord;
    }
    catch (error) {
        console.error(`Error fetching or creating leave balance for employee ${employeeId}, type ${leaveType}:`, error);
        // Depending on requirements, might re-throw or return null/specific error object
        throw new Error('Failed to retrieve leave balance.');
    }
};
exports.getLeaveBalance = getLeaveBalance;
/**
 * Checks if an employee has sufficient leave balance for a requested amount.
 *
 * @param employeeId The ID of the employee.
 * @param leaveType The type of leave.
 * @param requestedAmount The amount of leave requested (in the same unit as balance, e.g., hours/days).
 * @param getBalanceFn Optional function to fetch balance (for testing/dependency injection). Defaults to actual getLeaveBalance.
 * @returns True if the balance is sufficient, false otherwise.
 */
const checkLeaveBalance = async (employeeId, leaveType, requestedAmount, getBalanceFn = exports.getLeaveBalance // Default to the actual function
) => {
    const balanceRecord = await getBalanceFn(employeeId, leaveType); // Use the injected/default function
    if (!balanceRecord) {
        // Handle error case - perhaps insufficient permissions or invalid employee
        console.warn(`Could not retrieve balance for employee ${employeeId}, type ${leaveType} during check.`);
        return false; // Assume insufficient if balance cannot be retrieved
    }
    return balanceRecord.balance >= requestedAmount;
};
exports.checkLeaveBalance = checkLeaveBalance;
/**
 * Deducts a specified amount from an employee's leave balance.
 * IMPORTANT: This should typically be called within a transaction, especially
 * when approving a leave request, to ensure atomicity.
 *
 * @param employeeId The ID of the employee.
 * @param leaveType The type of leave.
 * @param amountToDeduct The amount to deduct.
 * @param transaction Optional Sequelize transaction object.
 * @param getBalanceFn Optional function to fetch balance (for testing/dependency injection). Defaults to actual getLeaveBalance.
 * @returns The updated leave balance record.
 * @throws Error if balance is insufficient or update fails.
 */
const deductLeaveBalance = async (employeeId, leaveType, amountToDeduct, transaction, // Pass Sequelize transaction object here
// Optional getBalanceFn should come AFTER other optional params
getBalanceFn = exports.getLeaveBalance) => {
    if (amountToDeduct <= 0) {
        throw new Error('Amount to deduct must be positive.');
    }
    const balanceRecord = await getBalanceFn(employeeId, leaveType); // Use the injected/default function
    if (!balanceRecord) {
        throw new Error(`Leave balance record not found for employee ${employeeId}, type ${leaveType}.`);
    }
    if (balanceRecord.balance < amountToDeduct) {
        throw new Error(`Insufficient leave balance. Available: ${balanceRecord.balance}, Requested: ${amountToDeduct}`);
    }
    // Perform the deduction
    balanceRecord.balance -= amountToDeduct;
    // Optionally update usedYTD
    balanceRecord.usedYTD = (balanceRecord.usedYTD || 0) + amountToDeduct;
    balanceRecord.lastUpdated = new Date();
    // Save the changes, potentially within a transaction
    await balanceRecord.save({ transaction });
    console.log(`Deducted ${amountToDeduct} from ${leaveType} balance for employee ${employeeId}. New balance: ${balanceRecord.balance}`);
    return balanceRecord;
};
exports.deductLeaveBalance = deductLeaveBalance;
/**
 * Accrues (adds) a specified amount to an employee's leave balance.
 *
 * @param employeeId The ID of the employee.
 * @param leaveType The type of leave.
 * @param amountToAccrue The amount to add.
 * @param transaction Optional Sequelize transaction object.
 * @returns The updated leave balance record.
 * @throws Error if update fails.
 */
const accrueLeaveBalance = async (employeeId, leaveType, amountToAccrue, transaction, // Pass Sequelize transaction object here
// Optional getBalanceFn should come AFTER other optional params
getBalanceFn = exports.getLeaveBalance) => {
    if (amountToAccrue <= 0) {
        throw new Error('Amount to accrue must be positive.');
    }
    const balanceRecord = await getBalanceFn(employeeId, leaveType); // Use the injected/default function
    if (!balanceRecord) {
        throw new Error(`Leave balance record not found for employee ${employeeId}, type ${leaveType}. Cannot accrue.`);
    }
    // Perform the accrual
    balanceRecord.balance += amountToAccrue;
    // Optionally update accruedYTD
    balanceRecord.accruedYTD = (balanceRecord.accruedYTD || 0) + amountToAccrue;
    balanceRecord.lastUpdated = new Date();
    // Save the changes, potentially within a transaction
    await balanceRecord.save({ transaction });
    console.log(`Accrued ${amountToAccrue} to ${leaveType} balance for employee ${employeeId}. New balance: ${balanceRecord.balance}`);
    return balanceRecord;
};
exports.accrueLeaveBalance = accrueLeaveBalance;
// TODO: Add functions for bulk accruals, balance resets, etc. if needed.
