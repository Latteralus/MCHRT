// src/components/documents/DocumentList.tsx
import React, { useState, useEffect } from 'react';
// Placeholder: Import API functions (fetch, delete)
// import { fetchDocuments, deleteDocument } from '@/lib/api/documents';
// Placeholder: Import UI components (Table, Pagination, Button, Loading, Error, Icon)
// Placeholder: Import types (Document, UserRole)
// Placeholder: Import utility for formatting file size, dates

// Define the shape of a document for display
interface DisplayDocument {
    id: number;
    title: string;
    fileType?: string;
    fileSize?: number; // In bytes
    uploadedBy?: string; // Owner name
    employeeName?: string; // Associated employee name
    updatedAt: string; // Formatted date/time
    // Add filePath for download/view link construction
    filePath: string;
}

interface DocumentListProps {
    // Props for filtering
    employeeId?: number;
    departmentId?: number;
    title?: string;
    // Prop to indicate if the current user can manage items (delete, maybe edit metadata)
    canManage?: boolean;
    // Callback for triggering metadata edit action (if implemented)
    // onEditMetadata?: (docId: number) => void;
}

// Mock API function for fetching
const mockFetchDocuments = async (filters: any): Promise<{ documents: DisplayDocument[], totalPages: number }> => {
    console.log('Mock fetching documents with filters:', filters);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    // Return mock data
    return {
        documents: [
            { id: 1, title: 'Employee Handbook Q1 2025', fileType: 'application/pdf', fileSize: 1024 * 512, uploadedBy: 'HR Admin', updatedAt: '2025-03-20 10:00:00', filePath: 'uuid1.pdf' },
            { id: 2, title: 'Kirk Performance Review', fileType: 'application/pdf', fileSize: 1024 * 128, uploadedBy: 'Faith Calkins', employeeName: 'Kirk, James', updatedAt: '2025-03-15 14:30:00', filePath: 'uuid2.pdf' },
            { id: 3, title: 'Compounding SOP v3', fileType: 'application/pdf', fileSize: 1024 * 1024 * 2, uploadedBy: 'Operations Manager', updatedAt: '2025-03-10 09:00:00', filePath: 'uuid3.pdf' },
        ],
        totalPages: 1,
    };
};

// Mock API function for deleting
const mockDeleteDocument = async (docId: number): Promise<void> => {
     console.log(`Mock deleting document ${docId}`);
     await new Promise(resolve => setTimeout(resolve, 300));
};

// Helper to format file size
const formatFileSize = (bytes?: number): string => {
    if (bytes === undefined || bytes === null) return 'N/A';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper to get file icon class (example)
const getFileIconClass = (fileType?: string): string => {
    if (!fileType) return 'fas fa-file'; // Default icon
    if (fileType.startsWith('image/')) return 'fas fa-file-image';
    if (fileType === 'application/pdf') return 'fas fa-file-pdf';
    if (fileType.includes('word')) return 'fas fa-file-word';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'fas fa-file-excel';
    return 'fas fa-file-alt'; // Generic document icon
};


const DocumentList: React.FC<DocumentListProps> = ({ employeeId, departmentId, title, canManage = false }) => {
    const [documents, setDocuments] = useState<DisplayDocument[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(20); // Or make configurable

    const loadDocuments = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Replace with actual API call: fetchDocuments
            const data = await mockFetchDocuments({
                employeeId,
                departmentId,
                title,
                page: currentPage,
                limit
            });
            setDocuments(data.documents);
            setTotalPages(data.totalPages);
            if (currentPage > data.totalPages) {
                setCurrentPage(Math.max(1, data.totalPages));
            }
        } catch (err: any) {
            console.error('Failed to fetch documents:', err);
            setError(err.message || 'Failed to load documents.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadDocuments();
    }, [employeeId, departmentId, title, currentPage, limit]);

    const handleDelete = async (docId: number) => {
        if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
            return;
        }
        try {
            setIsLoading(true); // Indicate loading state during action
            // Replace with actual API call: deleteDocument
            await mockDeleteDocument(docId);
            alert('Document deleted successfully.'); // Simple feedback
            loadDocuments(); // Refresh list
        } catch (err: any) {
           console.error('Error deleting document:', err);
           alert(`Failed to delete document: ${err.message}`);
           setIsLoading(false); // Reset loading state on error
        }
    };

     const handleDownload = (filePath: string, title: string) => {
        // Construct the download URL. This needs an API route to serve the file securely.
        // Example: /api/documents/download/[filename]
        // For now, just log it.
        console.log(`Placeholder: Trigger download for ${filePath} (Title: ${title})`);
        alert(`Download functionality not implemented. Would download: ${filePath}`);
        // window.location.href = `/api/documents/download/${filePath}`; // Example of triggering download
    };


    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    if (isLoading && documents.length === 0) {
        return <div className="text-center p-4">Loading documents...</div>;
    }

    if (error) {
        return <div className="text-center p-4 text-red-500 bg-red-100 border border-red-400 rounded">{error}</div>;
    }

    if (documents.length === 0) {
        return <div className="text-center p-4 text-gray-500">No documents found matching the criteria.</div>;
    }

    // Placeholder: Replace with actual Table component
    return (
        <div className="overflow-x-auto relative">
             {isLoading && <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10">Loading...</div>}
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">Type</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded By</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {documents.map((doc) => (
                        <tr key={doc.id}>
                             <td className="px-6 py-4 whitespace-nowrap text-center">
                                <i className={`${getFileIconClass(doc.fileType)} text-gray-500 text-lg`}></i>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doc.title}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.uploadedBy || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.employeeName || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatFileSize(doc.fileSize)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.updatedAt}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                {/* Placeholder: Replace with Button/Icon components */}
                                <button onClick={() => handleDownload(doc.filePath, doc.title)} className="text-blue-600 hover:text-blue-900 disabled:opacity-50" title="Download" disabled={isLoading}>
                                     <i className="fas fa-download"></i>
                                </button>
                                {/* Add View button? Needs secure file serving */}
                                {canManage && (
                                    <>
                                        {/* <button onClick={() => onEditMetadata && onEditMetadata(doc.id)} className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50" title="Edit Metadata" disabled={isLoading}>
                                            <i className="fas fa-pencil-alt"></i>
                                        </button> */}
                                        <button onClick={() => handleDelete(doc.id)} className="text-red-600 hover:text-red-900 disabled:opacity-50" title="Delete" disabled={isLoading}>
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </>
                                )}
                            </td>
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

export default DocumentList;