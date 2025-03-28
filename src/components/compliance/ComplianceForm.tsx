// src/components/compliance/ComplianceForm.tsx
import React, { useState, useEffect } from 'react';
// Placeholder: Import API functions (fetch single item, create, update)
// import { fetchComplianceItem, createComplianceItem, updateComplianceItem } from '@/lib/api/compliance';
// Placeholder: Import Employee fetch function for dropdown
// import { fetchEmployeesForSelect } from '@/lib/api/employees';
// Placeholder: Import UI components (Input, Select, DatePicker, Button, Loading, Error)
// Placeholder: Import types (ComplianceItem, ComplianceStatus)

interface ComplianceFormData {
    employeeId: string; // Use string for select input value
    itemType: string;
    itemName: string;
    authority: string;
    licenseNumber: string;
    issueDate: string; // Use string for date input value
    expirationDate: string; // Use string for date input value
    status: string; // ComplianceStatus
}

interface ComplianceFormProps {
    itemId?: number | null; // ID of the item to edit, or null/undefined for new item
    onSuccess: () => void; // Callback on successful save
    onCancel: () => void; // Callback on cancel
}

// Mock API functions
const mockFetchComplianceItem = async (id: number): Promise<Partial<ComplianceFormData>> => {
    console.log(`Mock fetching compliance item ${id}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    // Return mock data for editing
    if (id === 1) {
        return {
            employeeId: '1', // Assuming employee ID 1 is James Kirk
            itemType: 'License',
            itemName: 'Pharmacist License',
            authority: 'State Board',
            licenseNumber: 'PH12345',
            issueDate: '2023-01-15',
            expirationDate: '2025-01-14',
            status: 'ExpiringSoon',
        };
    }
    throw new Error("Item not found for editing (mock)");
};

const mockCreateComplianceItem = async (data: ComplianceFormData): Promise<any> => {
    console.log('Mock creating compliance item:', data);
    await new Promise(resolve => setTimeout(resolve, 500));
    return { id: Date.now(), ...data }; // Return mock created item
};

const mockUpdateComplianceItem = async (id: number, data: Partial<ComplianceFormData>): Promise<any> => {
    console.log(`Mock updating compliance item ${id}:`, data);
    await new Promise(resolve => setTimeout(resolve, 500));
    return { id, ...data }; // Return mock updated item
};

// Mock employee list for dropdown
const mockEmployees = [
    { id: 1, name: 'Kirk, James' },
    { id: 2, name: 'McCoy, Leonard' },
    { id: 3, name: 'Uhura, Nyota' },
    { id: 4, name: 'Manager, William' },
];

// Example statuses and types for dropdowns
const complianceStatuses = ['Active', 'ExpiringSoon', 'Expired', 'PendingReview'];
const complianceItemTypes = ['License', 'Certification', 'Training', 'Review'];

const ComplianceForm: React.FC<ComplianceFormProps> = ({ itemId, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState<ComplianceFormData>({
        employeeId: '',
        itemType: '',
        itemName: '',
        authority: '',
        licenseNumber: '',
        issueDate: '',
        expirationDate: '',
        status: 'PendingReview', // Default status
    });
    const [employees, setEmployees] = useState<{ id: number; name: string }[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch item data if editing
    useEffect(() => {
        // Fetch employees for dropdown
        // In a real app, fetchEmployeesForSelect() would be called here
        setEmployees(mockEmployees);

        if (itemId) {
            setIsLoading(true);
            setError(null);
            // Replace with actual API call: fetchComplianceItem
            mockFetchComplianceItem(itemId)
                .then(data => {
                    setFormData(prev => ({
                        ...prev, // Keep defaults for fields not returned
                        ...data,
                        // Ensure dates are formatted correctly for input type="date" (YYYY-MM-DD)
                        issueDate: data.issueDate ? data.issueDate.split('T')[0] : '',
                        expirationDate: data.expirationDate ? data.expirationDate.split('T')[0] : '',
                    }));
                })
                .catch(err => {
                    console.error(`Failed to fetch item ${itemId}:`, err);
                    setError(err.message || 'Failed to load item data.');
                })
                .finally(() => setIsLoading(false));
        } else {
            // Reset form for new item
             setFormData({
                employeeId: '', itemType: '', itemName: '', authority: '',
                licenseNumber: '', issueDate: '', expirationDate: '', status: 'PendingReview'
            });
        }
    }, [itemId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        // Basic validation
        if (!formData.employeeId || !formData.itemType || !formData.itemName) {
            setError('Employee, Item Type, and Item Name are required.');
            setIsLoading(false);
            return;
        }

        try {
            if (itemId) {
                // Update existing item - Replace with actual API call: updateComplianceItem
                await mockUpdateComplianceItem(itemId, formData);
            } else {
                // Create new item - Replace with actual API call: createComplianceItem
                await mockCreateComplianceItem(formData);
            }
            onSuccess(); // Call success callback
        } catch (err: any) {
            console.error('Failed to save compliance item:', err);
            setError(err.message || 'Failed to save item.');
            setIsLoading(false); // Keep form open on error
        }
        // Don't set loading false here if onSuccess navigates away or closes modal
    };

    if (isLoading && !itemId) { // Show loading only when fetching for edit
        return <div>Loading item data...</div>;
    }

    // Placeholder: Replace with actual form layout and UI components
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">{itemId ? 'Edit' : 'Add'} Compliance Item</h2>

            {error && <div className="p-3 bg-red-100 text-red-700 border border-red-400 rounded">{error}</div>}

            {/* Employee Select */}
            <div>
                <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">Employee *</label>
                <select
                    id="employeeId"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    disabled={isLoading}
                >
                    <option value="" disabled>Select Employee</option>
                    {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                </select>
            </div>

            {/* Item Name */}
            <div>
                <label htmlFor="itemName" className="block text-sm font-medium text-gray-700">Item Name *</label>
                <input
                    type="text"
                    id="itemName"
                    name="itemName"
                    value={formData.itemName}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    disabled={isLoading}
                />
            </div>

             {/* Item Type Select */}
             <div>
                <label htmlFor="itemType" className="block text-sm font-medium text-gray-700">Item Type *</label>
                <select
                    id="itemType"
                    name="itemType"
                    value={formData.itemType}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    disabled={isLoading}
                >
                    <option value="" disabled>Select Type</option>
                    {complianceItemTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
            </div>

            {/* Authority */}
            <div>
                <label htmlFor="authority" className="block text-sm font-medium text-gray-700">Issuing Authority</label>
                <input
                    type="text"
                    id="authority"
                    name="authority"
                    value={formData.authority}
                    onChange={handleChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    disabled={isLoading}
                />
            </div>

             {/* License Number */}
             <div>
                <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">License/Cert Number</label>
                <input
                    type="text"
                    id="licenseNumber"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    disabled={isLoading}
                />
            </div>

            {/* Issue Date */}
            <div>
                <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700">Issue Date</label>
                <input
                    type="date"
                    id="issueDate"
                    name="issueDate"
                    value={formData.issueDate}
                    onChange={handleChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    disabled={isLoading}
                />
            </div>

             {/* Expiration Date */}
             <div>
                <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700">Expiration Date</label>
                <input
                    type="date"
                    id="expirationDate"
                    name="expirationDate"
                    value={formData.expirationDate}
                    onChange={handleChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    disabled={isLoading}
                />
            </div>

             {/* Status Select */}
             <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status *</label>
                <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    disabled={isLoading}
                >
                    {complianceStatuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
            </div>


            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {isLoading ? 'Saving...' : (itemId ? 'Update Item' : 'Add Item')}
                </button>
            </div>
        </form>
    );
};

export default ComplianceForm;