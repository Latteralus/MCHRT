import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import MainLayout from '@/components/layouts/MainLayout';
import ComplianceList from '@/components/compliance/ComplianceList';
import ComplianceForm from '@/components/compliance/ComplianceForm';
import { fetchEmployeesForSelect } from '@/lib/api/employees'; // Import real fetch function
import Modal from '@/components/ui/Modal'; // Import Modal component
import Button from '@/components/ui/Button'; // Import Button component
import Select from '@/components/ui/Select'; // Import Select component

interface ComplianceIndexPageProps {
    employees: { id: number; name: string }[]; // For filter dropdown
    currentUserRole: string | null;
    // session is implicitly available via useSession hook if preferred, but passed here from SSR
}

// Example statuses and types for filters
const complianceStatuses = ['Active', 'ExpiringSoon', 'Expired', 'PendingReview', 'Archived'];
const complianceItemTypes = ['License', 'Certification', 'Training', 'Review', 'PolicyAcknowledgement'];

const ComplianceIndexPage: React.FC<ComplianceIndexPageProps> = ({ employees, currentUserRole }) => {
    // State for filters
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [selectedItemType, setSelectedItemType] = useState<string>('');
    // TODO: Add date range filters if needed

    // State for managing add/edit modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItemId, setEditingItemId] = useState<number | null>(null);
    const [listRefreshKey, setListRefreshKey] = useState<number>(0); // State to trigger list refresh

    // Determine if the current user can manage items (add/edit/delete)
    // Adjust roles as needed (e.g., Admin, HR, Dept Head)
    const canManage = currentUserRole === 'Admin' || currentUserRole === 'DepartmentHead';

    const handleAddNew = () => {
        setEditingItemId(null); // Ensure we are adding, not editing
        setIsModalOpen(true); // Open the modal
    };

    const handleEdit = (itemId: number) => {
        setEditingItemId(itemId); // Set the ID of the item to edit
        setIsModalOpen(true); // Open the modal
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingItemId(null);
    };

    const handleFormSuccess = () => {
        handleModalClose();
        setListRefreshKey(prev => prev + 1); // Increment key to force ComplianceList remount/refresh
    };


    return (
        <> {/* Removed redundant MainLayout wrapper */}
            <div className="container mx-auto p-4">
                <div className="flex justify-between items-center mb-6"> {/* Increased margin */}
                    <h1 className="text-2xl font-semibold">Compliance Tracking</h1>
                    {canManage && (
                        <Button
                            variant="primary"
                            onClick={handleAddNew}
                        >
                            {/* Consider adding an icon */}
                            Add New Item
                        </Button>
                    )}
                </div>

                {/* Filter Section */}
                <div className="mb-6 p-4 border rounded shadow-sm bg-gray-50 flex flex-wrap gap-4 items-end">
                    {/* Employee Filter (Show only if manager/admin?) */}
                    {canManage && ( // Or specific roles like Admin/HR
                        <Select
                            label="Employee"
                            id="employeeFilter"
                            value={selectedEmployeeId}
                            onChange={(e) => setSelectedEmployeeId(e.target.value)}
                            containerClassName="min-w-[200px]" // Example width control
                        >
                            <option value="">All Employees</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.name}</option>
                            ))}
                        </Select>
                    )}

                    {/* Status Filter */}
                    <Select
                        label="Status"
                        id="statusFilter"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        containerClassName="min-w-[150px]"
                    >
                        <option value="">All Statuses</option>
                        {complianceStatuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </Select>

                     {/* Item Type Filter */}
                     <Select
                        label="Item Type"
                        id="itemTypeFilter"
                        value={selectedItemType}
                        onChange={(e) => setSelectedItemType(e.target.value)}
                        containerClassName="min-w-[150px]"
                    >
                        <option value="">All Types</option>
                        {complianceItemTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </Select>

                    {/* TODO: Add Date Range Filter components here */}
                </div>

                {/* Compliance List */}
                <ComplianceList
                    key={listRefreshKey} // Add key to trigger refresh on change
                    employeeId={canManage ? (selectedEmployeeId ? parseInt(selectedEmployeeId, 10) : undefined) : undefined /* Pass logged-in employee ID if needed */}
                    status={selectedStatus || undefined}
                    itemType={selectedItemType || undefined}
                    canManage={canManage}
                    onEdit={handleEdit}
                />

                {/* Add/Edit Modal */}
                 <Modal
                    isOpen={isModalOpen}
                    onClose={handleModalClose}
                    title={editingItemId ? 'Edit Compliance Item' : 'Add New Compliance Item'}
                    size="lg" // Adjust size as needed
                 >
                     <ComplianceForm
                        itemId={editingItemId}
                        onSuccess={handleFormSuccess} // Use success handler to close and refresh
                        onCancel={handleModalClose}
                    />
                 </Modal>
            </div>
        </> // Moved parenthesis and semicolon after fragment
    );
};

// Fetch employees server-side for the filter dropdown & get user role
export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);

    // Protect route
    if (!session) {
        return { redirect: { destination: '/login', permanent: false } };
    }

    // Check if user has permission to view compliance module (adjust roles as needed)
    const currentUserRole = session.user?.role as string | null;
    // Allow all authenticated users to view the page, filtering happens client-side/API-side
    // const allowedRoles = ['Admin', 'DepartmentHead', 'Employee'];
    // if (!currentUserRole || !allowedRoles.includes(currentUserRole)) {
    //      return { notFound: true }; // Or redirect
    // }

    let employees: { id: number; name: string }[] = [];
    // Fetch employee list only if user can filter by employee (Admin/HR/DeptHead)
    const canFilterByEmployee = currentUserRole === 'Admin' || currentUserRole === 'DepartmentHead'; // Add other roles like HR if needed
    if (canFilterByEmployee) {
        try {
            // Use the actual API client function
            // Note: This runs server-side, so axios needs the full URL or handle base URL config
            // For simplicity, assuming fetchEmployeesForSelect works server-side or adjust API call
            employees = await fetchEmployeesForSelect();
        } catch (error) {
            console.error('SSR Error fetching employees for filter:', error);
            // Proceed without employees if fetch fails, or handle error differently
        }
    }

    return {
        props: {
            employees,
            currentUserRole,
            // Avoid passing the full session object to the client unless necessary
            // session,
        },
    };
};

export default ComplianceIndexPage;