// tests/unit/services/leaveBalanceService.test.ts
import { LeaveBalance } from '@/db';
// Import the entire module to allow spying
import * as leaveBalanceService from '@/modules/leave/services/leaveBalanceService';

// Destructure after importing for easier use in tests
const { getLeaveBalance, checkLeaveBalance, deductLeaveBalance, accrueLeaveBalance } = leaveBalanceService;


// Mock the LeaveBalance model (dependency of the service)
jest.mock('@/db', () => ({
  LeaveBalance: {
    findOrCreate: jest.fn(),
    // Add mock implementations for other methods if needed (e.g., save)
  },
}));

// NOTE: Service module is NOT mocked here


// Mock the instance methods used (save) - This remains the same
const mockSave = jest.fn();
const mockLeaveBalanceInstance = {
  employeeId: 1,
  leaveType: 'Vacation',
  balance: 10,
  accruedYTD: 10,
  usedYTD: 0,
  lastUpdated: new Date(),
  save: mockSave,
  // Add other properties if your service uses them
};

describe('Leave Balance Service', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset specific mock implementations if necessary
    jest.mocked(LeaveBalance.findOrCreate).mockReset(); // Use jest.mocked() helper
    mockSave.mockReset();
  });

  // --- Tests for getLeaveBalance ---
  describe('getLeaveBalance', () => {
    // Testing the actual implementation, no specific setup needed here

    it('should return existing balance record', async () => {
      const employeeId = 1;
      const leaveType = 'Vacation';
      jest.mocked(LeaveBalance.findOrCreate).mockResolvedValue([mockLeaveBalanceInstance, false]); // false = not created

      const result = await getLeaveBalance(employeeId, leaveType);

      expect(LeaveBalance.findOrCreate).toHaveBeenCalledWith({
        where: { employeeId, leaveType },
        defaults: { employeeId, leaveType, balance: 0 },
      });
      expect(result).toEqual(mockLeaveBalanceInstance);
    });

    it('should create and return a new balance record if none exists', async () => {
       const employeeId = 2;
       const leaveType = 'Sick';
       const newBalanceInstance = { ...mockLeaveBalanceInstance, employeeId, leaveType, balance: 0 };
      jest.mocked(LeaveBalance.findOrCreate).mockResolvedValue([newBalanceInstance, true]); // true = created

      const result = await getLeaveBalance(employeeId, leaveType);

      expect(LeaveBalance.findOrCreate).toHaveBeenCalledWith({
        where: { employeeId, leaveType },
        defaults: { employeeId, leaveType, balance: 0 },
      });
      expect(result).toEqual(newBalanceInstance);
      // Check console log? Might be brittle.
    });

    it('should return null for invalid input', async () => {
       // Suppress console.error for this test
       const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
       expect(await getLeaveBalance(0, 'Vacation')).toBeNull();
       expect(await getLeaveBalance(1, '')).toBeNull();
       expect(LeaveBalance.findOrCreate).not.toHaveBeenCalled();
       expect(errorSpy).toHaveBeenCalledTimes(2); // Ensure the error was logged internally
       errorSpy.mockRestore(); // Restore original console.error
    });

   it('should throw an error if findOrCreate fails', async () => {
     const employeeId = 3;
     const leaveType = 'Personal';
     const errorMessage = 'Database error';
     const dbError = new Error(errorMessage);
     jest.mocked(LeaveBalance.findOrCreate).mockRejectedValue(dbError);

     // Suppress console.error for this test
     const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

     await expect(getLeaveBalance(employeeId, leaveType)).rejects.toThrow('Failed to retrieve leave balance.');
     expect(LeaveBalance.findOrCreate).toHaveBeenCalledWith({
       where: { employeeId, leaveType },
       defaults: { employeeId, leaveType, balance: 0 },
     });
     expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining(`Error fetching or creating leave balance for employee ${employeeId}`), dbError);
     errorSpy.mockRestore(); // Restore original console.error
   });
 });

  // --- Tests for checkLeaveBalance ---
  describe('checkLeaveBalance', () => {
    // No spy setup needed

    it('should return true if balance is sufficient', async () => {
        const employeeId = 1;
        const leaveType = 'Vacation';
        const requestedAmount = 5;
        // Create a mock function for the dependency
        const mockGetBalanceFn = jest.fn().mockResolvedValue({ ...mockLeaveBalanceInstance, balance: 10 });

        // Inject the mock function when calling the function under test
        const result = await checkLeaveBalance(employeeId, leaveType, requestedAmount, mockGetBalanceFn);
        expect(result).toBe(true);
        expect(mockGetBalanceFn).toHaveBeenCalledWith(employeeId, leaveType);
    });

    it('should return false if balance is insufficient', async () => {
        const employeeId = 1;
        const leaveType = 'Vacation';
        const requestedAmount = 15;
        // Create a mock function for the dependency
        const mockGetBalanceFn = jest.fn().mockResolvedValue({ ...mockLeaveBalanceInstance, balance: 10 });

        // Inject the mock function
        const result = await checkLeaveBalance(employeeId, leaveType, requestedAmount, mockGetBalanceFn);
        expect(result).toBe(false);
        expect(mockGetBalanceFn).toHaveBeenCalledWith(employeeId, leaveType);
    });

    it('should return false if balance record cannot be retrieved', async () => {
       const employeeId = 99; // Non-existent or error case
       const leaveType = 'Vacation';
       const requestedAmount = 5;
       // Create a mock function for the dependency
       const mockGetBalanceFn = jest.fn().mockResolvedValue(null);

       // Suppress console.warn for this test
       const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

       // Inject the mock function
       const result = await checkLeaveBalance(employeeId, leaveType, requestedAmount, mockGetBalanceFn);
       expect(result).toBe(false);
       expect(mockGetBalanceFn).toHaveBeenCalledWith(employeeId, leaveType);
       expect(warnSpy).toHaveBeenCalledTimes(1); // Ensure the warning was logged
       warnSpy.mockRestore(); // Restore original console.warn
    });
  });

  // --- Tests for deductLeaveBalance ---
  describe('deductLeaveBalance', () => {
    // No spy setup needed

     it('should deduct amount and save if balance is sufficient', async () => {
        const employeeId = 1;
        const leaveType = 'Vacation';
        const amountToDeduct = 3;
        const initialBalance = 10;
        // Create mock function for dependency
        const balanceRecord = { ...mockLeaveBalanceInstance, balance: initialBalance, save: mockSave };
        const mockGetBalanceFn = jest.fn().mockResolvedValue(balanceRecord);
        mockSave.mockResolvedValue(balanceRecord); // Simulate successful save

        // Inject mock function (pass undefined for transaction)
        const result = await deductLeaveBalance(employeeId, leaveType, amountToDeduct, undefined, mockGetBalanceFn);

        expect(mockGetBalanceFn).toHaveBeenCalledWith(employeeId, leaveType);
        expect(result.balance).toBe(initialBalance - amountToDeduct);
        expect(result.usedYTD).toBe(amountToDeduct); // Assuming initial usedYTD was 0
        expect(mockSave).toHaveBeenCalledTimes(1);
        expect(mockSave).toHaveBeenCalledWith({ transaction: undefined }); // No transaction passed
     });

     it('should throw error if balance is insufficient', async () => {
        const employeeId = 1;
        const leaveType = 'Vacation';
        const amountToDeduct = 15;
        const initialBalance = 10;
        // Create mock function for dependency
        const balanceRecord = { ...mockLeaveBalanceInstance, balance: initialBalance, save: mockSave };
        const mockGetBalanceFn = jest.fn().mockResolvedValue(balanceRecord);

        // Inject mock function
        await expect(deductLeaveBalance(employeeId, leaveType, amountToDeduct, undefined, mockGetBalanceFn))
            .rejects.toThrow(`Insufficient leave balance. Available: ${initialBalance}, Requested: ${amountToDeduct}`);
        expect(mockGetBalanceFn).toHaveBeenCalledWith(employeeId, leaveType);
        expect(mockSave).not.toHaveBeenCalled();
     });

     it('should throw error if amount to deduct is zero or negative', async () => {
        const mockGetBalanceFn = jest.fn(); // Should not be called
        await expect(deductLeaveBalance(1, 'Vacation', 0, undefined, mockGetBalanceFn)).rejects.toThrow('Amount to deduct must be positive.');
        await expect(deductLeaveBalance(1, 'Vacation', -5, undefined, mockGetBalanceFn)).rejects.toThrow('Amount to deduct must be positive.');
        // getLeaveBalance should not be called in this case
        expect(mockGetBalanceFn).not.toHaveBeenCalled();
        expect(mockSave).not.toHaveBeenCalled();
     });

     it('should throw error if balance record cannot be found', async () => {
        const employeeId = 99;
        const leaveType = 'NonExistentType';
        // Create mock function for dependency
        const mockGetBalanceFn = jest.fn().mockResolvedValue(null);

        // Inject mock function
        await expect(deductLeaveBalance(employeeId, leaveType, 5, undefined, mockGetBalanceFn))
            .rejects.toThrow(`Leave balance record not found for employee ${employeeId}, type ${leaveType}.`);
        expect(mockGetBalanceFn).toHaveBeenCalledWith(employeeId, leaveType);
        expect(mockSave).not.toHaveBeenCalled();
     });

     it('should pass transaction to save method', async () => {
        const employeeId = 1;
        const leaveType = 'Vacation';
        const amountToDeduct = 3;
        const transaction = { id: 'mock-transaction' }; // Mock transaction object
        // Create mock function for dependency
        const balanceRecord = { ...mockLeaveBalanceInstance, balance: 10, save: mockSave };
        const mockGetBalanceFn = jest.fn().mockResolvedValue(balanceRecord);
        mockSave.mockResolvedValue(balanceRecord);

        // Inject mock function, passing the transaction
        await deductLeaveBalance(employeeId, leaveType, amountToDeduct, transaction, mockGetBalanceFn);

        expect(mockGetBalanceFn).toHaveBeenCalledWith(employeeId, leaveType);
        expect(mockSave).toHaveBeenCalledWith({ transaction });
     });
  });
