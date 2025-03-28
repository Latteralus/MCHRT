import React, { useState, useEffect } from 'react';
import { fetchDocuments, deleteDocument, getDocumentDownloadUrl } from '@/lib/api/documents';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon'; // Import Icon component
import { format } from 'date-fns'; // For date formatting
// Placeholder: Import types (Document, UserRole)

// Define the shape of a document for display
interface DisplayDocument {
    id: number;
    title: string;
    fileType?: string;
    fileSize?: number; // In bytes
    uploadedBy?: string; // Owner name
    employeeName?: string; // Associated employee name
    updatedAt: string; // Formatted date/time
    filePath: string; // Unique filename for download URL
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
    // Key to trigger refresh externally
    refreshKey?: number;
}

// Helper to format file size
const formatFileSize = (bytes?: number): string => {
    if (bytes === undefined || bytes === null) return 'N/A';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper to format date strings (e.g., YYYY-MM-DD HH:mm)
const formatDateTime = (dateString: string | undefined | null): string => {
    if (!dateString) return 'N/A';
    try {
        return format(new Date(dateString), 'yyyy-MM-dd HH:mm');
    } catch {
        return 'Invalid Date';
    }
};


// Helper to get file icon class (example using Font Awesome)
const getFileIconClass = (fileType?: string): string => {
    if (!fileType) return 'fas fa-file'; // Default icon
    if (fileType.startsWith('image/')) return 'fas fa-file-image';
    if (fileType === 'application/pdf') return 'fas fa-file-pdf';
    if (fileType.includes('word')) return 'fas fa-file-word';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'fas fa-file-excel';
    if (fileType.includes('presentation')) return 'fas fa-file-powerpoint';
    if (fileType.startsWith('text/')) return 'fas fa-file-alt';
    if (fileType.startsWith('audio/')) return 'fas fa-file-audio';
    if (fileType.startsWith('video/')) return 'fas fa-file-video';
    if (fileType === 'application/zip' || fileType.includes('archive')) return 'fas fa-file-archive';
    return 'fas fa-file'; // Generic document icon
};


const DocumentList: React.FC<DocumentListProps> = ({ employeeId, departmentId, title, canManage = false, refreshKey }) => {
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
            // Use actual API call
            const response = await fetchDocuments({
                employeeId,
                departmentId,
                title,
                page: currentPage,
                limit
            });

            // Map API response to DisplayDocument
            const displayDocs = response.documents.map(doc => ({
                id: doc.id,
                title: doc.title,
                fileType: doc.fileType,
                fileSize: doc.fileSize,
                uploadedBy: doc.owner?.username || 'N/A', // Use owner username if available
                employeeName: doc.employee ? `${doc.employee.lastName}, ${doc.employee.firstName}` : 'N/A',
                updatedAt: formatDateTime(doc.updatedAt), // Format date
                filePath: doc.filePath, // Pass unique filename
            }));

            setDocuments(displayDocs);
            setTotalPages(response.totalPages);
            // Adjust current page if it becomes invalid
            if (currentPage > response.totalPages && response.totalPages > 0) {
                setCurrentPage(response.totalPages);
            } else if (response.totalPages === 0) {
                 setCurrentPage(1);
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [employeeId, departmentId, title, currentPage, limit, refreshKey]); // Add refreshKey dependency

    const handleDelete = async (docId: number) => {
        if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
            return;
        }
        try {
            setIsLoading(true);
            // Use actual API call
            await deleteDocument(docId);
            alert('Document deleted successfully.');
            // Reload documents - current page might need adjustment if last item deleted
            loadDocuments();
        } catch (err: any) {
           console.error('Error deleting document:', err);
           alert(`Failed to delete document: ${err.message}`);
           setIsLoading(false); // Reset loading state on error
        }
    };

     const handleDownload = (filePath: string) => {
        // Use the API client function to get the URL
        const downloadUrl = getDocumentDownloadUrl(filePath);
        // Trigger download by navigating or using an anchor tag
        window.location.href = downloadUrl;
        // Or:
        // const link = document.createElement('a');
        // link.href = downloadUrl;
        // link.setAttribute('download', ''); // Optional: suggest filename (browser might override)
        // document.body.appendChild(link);
        // link.click();
        // document.body.removeChild(link);
    };


    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
            setCurrentPage(newPage);
        }
    };

    if (isLoading && documents.length === 0) {
        return <div className="text-center p-4">Loading documents...</div>;
    }

    if (error) {
        // Use Alert component if available
        return <div className="text-center p-4 text-red-500 bg-red-100 border border-red-400 rounded">{error}</div>;
    }

    if (documents.length === 0 && !isLoading) {
        return <div className="text-center p-4 text-gray-500">No documents found matching the criteria.</div>;
    }

    return (
        <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
             {isLoading && <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10 rounded-lg">Loading...</div>}
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">Type</th>
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
                             <td className="px-4 py-4 whitespace-nowrap text-center">
                                <Icon iconName={getFileIconClass(doc.fileType)} className="text-gray-500 text-lg" />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doc.title}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.uploadedBy}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.employeeName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatFileSize(doc.fileSize)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.updatedAt}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                {/* Use Button/Icon components */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDownload(doc.filePath)}
                                    title="Download"
                                    disabled={isLoading}
                                    className="text-blue-600 border-blue-300 hover:bg-blue-50 px-2 py-1" // Adjusted padding
                                >
                                     <Icon iconName="fas fa-download" />
                                </Button>
                                {/* Add Edit Metadata button if needed */}
                                {/* {canManage && onEditMetadata && (
                                     <Button variant="outline" size="sm" onClick={() => onEditMetadata(doc.id)} title="Edit Metadata" disabled={isLoading} className="text-indigo-600 border-indigo-300 hover:bg-indigo-50 px-2 py-1">
                                         <Icon iconName="fas fa-pencil-alt" />
                                     </Button>
                                )} */}
                                {canManage && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDelete(doc.id)}
                                        title="Delete"
                                        disabled={isLoading}
                                        className="text-red-600 border-red-300 hover:bg-red-50 px-2 py-1"
                                    >
                                        <Icon iconName="fas fa-trash" />
                                    </Button>
                                )}
                            </td>
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
                 {totalPages <= 1 && documents.length > 0 && (
                     <span className="text-sm text-gray-700">Page 1 of 1</span>
                 )}
            </div>
        </div>
    );
};

export default DocumentList;