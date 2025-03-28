// src/components/leave/LeaveBalance.tsx
import React, { useState, useEffect } from 'react';
import { fetchLeaveBalances } from '@/lib/api/leave'; // Import API function
// Placeholder: Import UI components (LoadingSpinner, ErrorMessage, Card)

interface LeaveBalanceRecord {
  id: number;
  leaveType: string;
  balance: number;
  // Add other fields like accruedYTD, usedYTD if needed
}

interface LeaveBalanceProps {
  employeeId: number;
}

const LeaveBalanceDisplay: React.FC<LeaveBalanceProps> = ({ employeeId }) => {
  const [balances, setBalances] = useState<LeaveBalanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBalances = async () => {
      if (!employeeId) {
        setIsLoading(false);
        setError('Employee ID is required to fetch balances.');
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchLeaveBalances(employeeId);
        setBalances(data);
      } catch (err: any) {
        console.error(`Error fetching leave balances for employee ${employeeId}:`, err);
        setError(err.message || 'Failed to load leave balances.');
      } finally {
        setIsLoading(false);
      }
    };

    loadBalances();
  }, [employeeId]); // Re-fetch if employeeId changes

  if (isLoading) {
    // Placeholder: Replace with LoadingSpinner
    return <div className="p-4 text-center">Loading balances...</div>;
  }

  if (error) {
    // Placeholder: Replace with ErrorMessage
     return <div className="p-4 text-center text-red-500 bg-red-100 border border-red-400 rounded">{error}</div>;
  }

  // Placeholder: Replace with better layout/Card components
  return (
    <div className="p-4 border rounded shadow-md">
      <h3 className="text-lg font-semibold mb-3">Leave Balances</h3>
      {balances.length === 0 ? (
        <p className="text-gray-500">No leave balance records found.</p>
      ) : (
        <ul className="space-y-2">
          {balances.map((bal) => (
            <li key={bal.id} className="flex justify-between border-b pb-1">
              <span className="font-medium">{bal.leaveType}:</span>
              {/* TODO: Format balance based on unit (days/hours) */}
              <span>{bal.balance} units</span>
            </li>
          ))}
        </ul>
      )}
      {/* TODO: Add accrual/usage details if available */}
    </div>
  );
};

export default LeaveBalanceDisplay;