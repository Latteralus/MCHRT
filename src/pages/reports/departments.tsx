import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import axios from 'axios'; // Import axios
import MainLayout from '@/components/layouts/MainLayout';
import Head from 'next/head';
import DepartmentSelect from '@/components/common/DepartmentSelect'; // Import the select component

// Define the structure for the report data fetched from the API
interface DepartmentReportData {
    departmentId: number;
    departmentName: string;
    employeeCount: number;
    averageAttendanceRate: number;
    pendingLeaveRequests: number;
}

interface DepartmentReportsPageProps {
    currentUserRole: string | null;
    userDepartmentId?: number | null; // Passed from getServerSideProps
}

// Simple component to display the fetched report data
const DepartmentReportDisplay: React.FC<{ data: DepartmentReportData }> = ({ data }) => (
    <div className="mt-4 p-4 border rounded bg-gray-50">
        <h2 className="text-xl font-semibold mb-3">Report for: {data.departmentName} (ID: {data.departmentId})</h2>
        <ul className="list-disc list-inside space-y-1">
            <li>Total Employees: {data.employeeCount}</li>
            <li>Average Attendance Rate: {data.averageAttendanceRate.toFixed(1)}%</li>
            <li>Pending Leave Requests: {data.pendingLeaveRequests}</li>
            {/* Add more data points as the API evolves */}
        </ul>
    </div>
);


const DepartmentReportsPage: React.FC<DepartmentReportsPageProps> = ({ currentUserRole, userDepartmentId }) => {
    const [selectedDeptId, setSelectedDeptId] = useState<string | null>(userDepartmentId ? userDepartmentId.toString() : null);
    const [reportData, setReportData] = useState<DepartmentReportData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch report data when selectedDeptId changes
    useEffect(() => {
        if (!selectedDeptId) {
            setReportData(null); // Clear previous report if no department is selected
            return;
        }

        const fetchReportData = async () => {
            setLoading(true);
            setError(null);
            setReportData(null); // Clear previous data
            try {
                const response = await axios.get(`/api/reports/department/${selectedDeptId}`);
                setReportData(response.data);
            } catch (err: any) {
                console.error(`Error fetching report for department ${selectedDeptId}:`, err);
                setError(err.response?.data?.message || err.message || 'Failed to load department report.');
            } finally {
                setLoading(false);
            }
        };

        fetchReportData();
    }, [selectedDeptId]); // Re-run effect when selectedDeptId changes

    let content = <p>You do not have permission to view department reports.</p>;

    if (currentUserRole === 'Admin') {
        content = (
            <div>
                <p className="mb-2">Select a department to view its report:</p>
                <DepartmentSelect
                    id="department-report-select" // Added id
                    label="Select Department" // Added label
                    value={selectedDeptId ?? ''}
                    onChange={(value) => setSelectedDeptId(value)}
                    placeholder="Choose a department..."
                    className="mb-4 max-w-xs" // Add some styling
                />
                {/* Display Loading / Error / Report Data */}
                {loading && <p className="text-gray-500">Loading report...</p>}
                {error && <p className="text-red-600">Error: {error}</p>}
                {reportData && <DepartmentReportDisplay data={reportData} />}
            </div>
        );
    } else if (currentUserRole === 'DepartmentHead' && userDepartmentId) { // Corrected operator
         content = (
            <div>
                {/* Dept Head sees their own report directly */}
                {loading && <p className="text-gray-500">Loading report for your department...</p>}
                {error && <p className="text-red-600">Error: {error}</p>}
                {reportData && <DepartmentReportDisplay data={reportData} />}
                 {!reportData && !loading && !error && <p>No report data available.</p>} {/* Fallback - Corrected operators */}
            </div>
        );
    }


    return (
        <MainLayout>
            <Head>
                <title>Department Reports - Mountain Care HR</title>
            </Head>
            <div className="p-8"> {/* Consistent padding */}
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Department Reports</h1>
                {content}
            </div>
        </MainLayout>
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);

    if (!session) {
        return { redirect: { destination: '/login', permanent: false } };
    }

    // Ensure user object and properties exist before accessing
    const currentUserRole = session.user?.role as string | null ?? null;
    const userDepartmentId = session.user?.departmentId as number | undefined | null ?? null;

    // Allow Admins and Department Heads to access this page
    if (currentUserRole !== 'Admin' && currentUserRole !== 'DepartmentHead') { // Corrected operator
         return {
             redirect: { destination: '/', permanent: false }, // Redirect non-authorized users
         };
    }

    // No need to fetch departments server-side anymore, the component handles it

    return {
        props: {
            currentUserRole,
            userDepartmentId, // Pass it as number | null
        },
    };
};


export default DepartmentReportsPage;