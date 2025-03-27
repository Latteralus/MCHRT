import { mockDb } from './mockDb';
import { AppDataSource, initializeDataSource } from './db'; // Import DataSource and initializer

// Import Entities (needed for getRepository)
import User from "../entities/User";
import Department from "../entities/Department";
import Employee from "../entities/Employee";
import Attendance from "../entities/Attendance";
import Leave from "../entities/Leave";
import Compliance from "../entities/Compliance";
import Document from "../entities/Document";
import { Between } from "typeorm"; // Import 'Between' for date range queries

const USE_MOCK_DB = process.env.USE_MOCK_DB === 'true';

if (USE_MOCK_DB) {
  console.log("Using Mock Database (USE_MOCK_DB is set to true).");
}

// Helper to get repository after ensuring connection
async function getRepo(entity) {
  if (USE_MOCK_DB) return null; // Mock DB doesn't use TypeORM repos
  await initializeDataSource(); // Ensure DB is connected
  return AppDataSource.getRepository(entity);
}


export const dbService = {
  isMockDb: () => USE_MOCK_DB,

  resetMockDb: () => {
    if (USE_MOCK_DB) {
      return mockDb.reset();
    }
    return Promise.reject(new Error('Reset not available for non-mock database'));
  },

  // ==================== User Methods ====================
  getUserByEmail: async (email) => {
    if (USE_MOCK_DB) { /* ... mock logic ... */ }
    const repo = await getRepo(User);
    return repo.findOneBy({ email });
  },

  getUserByUsername: async (username) => {
    if (USE_MOCK_DB) { /* ... mock logic ... */ }
    const repo = await getRepo(User);
    return repo.findOneBy({ username });
  },

  getUserById: async (id) => {
    if (USE_MOCK_DB) { return mockDb.findById('users', id); }
    const repo = await getRepo(User);
    return repo.findOneBy({ id }); // Add relations if needed: { where: { id }, relations: [...] }
  },

  getUsers: async (options = {}) => {
    if (USE_MOCK_DB) { return mockDb.findAll('users', options); }
    const repo = await getRepo(User);
    // Add filtering/pagination based on options if needed
    return repo.find();
  },

  createUser: async (userData) => {
    if (USE_MOCK_DB) { return mockDb.create('users', userData); }
    const repo = await getRepo(User);
    const user = repo.create(userData);
    return repo.save(user);
  },

  updateUser: async (id, userData) => {
    if (USE_MOCK_DB) { return mockDb.update('users', id, userData); }
    const repo = await getRepo(User);
    const updateResult = await repo.update(id, userData);
    if (updateResult.affected === 0) return null;
    return repo.findOneBy({ id }); // Fetch updated
  },

  deleteUser: async (id) => {
    if (USE_MOCK_DB) { return mockDb.remove('users', id); }
    const repo = await getRepo(User);
    const deleteResult = await repo.delete(id);
    return { success: deleteResult.affected > 0 };
  },

  // ==================== Employee Methods ====================
  getEmployeeById: async (id) => {
    if (USE_MOCK_DB) { return mockDb.findById('employees', id); }
    const repo = await getRepo(Employee);
    return repo.findOne({ where: { id }, relations: ["department", "user", "manager"] }); // Include common relations
  },

  getEmployees: async (options = {}) => {
    if (USE_MOCK_DB) { return mockDb.findAll('employees', options); }
    const repo = await getRepo(Employee);
    // Basic filtering example (extend based on options needed)
    const findOptions = { relations: ["department", "user"] };
    if (options.status) findOptions.where = { ...findOptions.where, status: options.status };
    if (options.departmentId) findOptions.where = { ...findOptions.where, department: { id: options.departmentId } };
    // Add pagination options.limit, options.offset -> take, skip
    if (options.limit) findOptions.take = parseInt(options.limit, 10);
    if (options.offset) findOptions.skip = parseInt(options.offset, 10);

    return repo.find(findOptions);
    // For more complex filters, use createQueryBuilder as in the original db.js
  },

  createEmployee: async (employeeData) => {
    if (USE_MOCK_DB) { return mockDb.create('employees', employeeData); }
    const repo = await getRepo(Employee);
    // Handle relation IDs correctly for create/save
    const dataToCreate = { ...employeeData };
    if (employeeData.departmentId) dataToCreate.department = { id: employeeData.departmentId };
    if (employeeData.userId) dataToCreate.user = { id: employeeData.userId };
    if (employeeData.managerId) dataToCreate.manager = { id: employeeData.managerId };
    // Remove plain IDs if relation objects are used
    delete dataToCreate.departmentId;
    delete dataToCreate.userId;
    delete dataToCreate.managerId;

    const employee = repo.create(dataToCreate);
    return repo.save(employee);
  },

  updateEmployee: async (id, employeeData) => {
     if (USE_MOCK_DB) { return mockDb.update('employees', id, employeeData); }
     const repo = await getRepo(Employee);
     // Handle relations carefully with update vs save
     const dataToUpdate = { ...employeeData };
     if (employeeData.departmentId) dataToUpdate.department = { id: employeeData.departmentId };
     if (employeeData.userId) dataToUpdate.user = { id: employeeData.userId };
     if (employeeData.managerId) dataToUpdate.manager = { id: employeeData.managerId };
     delete dataToUpdate.departmentId;
     delete dataToUpdate.userId;
     delete dataToUpdate.managerId;

     const updateResult = await repo.update(id, dataToUpdate); // Update doesn't handle relations well
     if (updateResult.affected === 0) return null;
     // Consider using save for easier relation updates:
     // const existing = await repo.findOneBy({ id });
     // if (!existing) return null;
     // repo.merge(existing, dataToUpdate);
     // return repo.save(existing);
     return repo.findOne({ where: { id }, relations: ["department", "user", "manager"] }); // Fetch updated
  },

   deleteEmployee: async (id) => {
     if (USE_MOCK_DB) { return mockDb.remove('employees', id); }
     const repo = await getRepo(Employee);
     const deleteResult = await repo.delete(id);
     return { success: deleteResult.affected > 0 };
   },


  // ==================== Department Methods ====================
  // (Similar refactoring: use getRepo(Department) and repo methods)
   getDepartmentById: async (id) => {
     if (USE_MOCK_DB) { return mockDb.findById('departments', id); }
     const repo = await getRepo(Department);
     return repo.findOneBy({ id }); // Add relations if needed
   },

   getDepartments: async (options = {}) => {
      if (USE_MOCK_DB) { return mockDb.findAll('departments', options); }
      const repo = await getRepo(Department);
      return repo.find(); // Add options if needed
   },

   createDepartment: async (departmentData) => {
       if (USE_MOCK_DB) { return mockDb.create('departments', departmentData); }
       const repo = await getRepo(Department);
       const dept = repo.create(departmentData);
       return repo.save(dept);
   },

   updateDepartment: async (id, departmentData) => {
       if (USE_MOCK_DB) { return mockDb.update('departments', id, departmentData); }
       const repo = await getRepo(Department);
       const updateResult = await repo.update(id, departmentData);
       if (updateResult.affected === 0) return null;
       return repo.findOneBy({ id });
   },

   deleteDepartment: async (id) => {
       if (USE_MOCK_DB) { return mockDb.remove('departments', id); }
       const repo = await getRepo(Department);
       const deleteResult = await repo.delete(id);
       return { success: deleteResult.affected > 0 };
   },


  // ==================== Attendance Methods ====================
  // (Refactor using getRepo(Attendance) and repo methods / createQueryBuilder)
  getAttendanceById: async (id) => {
    if (USE_MOCK_DB) { return mockDb.findById('attendance', id); }
    const repo = await getRepo(Attendance);
    return repo.findOne({ where: { id }, relations: ['employee'] });
  },

  getAttendanceRecords: async (options = {}) => {
    if (USE_MOCK_DB) { /* ... mock logic ... */ }
    const repo = await getRepo(Attendance);
    // Use createQueryBuilder for complex filtering as in original db.js
    let query = repo.createQueryBuilder("attendance")
      .leftJoinAndSelect("attendance.employee", "employee");

    let hasWhere = false;
    const addFilter = (condition, params) => {
      const clause = hasWhere ? "andWhere" : "where";
      query = query[clause](condition, params);
      hasWhere = true;
    };

    if (options.employeeId) addFilter("attendance.employeeId = :employeeId", { employeeId: options.employeeId });
    if (options.date) addFilter("attendance.date = :date", { date: options.date });
    else if (options.startDate && options.endDate) addFilter("attendance.date BETWEEN :startDate AND :endDate", { startDate: options.startDate, endDate: options.endDate });
    if (options.status) addFilter("attendance.status = :status", { status: options.status });

    if (options.limit) query = query.take(parseInt(options.limit, 10));
    if (options.offset) query = query.skip(parseInt(options.offset, 10));

    query = query.orderBy("attendance.date", "DESC");

    return query.getMany(); // Or getManyAndCount if pagination needed
  },

  // getAttendanceByEmployeeId, getAttendanceByDate might be redundant if getAttendanceRecords handles filters well

  createAttendance: async (attendanceData) => {
     if (USE_MOCK_DB) { return mockDb.create('attendance', attendanceData); }
     const repo = await getRepo(Attendance);
     const dataToCreate = { ...attendanceData };
     if (attendanceData.employeeId) dataToCreate.employee = { id: attendanceData.employeeId };
     delete dataToCreate.employeeId;
     const record = repo.create(dataToCreate);
     return repo.save(record);
  },

  updateAttendance: async (id, attendanceData) => {
      if (USE_MOCK_DB) { return mockDb.update('attendance', id, attendanceData); }
      const repo = await getRepo(Attendance);
      // Use save for partial updates + relations
      const existing = await repo.findOneBy({ id });
      if (!existing) return null;
      repo.merge(existing, attendanceData); // Only merges provided fields
      return repo.save(existing);
      // OR use update, but handle relations manually if needed
      // const updateResult = await repo.update(id, attendanceData);
      // if (updateResult.affected === 0) return null;
      // return repo.findOne({ where: { id }, relations: ['employee'] });
  },

   deleteAttendance: async (id) => {
     if (USE_MOCK_DB) { return mockDb.remove('attendance', id); }
     const repo = await getRepo(Attendance);
     const deleteResult = await repo.delete(id);
     return { success: deleteResult.affected > 0 };
   },

  // ==================== Leave Methods ====================
  // (Refactor using getRepo(Leave) and repo methods / createQueryBuilder)
  getLeaveById: async (id) => {
    if (USE_MOCK_DB) { return mockDb.findById('leave', id); }
    const repo = await getRepo(Leave);
    return repo.findOne({ where: { id }, relations: ["employee", "approver"] });
  },

  getLeaveRequests: async (options = {}) => {
     if (USE_MOCK_DB) { return mockDb.findAll('leave', options); }
     const repo = await getRepo(Leave);
     // Use createQueryBuilder for complex filters as in original db.js/API route
     let query = repo.createQueryBuilder("leave")
         .leftJoinAndSelect("leave.employee", "employee")
         .leftJoinAndSelect("employee.department", "department") // Needed for dept filtering
         .leftJoinAndSelect("leave.approver", "approver");

     let hasWhere = false;
     const addFilter = (condition, params) => { /* ... same helper ... */ };

     // Apply filters from options (status, date range, employeeId, etc.)
     // ... example ...
     if (options.status) addFilter("leave.status = :status", { status: options.status });
     if (options.employeeId) addFilter("leave.employeeId = :employeeId", { employeeId: options.employeeId });
     // ... add other filters ...

     if (options.limit) query = query.take(parseInt(options.limit, 10));
     if (options.offset) query = query.skip(parseInt(options.offset, 10));

     query = query.orderBy("leave.requestDate", "DESC");

     // Return array or object with pagination info
     const [requests, total] = await query.getManyAndCount();
     return {
         leaveRequests: requests,
         pagination: { total, limit: options.limit || 20, offset: options.offset || 0 }
     };
  },

  // getLeaveByEmployeeId might be redundant

  createLeave: async (leaveData) => {
      if (USE_MOCK_DB) { return mockDb.create('leave', leaveData); }
      const repo = await getRepo(Leave);
      const dataToCreate = { ...leaveData };
      if (leaveData.employeeId) dataToCreate.employee = { id: leaveData.employeeId };
      if (leaveData.approverId) dataToCreate.approver = { id: leaveData.approverId };
      delete dataToCreate.employeeId;
      delete dataToCreate.approverId;
      dataToCreate.requestDate = dataToCreate.requestDate || new Date(); // Ensure request date
      dataToCreate.status = dataToCreate.status || 'pending'; // Default status

      const leave = repo.create(dataToCreate);
      return repo.save(leave);
  },

  updateLeave: async (id, leaveData) => {
      if (USE_MOCK_DB) { return mockDb.update('leave', id, leaveData); }
      const repo = await getRepo(Leave);
      // Use save for easier partial updates + relations
      const existing = await repo.findOneBy({ id });
      if (!existing) return null;

      const dataToUpdate = { ...leaveData };
       if (leaveData.approverId !== undefined) { // Handle null or actual ID
           dataToUpdate.approver = leaveData.approverId ? { id: leaveData.approverId } : null;
       }
      delete dataToUpdate.approverId;
      // Don't allow changing employeeId on update
      delete dataToUpdate.employeeId;

      repo.merge(existing, dataToUpdate);
      return repo.save(existing);
  },

  deleteLeave: async (id) => {
      if (USE_MOCK_DB) { return mockDb.remove('leave', id); }
      const repo = await getRepo(Leave);
      const deleteResult = await repo.delete(id);
      return { success: deleteResult.affected > 0 };
  },

  // ==================== Compliance Methods ====================
  // (Refactor using getRepo(Compliance))
  getComplianceById: async (id) => {
      if (USE_MOCK_DB) { return mockDb.findById('compliance', id); }
      const repo = await getRepo(Compliance);
      return repo.findOne({ where: { id }, relations: ["employee", "verifier"] });
  },

  getComplianceRecords: async (options = {}) => {
      if (USE_MOCK_DB) { return mockDb.findAll('compliance', options); }
      const repo = await getRepo(Compliance);
      // Build query based on options
      const findOptions = { relations: ["employee", "verifier"] };
       // Add where clauses, take, skip based on options
      return repo.find(findOptions); // Or use QueryBuilder
  },

  createCompliance: async (complianceData) => {
      if (USE_MOCK_DB) { return mockDb.create('compliance', complianceData); }
      const repo = await getRepo(Compliance);
      const dataToCreate = { ...complianceData };
      if (complianceData.employeeId) dataToCreate.employee = { id: complianceData.employeeId };
      if (complianceData.verifierId) dataToCreate.verifier = { id: complianceData.verifierId };
       // Assuming department relationship might exist based on original db.js
      if (complianceData.departmentId) dataToCreate.department = { id: complianceData.departmentId };
      delete dataToCreate.employeeId;
      delete dataToCreate.verifierId;
      delete dataToCreate.departmentId;
      const record = repo.create(dataToCreate);
      return repo.save(record);
  },

  updateCompliance: async (id, complianceData) => {
      if (USE_MOCK_DB) { return mockDb.update('compliance', id, complianceData); }
      const repo = await getRepo(Compliance);
      // Use save for partial update
      const existing = await repo.findOneBy({ id });
      if (!existing) return null;
       const dataToUpdate = { ...complianceData };
      if (complianceData.verifierId !== undefined) dataToUpdate.verifier = complianceData.verifierId ? { id: complianceData.verifierId } : null;
       if (complianceData.departmentId !== undefined) dataToUpdate.department = complianceData.departmentId ? { id: complianceData.departmentId } : null;
      delete dataToUpdate.verifierId;
      delete dataToUpdate.departmentId;
      delete dataToUpdate.employeeId; // Don't change employee

      repo.merge(existing, dataToUpdate);
      return repo.save(existing);
  },

  deleteCompliance: async (id) => {
      if (USE_MOCK_DB) { return mockDb.remove('compliance', id); }
      const repo = await getRepo(Compliance);
      const deleteResult = await repo.delete(id);
      return { success: deleteResult.affected > 0 };
  },

  // ==================== Document Methods ====================
  // (Refactor using getRepo(Document))
   getDocumentById: async (id) => {
       if (USE_MOCK_DB) { return mockDb.findById('documents', id); }
       const repo = await getRepo(Document);
       return repo.findOne({ where: { id }, relations: ["uploadedBy", "employee", "department"] });
   },

   getDocuments: async (options = {}) => {
       if (USE_MOCK_DB) { return mockDb.findAll('documents', options); }
       const repo = await getRepo(Document);
       // Build query based on options
        const findOptions = { relations: ["uploadedBy", "employee", "department"] };
       // Add where clauses, take, skip based on options
       return repo.find(findOptions); // Or use QueryBuilder
   },

   createDocument: async (documentData) => {
       if (USE_MOCK_DB) { return mockDb.create('documents', documentData); }
       const repo = await getRepo(Document);
       const dataToCreate = { ...documentData };
       if (documentData.employeeId) dataToCreate.employee = { id: documentData.employeeId };
       if (documentData.departmentId) dataToCreate.department = { id: documentData.departmentId };
       if (documentData.uploadedById) dataToCreate.uploadedBy = { id: documentData.uploadedById };
       delete dataToCreate.employeeId;
       delete dataToCreate.departmentId;
       delete dataToCreate.uploadedById;
       const doc = repo.create(dataToCreate);
       return repo.save(doc);
   },

   updateDocument: async (id, documentData) => {
        if (USE_MOCK_DB) { return mockDb.update('documents', id, documentData); }
        const repo = await getRepo(Document);
        // Use save
        const existing = await repo.findOneBy({ id });
        if (!existing) return null;
        // Handle relations if needed
        repo.merge(existing, documentData);
        return repo.save(existing);
   },

    deleteDocument: async (id) => {
        if (USE_MOCK_DB) { return mockDb.remove('documents', id); }
        const repo = await getRepo(Document);
        const deleteResult = await repo.delete(id);
        return { success: deleteResult.affected > 0 };
    },


  // ==================== Dashboard Methods ====================
  getDashboardStats: async () => {
    if (USE_MOCK_DB) { /* ... mock logic ... */ }

    // Ensure connected before running multiple queries
    await initializeDataSource();

    // Use Promise.all for parallel counts
    const [totalEmployees, totalDepartments, pendingLeaveRequests] = await Promise.all([
      AppDataSource.getRepository(Employee).count({ where: { status: 'Active' } }), // Count only active
      AppDataSource.getRepository(Department).count(),
      AppDataSource.getRepository(Leave).count({ where: { status: 'pending' } })
    ]);

    // Expiring compliance (e.g., next 30 days)
    const today = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);
    const expiringCompliance = await AppDataSource.getRepository(Compliance).count({
      where: {
        status: 'Active', // Assuming 'Active' means valid/current
        expirationDate: Between(today, thirtyDaysLater)
      }
    });

    // Today's attendance (count records for today with present status)
     const todayStr = today.toISOString().split('T')[0];
     const todayAttendance = await AppDataSource.getRepository(Attendance).count({
         where: {
             date: todayStr,
             status: 'Present' // Assuming 'Present' status exists
         }
     });
     const attendanceRate = totalEmployees > 0 ? Math.round((todayAttendance / totalEmployees) * 100) : 0;


    return {
      totalEmployees,
      totalDepartments,
      pendingLeaveRequests,
      expiringCompliance,
      todayAttendance,
      attendanceRate
    };
  }
};