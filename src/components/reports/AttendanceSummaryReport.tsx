// src/components/reports/AttendanceSummaryReport.tsx
import React, { useState, useEffect } from 'react';
// Placeholder: Import API function to fetch attendance summary data
// import { fetchAttendanceSummary } from '@/lib/api/reports'; // Adjust path
// Placeholder: Import UI components (Table, Loading, Error)

interface AttendanceSummaryData {
    // Define the structure of the summary data, e.g.,
    department: string;
    totalEmployees: number;
    presentToday: number;
    absentToday: number;
    onLeaveToday: number;
    averageAttendanceRate: number; // e.g., last 30 days
}

interface AttendanceSummaryReportProps {
    // Props for filtering (e.g., date range, department)
    departmentId?: number;
    startDate?: string;
    endDate?: string;
}

const AttendanceSummaryReport: React.FC<AttendanceSummaryReportProps> = ({ departmentId, startDate, endDate }) => {
    const [summaryData, setSummaryData] = useState<AttendanceSummaryData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadSummary = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Placeholder: Replace with actual API call
                console.log('Fetching attendance summary for:', { departmentId, startDate, endDate });
                // const data = await fetchAttendanceSummary({ departmentId, startDate, endDate });
                // Mock data for now:
                const mockData: AttendanceSummaryData[] = [
                    { department: 'Compounding', totalEmployees: 50, presentToday: 45, absentToday: 2, onLeaveToday: 3, averageAttendanceRate: 95.5 },
                    { department: 'Operations', totalEmployees: 80, presentToday: 78, absentToday: 1, onLeaveToday: 1, averageAttendanceRate: 97.0 },
                    { department: 'Shipping', totalEmployees: 30, presentToday: 29, absentToday: 0, onLeaveToday: 1, averageAttendanceRate: 96.8 },
                    { department: 'Administration', totalEmployees: 15, presentToday: 14, absentToday: 0, onLeaveToday: 1, averageAttendanceRate: 98.1 },
                    { department: 'Human Resources', totalEmployees: 5, presentToday: 5, absentToday: 0, onLeaveToday: 0, averageAttendanceRate: 100.0 },
                ];
                setSummaryData(mockData);
            } catch (err: any) {
                console.error('Failed to fetch attendance summary:', err);
                setError(err.message || 'Failed to load attendance summary.');
            } finally {
                setIsLoading(false);
            }
        };

        loadSummary();
    }, [departmentId, startDate, endDate]);

    if (isLoading) {
        return <div className="text-center p-4">Loading attendance summary...</div>;
    }

    if (error) {
        return <div className="text-center p-4 text-red-500 bg-red-100 border border-red-400 rounded">{error}</div>;
    }

    if (summaryData.length === 0) {
        return <div className="text-center p-4 text-gray-500">No attendance summary data available.</div>;
    }

    // Placeholder: Replace with actual Table component
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Employees</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Present Today</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Absent Today</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">On Leave Today</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Attendance Rate (%)</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {summaryData.map((row) => (
                        <tr key={row.department}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.department}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.totalEmployees}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.presentToday}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.absentToday}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.onLeaveToday}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.averageAttendanceRate.toFixed(1)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AttendanceSummaryReport;