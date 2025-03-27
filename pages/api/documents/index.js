import { AppDataSource } from "../../../utils/db";
import Document from "../../../entities/Document";
import { apiHandler } from "../../../utils/apiHandler";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default apiHandler({
  GET: async (req, res) => {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const documentRepository = AppDataSource.getRepository(Document);
      
      // Extract query parameters
      const { 
        documentType, 
        accessLevel, 
        employeeId, 
        departmentId,
        isHIPAASensitive,
        expiringBefore,
        tags,
        requiresAcknowledgment,
        limit,
        offset,
        search
      } = req.query;
      
      // Create query builder with joins
      let queryBuilder = documentRepository.createQueryBuilder("document")
        .leftJoinAndSelect("document.employee", "employee")
        .leftJoinAndSelect("document.department", "department")
        .leftJoinAndSelect("document.uploadedBy", "uploadedBy");
      
      // Apply access control based on user role
      if (session.user.role !== 'admin' && session.user.role !== 'hr_manager') {
        if (session.user.role === 'department_manager') {
          // Department managers can see:
          // 1. Public documents
          // 2. Department documents for their department
          // 3. Documents where they are the employee
          // 4. Manager-level documents
          queryBuilder.where(
            "(document.accessLevel = :publicLevel) OR " +
            "(document.accessLevel = :deptLevel AND department.id = :userDeptId) OR " +
            "(document.accessLevel = :individualLevel AND employee.id = :userId) OR " +
            "(document.accessLevel = :managerLevel)",
            { 
              publicLevel: 'public',
              deptLevel: 'department',
              individualLevel: 'individual',
              managerLevel: 'manager',
              userDeptId: session.user.departmentId,
              userId: session.user.employeeId
            }
          );
        } else {
          // Regular employees can see:
          // 1. Public documents
          // 2. Department documents for their department
          // 3. Documents where they are the employee
          queryBuilder.where(
            "(document.accessLevel = :publicLevel) OR " +
            "(document.accessLevel = :deptLevel AND department.id = :userDeptId) OR " +
            "(document.accessLevel = :individualLevel AND employee.id = :userId)",
            { 
              publicLevel: 'public',
              deptLevel: 'department',
              individualLevel: 'individual',
              userDeptId: session.user.departmentId,
              userId: session.user.employeeId
            }
          );
        }
      }
      
      // Apply filters
      if (documentType) {
        queryBuilder.andWhere("document.documentType = :documentType", { documentType });
      }
      
      if (accessLevel && (session.user.role === 'admin' || session.user.role === 'hr_manager')) {
        queryBuilder.andWhere("document.accessLevel = :accessLevel", { accessLevel });
      }
      
      if (employeeId && (session.user.role === 'admin' || session.user.role === 'hr_manager' || 
          (session.user.role === 'department_manager' && 
           session.user.departmentId === session.user.departmentId))) {
        queryBuilder.andWhere("employee.id = :employeeId", { employeeId });
      }
      
      if (departmentId && (session.user.role === 'admin' || session.user.role === 'hr_manager' || 
          (session.user.role === 'department_manager' && 
           departmentId === session.user.departmentId))) {
        queryBuilder.andWhere("department.id = :departmentId", { departmentId });
      }
      
      if (isHIPAASensitive !== undefined && (session.user.role === 'admin' || session.user.role === 'hr_manager')) {
        queryBuilder.andWhere("document.isHIPAASensitive = :isHIPAASensitive", { 
          isHIPAASensitive: isHIPAASensitive === 'true' 
        });
      }
      
      if (expiringBefore) {
        const expiryDate = new Date(expiringBefore);
        queryBuilder.andWhere("document.expirationDate <= :expiryDate", { expiryDate });
      }
      
      if (tags) {
        // Handle comma-separated tags
        const tagArray = tags.split(',');
        tagArray.forEach((tag, index) => {
          queryBuilder.andWhere(`document.tags LIKE :tag${index}`, { [`tag${index}`]: `%${tag}%` });
        });
      }
      
      if (requiresAcknowledgment !== undefined) {
        queryBuilder.andWhere("document.requiresAcknowledgment = :requiresAcknowledgment", { 
          requiresAcknowledgment: requiresAcknowledgment === 'true' 
        });
      }
      
      if (search) {
        queryBuilder.andWhere(
          "(document.title LIKE :search OR document.description LIKE :search OR document.fileName LIKE :search)",
          { search: `%${search}%` }
        );
      }
      
      // Add pagination
      if (limit) {
        queryBuilder.take(parseInt(limit));
      }
      
      if (offset) {
        queryBuilder.skip(parseInt(offset));
      }
      
      // Order by most recently updated
      queryBuilder.orderBy("document.updatedAt", "DESC");
      
      // Execute query
      const [documents, total] = await queryBuilder.getManyAndCount();
      
      // Add access logging
      const now = new Date();
      documents.forEach(doc => {
        // Only record access for actual documents (not just metadata)
        if (doc.filePath) {
          // Create access log entry
          const accessEntry = {
            userId: session.user.id,
            userName: session.user.name,
            accessType: 'VIEW_LISTING',
            timestamp: now.toISOString()
          };
          
          // Initialize access log if it doesn't exist
          if (!doc.accessLog) {
            doc.accessLog = [];
          }
          
          // Add entry to access log and save
          doc.accessLog.push(accessEntry);
          documentRepository.save(doc).catch(err => {
            console.error(`Error updating access log for document ${doc.id}:`, err);
          });
        }
      });
      
      // Remove sensitive data for non-admin/HR users
      let sanitizedDocuments = documents;
      if (session.user.role !== 'admin' && session.user.role !== 'hr_manager') {
        sanitizedDocuments = documents.map(doc => {
          if (doc.isHIPAASensitive) {
            return {
              id: doc.id,
              title: doc.title,
              documentType: doc.documentType,
              accessLevel: doc.accessLevel,
              fileName: doc.fileName,
              version: doc.version,
              createdAt: doc.createdAt,
              updatedAt: doc.updatedAt,
              employee: doc.employee,
              department: doc.department,
              requiresAcknowledgment: doc.requiresAcknowledgment,
              // Do not include filePath, fileContent, or other sensitive data
            };
          }
          return doc;
        });
      }
      
      return res.status(200).json({
        documents: sanitizedDocuments,
        total,
        limit: limit ? parseInt(limit) : null,
        offset: offset ? parseInt(offset) : 0
      });
    } catch (error) {
      console.error("Error fetching documents:", error);
      return res.status(500).json({ message: "Failed to fetch documents", error: error.message });
    }
  },
  
  POST: async (req, res) => {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Only admin, HR managers, and department managers can upload documents
    if (session.user.role !== 'admin' && 
        session.user.role !== 'hr_manager' && 
        session.user.role !== 'department_manager') {
      return res.status(403).json({ message: "Forbidden - Insufficient permissions" });
    }
    
    try {
      const documentRepository = AppDataSource.getRepository(Document);
      const documentData = req.body;
      
      // Set uploaded by information
      documentData.uploadedById = session.user.id;
      
      // If department manager, restrict to their department
      if (session.user.role === 'department_manager') {
        if (documentData.departmentId && documentData.departmentId !== session.user.departmentId) {
          return res.status(403).json({ 
            message: "Forbidden - Cannot upload documents for other departments" 
          });
        }
        
        // Default to manager's department if not specified
        if (!documentData.departmentId) {
          documentData.departmentId = session.user.departmentId;
        }
        
        // Restrict certain document types for department managers
        if (documentData.documentType === 'MEDICAL' || 
            documentData.isHIPAASensitive) {
          return res.status(403).json({ 
            message: "Forbidden - Cannot upload HIPAA-sensitive or medical documents" 
          });
        }
      }
      
      // Calculate scheduled deletion date if retention period is set
      if (documentData.retentionPeriod) {
        const deletionDate = new Date();
        deletionDate.setDate(deletionDate.getDate() + documentData.retentionPeriod);
        documentData.scheduledDeletionDate = deletionDate;
      }
      
      // Initialize empty access log
      documentData.accessLog = [{
        userId: session.user.id,
        userName: session.user.name,
        accessType: 'CREATED',
        timestamp: new Date().toISOString()
      }];
      
      // Create new document record
      const newDocument = documentRepository.create(documentData);
      const savedDocument = await documentRepository.save(newDocument);
      
      return res.status(201).json(savedDocument);
    } catch (error) {
      console.error("Error creating document:", error);
      return res.status(500).json({ message: "Failed to create document", error: error.message });
    }
  }
});