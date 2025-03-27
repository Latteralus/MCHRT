import { DataSource } from "typeorm";
// Corrected: Use default imports and standard naming convention
import User from "../entities/User";
import Department from "../entities/Department";
import Employee from "../entities/Employee";
import Attendance from "../entities/Attendance";
import Leave from "../entities/Leave";
import Compliance from "../entities/Compliance"; // Default import
import Document from "../entities/Document"; // Default import

// Create a TypeORM data source for PostgreSQL
export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  // Use the correct imported names
  entities: [
    User,
    Department,
    Employee,
    Attendance,
    Leave,
    Compliance, // Use default import name
    Document    // Use default import name
  ],
  synchronize: process.env.NODE_ENV !== "production", // Auto-sync schema in development
  logging: process.env.NODE_ENV !== "production",
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false, // CRITICAL: Fix rejectUnauthorized later
});

// Helper function to ensure DB connection
// NOTE: This function might become less necessary if dbService fully manages the connection lifecycle.
export const ensureDbConnected = async () => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("Data Source has been initialized!");
    }
    return AppDataSource;
  } catch (error) {
    console.error("Error during Data Source initialization:", error);
    // Consider re-throwing or handling more gracefully depending on application needs
    throw error;
  }
};

// Database operations object
// NOTE: This 'db' object is likely redundant if dbService is used everywhere.
// Consider removing this or ensuring dbService uses these functions correctly if not using mock.
const db = {
  // User operations
  async getUsers() {
    const dataSource = await ensureDbConnected();
    const userRepository = dataSource.getRepository(User); // Use correct name
    return userRepository.find();
  },

  async getUserById(id) {
    const dataSource = await ensureDbConnected();
    const userRepository = dataSource.getRepository(User); // Use correct name
    // Consider adding relations if needed by callers
    return userRepository.findOneBy({ id });
  },

  async getUserByEmail(email) {
    const dataSource = await ensureDbConnected();
    const userRepository = dataSource.getRepository(User); // Use correct name
    return userRepository.findOneBy({ email });
  },

  async getUserByUsername(username) {
    const dataSource = await ensureDbConnected();
    const userRepository = dataSource.getRepository(User); // Use correct name
    return userRepository.findOneBy({ username });
  },

  async createUser(userData) {
    const dataSource = await ensureDbConnected();
    const userRepository = dataSource.getRepository(User); // Use correct name
    const user = userRepository.create(userData);
    return userRepository.save(user);
  },

  async updateUser(id, userData) {
    const dataSource = await ensureDbConnected();
    const userRepository = dataSource.getRepository(User); // Use correct name
    // update() doesn't automatically handle relations or return the full updated entity easily.
    // Consider using save() or findOne + merge + save for better control and return value.
    const updateResult = await userRepository.update(id, userData);
    if (updateResult.affected === 0) {
        return null; // Or throw an error if user not found
    }
    return this.getUserById(id); // Fetch again to return updated data
  },

  async deleteUser(id) {
    const dataSource = await ensureDbConnected();
    const userRepository = dataSource.getRepository(User); // Use correct name
    const deleteResult = await userRepository.delete(id);
    return { success: deleteResult.affected > 0 };
  },

  // --- Department operations ---
   async getDepartments() {
    const dataSource = await ensureDbConnected();
    const departmentRepository = dataSource.getRepository(Department); // Correct name
    return departmentRepository.find();
  },

  async getDepartmentById(id) {
    const dataSource = await ensureDbConnected();
    const departmentRepository = dataSource.getRepository(Department); // Correct name
    // Add relations like manager if needed
    return departmentRepository.findOneBy({ id });
  },

   async createDepartment(departmentData) {
    const dataSource = await ensureDbConnected();
    const departmentRepository = dataSource.getRepository(Department); // Correct name
    const department = departmentRepository.create(departmentData);
    return departmentRepository.save(department);
  },

  async updateDepartment(id, departmentData) {
    const dataSource = await ensureDbConnected();
    const departmentRepository = dataSource.getRepository(Department); // Correct name
    const updateResult = await departmentRepository.update(id, departmentData);
     if (updateResult.affected === 0) return null;
    return this.getDepartmentById(id);
  },

  async deleteDepartment(id) {
    const dataSource = await ensureDbConnected();
    const departmentRepository = dataSource.getRepository(Department); // Correct name
    const deleteResult = await departmentRepository.delete(id);
    return { success: deleteResult.affected > 0 };
  },


  // --- Employee operations ---
  async getEmployees(filter = {}) {
    const dataSource = await ensureDbConnected();
    const employeeRepository = dataSource.getRepository(Employee); // Correct name

    let query = employeeRepository.createQueryBuilder("employee")
        .leftJoinAndSelect("employee.department", "department") // Always join department
        .leftJoinAndSelect("employee.user", "user"); // Optionally join user

    if (filter.status) {
        query = query.where("employee.status = :status", { status: filter.status });
    }
    if (filter.departmentId) {
      // If filtering by status already, use andWhere, otherwise use where
      const whereClause = filter.status ? "andWhere" : "where";
      query = query[whereClause]("employee.departmentId = :departmentId", { departmentId: filter.departmentId });
    }
     if (filter.userId) {
      const whereClause = filter.status || filter.departmentId ? "andWhere" : "where";
      query = query[whereClause]("employee.userId = :userId", { userId: filter.userId });
    }

    return query.getMany();
  },

  async getEmployeeById(id) {
    const dataSource = await ensureDbConnected();
    const employeeRepository = dataSource.getRepository(Employee); // Correct name
    return employeeRepository.findOne({
      where: { id },
      relations: ["department", "user"] // Include user relation
    });
  },

  async createEmployee(employeeData) {
    const dataSource = await ensureDbConnected();
    const employeeRepository = dataSource.getRepository(Employee); // Correct name
    // Handle potential relation IDs (e.g., departmentId, userId)
    const dataToCreate = { ...employeeData };
    if (employeeData.departmentId) {
        dataToCreate.department = { id: employeeData.departmentId };
        delete dataToCreate.departmentId; // Remove plain ID if relation object is used
    }
     if (employeeData.userId) {
        dataToCreate.user = { id: employeeData.userId };
        delete dataToCreate.userId;
    }
    const employee = employeeRepository.create(dataToCreate);
    return employeeRepository.save(employee);
  },

  async updateEmployee(id, employeeData) {
    const dataSource = await ensureDbConnected();
    const employeeRepository = dataSource.getRepository(Employee); // Correct name
    // Handle relation updates carefully with update() vs save()
     const dataToUpdate = { ...employeeData };
    if (employeeData.departmentId) {
        dataToUpdate.department = { id: employeeData.departmentId };
        delete dataToUpdate.departmentId;
    }
     if (employeeData.userId) {
        dataToUpdate.user = { id: employeeData.userId };
        delete dataToUpdate.userId;
    }
    const updateResult = await employeeRepository.update(id, dataToUpdate);
     if (updateResult.affected === 0) return null;
    return this.getEmployeeById(id);
  },

  async deleteEmployee(id) {
    const dataSource = await ensureDbConnected();
    const employeeRepository = dataSource.getRepository(Employee); // Correct name
    const deleteResult = await employeeRepository.delete(id);
    return { success: deleteResult.affected > 0 };
  },


  // --- Attendance operations ---
  async getAttendanceRecords(filter = {}) {
    const dataSource = await ensureDbConnected();
    const attendanceRepository = dataSource.getRepository(Attendance); // Correct name

    let query = attendanceRepository.createQueryBuilder("attendance")
        .leftJoinAndSelect("attendance.employee", "employee"); // Always join employee

    let hasWhere = false;
    if (filter.employeeId) {
      query = query.where("attendance.employeeId = :employeeId", { employeeId: filter.employeeId });
      hasWhere = true;
    }
    if (filter.date) {
        // Handle single date query
        const clause = hasWhere ? "andWhere" : "where";
        query = query[clause]("attendance.date = :date", { date: filter.date });
        hasWhere = true;
    } else if (filter.startDate && filter.endDate) {
        // Handle date range query
       const clause = hasWhere ? "andWhere" : "where";
       query = query[clause]("attendance.date BETWEEN :startDate AND :endDate", {
        startDate: filter.startDate,
        endDate: filter.endDate
      });
      hasWhere = true;
    }
     if (filter.status) {
       const clause = hasWhere ? "andWhere" : "where";
       query = query[clause]("attendance.status = :status", { status: filter.status });
       hasWhere = true;
    }

    // Add order by date, then employee if needed
    query = query.orderBy("attendance.date", "DESC");

    return query.getMany();
  },

  async getAttendanceById(id) {
    const dataSource = await ensureDbConnected();
    const attendanceRepository = dataSource.getRepository(Attendance); // Correct name
    return attendanceRepository.findOne({
      where: { id },
      relations: ["employee"]
    });
  },

   async createAttendance(attendanceData) {
    const dataSource = await ensureDbConnected();
    const attendanceRepository = dataSource.getRepository(Attendance); // Correct name
     // Handle relation ID
     const dataToCreate = { ...attendanceData };
    if (attendanceData.employeeId) {
        dataToCreate.employee = { id: attendanceData.employeeId };
        delete dataToCreate.employeeId;
    }
    const attendance = attendanceRepository.create(dataToCreate);
    return attendanceRepository.save(attendance);
  },

  async updateAttendance(id, attendanceData) {
    const dataSource = await ensureDbConnected();
    const attendanceRepository = dataSource.getRepository(Attendance); // Correct name
     const dataToUpdate = { ...attendanceData };
    if (attendanceData.employeeId) {
        dataToUpdate.employee = { id: attendanceData.employeeId };
        delete dataToUpdate.employeeId;
    }
    const updateResult = await attendanceRepository.update(id, dataToUpdate);
     if (updateResult.affected === 0) return null;
    return this.getAttendanceById(id);
  },

  async deleteAttendance(id) {
    const dataSource = await ensureDbConnected();
    const attendanceRepository = dataSource.getRepository(Attendance); // Correct name
    const deleteResult = await attendanceRepository.delete(id);
    return { success: deleteResult.affected > 0 };
  },


  // --- Leave operations ---
  // NOTE: dbService uses 'Leave' methods, ensure consistency if keeping this 'db' object
  async getLeaveRequests(filter = {}) {
    const dataSource = await ensureDbConnected();
    const leaveRepository = dataSource.getRepository(Leave); // Correct name

    let query = leaveRepository.createQueryBuilder("leave")
        .leftJoinAndSelect("leave.employee", "employee")
        .leftJoinAndSelect("leave.approver", "approver"); // Include approver relation

    let hasWhere = false;
    if (filter.employeeId) {
      query = query.where("leave.employeeId = :employeeId", { employeeId: filter.employeeId });
      hasWhere = true;
    }
    if (filter.status) {
      const clause = hasWhere ? "andWhere" : "where";
      query = query[clause]("leave.status = :status", { status: filter.status });
      hasWhere = true;
    }
    // Add date range filtering if needed by dbService caller
    if (filter.startDate && filter.endDate) {
       const clause = hasWhere ? "andWhere" : "where";
       // Check for overlaps
       query = query[clause]('(leave.startDate <= :endDate AND leave.endDate >= :startDate)',
          { startDate: filter.startDate, endDate: filter.endDate }
        );
        hasWhere = true;
    }

     // Specific date check (is date within leave range) - useful for conflict checks
     if (filter.dateWithinRange) {
         const clause = hasWhere ? "andWhere" : "where";
         query = query[clause]('leave.startDate <= :date AND leave.endDate >= :date', { date: filter.dateWithinRange });
         hasWhere = true;
     }


    query = query.orderBy("leave.requestDate", "DESC"); // Default order

    return query.getMany();
  },

  async getLeaveById(id) { // Renamed from getLeaveRequestById for consistency with dbService
    const dataSource = await ensureDbConnected();
    const leaveRepository = dataSource.getRepository(Leave); // Correct name
    return leaveRepository.findOne({
      where: { id },
      relations: ["employee", "approver"] // Include approver
    });
  },

  async createLeave(leaveData) { // Renamed for consistency
    const dataSource = await ensureDbConnected();
    const leaveRepository = dataSource.getRepository(Leave); // Correct name
    const dataToCreate = { ...leaveData };
    if (leaveData.employeeId) {
        dataToCreate.employee = { id: leaveData.employeeId };
        delete dataToCreate.employeeId;
    }
    if (leaveData.approverId) {
        dataToCreate.approver = { id: leaveData.approverId };
        delete dataToCreate.approverId;
    }
    const leave = leaveRepository.create(dataToCreate);
    return leaveRepository.save(leave);
  },

  async updateLeave(id, leaveData) { // Renamed for consistency
    const dataSource = await ensureDbConnected();
    const leaveRepository = dataSource.getRepository(Leave); // Correct name
    const dataToUpdate = { ...leaveData };
     if (leaveData.employeeId) {
        dataToUpdate.employee = { id: leaveData.employeeId };
        delete dataToUpdate.employeeId;
    }
    if (leaveData.approverId) {
        dataToUpdate.approver = { id: leaveData.approverId };
        delete dataToUpdate.approverId;
    }
    const updateResult = await leaveRepository.update(id, dataToUpdate);
    if (updateResult.affected === 0) return null;
    return this.getLeaveById(id); // Use renamed function
  },

  async deleteLeave(id) { // Renamed for consistency
    const dataSource = await ensureDbConnected();
    const leaveRepository = dataSource.getRepository(Leave); // Correct name
    const deleteResult = await leaveRepository.delete(id);
    return { success: deleteResult.affected > 0 };
  },


  // --- Compliance operations ---
  async getComplianceRecords(filter = {}) {
    const dataSource = await ensureDbConnected();
    const complianceRepository = dataSource.getRepository(Compliance); // Correct name

    let query = complianceRepository.createQueryBuilder("compliance")
        .leftJoinAndSelect("compliance.employee", "employee")
        .leftJoinAndSelect("compliance.verifier", "verifier"); // Join verifier (User)

    let hasWhere = false;
    if (filter.employeeId) {
      query = query.where("compliance.employeeId = :employeeId", { employeeId: filter.employeeId });
      hasWhere = true;
    }
     if (filter.status) {
      const clause = hasWhere ? "andWhere" : "where";
      query = query[clause]("compliance.status = :status", { status: filter.status });
      hasWhere = true;
    }
     if (filter.licenseType) {
       const clause = hasWhere ? "andWhere" : "where";
       query = query[clause]("compliance.licenseType = :licenseType", { licenseType: filter.licenseType });
       hasWhere = true;
    }
    // Expiration filtering (e.g., expiring within X days)
    if (filter.expiresBefore) {
         const clause = hasWhere ? "andWhere" : "where";
         query = query[clause]("compliance.expirationDate < :date", { date: filter.expiresBefore });
         hasWhere = true;
    }
     if (filter.expiresAfter) {
         const clause = hasWhere ? "andWhere" : "where";
         query = query[clause]("compliance.expirationDate >= :date", { date: filter.expiresAfter });
         hasWhere = true;
    }


    query = query.orderBy("compliance.expirationDate", "ASC"); // Default order

    return query.getMany();
  },

  async getComplianceById(id) {
    const dataSource = await ensureDbConnected();
    const complianceRepository = dataSource.getRepository(Compliance); // Correct name
    return complianceRepository.findOne({
      where: { id },
      relations: ["employee", "verifier"]
    });
  },

  async createCompliance(complianceData) {
    const dataSource = await ensureDbConnected();
    const complianceRepository = dataSource.getRepository(Compliance); // Correct name
    const dataToCreate = { ...complianceData };
    if (complianceData.employeeId) {
        dataToCreate.employee = { id: complianceData.employeeId };
        delete dataToCreate.employeeId;
    }
     if (complianceData.verifierId) { // Assuming verifierId is User ID
        dataToCreate.verifier = { id: complianceData.verifierId };
        delete dataToCreate.verifierId;
    }
     if (complianceData.departmentId) {
        dataToCreate.department = { id: complianceData.departmentId };
        delete dataToCreate.departmentId;
    }
    const compliance = complianceRepository.create(dataToCreate);
    return complianceRepository.save(compliance);
  },

  async updateCompliance(id, complianceData) {
    const dataSource = await ensureDbConnected();
    const complianceRepository = dataSource.getRepository(Compliance); // Correct name
     const dataToUpdate = { ...complianceData };
     if (complianceData.employeeId) {
        dataToUpdate.employee = { id: complianceData.employeeId };
        delete dataToUpdate.employeeId;
    }
     if (complianceData.verifierId) {
        dataToUpdate.verifier = { id: complianceData.verifierId };
        delete dataToUpdate.verifierId;
    }
    if (complianceData.departmentId) {
        dataToUpdate.department = { id: complianceData.departmentId };
        delete dataToUpdate.departmentId;
    }
    const updateResult = await complianceRepository.update(id, dataToUpdate);
    if (updateResult.affected === 0) return null;
    return this.getComplianceById(id);
  },

  async deleteCompliance(id) {
    const dataSource = await ensureDbConnected();
    const complianceRepository = dataSource.getRepository(Compliance); // Correct name
    const deleteResult = await complianceRepository.delete(id);
    return { success: deleteResult.affected > 0 };
  },

  // --- Document operations ---
   async getDocuments(filter = {}) {
    const dataSource = await ensureDbConnected();
    const documentRepository = dataSource.getRepository(Document); // Correct name

    let query = documentRepository.createQueryBuilder("document")
        .leftJoinAndSelect("document.uploadedBy", "uploadedBy") // Join uploader (User)
        .leftJoinAndSelect("document.employee", "employee")     // Join related employee (optional)
        .leftJoinAndSelect("document.department", "department"); // Join related department (optional)

    let hasWhere = false;
    if (filter.employeeId) {
      query = query.where("document.employeeId = :employeeId", { employeeId: filter.employeeId });
      hasWhere = true;
    }
    if (filter.departmentId) {
       // Fetch docs for specific dept OR public docs (deptId is null)
      const clause = hasWhere ? "andWhere" : "where";
      query = query[clause]("(document.departmentId = :departmentId OR document.departmentId IS NULL)", { departmentId: filter.departmentId });
      hasWhere = true;
    }
     if (filter.uploadedById) {
       const clause = hasWhere ? "andWhere" : "where";
       query = query[clause]("document.uploadedById = :uploadedById", { uploadedById: filter.uploadedById });
       hasWhere = true;
    }
      if (filter.documentType) {
       const clause = hasWhere ? "andWhere" : "where";
       query = query[clause]("document.documentType = :documentType", { documentType: filter.documentType });
       hasWhere = true;
    }
     if (filter.accessLevel) {
        // You might need more complex logic here depending on roles
       const clause = hasWhere ? "andWhere" : "where";
       query = query[clause]("document.accessLevel = :accessLevel", { accessLevel: filter.accessLevel });
       hasWhere = true;
    }

    query = query.orderBy("document.updatedAt", "DESC"); // Default order

    return query.getMany();
  },

  async getDocumentById(id) {
    const dataSource = await ensureDbConnected();
    const documentRepository = dataSource.getRepository(Document); // Correct name
    return documentRepository.findOne({
      where: { id },
      relations: ["uploadedBy", "employee", "department"] // Include relations
    });
  },

  async createDocument(documentData) {
    const dataSource = await ensureDbConnected();
    const documentRepository = dataSource.getRepository(Document); // Correct name
     const dataToCreate = { ...documentData };
    if (documentData.employeeId) {
        dataToCreate.employee = { id: documentData.employeeId };
        delete dataToCreate.employeeId;
    }
     if (documentData.departmentId) {
        dataToCreate.department = { id: documentData.departmentId };
        delete dataToCreate.departmentId;
    }
    if (documentData.uploadedById) {
        dataToCreate.uploadedBy = { id: documentData.uploadedById };
        delete dataToCreate.uploadedById;
    }
    const document = documentRepository.create(dataToCreate);
    return documentRepository.save(document);
  },

  async updateDocument(id, documentData) {
    const dataSource = await ensureDbConnected();
    const documentRepository = dataSource.getRepository(Document); // Correct name
    const dataToUpdate = { ...documentData };
     if (documentData.employeeId) {
        dataToUpdate.employee = { id: documentData.employeeId };
        delete dataToUpdate.employeeId;
    }
     if (documentData.departmentId) {
        dataToUpdate.department = { id: documentData.departmentId };
        delete dataToUpdate.departmentId;
    }
    if (documentData.uploadedById) {
        dataToUpdate.uploadedBy = { id: documentData.uploadedById };
        delete dataToUpdate.uploadedById;
    }
    const updateResult = await documentRepository.update(id, dataToUpdate);
    if (updateResult.affected === 0) return null;
    return this.getDocumentById(id);
  },

   async deleteDocument(id) {
    const dataSource = await ensureDbConnected();
    const documentRepository = dataSource.getRepository(Document); // Correct name
    const deleteResult = await documentRepository.delete(id);
    return { success: deleteResult.affected > 0 };
  },

   // --- Dashboard Method --- (Example, depends on exact stats needed)
   async getDashboardStats() {
       const dataSource = await ensureDbConnected();
       // Use Promise.all for parallel counts
       const [totalEmployees, totalDepartments, pendingLeaveRequests] = await Promise.all([
           dataSource.getRepository(Employee).count({ where: { status: 'active' } }),
           dataSource.getRepository(Department).count(),
           dataSource.getRepository(Leave).count({ where: { status: 'pending' } })
       ]);

        // Expiring compliance (e.g., next 30 days)
        const thirtyDaysLater = new Date();
        thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
        const expiringCompliance = await dataSource.getRepository(Compliance).count({
            where: {
                status: 'active',
                expirationDate: Between(new Date(), thirtyDaysLater) // Requires importing Between from TypeORM
            }
        });

        // Today's attendance (this might be complex depending on definition)
        // Placeholder - requires more specific logic for attendance rate/count
        const todayAttendance = 0; // Replace with actual query later
        const attendanceRate = totalEmployees > 0 ? Math.round((todayAttendance / totalEmployees) * 100) : 0;


       return {
           totalEmployees,
           totalDepartments,
           pendingLeaveRequests,
           expiringCompliance, // Need to query this
           todayAttendance,    // Need to query this
           attendanceRate      // Need to calculate this
       };
   },


  // --- Other methods from original db object ---
  // Transaction support (Keep as is, uses queryRunner which is fine)
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
      throw error; // Re-throw error after rollback
    } finally {
      await queryRunner.release();
    }
  },

  // executeRawQuery (Keep as is)
   async executeRawQuery(query, parameters = []) {
    const dataSource = await ensureDbConnected();
    return dataSource.query(query, parameters);
  },

  // getEntityByName needs updating to use correct default import names
  getEntityByName(name) {
    const entityMap = {
      "user": User,
      "department": Department,
      "employee": Employee,
      "attendance": Attendance,
      "leave": Leave,
      "compliance": Compliance, // Correct name
      "document": Document    // Correct name
    };

    const entity = entityMap[name?.toLowerCase()]; // Add safety check for name
    if (!entity) {
      throw new Error(`Entity ${name} not found`);
    }
    return entity;
  },

  // countRecords (Keep as is, relies on getEntityByName)
  async countRecords(entityName, filter = {}) {
    const dataSource = await ensureDbConnected();
    const repository = dataSource.getRepository(this.getEntityByName(entityName));
    return repository.count({ where: filter });
  },

   // closeConnection (Keep as is)
  async closeConnection() {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log("Data Source has been closed");
    }
  }

  // NOTE: Methods like getEncryptedField, setEncryptedField, logAuditEvent, userHasAccessToDepartment
  // were placeholders and highly dependent on specific implementations (encryption, audit logging).
  // They are omitted here but would need proper implementation if required by dbService.

};

export default db; // Exporting the db object - consider if this is needed alongside dbService