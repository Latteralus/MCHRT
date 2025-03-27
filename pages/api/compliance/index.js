import { AppDataSource } from "../../../utils/db";
import Compliance from "../../../entities/Compliance";
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
      const complianceRepository = AppDataSource.getRepository(Compliance);
      
      // Process query parameters
      const { 
        status, 
        expiringBefore, 
        licenseType, 
        employeeId, 
        departmentId,
        isHIPAASensitive,
        limit,
        offset
      } = req.query;
      
      // Build query based on permissions and filters
      let queryBuilder = complianceRepository.createQueryBuilder("compliance")
        .leftJoinAndSelect("compliance.employee", "employee")
        .leftJoinAndSelect("employee.department", "employeeDept")
        .leftJoinAndSelect("compliance.department", "department")
        .leftJoinAndSelect("compliance.verifier", "verifier");
      
      // Apply role-based restrictions
      if (session.user.role !== 'admin' && session.user.role !== 'hr_manager') {
        if (session.user.role === 'department_manager') {
          queryBuilder.where(
            "(employeeDept.id = :departmentId OR department.id = :departmentId)",
            { departmentId: session.user.departmentId }
          );
        } else {
          // Regular employees can only see their own records
          queryBuilder.where("employee.id = :employeeId", { employeeId: session.user.employeeId });
        }
      }
      
      // Apply filters
      if (status) {
        queryBuilder.andWhere("compliance.status = :status", { status });
      }
      
      if (expiringBefore) {
        const expiryDate = new Date(expiringBefore);
        queryBuilder.andWhere("compliance.expirationDate <= :expiryDate", { expiryDate });
      }
      
      if (licenseType) {
        queryBuilder.andWhere("compliance.licenseType = :licenseType", { licenseType });
      }
      
      if (employeeId && (session.user.role === 'admin' || session.user.role === 'hr_manager')) {
        queryBuilder.andWhere("employee.id = :employeeId", { employeeId });
      }
      
      if (departmentId && (session.user.role === 'admin' || session.user.role === 'hr_manager')) {
        queryBuilder.andWhere(
          "(employeeDept.id = :departmentId OR department.id = :departmentId)", 
          { departmentId }
        );
      }
      
      if (isHIPAASensitive !== undefined && (session.user.role === 'admin' || session.user.role !== 'hr_manager')) {
        queryBuilder.andWhere("compliance.isHIPAASensitive = :isHIPAASensitive", { 
          isHIPAASensitive: isHIPAASensitive === 'true' 
        });
      }
      
      // Add pagination if specified
      if (limit) {
        queryBuilder.take(parseInt(limit));
      }
      
      if (offset) {
        queryBuilder.skip(parseInt(offset));
      }
      
      // Order by expiration date (most urgent first)
      queryBuilder.orderBy("compliance.expirationDate", "ASC");
      
      // Execute query
      const records = await queryBuilder.getMany();
      
      // Filter out HIPAA sensitive data for non-admin/HR users
      let sanitizedRecords = records;
      if (session.user.role !== 'admin' && session.user.role !== 'hr_manager') {
        sanitizedRecords = records.map(record => {
          if (record.isHIPAASensitive) {
            return {
              id: record.id,
              licenseType: record.licenseType,
              status: record.status,
              expirationDate: record.expirationDate,
              employee: record.employee,
              department: record.department
            };
          }
          return record;
        });
      }
      
      return res.status(200).json(sanitizedRecords);
    } catch (error) {
      console.error("Error fetching compliance records:", error);
      return res.status(500).json({ message: "Failed to fetch compliance records" });
    }
  },
  
  POST: async (req, res) => {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Only admin and HR managers can create compliance records
    if (session.user.role !== 'admin' && session.user.role !== 'hr_manager') {
      return res.status(403).json({ message: "Forbidden - Insufficient permissions" });
    }
    
    try {
      const complianceRepository = AppDataSource.getRepository(Compliance);
      const complianceData = req.body;
      
      // Add verification info
      complianceData.lastVerificationDate = new Date();
      complianceData.verifiedBy = session.user.name;
      complianceData.verifierId = session.user.id;
      
      // Handle reminder flag - default to false
      if (complianceData.reminderSent === undefined) {
        complianceData.reminderSent = false;
      }
      
      // Create new compliance record
      const newRecord = complianceRepository.create(complianceData);
      await complianceRepository.save(newRecord);
      
      return res.status(201).json(newRecord);
    } catch (error) {
      console.error("Error creating compliance record:", error);
      return res.status(500).json({ message: "Failed to create compliance record", error: error.message });
    }
  }
});