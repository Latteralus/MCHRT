import React, { useState, useCallback } from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import MainLayout from '@/components/layouts/MainLayout';
import DocumentList from '@/components/documents/DocumentList';
import UploadForm from '@/components/documents/UploadForm';
import { fetchEmployeesForSelect } from '@/lib/api/employees'; // Import real fetch function
import { fetchDepartmentsForSelect } from '@/lib/api/departments'; // Import real fetch function
import Modal from '@/components/ui/Modal'; // Import Modal component
import Button from '@/components/ui/Button'; // Import Button component
import Select from '@/components/ui/Select'; // Import Select component
import Input from '@/components/ui/Input'; // Import Input component

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

    // State to trigger list refresh after upload/delete
    const [listKey, setListKey] = useState<number>(Date.now());
    // State for upload modal
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    // Determine user capabilities based on role
    const canUpload = currentUserRole === 'Admin' || currentUserRole === 'DepartmentHead' || currentUserRole === 'Employee'; // Adjust as needed
    const canManageAll = currentUserRole === 'Admin'; // Admins can delete/edit all
    const canManageDept = currentUserRole === 'DepartmentHead'; // Dept heads can manage their dept/employees
    const listCanManage = canManageAll || canManageDept;

    const handleUploadSuccess = (newDocument: any) => {
        console.log('New document uploaded:', newDocument);
        setIsUploadModalOpen(false); // Close modal on success
        setListKey(Date.now()); // Refresh the document list
    };

    const handleOpenUploadModal = () => setIsUploadModalOpen(true);
    const handleCloseUploadModal = () => setIsUploadModalOpen(false);

    // Debounce filter input? For now, simple state update
    // Update type to handle potential textarea usage in Input component
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setTitleFilter(e.target.value);
    };

    return (
        <MainLayout>
            <div className="container mx-auto p-4">
                 <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold">Document Management</h1>
                     {/* Upload Button */}
                     {canUpload && (
                         <Button variant="primary" onClick={handleOpenUploadModal}>
                             Upload Document
                         </Button>
                     )}
                 </div>


                {/* Filter Section */}
                <div className="mb-6 p-4 border rounded shadow-sm bg-gray-50 flex flex-wrap gap-4 items-end">
                     {/* Title Filter */}
                     <Input
                        label="Search Title"
                        id="titleFilter"
                        value={titleFilter}
                        onChange={handleTitleChange}
                        placeholder="Enter title..."
                        containerClassName="min-w-[200px]"
                    />
                    {/* Employee Filter */}
                    {(canManageAll || canManageDept) && (
                        <Select
                            label="Employee"
                            id="docEmployeeFilter"
                            value={selectedEmployeeId}
                            onChange={(e) => setSelectedEmployeeId(e.target.value)}
                            containerClassName="min-w-[200px]"
                        >
                            <option value="">All Employees</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.name}</option>
                            ))}
                        </Select>
                    )}
                     {/* Department Filter */}
                     {canManageAll && ( // Only Admin can filter cross-department
                        <Select
                            label="Department"
                            id="docDepartmentFilter"
                            value={selectedDepartmentId}
                            onChange={(e) => setSelectedDepartmentId(e.target.value)}
                            containerClassName="min-w-[200px]"
                        >
                            <option value="">All Departments</option>
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                            ))}
                        </Select>
                    )}
                </div>

                {/* Document List */}
                <DocumentList
                    key={listKey} // Use key to force re-render/re-fetch on change
                    employeeId={selectedEmployeeId ? parseInt(selectedEmployeeId, 10) : undefined}
                    departmentId={selectedDepartmentId ? parseInt(selectedDepartmentId, 10) : undefined}
                    title={titleFilter || undefined}
                    canManage={listCanManage}
                    refreshKey={listKey} // Pass key explicitly if needed by list's useEffect
                    // Pass edit handler if implemented: onEditMetadata={handleEditMetadata}
                />

                 {/* Upload Modal */}
                 <Modal
                    isOpen={isUploadModalOpen}
                    onClose={handleCloseUploadModal}
                    title="Upload New Document"
                    size="lg" // Adjust size as needed
                 >
                     <UploadForm
                        onUploadSuccess={handleUploadSuccess}
                        onCancel={handleCloseUploadModal} // Pass cancel handler
                     />
                 </Modal>
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

    const currentUserRole = session.user?.role as string | null;
    // Allow all authenticated users to view the page
    // const allowedRoles = ['Admin', 'DepartmentHead', 'Employee'];
    // if (!currentUserRole || !allowedRoles.includes(currentUserRole)) {
    //      return { notFound: true };
    // }

    let employees: { id: number; name: string }[] = [];
    let departments: { id: number; name: string }[] = [];

    const canFilterByEmployee = currentUserRole === 'Admin' || currentUserRole === 'DepartmentHead';
    const canFilterByDepartment = currentUserRole === 'Admin';

    const promises = [];
    if (canFilterByEmployee) {
        promises.push(fetchEmployeesForSelect().catch(err => {
             console.error('SSR Error fetching employees:', err);
             return []; // Return empty array on error
        }));
    } else {
        promises.push(Promise.resolve([])); // Placeholder for employees
    }

    if (canFilterByDepartment) {
         promises.push(fetchDepartmentsForSelect().catch(err => {
             console.error('SSR Error fetching departments:', err);
             return []; // Return empty array on error
        }));
    } else {
         promises.push(Promise.resolve([])); // Placeholder for departments
    }


    try {
        const [fetchedEmployees, fetchedDepartments] = await Promise.all(promises);
        employees = fetchedEmployees;
        departments = fetchedDepartments;
    } catch (error) {
        // Errors are caught individually above, this is a fallback
        console.error('SSR Error fetching dropdown data:', error);
    }


    return {
        props: {
            employees,
            departments,
            currentUserRole,
        },
    };
};

export default DocumentsIndexPage;