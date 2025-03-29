// src/pages/api/documents/upload.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File } from 'formidable'; // Import formidable and File type
import fs from 'fs';
import path from 'path';
import { Document, Employee } from '@/db'; // Import Document and Employee models
import { withRole, AuthenticatedNextApiHandler, UserRole } from '@/lib/middleware/withRole';
import { v4 as uuidv4 } from 'uuid';
import { logActivity } from '@/modules/logging/services/activityLogService'; // Import logging service

// Disable Next.js body parsing for this route
export const config = {
    api: {
        bodyParser: false,
    },
};

// Define the base storage path from environment variables
const baseStoragePath = process.env.FILE_STORAGE_PATH || path.join(process.cwd(), 'local-storage', 'documents');

// Ensure the base storage directory exists
fs.mkdirSync(baseStoragePath, { recursive: true });

// Define the handler logic
const handler: AuthenticatedNextApiHandler = async (req, res, session) => {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

    const userId = session.user?.id; // Get user ID from session
    if (!userId) {
        // Should be caught by withRole, but good practice
        return res.status(401).json({ message: 'User ID not found in session.' });
    }

    const form = new formidable.IncomingForm({ // Use formidable namespace
        uploadDir: baseStoragePath, // Base directory
        keepExtensions: true,
        // Define how to generate filenames (e.g., using UUID)
        filename: (name, ext, part, form) => {
            // Generate a unique filename using UUID and keep original extension
            return `${uuidv4()}${ext}`;
        },
        // Optional: Filter specific file types
        filter: ({ name, originalFilename, mimetype }) => {
            // Example: Allow only PDFs and common image types
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
            return !!(mimetype && allowedTypes.includes(mimetype)); // Ensure boolean return
        },
        // Optional: Limit file size (e.g., 10MB)
        maxFileSize: 10 * 1024 * 1024, // 10MB in bytes
    });

    try {
        const parseResult = await new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) {
                    console.error('Error parsing form data:', err);
                    // Handle specific formidable errors (e.g., file size limit)
                    if (err.code === 1009) { // formidable v3 uses code 1009 for LIMIT_FILE_SIZE
                         return reject({ status: 413, message: 'File size exceeds the limit (10MB).' });
                    }
                    return reject({ status: 400, message: 'Error processing file upload.' });
                }
                // Check if files.file exists and is an array with at least one element
                if (!files.file || !Array.isArray(files.file) || files.file.length === 0) {
                     return reject({ status: 400, message: 'No file uploaded or file array is empty.' });
                }
                resolve({ fields, files });
            });
        });

        const { fields, files } = parseResult;
        // Ensure files.file is treated as an array and get the first element
        const uploadedFile = Array.isArray(files.file) ? files.file[0] : undefined;

        if (!uploadedFile) {
             throw { status: 400, message: 'File upload failed or file was filtered.' };
        }

        // Extract metadata from fields (ensure they are sent from the client)
        const title = fields.title?.[0] || uploadedFile.originalFilename || 'Untitled';
        const description = fields.description?.[0] || undefined;
        const employeeId = fields.employeeId?.[0] ? parseInt(fields.employeeId[0], 10) : undefined;
        const departmentId = fields.departmentId?.[0] ? parseInt(fields.departmentId[0], 10) : undefined;

        // --- RBAC Check ---
        const userRole = session.user?.role as UserRole;
        const userDepartmentId = session.user?.departmentId;
        let authorized = false;

        if (userRole === 'Admin') {
            authorized = true; // Admins can upload anything
        } else if (userRole === 'DepartmentHead') {
            if (!userDepartmentId) {
                return res.status(403).json({ message: 'Forbidden: Department information missing for manager.' });
            }
            if (!employeeId && !departmentId) { // General upload
                authorized = true;
            } else if (departmentId && departmentId === userDepartmentId && !employeeId) { // Department upload
                authorized = true;
            } else if (employeeId) { // Employee-specific upload
                const employee = await Employee.findOne({ where: { id: employeeId, departmentId: userDepartmentId }, attributes: ['id'] });
                if (employee) {
                    authorized = true; // Employee is in manager's department
                } else {
                    // Check if manager is uploading for themselves
                    const managerEmployee = await Employee.findOne({ where: { userId: userId }, attributes: ['id'] });
                    if (managerEmployee && managerEmployee.id === employeeId) {
                        authorized = true;
                    }
                }
            }
        } else if (userRole === 'Employee') {
            if (!employeeId && !departmentId) { // General upload
                authorized = true;
            } else if (employeeId) { // Self-upload
                const employee = await Employee.findOne({ where: { userId: userId }, attributes: ['id'] });
                if (employee && employee.id === employeeId) {
                    authorized = true;
                }
            }
            // Employees cannot upload for specific departments or other employees
        }

        if (!authorized) {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to upload this document association.' });
        }
        // --- End RBAC Check ---


        // Create document record in the database
        const newDocument = await Document.create({
            title: title,
            filePath: uploadedFile.newFilename, // Store the generated unique filename
            fileType: uploadedFile.mimetype || undefined,
            fileSize: uploadedFile.size,
            ownerId: userId,
            employeeId: employeeId,
            departmentId: departmentId,
            description: description,
            version: 1, // Initial version
        });

        // --- Log Activity ---
        await logActivity(
            userId,
            'UPLOAD',
            `Uploaded document: ${newDocument.title} (ID: ${newDocument.id})`,
            {
                entityType: 'Document',
                entityId: newDocument.id,
                details: {
                    filename: newDocument.filePath,
                    size: newDocument.fileSize,
                    type: newDocument.fileType,
                    associatedEmployeeId: newDocument.employeeId,
                    associatedDepartmentId: newDocument.departmentId,
                }
            }
        );
        // --- End Log Activity ---

        return res.status(201).json({ message: 'File uploaded successfully', document: newDocument });

    } catch (error: any) {
        console.error('File upload API error:', error);
        // Clean up uploaded file if DB entry fails? (More complex)
        // fs.unlink(uploadedFile.filepath, ...)
        return res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
    }
};

// Apply middleware - Allow any authenticated user to attempt upload
// Finer-grained checks (e.g., can upload for specific employee) should be inside the handler
export default withRole(['Admin', 'DepartmentHead', 'Employee'], handler); // Adjust roles as needed