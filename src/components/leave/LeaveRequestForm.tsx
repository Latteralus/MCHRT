// src/components/leave/LeaveRequestForm.tsx
import React, { useState } from 'react';
// Placeholder: Import UI components (Input, Button, Select, Textarea, FormField, FormContainer)
import { submitLeaveRequest } from '@/lib/api/leave'; // Import the API function
// Placeholder: Import types if needed
// import { User } from '@/db'; // For current user info

interface LeaveRequestFormProps {
  // Props like current user ID or callback on success
  userId: number; // Assuming the ID of the employee making the request is passed
  onSuccess?: () => void;
}

// Example leave types (consider defining these centrally)
const leaveTypes = ['Vacation', 'Sick', 'Personal', 'Unpaid', 'Bereavement'];

const LeaveRequestForm: React.FC<LeaveRequestFormProps> = ({ userId, onSuccess }) => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [leaveType, setLeaveType] = useState<string>(leaveTypes[0]); // Default to first type
  const [reason, setReason] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!startDate || !endDate || !leaveType) {
      setError('Start Date, End Date, and Leave Type are required.');
      setIsLoading(false);
      return;
    }

    // Basic date validation
    if (new Date(endDate) < new Date(startDate)) {
        setError('End Date cannot be before Start Date.');
        setIsLoading(false);
        return;
    }

    try {
      // Call the API function
      await submitLeaveRequest({
        employeeId: userId, // Pass the userId prop as employeeId
        startDate,
        endDate,
        leaveType,
        reason: reason || undefined, // Send undefined if empty
      });

      // Reset form or call onSuccess callback
      setStartDate('');
      setEndDate('');
      setLeaveType(leaveTypes[0]);
      setReason('');
      if (onSuccess) {
        onSuccess();
      }
      alert('Leave request submitted successfully!'); // Placeholder feedback

    } catch (err: any) {
      console.error('Failed to submit leave request:', err);
      setError(err.message || 'Failed to submit leave request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded shadow-md">
      <h2 className="text-xl font-semibold mb-4">Request Leave</h2>

      {error && <div className="text-red-500 bg-red-100 p-2 rounded">{error}</div>}

      {/* Placeholder: Replace with actual Input component (type="date") */}
      <div>
        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
        <input
          type="date"
          id="startDate"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {/* Placeholder: Replace with actual Input component (type="date") */}
      <div>
        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
        <input
          type="date"
          id="endDate"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {/* Placeholder: Replace with actual Select component */}
      <div>
        <label htmlFor="leaveType" className="block text-sm font-medium text-gray-700">Leave Type</label>
        <select
          id="leaveType"
          value={leaveType}
          onChange={(e) => setLeaveType(e.target.value)}
          required
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          {leaveTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Placeholder: Replace with actual Textarea component */}
      <div>
        <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason (Optional)</label>
        <textarea
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {/* Placeholder: Replace with actual Button component */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {isLoading ? 'Submitting...' : 'Submit Request'}
      </button>
    </form>
  );
};

export default LeaveRequestForm;