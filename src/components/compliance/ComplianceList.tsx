import React, { useState, useEffect } from 'react';
import { fetchComplianceItems, deleteComplianceItem } from '@/lib/api/compliance';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { format } from 'date-fns'; // For date formatting
// Placeholder: Import types (ComplianceItem, UserRole)

// Define the shape of a compliance item for display
interface DisplayComplianceItem {
    id: number;
    employeeName: string; // Combine first/last name from included employee data
    itemType: string;
    itemName: string;
    authority?: string | null; // Allow null
    licenseNumber?: string | null; // Allow null
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

// Helper to format date strings (e.g., YYYY-MM-DD)
const formatDate = (dateString: string | undefined | null): string => {
    if (!dateString) return 'N/A';
    try {
        // Ensure the date string is treated correctly (might need parsing if not ISO)
        // If dateString is just 'YYYY-MM-DD', new Date() might interpret it as UTC midnight.
        // Adding time component 'T00:00:00' helps ensure local interpretation if needed.
        // Or use date-fns parseISO if format is guaranteed ISO 8601.
        return format(new Date(dateString + 'T00:00:00'), 'yyyy-MM-dd');
    } catch {
        return 'Invalid Date';
    }
};

// Helper to map status to Badge color
const getStatusColor = (status: string): 'success' | 'warning' | 'danger' | 'gray' => {
    switch (status?.toLowerCase()) {
        case 'active': return 'success';
        case 'expiringsoon': return 'warning'; // Assuming API returns 'ExpiringSoon'
        case 'expired': return 'danger';
        case 'pendingreview': return 'gray';
        default: return 'gray';
    }
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
            // Use actual API call
            const response = await fetchComplianceItems({
                employeeId,
                status,
                itemType,
                page: currentPage,
                limit
            });

            // Map API response to DisplayComplianceItem
            const displayItems = response.items.map(item => ({
                id: item.id,
                employeeName: item.employee ? `${item.employee.lastName}, ${item.employee.firstName}` : 'N/A',
                itemType: item.itemType,
                itemName: item.itemName,
                authority: item.authority,
                licenseNumber: item.licenseNumber,
                issueDate: formatDate(item.issueDate),
                expirationDate: formatDate(item.expirationDate),
                status: item.status, // Assuming API returns status string directly
            }));

            setItems(displayItems);
            setTotalPages(response.totalPages);
            // Adjust current page if it becomes invalid after data load (e.g., after deletion)
            if (currentPage > response.totalPages && response.totalPages > 0) {
                setCurrentPage(response.totalPages);
            } else if (response.totalPages === 0) {
                 setCurrentPage(1); // Reset to page 1 if no results
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [employeeId, status, itemType, currentPage, limit]); // Dependencies for re-fetching

    const handleDelete = async (itemId: number) => {
        if (!confirm('Are you sure you want to delete this compliance item?')) {
            return;
        }
        try {
            setIsLoading(true); // Indicate loading state during action
            // Use actual API call
            await deleteComplianceItem(itemId);
            alert('Item deleted successfully.'); // Simple feedback
            // Refresh list - loadItems will be triggered by state change if currentPage needs adjustment,
            // or call it directly if staying on the same page is desired after deletion.
            // If deleting the last item on a page, adjusting currentPage might be needed.
            // For simplicity, just reload current view. If it was the last item, loadItems will adjust.
            loadItems();
        } catch (err: any) {
           console.error('Error deleting item:', err);
           alert(`Failed to delete item: ${err.message}`);
           setIsLoading(false); // Reset loading state on error
        }
        // loadItems() handles the final setIsLoading(false)
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
            setCurrentPage(newPage);
        }
    };

    if (isLoading && items.length === 0) { // Show loading only on initial load
        return <div className="text-center p-4">Loading compliance items...</div>;
    }

    if (error) {
        // Use Alert component if available and desired
        return <div className="text-center p-4 text-red-500 bg-red-100 border border-red-400 rounded">{error}</div>;
    }

    if (items.length === 0 && !isLoading) { // Ensure not loading before showing "no items"
        return <div className="text-center p-4 text-gray-500">No compliance items found matching the criteria.</div>;
    }

    // Use actual Table component (assuming one exists or using basic table for now)
    return (
        <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
             {isLoading && <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10 rounded-lg">Loading...</div>}
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
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.expirationDate}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {/* Use Badge component */}
                                <Badge color={getStatusColor(item.status)} size="sm">
                                    {item.status}
                                </Badge>
                            </td>
                            {canManage && (
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    {/* Use Button components */}
                                    <Button
                                        variant="outline"
                                        size="sm" // Assuming Button has size prop
                                        onClick={() => onEdit && onEdit(item.id)}
                                        disabled={isLoading}
                                        className="text-indigo-600 border-indigo-300 hover:bg-indigo-50"
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDelete(item.id)}
                                        disabled={isLoading}
                                        className="text-red-600 border-red-300 hover:bg-red-50"
                                    >
                                        Delete
                                    </Button>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
            {/* Pagination Controls */}
            <div className="py-3 px-6 flex justify-center items-center space-x-2 bg-gray-50 border-t border-gray-200">
                {totalPages > 1 && (
                    <>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage <= 1 || isLoading}
                        >
                            Previous
                        </Button>
                        <span className="text-sm text-gray-700">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= totalPages || isLoading}
                        >
                            Next
                        </Button>
                    </>
                )}
                 {totalPages <= 1 && items.length > 0 && (
                     <span className="text-sm text-gray-700">Page 1 of 1</span>
                 )}
            </div>
        </div>
    );
};

export default ComplianceList;