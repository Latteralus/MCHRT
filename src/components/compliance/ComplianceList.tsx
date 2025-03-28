// src/components/compliance/ComplianceList.tsx
import React, { useState, useEffect } from 'react';
// Placeholder: Import API functions (fetch, delete)
// import { fetchComplianceItems, deleteComplianceItem } from '@/lib/api/compliance';
// Placeholder: Import UI components (Table, Pagination, Badge, Button, Loading, Error)
// Placeholder: Import types (ComplianceItem, UserRole)

// Define the shape of a compliance item for display
interface DisplayComplianceItem {
    id: number;
    employeeName: string; // Combine first/last name from included employee data
    itemType: string;
    itemName: string;
    authority?: string;
    licenseNumber?: string;
    issueDate?: string; // Format date
    expirationDate?: string; // Format date
    status: string; // 'Active', 'ExpiringSoon', 'Expired', 'PendingReview'
}

interface ComplianceListProps {
    // Props for filtering
    employeeId?: number;
    status?: string;
    itemType?: string;
    // Prop to indicate if the current user can manage items (edit/delete)
    canManage?: boolean;
    // Callback for triggering edit action
    onEdit?: (itemId: number) => void;
}

// Mock API function for fetching
const mockFetchComplianceItems = async (filters: any): Promise<{ items: DisplayComplianceItem[], totalPages: number }> => {
    console.log('Mock fetching compliance items with filters:', filters);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    // Return mock data based on filters if needed, otherwise static list
    return {
        items: [
            { id: 1, employeeName: 'Kirk, James', itemType: 'License', itemName: 'Pharmacist License', authority: 'State Board', licenseNumber: 'PH12345', issueDate: '2023-01-15', expirationDate: '2025-01-14', status: 'ExpiringSoon' },
            { id: 2, employeeName: 'McCoy, Leonard', itemType: 'License', itemName: 'Pharmacy Tech License', authority: 'State Board', licenseNumber: 'PT67890', issueDate: '2022-06-01', expirationDate: '2024-05-31', status: 'Expired' },
            { id: 3, employeeName: 'Uhura, Nyota', itemType: 'Training', itemName: 'HIPAA Compliance', authority: 'Internal HR', issueDate: '2024-01-10', expirationDate: '2025-01-09', status: 'Active' },
            { id: 4, employeeName: 'Manager, William', itemType: 'Review', itemName: '90 Day Review', authority: 'HR', issueDate: '2024-03-01', expirationDate: undefined, status: 'PendingReview' },
        ],
        totalPages: 1,
    };
};

// Mock API function for deleting
const mockDeleteComplianceItem = async (itemId: number): Promise<void> => {
     console.log(`Mock deleting compliance item ${itemId}`);
     await new Promise(resolve => setTimeout(resolve, 300));
     // Simulate potential error
     // if (itemId === 2) throw new Error("Simulated deletion error");
};


const ComplianceList: React.FC<ComplianceListProps> = ({ employeeId, status, itemType, canManage = false, onEdit }) => {
    const [items, setItems] = useState<DisplayComplianceItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(20); // Or make configurable

    const loadItems = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Replace with actual API call: fetchComplianceItems
            const data = await mockFetchComplianceItems({
                employeeId,
                status,
                itemType,
                page: currentPage,
                limit
            });
            setItems(data.items);
            setTotalPages(data.totalPages);
            if (currentPage > data.totalPages) {
                setCurrentPage(Math.max(1, data.totalPages));
            }
        } catch (err: any) {
            console.error('Failed to fetch compliance items:', err);
            setError(err.message || 'Failed to load compliance items.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadItems();
    }, [employeeId, status, itemType, currentPage, limit]);

    const handleDelete = async (itemId: number) => {
        if (!confirm('Are you sure you want to delete this compliance item?')) {
            return;
        }
        try {
            setIsLoading(true); // Indicate loading state during action
            // Replace with actual API call: deleteComplianceItem
            await mockDeleteComplianceItem(itemId);
            alert('Item deleted successfully.'); // Simple feedback
            loadItems(); // Refresh list
        } catch (err: any) {
           console.error('Error deleting item:', err);
           alert(`Failed to delete item: ${err.message}`);
           setIsLoading(false); // Reset loading state on error
        }
        // No finally setIsLoading(false) here, as loadItems() handles it
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    if (isLoading && items.length === 0) { // Show loading only on initial load
        return <div className="text-center p-4">Loading compliance items...</div>;
    }

    if (error) {
        return <div className="text-center p-4 text-red-500 bg-red-100 border border-red-400 rounded">{error}</div>;
    }

    if (items.length === 0) {
        return <div className="text-center p-4 text-gray-500">No compliance items found matching the criteria.</div>;
    }

    // Placeholder: Replace with actual Table component
    return (
        <div className="overflow-x-auto relative">
             {isLoading && <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10">Loading...</div>}
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiration Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        {canManage && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {items.map((item) => (
                        <tr key={item.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.employeeName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.itemName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.itemType}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.expirationDate || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {/* Placeholder: Replace with Badge component */}
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    item.status === 'Active' ? 'bg-green-100 text-green-800' :
                                    item.status === 'Expired' ? 'bg-red-100 text-red-800' :
                                    item.status === 'ExpiringSoon' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800' // PendingReview or other
                                }`}>
                                    {item.status}
                                </span>
                            </td>
                            {canManage && (
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    {/* Placeholder: Replace with Button components */}
                                    <button onClick={() => onEdit && onEdit(item.id)} className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50" disabled={isLoading}>Edit</button>
                                    <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900 disabled:opacity-50" disabled={isLoading}>Delete</button>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
            {/* Placeholder: Replace with actual Pagination component */}
            <div className="mt-4 flex justify-center">
                {totalPages > 1 && (
                    <>
                        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1 || isLoading} className="mx-1 px-3 py-1 border rounded disabled:opacity-50">Previous</button>
                        <span className="mx-2 self-center">Page {currentPage} of {totalPages}</span>
                        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages || isLoading} className="mx-1 px-3 py-1 border rounded disabled:opacity-50">Next</button>
                    </>
                )}
            </div>
        </div>
    );
};

export default ComplianceList;