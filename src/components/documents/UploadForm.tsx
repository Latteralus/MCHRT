import React, { useState, useEffect, useRef } from 'react';
import { uploadDocument } from '@/lib/api/documents';
import { fetchEmployeesForSelect } from '@/lib/api/employees';
import { fetchDepartmentsForSelect } from '@/lib/api/departments'; // Import department fetch
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert'; // For displaying errors

interface UploadFormProps {
    employeeId?: number; // Pre-filled employee ID
    departmentId?: number; // Pre-filled department ID
    onUploadSuccess: (document: any) => void; // Callback on successful upload
    // Add onCancel prop if this form is used in a modal
    onCancel?: () => void;
}

interface SelectOption {
    id: number;
    name: string;
}

const UploadForm: React.FC<UploadFormProps> = ({ employeeId, departmentId, onUploadSuccess, onCancel }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(employeeId?.toString() || '');
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>(departmentId?.toString() || '');
    const [employees, setEmployees] = useState<SelectOption[]>([]);
    const [departments, setDepartments] = useState<SelectOption[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    // Upload progress state removed as Axios doesn't provide it easily without extra config
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch employees and departments for dropdowns
    useEffect(() => {
        let isMounted = true;
        const loadDropdownData = async () => {
            // Fetch concurrently
            const employeesPromise = fetchEmployeesForSelect();
            const departmentsPromise = fetchDepartmentsForSelect();
            try {
                const [fetchedEmployees, fetchedDepartments] = await Promise.all([employeesPromise, departmentsPromise]);
                if (isMounted) {
                    setEmployees(fetchedEmployees);
                    setDepartments(fetchedDepartments);
                }
            } catch (err) {
                 if (isMounted) {
                    console.error('Failed to load dropdown data for upload form:', err);
                    // Set error state? Or allow form usage without dropdowns?
                    setError('Failed to load employee/department list.');
                 }
            }
        };
        loadDropdownData();
        return () => { isMounted = false; }; // Cleanup
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            // Client-side validation
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                 setError('File size exceeds the 10MB limit.');
                 setSelectedFile(null);
                 if(fileInputRef.current) fileInputRef.current.value = '';
                 return;
            }
            // Add more allowed types if necessary
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
             if (!allowedTypes.includes(file.type)) {
                 setError(`Invalid file type (${file.type}). Allowed types: PDF, JPG, PNG, GIF, DOC, DOCX.`);
                 setSelectedFile(null);
                  if(fileInputRef.current) fileInputRef.current.value = '';
                 return;
            }

            setSelectedFile(file);
            if (!title) {
                setTitle(file.name.replace(/\.[^/.]+$/, "")); // Default title
            }
            setError(null);
        } else {
            setSelectedFile(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) {
            setError('Please select a file to upload.');
            return;
        }

        setIsLoading(true);
        setError(null);

        const metadata = {
            title: title || selectedFile.name.replace(/\.[^/.]+$/, ""),
            description: description || undefined, // Send undefined if empty
            employeeId: selectedEmployeeId || null, // Send null if empty string
            departmentId: selectedDepartmentId || null, // Send null if empty string
        };

        try {
            const result = await uploadDocument(selectedFile, metadata);
            console.log('Upload successful:', result);
            onUploadSuccess(result.document); // Pass created document data back

            // Reset form state
            setSelectedFile(null);
            setTitle('');
            setDescription('');
            setSelectedEmployeeId(employeeId?.toString() || ''); // Reset to initial prop or empty
            setSelectedDepartmentId(departmentId?.toString() || '');
            if(fileInputRef.current) fileInputRef.current.value = '';
            alert('File uploaded successfully!'); // Simple feedback

        } catch (err: any) {
            console.error('Upload failed:', err);
            setError(err.message || 'Failed to upload file.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Use Alert component for errors */}
            {error && <Alert type="danger" title="Upload Error">{error}</Alert>}

            {/* File Input - Style using Input component structure if possible, or keep custom styling */}
             <div>
                <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">File *</label>
                <input
                    type="file"
                    id="file"
                    name="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    required
                    className={`block w-full text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 disabled:opacity-50 border rounded-lg ${error && !selectedFile ? 'border-red-500' : 'border-gray-300'}`}
                    disabled={isLoading}
                />
                 <p className="mt-1 text-xs text-gray-500">Max 10MB. Allowed: PDF, DOC(X), Images.</p>
            </div>


            <Input
                label="Title"
                id="title"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Defaults to filename if left empty"
                disabled={isLoading}
            />

             {/* Description - Using Input as a textarea */}
             <Input
                label="Description"
                id="description"
                name="description"
                as="textarea" // Assuming Input component supports 'as' prop or similar
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
            />

             {/* Employee Association Select */}
             <Select
                label="Associate with Employee (Optional)"
                id="uploadEmployeeId"
                name="employeeId"
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                disabled={isLoading || employees.length === 0}
            >
                <option value="">None</option>
                {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
            </Select>

             {/* Department Association Select */}
             <Select
                label="Associate with Department (Optional)"
                id="uploadDepartmentId"
                name="departmentId"
                value={selectedDepartmentId}
                onChange={(e) => setSelectedDepartmentId(e.target.value)}
                disabled={isLoading || departments.length === 0}
            >
                <option value="">None</option>
                 {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
            </Select>


            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                 {/* Add Cancel button if needed */}
                 {onCancel && (
                     <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                 )}
                <Button
                    type="submit"
                    variant="primary" // Use primary variant
                    disabled={isLoading || !selectedFile}
                    // Add icon if desired
                >
                    {isLoading ? 'Uploading...' : 'Upload File'}
                </Button>
            </div>
        </form>
    );
};

export default UploadForm;