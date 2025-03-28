import React, { useState, useEffect } from 'react';
import { fetchComplianceItem, createComplianceItem, updateComplianceItem } from '@/lib/api/compliance';
import { fetchEmployeesForSelect } from '@/lib/api/employees';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert'; // Import Alert for error display

// Interface for form data state
interface ComplianceFormData {
    employeeId: string; // Keep as string for Select component value
    itemType: string;
    itemName: string;
    authority: string;
    licenseNumber: string;
    issueDate: string; // Keep as string for Input type="date"
    expirationDate: string; // Keep as string for Input type="date"
    status: string;
}

// Interface for employee select options
interface EmployeeOption {
    id: number;
    name: string;
}

interface ComplianceFormProps {
    itemId?: number | null;
    onSuccess: () => void;
    onCancel: () => void;
}

// Constants for dropdowns
const complianceStatuses = ['Active', 'ExpiringSoon', 'Expired', 'PendingReview', 'Archived']; // Added Archived
const complianceItemTypes = ['License', 'Certification', 'Training', 'Review', 'PolicyAcknowledgement']; // Added more types

const ComplianceForm: React.FC<ComplianceFormProps> = ({ itemId, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState<ComplianceFormData>({
        employeeId: '', itemType: '', itemName: '', authority: '',
        licenseNumber: '', issueDate: '', expirationDate: '', status: 'PendingReview'
    });
    const [employees, setEmployees] = useState<EmployeeOption[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isFetchingInitialData, setIsFetchingInitialData] = useState<boolean>(false);

    // Fetch employees and item data (if editing)
    useEffect(() => {
        let isMounted = true;
        const loadInitialData = async () => {
            setIsFetchingInitialData(true);
            setError(null);
            try {
                // Fetch employees concurrently
                const employeesPromise = fetchEmployeesForSelect();

                let itemDataPromise: Promise<any> = Promise.resolve(null);
                if (itemId) {
                    itemDataPromise = fetchComplianceItem(itemId);
                }

                const [fetchedEmployees, itemData] = await Promise.all([employeesPromise, itemDataPromise]);

                if (!isMounted) return; // Prevent state update if component unmounted

                setEmployees(fetchedEmployees);

                if (itemData) {
                    // Populate form with fetched item data
                    setFormData({
                        employeeId: itemData.employeeId?.toString() || '',
                        itemType: itemData.itemType || '',
                        itemName: itemData.itemName || '',
                        authority: itemData.authority || '',
                        licenseNumber: itemData.licenseNumber || '',
                        // Format dates for input type="date" (YYYY-MM-DD)
                        issueDate: itemData.issueDate ? itemData.issueDate.split('T')[0] : '',
                        expirationDate: itemData.expirationDate ? itemData.expirationDate.split('T')[0] : '',
                        status: itemData.status || 'PendingReview',
                    });
                } else {
                     // Reset form if creating new or itemId is invalid
                     setFormData({
                        employeeId: '', itemType: '', itemName: '', authority: '',
                        licenseNumber: '', issueDate: '', expirationDate: '', status: 'PendingReview'
                    });
                }

            } catch (err: any) {
                 if (isMounted) {
                    console.error('Failed to load initial form data:', err);
                    setError(err.message || 'Failed to load data.');
                 }
            } finally {
                 if (isMounted) {
                    setIsFetchingInitialData(false);
                 }
            }
        };

        loadInitialData();

        return () => { isMounted = false; }; // Cleanup function
    }, [itemId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

        // Prepare data for API (convert employeeId to number, handle optional fields)
        const apiData = {
            employeeId: parseInt(formData.employeeId, 10),
            itemType: formData.itemType,
            itemName: formData.itemName,
            authority: formData.authority || null,
            licenseNumber: formData.licenseNumber || null,
            issueDate: formData.issueDate || null,
            expirationDate: formData.expirationDate || null,
            status: formData.status,
        };

        try {
            if (itemId) {
                await updateComplianceItem(itemId, apiData);
            } else {
                await createComplianceItem(apiData);
            }
            onSuccess(); // Call success callback
        } catch (err: any) {
            console.error('Failed to save compliance item:', err);
            setError(err.message || 'Failed to save item.');
            setIsLoading(false); // Keep form open on error
        }
        // Don't set loading false here if onSuccess navigates away or closes modal
    };

    if (isFetchingInitialData) {
        return <div className="p-4 text-center">Loading form data...</div>;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">{itemId ? 'Edit' : 'Add'} Compliance Item</h2>

            {error && <Alert type="danger" title="Error">{error}</Alert>}

            <Select
                label="Employee *"
                id="employeeId"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                required
                disabled={isLoading || isFetchingInitialData}
                error={!formData.employeeId && error ? 'Employee is required' : undefined} // Example inline error
            >
                <option value="" disabled>Select Employee</option>
                {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
            </Select>

            <Input
                label="Item Name *"
                id="itemName"
                name="itemName"
                value={formData.itemName}
                onChange={handleChange}
                required
                disabled={isLoading}
                error={!formData.itemName && error ? 'Item Name is required' : undefined}
            />

             <Select
                label="Item Type *"
                id="itemType"
                name="itemType"
                value={formData.itemType}
                onChange={handleChange}
                required
                disabled={isLoading}
                error={!formData.itemType && error ? 'Item Type is required' : undefined}
            >
                <option value="" disabled>Select Type</option>
                {complianceItemTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                ))}
            </Select>

            <Input
                label="Issuing Authority"
                id="authority"
                name="authority"
                value={formData.authority}
                onChange={handleChange}
                disabled={isLoading}
            />

             <Input
                label="License/Cert Number"
                id="licenseNumber"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                disabled={isLoading}
            />

            <Input
                label="Issue Date"
                type="date"
                id="issueDate"
                name="issueDate"
                value={formData.issueDate}
                onChange={handleChange}
                disabled={isLoading}
            />

             <Input
                label="Expiration Date"
                type="date"
                id="expirationDate"
                name="expirationDate"
                value={formData.expirationDate}
                onChange={handleChange}
                disabled={isLoading}
            />

             <Select
                label="Status *"
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                disabled={isLoading}
            >
                {complianceStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                ))}
            </Select>


            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isLoading}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant="primary"
                    disabled={isLoading || isFetchingInitialData}
                >
                    {isLoading ? 'Saving...' : (itemId ? 'Update Item' : 'Add Item')}
                </Button>
            </div>
        </form>
    );
};

export default ComplianceForm;