import React from 'react';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import Link from 'next/link'; // For linking to document page

// Placeholder: Fetch actual data
const mockDocuments = [
    { id: 1, title: 'Employee Handbook Q1 2025', fileType: 'application/pdf', updatedAt: '2 days ago' },
    { id: 2, title: 'Kirk Performance Review', fileType: 'application/pdf', updatedAt: '5 days ago' },
    { id: 3, title: 'Compounding SOP v3', fileType: 'application/pdf', updatedAt: '1 week ago' },
];

// Helper to get file icon class (can be shared or duplicated)
const getFileIconClass = (fileType?: string): string => {
    if (!fileType) return 'fas fa-file';
    if (fileType.startsWith('image/')) return 'fas fa-file-image';
    if (fileType === 'application/pdf') return 'fas fa-file-pdf';
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
    const documents = mockDocuments; // Use mock data

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
                                    <Icon iconName={getFileIconClass(doc.fileType)} className="text-gray-500" />
                                </div>
                                <div className={documentItemInfoClass} style={{ flex: 1, minWidth: 0 }}>
                                    {/* Add Link if needed */}
                                    <p className={documentItemTitleClass} style={{ fontWeight: '500', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {doc.title}
                                    </p>
                                    <p className={documentItemMetaClass} style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>{doc.updatedAt}</p>
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