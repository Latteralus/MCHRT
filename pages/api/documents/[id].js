import { AppDataSource } from "../../../utils/db";
import Document from "../../../entities/Document";
import { apiHandler } from "../../../utils/apiHandler";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

// Helper function to check document access permissions
const checkDocumentAccess = (document, user) => {
  // Admins and HR managers have access to all documents
  if (user.role === 'admin' || user.role === 'hr_manager') {
    return true;
  }
  
  // Check access based on document's accessLevel
  switch (document.accessLevel) {
    case 'public':
      // Everyone has access to public documents
      return true;
    
    case 'department':
      // Department members have access to department documents
      return document.department?.id === user.departmentId || 
             document.employee?.department?.id === user.departmentId;
    
    case 'manager':
      // Only managers and above can access manager-level documents
      return user.role === 'department_manager' && 
             (document.department?.id === user.departmentId || 
              document.employee?.department?.id === user.departmentId);
    
    case 'hr':
      // Only HR and admins can access HR-level documents (already checked above)
      return false;
    
    case 'admin':
      // Only admins can access admin-level documents (already checked above)
      return false;
    
    case 'individual':
      // Only the specific employee can access individual documents
      return document.employee?.id === user.employeeId;
    
    default:
      return false;
  }
};

export default apiHandler({
  GET: async (req, res) => {
    const { id } = req.query;
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const documentRepository = AppDataSource.getRepository(Document);
      
      const document = await documentRepository.findOne({
        where: { id },
        relations: ['employee', 'department', 'uploadedBy'],
      });
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Check access permissions based on role and document access level
      const hasAccess = checkDocumentAccess(document, session.user);
      
      if (!hasAccess) {
        return res.status(403).json({ message: "Forbidden - Insufficient permissions to access this document" });
      }
      
      // Record this access in the document's access log
      if (!document.accessLog) {
        document.accessLog = [];
      }
      
      document.accessLog.push({
        userId: session.user.id,
        userName: session.user.name,
        accessType: 'VIEW',
        timestamp: new Date().toISOString()
      });
      
      await documentRepository.save(document);
      
      // Sanitize HIPAA-sensitive data for non-admin/HR users
      if (document.isHIPAASensitive && 
          session.user.role !== 'admin' && 
          session.user.role !== 'hr_manager') {
        const sanitizedDocument = {
          id: document.id,
          title: document.title,
          documentType: document.documentType,
          accessLevel: document.accessLevel,
          fileName: document.fileName,
          version: document.version,
          createdAt: document.createdAt,
          updatedAt: document.updatedAt,
          employee: document.employee,
          department: document.department,
          requiresAcknowledgment: document.requiresAcknowledgment,
          // Exclude sensitive content
        };
        return res.status(200).json(sanitizedDocument);
      }
      
      return res.status(200).json(document);
    } catch (error) {
      console.error("Error fetching document:", error);
      return res.status(500).json({ message: "Failed to fetch document" });
    }
  },
  
  PUT: async (req, res) => {
    const { id } = req.query;
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const documentRepository = AppDataSource.getRepository(Document);
      
      const document = await documentRepository.findOne({
        where: { id },
        relations: ['employee', 'department', 'uploadedBy'],
      });
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Check if user has permission to update this document
      if (session.user.role !== 'admin' && session.user.role !== 'hr_manager') {
        if (session.user.role === 'department_manager') {
          // Department managers can only update documents for their department
          if (document.department?.id !== session.user.departmentId) {
            return res.status(403).json({ message: "Forbidden - Cannot update documents from other departments" });
          }
          
          // Cannot update HIPAA or medical documents
          if (document.isHIPAASensitive || document.documentType === 'MEDICAL') {
            return res.status(403).json({ message: "Forbidden - Cannot update HIPAA-sensitive or medical documents" });
          }
        } else {
          // Regular employees cannot update documents
          return res.status(403).json({ message: "Forbidden - Insufficient permissions to update documents" });
        }
      }
      
      // Handle document versioning
      if (req.body.filePath && req.body.filePath !== document.filePath) {
        // File content changed, increment version
        req.body.version = document.version + 1;
      }
      
      // Recalculate scheduled deletion date if retention period changes
      if (req.body.retentionPeriod && req.body.retentionPeriod !== document.retentionPeriod) {
        const deletionDate = new Date();
        deletionDate.setDate(deletionDate.getDate() + req.body.retentionPeriod);
        req.body.scheduledDeletionDate = deletionDate;
      }
      
      // Log the update in the access log
      if (!document.accessLog) {
        document.accessLog = [];
      }
      
      document.accessLog.push({
        userId: session.user.id,
        userName: session.user.name,
        accessType: 'UPDATE',
        timestamp: new Date().toISOString()
      });
      
      req.body.accessLog = document.accessLog;
      
      // Update document
      documentRepository.merge(document, req.body);
      const updatedDocument = await documentRepository.save(document);
      
      return res.status(200).json(updatedDocument);
    } catch (error) {
      console.error("Error updating document:", error);
      return res.status(500).json({ message: "Failed to update document" });
    }
  },
  
  DELETE: async (req, res) => {
    const { id } = req.query;
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Only admin and HR managers can delete documents
    if (session.user.role !== 'admin' && session.user.role !== 'hr_manager') {
      return res.status(403).json({ message: "Forbidden - Insufficient permissions to delete documents" });
    }
    
    try {
      const documentRepository = AppDataSource.getRepository(Document);
      
      const document = await documentRepository.findOne({
        where: { id }
      });
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Log deletion for audit purposes before removing
      console.log(`[AUDIT] Document ${id} (${document.title}) deleted by ${session.user.name} (${session.user.id}) at ${new Date().toISOString()}`);
      
      // TODO: If using file storage system, consider file removal logic here
      // This would involve deleting the actual file from storage
      
      await documentRepository.remove(document);
      
      return res.status(200).json({ message: "Document deleted successfully" });
    } catch (error) {
      console.error("Error deleting document:", error);
      return res.status(500).json({ message: "Failed to delete document" });
    }
  },
  
  // Additional endpoint for document acknowledgment
  PATCH: async (req, res) => {
    const { id } = req.query;
    const { action } = req.body;
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const documentRepository = AppDataSource.getRepository(Document);
      
      const document = await documentRepository.findOne({
        where: { id }
      });
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Check if user has access to this document
      const hasAccess = checkDocumentAccess(document, session.user);
      
      if (!hasAccess) {
        return res.status(403).json({ message: "Forbidden - Insufficient permissions to access this document" });
      }
      
      // Handle document acknowledgment
      if (action === 'acknowledge') {
        if (!document.requiresAcknowledgment) {
          return res.status(400).json({ message: "This document does not require acknowledgment" });
        }
        
        // Initialize acknowledgments array if it doesn't exist
        if (!document.acknowledgments) {
          document.acknowledgments = [];
        }
        
        // Check if user has already acknowledged
        const alreadyAcknowledged = document.acknowledgments.some(ack => 
          ack.userId === session.user.id
        );
        
        if (alreadyAcknowledged) {
          return res.status(400).json({ message: "You have already acknowledged this document" });
        }
        
        // Add acknowledgment
        document.acknowledgments.push({
          userId: session.user.id,
          userName: session.user.name,
          timestamp: new Date().toISOString()
        });
        
        // Log the acknowledgment
        if (!document.accessLog) {
          document.accessLog = [];
        }
        
        document.accessLog.push({
          userId: session.user.id,
          userName: session.user.name,
          accessType: 'ACKNOWLEDGE',
          timestamp: new Date().toISOString()
        });
        
        await documentRepository.save(document);
        
        return res.status(200).json({ 
          message: "Document acknowledged successfully",
          acknowledgments: document.acknowledgments 
        });
      }
      
      return res.status(400).json({ message: "Invalid action" });
    } catch (error) {
      console.error("Error processing document action:", error);
      return res.status(500).json({ message: "Failed to process document action" });
    }
  }
});