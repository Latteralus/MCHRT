import { DataSource } from "typeorm";
import { UserEntity } from "../entities/User";
import { DepartmentEntity } from "../entities/Department";
import { EmployeeEntity } from "../entities/Employee";
import { AttendanceEntity } from "../entities/Attendance";
import { LeaveEntity } from "../entities/Leave";
import { ComplianceEntity } from "../entities/Compliance";
import { DocumentEntity } from "../entities/Document";

// Create a TypeORM data source for PostgreSQL
export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  entities: [
    UserEntity,
    DepartmentEntity,
    EmployeeEntity,
    AttendanceEntity,
    LeaveEntity,
    ComplianceEntity,
    DocumentEntity
  ],
  synchronize: process.env.NODE_ENV !== "production", // Auto-sync schema in development
  logging: process.env.NODE_ENV !== "production",
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// Helper function to ensure DB connection
export const ensureDbConnected = async () => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("Data Source has been initialized!");
    }
    return AppDataSource;
  } catch (error) {
    console.error("Error during Data Source initialization:", error);
    throw error;
  }
};

// Database operations
const db = {
  // User operations
  async getUsers() {
    const dataSource = await ensureDbConnected();
    const userRepository = dataSource.getRepository(UserEntity);
    return userRepository.find();
  },

  async getUserById(id) {
    const dataSource = await ensureDbConnected();
    const userRepository = dataSource.getRepository(UserEntity);
    return userRepository.findOneBy({ id });
  },

  async getUserByEmail(email) {
    const dataSource = await ensureDbConnected();
    const userRepository = dataSource.getRepository(UserEntity);
    return userRepository.findOneBy({ email });
  },
  
  async getUserByUsername(username) {
    const dataSource = await ensureDbConnected();
    const userRepository = dataSource.getRepository(UserEntity);
    return userRepository.findOneBy({ username });
  },

  async createUser(userData) {
    const dataSource = await ensureDbConnected();
    const userRepository = dataSource.getRepository(UserEntity);
    const user = userRepository.create(userData);
    return userRepository.save(user);
  },

  async updateUser(id, userData) {
    const dataSource = await ensureDbConnected();
    const userRepository = dataSource.getRepository(UserEntity);
    await userRepository.update(id, userData);
    return this.getUserById(id);
  },

  async deleteUser(id) {
    const dataSource = await ensureDbConnected();
    const userRepository = dataSource.getRepository(UserEntity);
    await userRepository.delete(id);
    return { success: true };
  },

  // Department operations
  async getDepartments() {
    const dataSource = await ensureDbConnected();
    const departmentRepository = dataSource.getRepository(DepartmentEntity);
    return departmentRepository.find();
  },

  async getDepartmentById(id) {
    const dataSource = await ensureDbConnected();
    const departmentRepository = dataSource.getRepository(DepartmentEntity);
    return departmentRepository.findOneBy({ id });
  },

  async createDepartment(departmentData) {
    const dataSource = await ensureDbConnected();
    const departmentRepository = dataSource.getRepository(DepartmentEntity);
    const department = departmentRepository.create(departmentData);
    return departmentRepository.save(department);
  },

  async updateDepartment(id, departmentData) {
    const dataSource = await ensureDbConnected();
    const departmentRepository = dataSource.getRepository(DepartmentEntity);
    await departmentRepository.update(id, departmentData);
    return this.getDepartmentById(id);
  },

  async deleteDepartment(id) {
    const dataSource = await ensureDbConnected();
    const departmentRepository = dataSource.getRepository(DepartmentEntity);
    await departmentRepository.delete(id);
    return { success: true };
  },

  // Employee operations
  async getEmployees(filter = {}) {
    const dataSource = await ensureDbConnected();
    const employeeRepository = dataSource.getRepository(EmployeeEntity);
    
    // Handle filtering for employees by department or other criteria
    let query = employeeRepository.createQueryBuilder("employee");
    
    if (filter.departmentId) {
      query = query.where("employee.departmentId = :departmentId", { departmentId: filter.departmentId });
    }
    
    // Add relations as needed
    query = query.leftJoinAndSelect("employee.department", "department");
    
    return query.getMany();
  },

  async getEmployeeById(id) {
    const dataSource = await ensureDbConnected();
    const employeeRepository = dataSource.getRepository(EmployeeEntity);
    return employeeRepository.findOne({
      where: { id },
      relations: ["department"]
    });
  },

  async createEmployee(employeeData) {
    const dataSource = await ensureDbConnected();
    const employeeRepository = dataSource.getRepository(EmployeeEntity);
    const employee = employeeRepository.create(employeeData);
    return employeeRepository.save(employee);
  },

  async updateEmployee(id, employeeData) {
    const dataSource = await ensureDbConnected();
    const employeeRepository = dataSource.getRepository(EmployeeEntity);
    await employeeRepository.update(id, employeeData);
    return this.getEmployeeById(id);
  },

  async deleteEmployee(id) {
    const dataSource = await ensureDbConnected();
    const employeeRepository = dataSource.getRepository(EmployeeEntity);
    await employeeRepository.delete(id);
    return { success: true };
  },

  // Attendance operations
  async getAttendanceRecords(filter = {}) {
    const dataSource = await ensureDbConnected();
    const attendanceRepository = dataSource.getRepository(AttendanceEntity);
    
    let query = attendanceRepository.createQueryBuilder("attendance");
    
    // Add filters
    if (filter.employeeId) {
      query = query.where("attendance.employeeId = :employeeId", { employeeId: filter.employeeId });
    }
    
    if (filter.startDate && filter.endDate) {
      query = query.andWhere("attendance.date BETWEEN :startDate AND :endDate", { 
        startDate: filter.startDate, 
        endDate: filter.endDate 
      });
    }
    
    // Add relations
    query = query.leftJoinAndSelect("attendance.employee", "employee");
    
    return query.getMany();
  },

  async getAttendanceById(id) {
    const dataSource = await ensureDbConnected();
    const attendanceRepository = dataSource.getRepository(AttendanceEntity);
    return attendanceRepository.findOne({
      where: { id },
      relations: ["employee"]
    });
  },

  async createAttendance(attendanceData) {
    const dataSource = await ensureDbConnected();
    const attendanceRepository = dataSource.getRepository(AttendanceEntity);
    const attendance = attendanceRepository.create(attendanceData);
    return attendanceRepository.save(attendance);
  },

  async updateAttendance(id, attendanceData) {
    const dataSource = await ensureDbConnected();
    const attendanceRepository = dataSource.getRepository(AttendanceEntity);
    await attendanceRepository.update(id, attendanceData);
    return this.getAttendanceById(id);
  },

  async deleteAttendance(id) {
    const dataSource = await ensureDbConnected();
    const attendanceRepository = dataSource.getRepository(AttendanceEntity);
    await attendanceRepository.delete(id);
    return { success: true };
  },

  // Leave operations
  async getLeaveRequests(filter = {}) {
    const dataSource = await ensureDbConnected();
    const leaveRepository = dataSource.getRepository(LeaveEntity);
    
    let query = leaveRepository.createQueryBuilder("leave");
    
    // Add filters
    if (filter.employeeId) {
      query = query.where("leave.employeeId = :employeeId", { employeeId: filter.employeeId });
    }
    
    if (filter.status) {
      query = query.andWhere("leave.status = :status", { status: filter.status });
    }
    
    if (filter.startDate && filter.endDate) {
      query = query.andWhere(
        "(leave.startDate BETWEEN :startDate AND :endDate OR leave.endDate BETWEEN :startDate AND :endDate)",
        { startDate: filter.startDate, endDate: filter.endDate }
      );
    }
    
    // Add relations
    query = query.leftJoinAndSelect("leave.employee", "employee");
    
    return query.getMany();
  },

  async getLeaveRequestById(id) {
    const dataSource = await ensureDbConnected();
    const leaveRepository = dataSource.getRepository(LeaveEntity);
    return leaveRepository.findOne({
      where: { id },
      relations: ["employee"]
    });
  },

  async createLeaveRequest(leaveData) {
    const dataSource = await ensureDbConnected();
    const leaveRepository = dataSource.getRepository(LeaveEntity);
    const leave = leaveRepository.create(leaveData);
    return leaveRepository.save(leave);
  },

  async updateLeaveRequest(id, leaveData) {
    const dataSource = await ensureDbConnected();
    const leaveRepository = dataSource.getRepository(LeaveEntity);
    await leaveRepository.update(id, leaveData);
    return this.getLeaveRequestById(id);
  },

  async deleteLeaveRequest(id) {
    const dataSource = await ensureDbConnected();
    const leaveRepository = dataSource.getRepository(LeaveEntity);
    await leaveRepository.delete(id);
    return { success: true };
  },

  // Compliance operations
  async getComplianceRecords(filter = {}) {
    const dataSource = await ensureDbConnected();
    const complianceRepository = dataSource.getRepository(ComplianceEntity);
    
    let query = complianceRepository.createQueryBuilder("compliance");
    
    // Add filters
    if (filter.employeeId) {
      query = query.where("compliance.employeeId = :employeeId", { employeeId: filter.employeeId });
    }
    
    if (filter.licenseType) {
      query = query.andWhere("compliance.licenseType = :licenseType", { licenseType: filter.licenseType });
    }
    
    if (filter.expirationBefore) {
      query = query.andWhere("compliance.expirationDate <= :expirationDate", { expirationDate: filter.expirationBefore });
    }
    
    // Add relations
    query = query.leftJoinAndSelect("compliance.employee", "employee");
    
    return query.getMany();
  },

  async getComplianceById(id) {
    const dataSource = await ensureDbConnected();
    const complianceRepository = dataSource.getRepository(ComplianceEntity);
    return complianceRepository.findOne({
      where: { id },
      relations: ["employee"]
    });
  },

  async createCompliance(complianceData) {
    const dataSource = await ensureDbConnected();
    const complianceRepository = dataSource.getRepository(ComplianceEntity);
    const compliance = complianceRepository.create(complianceData);
    return complianceRepository.save(compliance);
  },

  async updateCompliance(id, complianceData) {
    const dataSource = await ensureDbConnected();
    const complianceRepository = dataSource.getRepository(ComplianceEntity);
    await complianceRepository.update(id, complianceData);
    return this.getComplianceById(id);
  },

  async deleteCompliance(id) {
    const dataSource = await ensureDbConnected();
    const complianceRepository = dataSource.getRepository(ComplianceEntity);
    await complianceRepository.delete(id);
    return { success: true };
  },

  // Document operations
  async getDocuments(filter = {}) {
    const dataSource = await ensureDbConnected();
    const documentRepository = dataSource.getRepository(DocumentEntity);
    
    let query = documentRepository.createQueryBuilder("document");
    
    // Add filters
    if (filter.ownerId) {
      query = query.where("document.ownerId = :ownerId", { ownerId: filter.ownerId });
    }
    
    if (filter.title) {
      query = query.andWhere("document.title LIKE :title", { title: `%${filter.title}%` });
    }
    
    // Add relations if needed
    if (filter.includeOwner) {
      query = query.leftJoinAndSelect("document.owner", "owner");
    }
    
    return query.getMany();
  },

  async getDocumentById(id) {
    const dataSource = await ensureDbConnected();
    const documentRepository = dataSource.getRepository(DocumentEntity);
    return documentRepository.findOne({
      where: { id },
      relations: ["owner"]
    });
  },

  async createDocument(documentData) {
    const dataSource = await ensureDbConnected();
    const documentRepository = dataSource.getRepository(DocumentEntity);
    const document = documentRepository.create(documentData);
    return documentRepository.save(document);
  },

  async updateDocument(id, documentData) {
    const dataSource = await ensureDbConnected();
    const documentRepository = dataSource.getRepository(DocumentEntity);
    await documentRepository.update(id, documentData);
    return this.getDocumentById(id);
  },

  async deleteDocument(id) {
    const dataSource = await ensureDbConnected();
    const documentRepository = dataSource.getRepository(DocumentEntity);
    await documentRepository.delete(id);
    return { success: true };
  },

  // Transaction support
  async transaction(callback) {
    const dataSource = await ensureDbConnected();
    const queryRunner = dataSource.createQueryRunner();
    
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      const result = await callback(queryRunner.manager);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  },

  // Custom queries for complex operations
  async executeRawQuery(query, parameters = []) {
    const dataSource = await ensureDbConnected();
    return dataSource.query(query, parameters);
  },

  // Query builders for more complex queries
  queryBuilder(entityName) {
    return async () => {
      const dataSource = await ensureDbConnected();
      return dataSource.getRepository(this.getEntityByName(entityName)).createQueryBuilder();
    };
  },
  
  // Helper to get entity by name
  getEntityByName(name) {
    const entityMap = {
      "user": UserEntity,
      "department": DepartmentEntity,
      "employee": EmployeeEntity,
      "attendance": AttendanceEntity,
      "leave": LeaveEntity,
      "compliance": ComplianceEntity,
      "document": DocumentEntity
    };
    
    const entity = entityMap[name.toLowerCase()];
    if (!entity) {
      throw new Error(`Entity ${name} not found`);
    }
    return entity;
  },
  
  // Utility functions
  async countRecords(entityName, filter = {}) {
    const dataSource = await ensureDbConnected();
    const repository = dataSource.getRepository(this.getEntityByName(entityName));
    return repository.count({ where: filter });
  },
  
  // HIPAA-compliant operations
  // For encrypted fields, we can use PostgreSQL's built-in encryption or handle at the application level
  async getEncryptedField(entityName, id, fieldName) {
    // Implementation would depend on the encryption method used
    // This is a placeholder for a function that would handle retrieving and decrypting sensitive fields
    const dataSource = await ensureDbConnected();
    const repository = dataSource.getRepository(this.getEntityByName(entityName));
    const entity = await repository.findOneBy({ id });
    
    if (!entity) {
      return null;
    }
    
    // In a real implementation, this would decrypt the field
    // For simplicity, we're just returning the field
    return entity[fieldName];
  },
  
  async setEncryptedField(entityName, id, fieldName, value) {
    // Implementation would depend on the encryption method used
    // This is a placeholder for a function that would handle encrypting and storing sensitive fields
    const dataSource = await ensureDbConnected();
    const repository = dataSource.getRepository(this.getEntityByName(entityName));
    const entity = await repository.findOneBy({ id });
    
    if (!entity) {
      return false;
    }
    
    // In a real implementation, this would encrypt the value before storing
    entity[fieldName] = value;
    await repository.save(entity);
    return true;
  },
  
  // Audit logging
  async logAuditEvent(userId, action, entityName, entityId, details = {}) {
    // Implementation would depend on audit logging requirements
    // This is a placeholder for a function that would log user actions for compliance
    const dataSource = await ensureDbConnected();
    
    // Assuming we have an AuditLog entity
    // If not, we could create one as needed or use a separate logging system
    // const auditLogRepository = dataSource.getRepository(AuditLogEntity);
    // const auditLog = auditLogRepository.create({
    //   userId,
    //   action,
    //   entityName,
    //   entityId,
    //   details: JSON.stringify(details),
    //   timestamp: new Date()
    // });
    // return auditLogRepository.save(auditLog);
    
    // For now, we'll just log to console
    console.log(`AUDIT: User ${userId} performed ${action} on ${entityName} ${entityId}`, details);
    return true;
  },
  
  // Department-based access control helper
  async userHasAccessToDepartment(userId, departmentId) {
    const dataSource = await ensureDbConnected();
    const userRepository = dataSource.getRepository(UserEntity);
    const user = await userRepository.findOneBy({ id: userId });
    
    if (!user) {
      return false;
    }
    
    // Admins have access to all departments
    if (user.role === 'admin' || user.role === 'hr_manager') {
      return true;
    }
    
    // Department heads can access their own department
    if (user.role === 'department_head' && user.departmentId === departmentId) {
      return true;
    }
    
    // Regular employees can only access their own information
    return false;
  },
  
  // Additional utilities for managing connections in serverless environments
  async closeConnection() {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log("Data Source has been closed");
    }
  }
};

export default db;