// src/pages/reports/attendance.tsx
import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
// MainLayout is applied globally via _app.tsx
import AttendanceSummaryReport from '@/components/reports/AttendanceSummaryReport';
import axios from 'axios'; // Import axios for SSR fetch
// Placeholder: Import function to fetch departments for filter
// import { fetchDepartmentsForSelect } from '@/lib/api/departments'; // Adjust path
// Placeholder: Import UI components (Select, DatePicker)

// Define interface for department options
interface DepartmentOption {
    id: number;
    name: string;
}

interface AttendanceReportPageProps {
    departments: { id: number; name: string }[]; // For filter dropdown
    currentUserRole: string | null;
}

const AttendanceReportPage: React.FC<AttendanceReportPageProps> = ({ departments = [], currentUserRole }) => { // Default departments to empty array
    // State for filters
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
    // TODO: Add date range state if implementing date filters

    // Determine if the user can filter by department (e.g., Admin/HR)
    const canFilterByDept = currentUserRole === 'Admin' || currentUserRole === 'Human Resources'; // Adjust roles as needed

    return (
        <> {/* Add fragment wrapper */}
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
        </>
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
            console.log('SSR: Fetching departments for attendance report filter...');
            const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
            const url = new URL('/api/departments', baseUrl);
            url.searchParams.append('select', 'id,name');
            url.searchParams.append('sortBy', 'name');
            url.searchParams.append('sortOrder', 'asc');

            const response = await axios.get<DepartmentOption[]>(url.toString(), {
                 headers: { Cookie: context.req.headers.cookie || '' }
            });
            departments = response.data;
        } catch (error: any) {
            console.error('SSR Error fetching departments for filter:', error.message);
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