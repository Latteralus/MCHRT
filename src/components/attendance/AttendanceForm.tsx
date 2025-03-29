// src/components/attendance/AttendanceForm.tsx
import React, { useState } from 'react';
// Placeholder: Import necessary UI components (Input, Button, Select, etc.)
// import { Input, Button, Select, FormField, FormContainer } from '@/components/ui';
import { recordAttendance } from '@/lib/api/attendance'; // Import the API function
// Placeholder: Import types if needed
// import { Employee } from '@/db';

interface AttendanceFormProps {
  // Props like initial values or callback on success could be added here
  onSuccess?: () => void;
  employees?: { id: number; name: string }[]; // Example: List of employees for selection
}

const AttendanceForm: React.FC<AttendanceFormProps> = ({ onSuccess, employees = [] }) => {
  const [employeeId, setEmployeeId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]); // Default to today
  const [timeIn, setTimeIn] = useState<string>('');
  const [timeOut, setTimeOut] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!employeeId || !date || !timeIn) {
      setError('Employee, Date, and Time In are required.');
      setIsLoading(false);
      return;
    }

    try {
      // Call the API function
      await recordAttendance({
        employeeId: parseInt(employeeId, 10),
        date,
        timeIn,
        timeOut: timeOut || undefined, // Send undefined if empty string
      });

      // Reset form or call onSuccess callback
      setEmployeeId('');
      setDate(new Date().toISOString().split('T')[0]);
      setTimeIn('');
      setTimeOut('');
      if (onSuccess) {
        onSuccess();
      }
      alert('Attendance recorded successfully!'); // Placeholder feedback

    } catch (err: any) {
      console.error('Failed to record attendance:', err);
      setError(err.message || 'Failed to record attendance. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded shadow-md">
      <h2 className="text-xl font-semibold mb-4">Record Attendance</h2>

      {error && <div className="text-red-500 bg-red-100 p-2 rounded">{error}</div>}

      {/* Placeholder: Replace with actual Select component */}
      <div>
        <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">Employee</label>
        <select
          id="employeeId"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          required
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="" disabled>Select Employee</option>
          {employees.map(emp => (
            <option key={emp.id} value={emp.id}>{emp.name}</option>
          ))}
          {/* If employees array is empty (e.g., due to SSR fetch error), the dropdown will just show "Select Employee" */}
        </select>
      </div>

      {/* Placeholder: Replace with actual Input component (type="date") */}
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {/* Placeholder: Replace with actual Input component (type="time") */}
      <div>
        <label htmlFor="timeIn" className="block text-sm font-medium text-gray-700">Time In</label>
        <input
          type="time"
          id="timeIn"
          value={timeIn}
          onChange={(e) => setTimeIn(e.target.value)}
          required
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {/* Placeholder: Replace with actual Input component (type="time") */}
      <div>
        <label htmlFor="timeOut" className="block text-sm font-medium text-gray-700">Time Out (Optional)</label>
        <input
          type="time"
          id="timeOut"
          value={timeOut}
          onChange={(e) => setTimeOut(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {/* Placeholder: Replace with actual Button component */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {isLoading ? 'Recording...' : 'Record Attendance'}
      </button>
    </form>
  );
};

export default AttendanceForm;