import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { Document, Employee } from '@/db'; // Import models
import { withAuth, AuthenticatedNextApiHandler } from '@/lib/middleware/withAuth';
import { UserRole } from '@/lib/middleware/withRole'; // Import UserRole type

// Define the base storage path from environment variables
const baseStoragePath = process.env.FILE_STORAGE_PATH || path.join(process.cwd(), 'local-storage', 'documents');

// Define the handler logic, wrapped with authentication
const handler: AuthenticatedNextApiHandler = async (req, res, session) => {
    const { method } = req;
    const { filename } = req.query; // Get the unique filename from the URL path
    const requestingUserId = session.user?.id;
    const requestingUserRole = session.user?.role as UserRole;
    const requestingUserDepartmentId = session.user?.departmentId;

    if (method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ message: `Method ${method} Not Allowed` });
    }

    if (!filename || typeof filename !== 'string') {
        return res.status(400).json({ message: 'Filename is required' });
    }

    try {
        // Find the document record by its unique filePath (which is the filename from the URL)
        const document = await Document.findOne({
            where: { filePath: filename },
            include: [{ model: Employee, as: 'employee', attributes: ['id', 'userId', 'departmentId'] }] // Include for auth checks
        });

        if (!document) {
            return res.status(404).json({ message: 'Document not found or filename is incorrect.' });
        }

        // --- Authorization Check (similar to listing/metadata) ---
        let authorized = false;
        if (requestingUserRole === 'Admin') {
            authorized = true; // Admins can download any document
        } else if (document.ownerId === requestingUserId) {
            authorized = true; // Owner can download their own document
        } else if (requestingUserRole === 'DepartmentHead') {
           if (requestingUserDepartmentId) {
               if (document.departmentId === requestingUserDepartmentId) {
                   authorized = true; // Document belongs to the department
               } else if (document.employeeId) {
                   // Check if the associated employee belongs to the manager's department
                   const employee = await Employee.findByPk(document.employeeId, { attributes: ['departmentId'] });
                   if (employee && employee.departmentId === requestingUserDepartmentId) {
                       authorized = true;
                   }
               }
            }
       } else if (requestingUserRole === 'Employee') {
           // Employee can download their own docs or general docs
           if (document.employeeId) {
                // Check if the document's employeeId matches the employee linked to the requesting user
                const employee = await Employee.findOne({ where: { userId: requestingUserId }, attributes: ['id'] });
                if (employee && employee.id === document.employeeId) {
                    authorized = true; // Document is associated with their employee record
                }
           } else if (!document.employeeId && !document.departmentId) {
                authorized = true; // General company document
            }
        }

        if (!authorized) {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to download this document.' });
        }
        // --- End Authorization Check ---

        // Construct the full file path
        const filePath = path.join(baseStoragePath, document.filePath);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            console.error(`File not found on server: ${filePath} for document ID ${document.id}`);
            return res.status(404).json({ message: 'File not found on server.' });
        }

        // Get file stats for content length
        const stats = fs.statSync(filePath);

        // Set headers for file download
        // Use the unique filePath as the download filename (originalFilename is not stored)
        const downloadFilename = document.filePath;
        res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
        res.setHeader('Content-Type', document.fileType || 'application/octet-stream'); // Use stored MIME type or default
        res.setHeader('Content-Length', stats.size.toString());

        // Stream the file
        const readStream = fs.createReadStream(filePath);
        readStream.pipe(res);

        // Handle stream errors
        readStream.on('error', (err) => {
            console.error('Error streaming file:', err);
            // Check if headers already sent before sending error response
            if (!res.headersSent) {
                res.status(500).json({ message: 'Error reading file.' });
            }
        });

        // Ensure response ends when stream finishes (important for serverless environments)
         res.on('finish', () => {
             console.log(`Successfully streamed file: ${downloadFilename}`);
         });


    } catch (error: any) {
        console.error(`Error processing download request for ${filename}:`, error);
        if (!res.headersSent) {
             res.status(500).json({ message: 'Internal Server Error' });
        }
    }
};

// Apply authentication middleware
export default withAuth(handler);