import type { NextApiRequest, NextApiResponse } from 'next';
import Document from '@/modules/documents/models/Document';
import { withRole } from '@/lib/middleware/withRole'; // Import withRole
import { AuthenticatedNextApiHandler } from '@/lib/middleware/withAuth'; // Import handler type
// import fs from 'fs/promises'; // Needed for actual file deletion
// import path from 'path'; // Needed for constructing file paths
// import { defineAssociations } from '@/db/associations';

// TODO: Add more granular authorization (RBAC for documents based on context/ownership)
// TODO: Add proper error handling and validation
// TODO: Implement actual file deletion on DELETE request

// Ensure associations are defined
// defineAssociations();

// Define the core handler logic expecting authentication and session
const handler: AuthenticatedNextApiHandler = async (req, res, session) => {
  const { method } = req;
  const { id } = req.query; // Get the document ID from the URL path

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Document ID is required' });
  }

  const documentId = parseInt(id, 10);
  if (isNaN(documentId)) {
    return res.status(400).json({ message: 'Invalid Document ID format' });
  }

  let documentRecord; // To store the found document record

  switch (method) {
    case 'GET':
      // Handle GET request - Retrieve document metadata by ID
      try {
        documentRecord = await Document.findByPk(documentId);
        if (!documentRecord) {
          return res.status(404).json({ message: 'Document not found' });
        }
        // TODO: Check RBAC permissions before returning
        res.status(200).json(documentRecord);
      } catch (error) {
        console.error(`Error fetching document ${documentId}:`, error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
      break;

    case 'PUT':
      // Handle PUT request - Update document metadata by ID
      try {
        documentRecord = await Document.findByPk(documentId);
        if (!documentRecord) {
          return res.status(404).json({ message: 'Document not found' });
        }
        // TODO: Check RBAC permissions before allowing update

        // Allow updating metadata fields
        const {
          title,
          // filePath should generally not be updated directly here
          ownerId, // Reassign owner? Requires careful permission checks
          employeeId,
          departmentId,
          description,
          version // Increment version?
        } = req.body;

        const updateData: Partial<Document> = {};
        if (title) updateData.title = title;
        if (ownerId !== undefined) updateData.ownerId = ownerId; // Check permissions!
        if (employeeId !== undefined) updateData.employeeId = employeeId;
        if (departmentId !== undefined) updateData.departmentId = departmentId;
        if (description !== undefined) updateData.description = description;
        if (version) updateData.version = version; // Or handle version increment logic

        await documentRecord.update(updateData);
        res.status(200).json(documentRecord); // Return the updated metadata

      } catch (error: any) {
        console.error(`Error updating document ${documentId}:`, error);
        // Handle potential foreign key or unique constraint errors
        res.status(500).json({ message: 'Internal Server Error' });
      }
      break;

    case 'DELETE':
      // Handle DELETE request - Delete document metadata (and optionally the file)
      try {
        documentRecord = await Document.findByPk(documentId);
        if (!documentRecord) {
          return res.status(404).json({ message: 'Document not found' });
        }
        // TODO: Check RBAC permissions before allowing delete

        const filePathToDelete = documentRecord.filePath; // Get path before deleting record

        await documentRecord.destroy();

        // TODO: Implement actual file deletion from local storage
        // try {
        //   const fullPath = path.join(process.env.FILE_STORAGE_PATH || './local-storage/documents', filePathToDelete);
        //   await fs.unlink(fullPath);
        //   console.log(`Deleted file: ${fullPath}`);
        // } catch (fileError) {
        //   console.error(`Error deleting file ${filePathToDelete}:`, fileError);
        //   // Decide how to handle DB record deletion failure vs file deletion failure
        // }

        res.status(204).end(); // No content to send back
      } catch (error) {
        console.error(`Error deleting document ${documentId}:`, error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

// Wrap the handler with the RBAC middleware, allowing all authenticated users for now
// More specific checks (e.g., based on document ownership/department) should be inside the handler
export default withRole(['Admin', 'DepartmentHead', 'Employee'], handler);