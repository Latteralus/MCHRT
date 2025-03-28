// src/pages/reports/attendance.tsx
import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import MainLayout from '@/components/layouts/MainLayout';
import AttendanceSummaryReport from '@/components/reports/AttendanceSummaryReport';
// Placeholder: Import function to fetch departments for filter
// import { fetchDepartmentsForSelect } from '@/lib/api/departments'; // Adjust path
// Placeholder: Import UI components (Select, DatePicker)

interface AttendanceReportPageProps {
    departments: { id: number; name: string }[]; // For filter dropdown
    currentUserRole: string | null;
}

const AttendanceReportPage: React.FC<AttendanceReportPageProps> = ({ departments, currentUserRole }) => {
    // State for filters
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
    // TODO: Add date range state if implementing date filters

    // Determine if the user can filter by department (e.g., Admin/HR)
    const canFilterByDept = currentUserRole === 'Admin' || currentUserRole === 'Human Resources'; // Adjust roles as needed

    return (
        <MainLayout>
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-semibold mb-4">Attendance Summary Report</h1>

                {/* Filter Section - Placeholder */}
                <div className="mb-4 p-4 border rounded shadow-sm bg-gray-50 flex flex-wrap gap-4 items-end">
                    {/* Department Filter */}
                    {canFilterByDept && (
                        <div>
                            <label htmlFor="departmentFilter" className="block text-sm font-medium text-gray-700">Department</label>
                            <select
                                id="departmentFilter"
                                value={selectedDepartmentId}
                                onChange={(e) => setSelectedDepartmentId(e.target.value)}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                <option value="">All Departments</option>
                                {departments.map(dept => (
                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    {/* TODO: Add Date Range Filter components here */}
                </div>

                {/* Report Component */}
                <AttendanceSummaryReport
                    departmentId={selectedDepartmentId ? parseInt(selectedDepartmentId, 10) : undefined}
                // Pass date filters here if implemented
                />
            </div>
        </MainLayout>
    );
};

// Fetch departments server-side for the filter dropdown & get user role
export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);

    // Protect route
    if (!session) {
        return { redirect: { destination: '/login', permanent: false } };
    }

    // Check if user has permission to view reports (e.g., Admin, HR, Dept Head)
    const currentUserRole = session.user?.role as string | null;
    const allowedRoles = ['Admin', 'DepartmentHead', 'Human Resources']; // Adjust as needed
    if (!currentUserRole || !allowedRoles.includes(currentUserRole)) {
         return {
             // redirect: { destination: '/', permanent: false }, // Redirect to dashboard
             notFound: true, // Or return 404
         };
    }


    let departments: { id: number; name: string }[] = [];
    // Fetch department list only if user can filter by department
    if (currentUserRole === 'Admin' || currentUserRole === 'Human Resources') { // Adjust roles
        try {
            // Placeholder: Fetch departments
            console.log('SSR: Fetching departments for attendance report filter...');
            // departments = await fetchDepartmentsForSelect();
            departments = [ // Placeholder data
                { id: 1, name: 'Compounding' },
                { id: 2, name: 'Operations' },
                { id: 3, name: 'Shipping' },
                { id: 4, name: 'Administration' },
                { id: 5, name: 'Human Resources' },
            ];
        } catch (error) {
            console.error('SSR Error fetching departments for filter:', error);
        }
    }

    return {
        props: {
            departments,
            currentUserRole,
            session,
        },
    };
};

export default AttendanceReportPage;