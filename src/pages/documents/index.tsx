// src/pages/documents/index.tsx
import React, { useState, useCallback } from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import MainLayout from '@/components/layouts/MainLayout';
import DocumentList from '@/components/documents/DocumentList';
import UploadForm from '@/components/documents/UploadForm';
// Placeholder: Import function to fetch employees/departments for filters
// Placeholder: Import UI components (Select, Input)

interface DocumentsIndexPageProps {
    employees: { id: number; name: string }[]; // For filter dropdown
    departments: { id: number; name: string }[]; // For filter dropdown
    currentUserRole: string | null;
}

const DocumentsIndexPage: React.FC<DocumentsIndexPageProps> = ({ employees, departments, currentUserRole }) => {
    // State for filters
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
    const [titleFilter, setTitleFilter] = useState<string>('');

    // State to trigger list refresh after upload
    const [listKey, setListKey] = useState<number>(Date.now());

    // Determine user capabilities based on role
    const canUpload = currentUserRole === 'Admin' || currentUserRole === 'DepartmentHead' || currentUserRole === 'Employee'; // Adjust as needed
    const canManageAll = currentUserRole === 'Admin'; // Admins can delete/edit all
    const canManageDept = currentUserRole === 'DepartmentHead'; // Dept heads can manage their dept/employees
    // The DocumentList component itself receives a simpler 'canManage' based on role for showing action buttons
    const listCanManage = canManageAll || canManageDept;

    const handleUploadSuccess = (newDocument: any) => {
        console.log('New document uploaded:', newDocument);
        // Refresh the document list by changing its key
        setListKey(Date.now());
    };

    // Debounce filter input? For now, simple state update
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitleFilter(e.target.value);
    };

    return (
        <MainLayout>
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-semibold mb-4">Document Management</h1>

                {/* Upload Form Section (Conditionally Rendered?) */}
                {canUpload && (
                    <div className="mb-6">
                        <UploadForm onUploadSuccess={handleUploadSuccess} />
                    </div>
                )}

                {/* Filter Section */}
                <div className="mb-4 p-4 border rounded shadow-sm bg-gray-50 flex flex-wrap gap-4 items-end">
                     {/* Title Filter */}
                     <div>
                        <label htmlFor="titleFilter" className="block text-sm font-medium text-gray-700">Search Title</label>
                        <input
                            type="text"
                            id="titleFilter"
                            value={titleFilter}
                            onChange={handleTitleChange}
                            placeholder="Enter title..."
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    {/* Employee Filter (Show only if manager/admin?) */}
                    {(canManageAll || canManageDept) && (
                        <div>
                            <label htmlFor="docEmployeeFilter" className="block text-sm font-medium text-gray-700">Employee</label>
                            <select
                                id="docEmployeeFilter"
                                value={selectedEmployeeId}
                                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                <option value="">All Employees</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                     {/* Department Filter (Show only if admin?) */}
                     {canManageAll && ( // Only Admin can filter cross-department
                        <div>
                            <label htmlFor="docDepartmentFilter" className="block text-sm font-medium text-gray-700">Department</label>
                            <select
                                id="docDepartmentFilter"
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
                </div>

                {/* Document List */}
                <DocumentList
                    key={listKey} // Add key to force re-render/re-fetch on change
                    employeeId={selectedEmployeeId ? parseInt(selectedEmployeeId, 10) : undefined}
                    departmentId={selectedDepartmentId ? parseInt(selectedDepartmentId, 10) : undefined}
                    title={titleFilter || undefined}
                    canManage={listCanManage}
                    // Pass edit handler if implemented: onEditMetadata={handleEditMetadata}
                />
            </div>
        </MainLayout>
    );
};

// Fetch data server-side for filters & get user role
export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);

    // Protect route
    if (!session) {
        return { redirect: { destination: '/login', permanent: false } };
    }

    // Check if user has permission to view documents module (adjust roles as needed)
    const currentUserRole = session.user?.role as string | null;
    const allowedRoles = ['Admin', 'DepartmentHead', 'Employee', 'Human Resources']; // Example roles
    if (!currentUserRole || !allowedRoles.includes(currentUserRole)) {
         return { notFound: true }; // Or redirect
    }

    let employees: { id: number; name: string }[] = [];
    let departments: { id: number; name: string }[] = [];

    // Fetch lists only if user can filter by them (Admin/HR/DeptHead)
    if (currentUserRole === 'Admin' || currentUserRole === 'DepartmentHead' || currentUserRole === 'Human Resources') {
        try {
            // Placeholder: Fetch employees
            console.log('SSR: Fetching employees for document filter...');
            // employees = await fetchEmployeesForSelect(); // Use actual fetch function
             employees = [ { id: 1, name: 'Kirk, James' }, { id: 2, name: 'McCoy, Leonard' }, /* ... */ ];
        } catch (error) { console.error('SSR Error fetching employees:', error); }

        // Only Admin fetches all departments for filtering
        if (currentUserRole === 'Admin') {
             try {
                // Placeholder: Fetch departments
                console.log('SSR: Fetching departments for document filter...');
                // departments = await fetchDepartmentsForSelect(); // Use actual fetch function
                 departments = [ { id: 1, name: 'Compounding' }, { id: 2, name: 'Operations' }, /* ... */ ];
            } catch (error) { console.error('SSR Error fetching departments:', error); }
        }
    }


    return {
        props: {
            employees,
            departments,
            currentUserRole,
            session,
        },
    };
};

export default DocumentsIndexPage;