// --- Tests for accrueLeaveBalance ---
describe('accrueLeaveBalance', () => {
  // No spy setup needed

  it('should accrue amount and save', async () => {
      const employeeId = 1;
      const leaveType = 'Vacation';
      const amountToAccrue = 8; // e.g., monthly accrual
      const initialBalance = 10;
      const initialAccruedYTD = 10;
      // Create mock function for dependency
      const balanceRecord = { ...mockLeaveBalanceInstance, balance: initialBalance, accruedYTD: initialAccruedYTD, save: mockSave };
      const mockGetBalanceFn = jest.fn().mockResolvedValue(balanceRecord);
      mockSave.mockResolvedValue(balanceRecord); // Simulate successful save

      // Inject mock function
      const result = await accrueLeaveBalance(employeeId, leaveType, amountToAccrue, undefined, mockGetBalanceFn);

      expect(mockGetBalanceFn).toHaveBeenCalledWith(employeeId, leaveType);
      expect(result.balance).toBe(initialBalance + amountToAccrue);
      expect(result.accruedYTD).toBe(initialAccruedYTD + amountToAccrue);
      expect(mockSave).toHaveBeenCalledTimes(1);
      expect(mockSave).toHaveBeenCalledWith({ transaction: undefined });
    });

    it('should throw error if amount to accrue is zero or negative', async () => {
        const mockGetBalanceFn = jest.fn(); // Should not be called
        await expect(accrueLeaveBalance(1, 'Vacation', 0, undefined, mockGetBalanceFn)).rejects.toThrow('Amount to accrue must be positive.');
        await expect(accrueLeaveBalance(1, 'Vacation', -5, undefined, mockGetBalanceFn)).rejects.toThrow('Amount to accrue must be positive.');
        // getLeaveBalance should not be called
        expect(mockGetBalanceFn).not.toHaveBeenCalled();
        expect(mockSave).not.toHaveBeenCalled();
    });

    it('should throw error if balance record cannot be found', async () => {
        const employeeId = 99;
        const leaveType = 'NonExistentType';
        // Create mock function for dependency
        const mockGetBalanceFn = jest.fn().mockResolvedValue(null);

        // Inject mock function
        await expect(accrueLeaveBalance(employeeId, leaveType, 8, undefined, mockGetBalanceFn))
            .rejects.toThrow(`Leave balance record not found for employee ${employeeId}, type ${leaveType}. Cannot accrue.`);
        expect(mockGetBalanceFn).toHaveBeenCalledWith(employeeId, leaveType);
        expect(mockSave).not.toHaveBeenCalled();
    });

     it('should pass transaction to save method', async () => {
        const employeeId = 1;
        const leaveType = 'Vacation';
        const amountToAccrue = 8;
        const transaction = { id: 'mock-transaction-accrue' };
        // Create mock function for dependency
        const balanceRecord = { ...mockLeaveBalanceInstance, balance: 10, save: mockSave };
        const mockGetBalanceFn = jest.fn().mockResolvedValue(balanceRecord);
        mockSave.mockResolvedValue(balanceRecord);

        // Inject mock function, passing the transaction
        await accrueLeaveBalance(employeeId, leaveType, amountToAccrue, transaction, mockGetBalanceFn);

        expect(mockGetBalanceFn).toHaveBeenCalledWith(employeeId, leaveType);
        expect(mockSave).toHaveBeenCalledWith({ transaction });
     });
  });
});