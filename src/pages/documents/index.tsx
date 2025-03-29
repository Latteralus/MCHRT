import React, { useState, useCallback } from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import MainLayout from '@/components/layouts/MainLayout';
import DocumentList from '@/components/documents/DocumentList';
import UploadForm from '@/components/documents/UploadForm';
import { fetchEmployeesForSelect } from '@/lib/api/employees';
import { fetchDepartmentsForSelect } from '@/lib/api/departments';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import Link from 'next/link';

interface DocumentsIndexPageProps {
    employees: { id: number; name: string }[];
    departments: { id: number; name: string }[];
    currentUserRole: string | null;
}

// Mock folder data to match screenshot
const folderData = [
    { name: 'HR Policies', icon: 'folder', count: 12 },
    { name: 'Forms & Templates', icon: 'folder', count: 8 },
    { name: 'Training Materials', icon: 'folder', count: 15 },
    { name: 'My Documents', icon: 'folder', count: 3 }
];

// Mock document data to match screenshot
const documentData = [
    {
        id: 1,
        name: 'Employee Handbook 2025.pdf',
        type: 'pdf',
        size: '2.4 MB',
        lastUpdated: '3/14/2025',
        uploadedBy: 'Admin'
    },
    {
        id: 2,
        name: 'HIPAA Compliance Guidelines.docx',
        type: 'docx',
        size: '1.1 MB',
        lastUpdated: '2/27/2025',
        uploadedBy: 'HR Manager'
    },
    {
        id: 3,
        name: 'Leave Policy.pdf',
        type: 'pdf',
        size: '850 KB',
        lastUpdated: '3/9/2025',
        uploadedBy: 'Admin'
    }
];

const DocumentsIndexPage: React.FC<DocumentsIndexPageProps> = ({ employees, departments, currentUserRole }) => {
    // State for filters
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
    const [titleFilter, setTitleFilter] = useState<string>('');
    const [activeFolder, setActiveFolder] = useState<string>('HR Policies');
    const [listKey, setListKey] = useState<number>(Date.now());
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    
    // Determine user capabilities based on role
    const canUpload = currentUserRole === 'Admin' || currentUserRole === 'DepartmentHead' || currentUserRole === 'Employee';
    const canManageAll = currentUserRole === 'Admin';
    const canManageDept = currentUserRole === 'DepartmentHead';
    const listCanManage = canManageAll || canManageDept;

    const handleUploadSuccess = (newDocument: any) => {
        console.log('New document uploaded:', newDocument);
        setIsUploadModalOpen(false);
        setListKey(Date.now());
    };

    const handleOpenUploadModal = () => setIsUploadModalOpen(true);
    const handleCloseUploadModal = () => setIsUploadModalOpen(false);
    
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setTitleFilter(e.target.value);
    };

    // Handle folder click
    const handleFolderClick = (folderName: string) => {
        setActiveFolder(folderName);
    };

    // Format file icon based on extension
    const getFileIcon = (type: string) => {
        switch (type) {
            case 'pdf':
                return <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>;
            case 'docx':
                return <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>;
            default:
                return <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>;
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="header py-6 px-8 flex justify-between items-center">
                <h1 className="text-3xl font-semibold text-gray-800">Document Management</h1>
                <div className="flex items-center gap-4">
                    {canUpload && (
                        <button 
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                            onClick={handleOpenUploadModal}
                        >
                            Upload Document
                        </button>
                    )}
                </div>
            </div>

            {/* Main content */}
            <div className="px-8 pb-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Left sidebar - Folders */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-medium text-gray-800 mb-6">Folders</h2>
                            <ul className="space-y-3">
                                {folderData.map((folder) => (
                                    <li key={folder.name}>
                                        <button
                                            onClick={() => handleFolderClick(folder.name)}
                                            className={`w-full flex items-center justify-between px-3 py-2 rounded ${
                                                activeFolder === folder.name
                                                    ? 'bg-blue-50 text-blue-600'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex items-center">
                                                <span className="mr-2 text-yellow-400">
                                                    <i className="fas fa-folder"></i>
                                                </span>
                                                <span>{folder.name}</span>
                                            </div>
                                            <span className="text-gray-500 text-sm">{folder.count}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Right content - Document list */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-medium text-gray-800">{activeFolder}</h2>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center">
                                        <span className="mr-2 text-gray-500">
                                            <i className="fas fa-sort"></i>
                                        </span>
                                        <span className="text-sm text-gray-600">Sort</span>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search..."
                                            className="pl-8 pr-4 py-1 border border-gray-300 rounded-md text-sm"
                                        />
                                        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                                            <i className="fas fa-search text-xs"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Document table */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-white">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Size
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Last Updated
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Uploaded By
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {documentData.map((doc) => (
                                            <tr key={doc.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 mr-2">
                                                            {getFileIcon(doc.type)}
                                                        </div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {doc.name}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {doc.size}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {doc.lastUpdated}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {doc.uploadedBy}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div className="flex space-x-3">
                                                        <a href="#" className="text-blue-600 hover:text-blue-800">View</a>
                                                        <a href="#" className="text-blue-600 hover:text-blue-800">Download</a>
                                                        <a href="#" className="text-red-600 hover:text-red-800">Delete</a>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Footer message */}
                            <div className="mt-8 p-4 bg-blue-50 text-blue-700 text-sm rounded-md">
                                This is a placeholder page. In the full implementation, you would be able to upload, download, view, and manage documents with proper permissions.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upload Modal */}
            <Modal
                isOpen={isUploadModalOpen}
                onClose={handleCloseUploadModal}
                title="Upload New Document"
                size="lg"
            >
                <UploadForm
                    onUploadSuccess={handleUploadSuccess}
                    onCancel={handleCloseUploadModal}
                />
            </Modal>
        </div>
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);

    // Protect route
    if (!session) {
        return { redirect: { destination: '/login', permanent: false } };
    }

    const currentUserRole = session.user?.role as string | null;

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