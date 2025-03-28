// src/pages/compliance/index.tsx
import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import MainLayout from '@/components/layouts/MainLayout';
import ComplianceList from '@/components/compliance/ComplianceList';
import ComplianceForm from '@/components/compliance/ComplianceForm'; // Import the form
// Placeholder: Import function to fetch employees/departments for filters
// import { fetchEmployeesForSelect } from '@/lib/api/employees';
// Placeholder: Import UI components (Select, Button, Modal)
// import Modal from '@/components/common/Modal'; // Placeholder Modal import

interface ComplianceIndexPageProps {
    employees: { id: number; name: string }[]; // For filter dropdown
    currentUserRole: string | null;
}

// Example statuses and types for filters
const complianceStatuses = ['Active', 'ExpiringSoon', 'Expired', 'PendingReview'];
const complianceItemTypes = ['License', 'Certification', 'Training', 'Review']; // Example types

const ComplianceIndexPage: React.FC<ComplianceIndexPageProps> = ({ employees, currentUserRole }) => {
    // State for filters
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [selectedItemType, setSelectedItemType] = useState<string>('');
    // TODO: Add date range filters if needed

    // State for managing add/edit modal (placeholder)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItemId, setEditingItemId] = useState<number | null>(null);

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
        // TODO: Add logic to refresh the ComplianceList data here
        // This might involve adding a 'key' prop to ComplianceList that changes,
        // or lifting the loadItems function up. For now, manual refresh is needed.
        console.log("Modal closed. List refresh might be needed.");
    };


    return (
        <MainLayout>
            <div className="container mx-auto p-4">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-semibold">Compliance Tracking</h1>
                    {canManage && (
                        <button
                            onClick={handleAddNew}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Add New Item
                        </button>
                    )}
                </div>

                {/* Filter Section - Placeholder */}
                <div className="mb-4 p-4 border rounded shadow-sm bg-gray-50 flex flex-wrap gap-4 items-end">
                    {/* Employee Filter (Show only if manager/admin?) */}
                    {canManage && ( // Or specific roles like Admin/HR
                        <div>
                            <label htmlFor="employeeFilter" className="block text-sm font-medium text-gray-700">Employee</label>
                            <select
                                id="employeeFilter"
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

                    {/* Status Filter */}
                    <div>
                        <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                            id="statusFilter"
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            <option value="">All Statuses</option>
                            {complianceStatuses.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>

                     {/* Item Type Filter */}
                     <div>
                        <label htmlFor="itemTypeFilter" className="block text-sm font-medium text-gray-700">Item Type</label>
                        <select
                            id="itemTypeFilter"
                            value={selectedItemType}
                            onChange={(e) => setSelectedItemType(e.target.value)}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            <option value="">All Types</option>
                            {complianceItemTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    {/* TODO: Add Date Range Filter components here */}
                </div>

                {/* Compliance List */}
                <ComplianceList
                    employeeId={canManage ? (selectedEmployeeId ? parseInt(selectedEmployeeId, 10) : undefined) : undefined /* Pass logged-in employee ID if needed */}
                    status={selectedStatus || undefined}
                    itemType={selectedItemType || undefined}
                    canManage={canManage}
                    onEdit={handleEdit}
                />

                {/* Placeholder for Add/Edit Modal */}
                {/* {isModalOpen && (
                    <Modal onClose={handleModalClose}>
                        <ComplianceForm
                            itemId={editingItemId}
                            onSuccess={handleModalClose}
                            onCancel={handleModalClose}
                        />
                    </Modal>
                )} */}
                {/* Actual Modal Rendering (using placeholder structure) */}
                 {isModalOpen && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
                        <div className="relative mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                             {/* Close button can be added here */}
                             <ComplianceForm
                                itemId={editingItemId}
                                onSuccess={handleModalClose} // Close modal on success
                                onCancel={handleModalClose} // Close modal on cancel
                            />
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
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
    const allowedRoles = ['Admin', 'DepartmentHead', 'Employee', 'Human Resources']; // Example roles
    if (!currentUserRole || !allowedRoles.includes(currentUserRole)) {
         return { notFound: true }; // Or redirect
    }

    let employees: { id: number; name: string }[] = [];
    // Fetch employee list only if user can filter by employee (Admin/HR/DeptHead)
    if (currentUserRole === 'Admin' || currentUserRole === 'DepartmentHead' || currentUserRole === 'Human Resources') {
        try {
            // Placeholder: Fetch employees
            console.log('SSR: Fetching employees for compliance filter...');
            // employees = await fetchEmployeesForSelect();
            employees = [ // Placeholder data
                { id: 1, name: 'Kirk, James' },
                { id: 2, name: 'McCoy, Leonard' },
                { id: 3, name: 'Uhura, Nyota' },
                { id: 4, name: 'Manager, William' },
            ];
        } catch (error) {
            console.error('SSR Error fetching employees for filter:', error);
        }
    }

    return {
        props: {
            employees,
            currentUserRole,
            session,
        },
    };
};

export default ComplianceIndexPage;