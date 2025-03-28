// src/components/documents/UploadForm.tsx
import React, { useState, useRef } from 'react';
// Placeholder: Import API functions or fetch wrapper
// Placeholder: Import Employee/Department fetch functions for dropdowns
// Placeholder: Import UI components (Input, Select, Button, ProgressBar, Alert)

interface UploadFormProps {
    // Optional props to pre-fill employee/department if uploading in a specific context
    employeeId?: number;
    departmentId?: number;
    onUploadSuccess: (document: any) => void; // Callback on successful upload
}

// Mock employee/department data for dropdowns
const mockEmployees = [
    { id: 1, name: 'Kirk, James' },
    { id: 2, name: 'McCoy, Leonard' },
    { id: 3, name: 'Uhura, Nyota' },
];
const mockDepartments = [
     { id: 1, name: 'Compounding' },
     { id: 2, name: 'Operations' },
     { id: 3, name: 'Shipping' },
];


const UploadForm: React.FC<UploadFormProps> = ({ employeeId, departmentId, onUploadSuccess }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(employeeId?.toString() || '');
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>(departmentId?.toString() || '');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // TODO: Fetch actual employees/departments for dropdowns based on user permissions

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            // Optional: Client-side validation (size, type)
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                 setError('File size exceeds the 10MB limit.');
                 setSelectedFile(null);
                 if(fileInputRef.current) fileInputRef.current.value = ''; // Clear input
                 return;
            }
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
             if (!allowedTypes.includes(file.type)) {
                 setError('Invalid file type. Allowed types: PDF, JPG, PNG, GIF.');
                 setSelectedFile(null);
                  if(fileInputRef.current) fileInputRef.current.value = ''; // Clear input
                 return;
            }

            setSelectedFile(file);
            // Use filename as default title if title is empty
            if (!title) {
                setTitle(file.name.replace(/\.[^/.]+$/, "")); // Remove extension
            }
            setError(null); // Clear previous errors
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
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('title', title || selectedFile.name.replace(/\.[^/.]+$/, "")); // Use filename if title empty
        if (description) formData.append('description', description);
        if (selectedEmployeeId) formData.append('employeeId', selectedEmployeeId);
        if (selectedDepartmentId) formData.append('departmentId', selectedDepartmentId);

        try {
            // Use fetch with XMLHttpRequest for progress tracking (or a library like Axios)
            const xhr = new XMLHttpRequest();

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = Math.round((event.loaded / event.total) * 100);
                    setUploadProgress(percentComplete);
                }
            };

            xhr.onload = () => {
                setIsLoading(false);
                setUploadProgress(100); // Ensure it hits 100 on completion

                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        console.log('Upload successful:', response);
                        onUploadSuccess(response.document); // Pass created document data back
                         // Reset form
                        setSelectedFile(null);
                        setTitle('');
                        setDescription('');
                        setSelectedEmployeeId(employeeId?.toString() || ''); // Reset to initial prop or empty
                        setSelectedDepartmentId(departmentId?.toString() || '');
                        if(fileInputRef.current) fileInputRef.current.value = '';
                        setUploadProgress(0);
                        alert('File uploaded successfully!'); // Simple feedback
                    } catch (parseError) {
                         console.error("Error parsing success response:", parseError);
                         setError("Upload succeeded but response was invalid.");
                    }
                } else {
                    console.error('Upload failed:', xhr.statusText, xhr.responseText);
                     try {
                         const errorResponse = JSON.parse(xhr.responseText);
                         setError(`Upload failed: ${errorResponse.message || xhr.statusText}`);
                     } catch {
                         setError(`Upload failed: ${xhr.statusText || 'Server error'}`);
                     }
                }
            };

            xhr.onerror = () => {
                setIsLoading(false);
                setError('Upload failed due to a network error.');
                console.error('Network error during upload');
                 setUploadProgress(0);
            };

            xhr.open('POST', '/api/documents/upload', true);
            // TODO: Add authorization header if needed (e.g., JWT)
            // xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            xhr.send(formData);

        } catch (err: any) {
            // This catch block might not be reached for XHR errors, handled by onerror
            setIsLoading(false);
            setError(err.message || 'An unexpected error occurred during upload setup.');
            console.error('Error setting up upload:', err);
             setUploadProgress(0);
        }
    };

    // Placeholder: Replace with actual form layout and UI components
    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded shadow-sm">
            <h3 className="text-lg font-medium mb-3">Upload Document</h3>

            {error && <div className="p-3 bg-red-100 text-red-700 border border-red-400 rounded">{error}</div>}

            {/* File Input */}
            <div>
                <label htmlFor="file" className="block text-sm font-medium text-gray-700">File *</label>
                <input
                    type="file"
                    id="file"
                    name="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    required
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                    disabled={isLoading}
                />
                 <p className="mt-1 text-xs text-gray-500">Max 10MB. Allowed types: PDF, JPG, PNG, GIF.</p>
            </div>

            {/* Title */}
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Defaults to filename if left empty"
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    disabled={isLoading}
                />
            </div>

             {/* Description */}
             <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    disabled={isLoading}
                />
            </div>

             {/* Employee Association (Optional, show based on permissions/context) */}
             <div>
                <label htmlFor="uploadEmployeeId" className="block text-sm font-medium text-gray-700">Associate with Employee (Optional)</label>
                <select
                    id="uploadEmployeeId"
                    name="employeeId"
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    disabled={isLoading}
                >
                    <option value="">None</option>
                    {mockEmployees.map(emp => ( // Replace with actual employees list
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                </select>
            </div>

             {/* Department Association (Optional, show based on permissions/context) */}
             <div>
                <label htmlFor="uploadDepartmentId" className="block text-sm font-medium text-gray-700">Associate with Department (Optional)</label>
                <select
                    id="uploadDepartmentId"
                    name="departmentId"
                    value={selectedDepartmentId}
                    onChange={(e) => setSelectedDepartmentId(e.target.value)}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    disabled={isLoading}
                >
                    <option value="">None</option>
                     {mockDepartments.map(dept => ( // Replace with actual departments list
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                </select>
            </div>


            {/* Progress Bar */}
            {isLoading && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isLoading || !selectedFile}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? `Uploading (${uploadProgress}%)` : 'Upload File'}
                </button>
            </div>
        </form>
    );
};

export default UploadForm;