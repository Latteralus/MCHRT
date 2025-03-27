// pages/documents.js
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '../components/common/Layout';

export default function DocumentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeFolder, setActiveFolder] = useState('hr');
  
  // If loading session, show simple loading indicator
  if (status === 'loading') {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading session...</p>
        </div>
      </Layout>
    );
  }

  // If no session and not loading, redirect to login
  if (!session && status !== 'loading') {
    return null; // Will redirect in useEffect
  }

  // Mock folder structure
  const folders = [
    { id: 'hr', name: 'HR Policies', count: 12 },
    { id: 'forms', name: 'Forms & Templates', count: 8 },
    { id: 'training', name: 'Training Materials', count: 15 },
    { id: 'personal', name: 'My Documents', count: 3 }
  ];

  // Mock documents
  const documents = {
    hr: [
      { id: 1, name: 'Employee Handbook 2025.pdf', size: '2.4 MB', type: 'pdf', updated: '2025-03-15', uploadedBy: 'Admin' },
      { id: 2, name: 'HIPAA Compliance Guidelines.docx', size: '1.1 MB', type: 'docx', updated: '2025-02-28', uploadedBy: 'HR Manager' },
      { id: 3, name: 'Leave Policy.pdf', size: '850 KB', type: 'pdf', updated: '2025-03-10', uploadedBy: 'Admin' }
    ],
    forms: [
      { id: 4, name: 'Vacation Request Form.docx', size: '320 KB', type: 'docx', updated: '2025-01-12', uploadedBy: 'HR Manager' },
      { id: 5, name: 'Employee Evaluation Template.xlsx', size: '450 KB', type: 'xlsx', updated: '2025-03-01', uploadedBy: 'Department Manager' }
    ],
    training: [
      { id: 6, name: 'New Hire Orientation.pptx', size: '5.7 MB', type: 'pptx', updated: '2025-02-15', uploadedBy: 'Training Manager' },
      { id: 7, name: 'HIPAA Training.mp4', size: '68.5 MB', type: 'mp4', updated: '2025-03-05', uploadedBy: 'Compliance Officer' }
    ],
    personal: [
      { id: 8, name: 'ID Badge.jpg', size: '2.1 MB', type: 'jpg', updated: '2025-01-27', uploadedBy: 'You' },
      { id: 9, name: 'Performance Review 2024.pdf', size: '1.2 MB', type: 'pdf', updated: '2025-01-05', uploadedBy: 'Department Manager' }
    ]
  };

  // Get file icon based on type
  const getFileIcon = (type) => {
    switch(type) {
      case 'pdf': return '📄';
      case 'docx': return '📝';
      case 'xlsx': return '📊';
      case 'pptx': return '📑';
      case 'mp4': return '🎬';
      case 'jpg': return '🖼️';
      default: return '📄';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Document Management</h1>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Upload Document
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Left sidebar - Folders */}
          <div className="w-full md:w-64 bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="font-medium text-gray-800">Folders</h2>
            </div>
            <ul className="p-2">
              {folders.map(folder => (
                <li key={folder.id}>
                  <button
                    onClick={() => setActiveFolder(folder.id)}
                    className={`w-full text-left px-3 py-2 rounded-md flex justify-between items-center ${
                      activeFolder === folder.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span>📁 {folder.name}</span>
                    <span className="bg-gray-100 text-gray-600 text-xs rounded-full px-2 py-1">
                      {folder.count}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Right content - Document list */}
          <div className="flex-1 bg-white rounded-lg shadow">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="font-medium text-gray-800">
                {folders.find(f => f.id === activeFolder)?.name || 'Documents'}
              </h2>
              <div className="flex">
                <button className="text-gray-500 hover:text-gray-700 mr-2">
                  ⬇️ Sort
                </button>
                <button className="text-gray-500 hover:text-gray-700">
                  🔍 Search
                </button>
              </div>
            </div>
            <div className="p-4">
              {documents[activeFolder]?.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
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
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {documents[activeFolder].map((doc) => (
                      <tr key={doc.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="mr-2 text-lg">{getFileIcon(doc.type)}</span>
                            <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{doc.size}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{new Date(doc.updated).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{doc.uploadedBy}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                          <button className="text-blue-600 hover:text-blue-900 mr-3">Download</button>
                          <button className="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center p-8 text-gray-500">
                  <p>No documents found in this folder</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-800">
            This is a placeholder page. In the full implementation, you would be able to upload, download, view, and manage documents with proper permissions.
          </p>
        </div>
      </div>
    </Layout>
  );
}