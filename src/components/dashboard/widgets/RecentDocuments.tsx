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

const RecentDocuments: React.FC = () => {
    const documents = mockDocuments; // Use mock data

    return (
        <Card>
            <div className="p-4">
                <h3 className="text-md font-semibold text-gray-800 mb-3">Recent Documents</h3>
                {documents.length === 0 ? (
                    <p className="text-sm text-gray-500">No recent documents found.</p>
                ) : (
                    <ul className="space-y-3">
                        {documents.map(doc => (
                            <li key={doc.id} className="flex items-center space-x-3">
                                <Icon iconName={getFileIconClass(doc.fileType)} className="text-gray-400 text-lg w-5 text-center" />
                                <div className="flex-1 min-w-0">
                                    {/* Placeholder: Link to actual document view/download */}
                                    <p className="text-sm font-medium text-gray-900 truncate hover:text-teal-600 cursor-pointer">
                                        {doc.title}
                                    </p>
                                    <p className="text-xs text-gray-500">{doc.updatedAt}</p>
                                </div>
                                {/* Optional: Add download/view button */}
                            </li>
                        ))}
                    </ul>
                )}
                 {/* Link to view all documents */}
                 <div className="mt-4 text-right">
                     <Link href="/documents" className="text-sm font-medium text-teal-600 hover:text-teal-800">
                         View all <Icon iconName="fas fa-arrow-right" className="ml-1 text-xs" />
                     </Link>
                 </div>
            </div>
        </Card>
    );
};

export default RecentDocuments;