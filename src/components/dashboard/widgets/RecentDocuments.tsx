import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import Link from 'next/link'; // For linking to document page
import axios from 'axios'; // Import axios
import { formatDistanceToNow } from 'date-fns'; // For relative time formatting

// Define the expected structure for the API response
interface DocumentData {
    id: number;
    title: string;
    mimeType?: string; // Assuming API might return mimeType instead of fileType
    updatedAt: string; // Expecting ISO date string from API
}

// Mock data removed

// Helper to get file icon class (can be shared or duplicated)
const getFileIconClass = (fileType?: string): string => {
    if (!fileType) return 'fas fa-file-alt'; // Default icon
    if (fileType.startsWith('image/')) return 'fas fa-file-image';
    if (fileType === 'application/pdf') return 'fas fa-file-pdf';
    if (fileType.startsWith('text/')) return 'fas fa-file-alt'; // Use text icon for text files
    if (fileType === 'application/msword' || fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'fas fa-file-word';
    // Add more types as needed
    return 'fas fa-file-alt';
};

// Define a simple list item style class (can be styled globally)
const documentItemClass = "document-item"; // Example class name
const documentItemIconClass = "document-item-icon";
const documentItemInfoClass = "document-item-info";
const documentItemTitleClass = "document-item-title";
const documentItemMetaClass = "document-item-meta";

const RecentDocuments: React.FC = () => {
    const [documents, setDocuments] = useState<DocumentData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRecentDocuments = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await axios.get<DocumentData[]>('/api/documents', {
                    params: {
                        sortBy: 'updatedAt',
                        sortOrder: 'desc',
                        limit: 3 // Fetch top 3 recent documents
                    }
                });
                setDocuments(response.data);
            } catch (err: any) {
                console.error("Failed to fetch recent documents:", err);
                setError(err.response?.data?.message || err.message || "Could not load recent documents");
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecentDocuments();
    }, []);

    // Loading State
    if (isLoading) {
        return (
            <Card>
                <div className="card-body flex justify-center items-center h-24"> {/* Added height */}
                    <p className="text-gray-500">Loading...</p>
                </div>
            </Card>
        );
    }

    // Error State
    if (error) {
        return (
            <Card className="border-red-200 bg-red-50">
                 <div className="card-body flex flex-col h-24 justify-center"> {/* Added height */}
                     <div className="flex items-center text-sm text-red-600 mb-1">
                        <Icon iconName="fas fa-exclamation-triangle" className="mr-2" />
                        Error
                    </div>
                    <p className="text-xs text-red-700">{error}</p>
                </div>
            </Card>
        );
    }
    return (
        <Card>
            {/* Use card-body for padding */}
            <div className="card-body">
                {/* Use card-title */}
                <h3 className="card-title" style={{ marginBottom: '1rem' }}>Recent Documents</h3>
                {documents.length === 0 ? (
                    // Rely on default paragraph styling
                    <p>No recent documents found.</p>
                ) : (
                    // Use standard ul/li structure
                    <ul>
                        {documents.map(doc => (
                            // Apply a consistent class for list items
                            <li key={doc.id} className={documentItemClass} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                                <div className={documentItemIconClass} style={{ marginRight: '0.75rem', width: '20px', textAlign: 'center' }}>
                                    {/* Pass className to Icon, not style */}
                                    <Icon iconName={getFileIconClass(doc.mimeType)} className="text-gray-500" />
                                </div>
                                <div className={documentItemInfoClass} style={{ flex: 1, minWidth: 0 }}>
                                    {/* Add Link if needed */}
                                    <p className={documentItemTitleClass} style={{ fontWeight: '500', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {doc.title}
                                    </p>
                                    <p className={documentItemMetaClass} style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>
                                        {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}
                                    </p>
                                </div>
                                {/* Optional: Add download/view button */}
                            </li>
                        ))}
                    </ul>
                )}
                 {/* Link to view all documents */}
                 {/* Use action-link styling */}
                 <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                     <Link href="/documents" className="action-link">
                         View all <Icon iconName="fas fa-arrow-right" />
                     </Link>
                 </div>
            </div>
        </Card>
    );
};

export default RecentDocuments;