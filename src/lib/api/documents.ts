import axios from 'axios';

// Interface for API response when listing documents
interface DocumentApiResponse {
    id: number;
    title: string;
    filePath: string; // Unique server filename
    fileType?: string;
    fileSize?: number;
    ownerId: number;
    employeeId?: number | null;
    departmentId?: number | null;
    description?: string | null;
    version: number;
    createdAt: string;
    updatedAt: string;
    owner?: { // Assuming owner details are included
        id: number;
        username?: string; // Or name
    };
    employee?: { // Assuming employee details are included
        id: number;
        firstName: string;
        lastName: string;
    };
    // Add department details if included by API
}

interface FetchDocumentsParams {
    employeeId?: number;
    departmentId?: number;
    title?: string;
    page?: number;
    limit?: number;
}

interface FetchDocumentsResponse {
    documents: DocumentApiResponse[];
    totalPages: number;
    currentPage: number;
}

/**
 * Fetches documents from the API.
 */
export const fetchDocuments = async (
    params: FetchDocumentsParams
): Promise<FetchDocumentsResponse> => {
    try {
        const response = await axios.get<FetchDocumentsResponse>('/api/documents', { params });
        return response.data;
    } catch (error: any) {
        console.error('API Error fetching documents:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to fetch documents');
    }
};

/**
 * Uploads a document file along with metadata.
 * Uses FormData for file upload.
 */
export const uploadDocument = async (
    file: File,
    metadata: {
        title?: string;
        description?: string;
        employeeId?: number | string | null; // Allow string for form input
        departmentId?: number | string | null; // Allow string for form input
    }
): Promise<{ message: string; document: DocumentApiResponse }> => {
    const formData = new FormData();
    formData.append('file', file); // 'file' should match the key expected by the API route

    // Append metadata fields
    if (metadata.title) formData.append('title', metadata.title);
    if (metadata.description) formData.append('description', metadata.description);
    if (metadata.employeeId) formData.append('employeeId', String(metadata.employeeId));
    if (metadata.departmentId) formData.append('departmentId', String(metadata.departmentId));

    try {
        const response = await axios.post<{ message: string; document: DocumentApiResponse }>(
            '/api/documents/upload',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    } catch (error: any) {
        console.error('API Error uploading document:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to upload document');
    }
};

/**
 * Updates document metadata via the API.
 */
export const updateDocumentMetadata = async (
    documentId: number,
    metadata: {
        title?: string;
        description?: string | null;
        employeeId?: number | string | null; // Allow string/null for clearing
        departmentId?: number | string | null; // Allow string/null for clearing
    }
): Promise<DocumentApiResponse> => {
     try {
        // Ensure empty strings become null for clearing associations
        const payload = {
            title: metadata.title,
            description: metadata.description === undefined ? undefined : (metadata.description || null),
            employeeId: metadata.employeeId === undefined ? undefined : (metadata.employeeId || null),
            departmentId: metadata.departmentId === undefined ? undefined : (metadata.departmentId || null),
        };
        const response = await axios.put<DocumentApiResponse>(`/api/documents/${documentId}/metadata`, payload);
        return response.data;
    } catch (error: any) {
        console.error(`API Error updating document metadata ${documentId}:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to update document metadata');
    }
};


/**
 * Deletes a document via the API.
 * Note: This might need a dedicated API endpoint if not handled by /api/documents/[id]
 */
export const deleteDocument = async (documentId: number): Promise<void> => {
    try {
        // Assuming DELETE /api/documents/[id] exists and handles deletion
        await axios.delete(`/api/documents/${documentId}`);
    } catch (error: any) {
        console.error(`API Error deleting document ${documentId}:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to delete document');
    }
};

/**
 * Generates the secure download URL for a document.
 */
export const getDocumentDownloadUrl = (filename: string): string => {
    // The API route handles the actual file serving and auth
    return `/api/documents/download/${filename}`;
};