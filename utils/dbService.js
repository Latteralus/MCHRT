import { mockDb } from './mockDb';
// **MODIFIED: Import DataSource and the exported initializer**
import { AppDataSource, initializeDataSource } from './db';

// Import Entities (needed for getRepository)
import User from "../entities/User";
import Department from "../entities/Department";
import Employee from "../entities/Employee";
import Attendance from "../entities/Attendance";
import Leave from "../entities/Leave";
import Compliance from "../entities/Compliance";
import Document from "../entities/Document";
// **REMOVED: Explicit import of TypeORM operators like Between to avoid potential browser bundle issues**
// import { Between, MoreThanOrEqual, LessThanOrEqual } from "typeorm";

const USE_MOCK_DB = process.env.USE_MOCK_DB === 'true';

if (USE_MOCK_DB) {
  console.log("Using Mock Database (USE_MOCK_DB is set to true).");
} else {
  console.log("Attempting to use Real Database (USE_MOCK_DB is false or unset).");
}

// Helper to get repository after ensuring connection
async function getRepo(entity) {
  if (USE_MOCK_DB) return null;
  // **MODIFIED: Await the exported initializer**
  await initializeDataSource();
  return AppDataSource.getRepository(entity);
}

export const dbService = {
  isMockDb: () => USE_MOCK_DB,

  resetMockDb: () => {
    if (USE_MOCK_DB) { return mockDb.reset(); }
    return Promise.reject(new Error('Reset not available for non-mock database'));
  },

  // ==================== User Methods ====================
  getUserByEmail: async (email) => {
    if (USE_MOCK_DB) { /* ... mock logic ... */ }
    const repo = await getRepo(User);
    return repo.findOneBy({ email });
  },
  // ... (Keep other User methods refactored as before) ...
  getUserById: async (id) => {
      if (USE_MOCK_DB) { return mockDb.findById('users', id); }
      const repo = await getRepo(User);
      return repo.findOneBy({ id });
  },
  getUsers: async (options = {}) => {
      if (USE_MOCK_DB) { return mockDb.findAll('users', options); }
      const repo = await getRepo(User);
      return repo.find(); // Add options handling if needed
  },
   createUser: async (userData) => {
    if (USE_MOCK_DB) { return mockDb.create('users', userData); }
    const repo = await getRepo(User);
    const user = repo.create(userData);
    await repo.save(user); // Ensure save is awaited
    return user; // Return the saved user
  },
   updateUser: async (id, userData) => {
    if (USE_MOCK_DB) { return mockDb.update('users', id, userData); }
    const repo = await getRepo(User);
    await repo.update(id, userData);
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
    return repo.findOne({ where: { id }, relations: ["department", "user", "manager"] });
  },
   getEmployees: async (options = {}) => {
    if (USE_MOCK_DB) { return mockDb.findAll('employees', options); }
    const repo = await getRepo(Employee);
    const findOptions = { relations: ["department", "user"] };
    // Add where, take, skip based on options
    return repo.find(findOptions);
  },
   createEmployee: async (employeeData) => {
    if (USE_MOCK_DB) { return mockDb.create('employees', employeeData); }
    const repo = await getRepo(Employee);
    const dataToCreate = { ...employeeData };
    // Handle relations
    if (employeeData.departmentId) dataToCreate.department = { id: employeeData.departmentId };
    if (employeeData.userId) dataToCreate.user = { id: employeeData.userId };
    if (employeeData.managerId) dataToCreate.manager = { id: employeeData.managerId };
    delete dataToCreate.departmentId; delete dataToCreate.userId; delete dataToCreate.managerId;
    const employee = repo.create(dataToCreate);
    await repo.save(employee);
    return employee;
  },
  updateEmployee: async (id, employeeData) => {
    if (USE_MOCK_DB) { return mockDb.update('employees', id, employeeData); }
    const repo = await getRepo(Employee);
    // Use save for easier relation updates
    const existing = await repo.findOneBy({ id });
    if (!existing) return null;
    const dataToUpdate = { ...employeeData };
     if (employeeData.departmentId !== undefined) dataToUpdate.department = employeeData.departmentId ? { id: employeeData.departmentId } : null;
     if (employeeData.userId !== undefined) dataToUpdate.user = employeeData.userId ? { id: employeeData.userId } : null;
     if (employeeData.managerId !== undefined) dataToUpdate.manager = employeeData.managerId ? { id: employeeData.managerId } : null;
    delete dataToUpdate.departmentId; delete dataToUpdate.userId; delete dataToUpdate.managerId;
    repo.merge(existing, dataToUpdate);
    await repo.save(existing);
    return repo.findOne({ where: { id }, relations: ["department", "user", "manager"] }); // Re-fetch with relations
  },
   deleteEmployee: async (id) => {
     if (USE_MOCK_DB) { return mockDb.remove('employees', id); }
     const repo = await getRepo(Employee);
     const deleteResult = await repo.delete(id);
     return { success: deleteResult.affected > 0 };
   },
  // ... (Keep other Employee, Department, Attendance, Leave, Compliance, Document methods refactored as before) ...
   // Example: Attendance
   getAttendanceById: async (id) => {
    if (USE_MOCK_DB) { return mockDb.findById('attendance', id); }
    const repo = await getRepo(Attendance);
    // Ensure necessary relations are loaded for API routes
    return repo.findOne({ where: { id }, relations: ['employee', 'employee.department'] });
   },
    getAttendanceRecords: async (options = {}) => {
        if (USE_MOCK_DB) { /* ... mock logic ... */ }
        const repo = await getRepo(Attendance);
        let query = repo.createQueryBuilder("attendance")
          .leftJoinAndSelect("attendance.employee", "employee");
        // Apply filters from options using query.where or query.andWhere
        // Apply take/skip for pagination
        query = query.orderBy("attendance.date", "DESC");
        return query.getMany();
    },
    createAttendance: async (attendanceData) => {
       if (USE_MOCK_DB) { return mockDb.create('attendance', attendanceData); }
       const repo = await getRepo(Attendance);
       const dataToCreate = { ...attendanceData };
       if (attendanceData.employeeId) dataToCreate.employee = { id: attendanceData.employeeId };
       delete dataToCreate.employeeId;
       const record = repo.create(dataToCreate);
       await repo.save(record);
       return record;
    },
    updateAttendance: async (id, attendanceData) => {
      if (USE_MOCK_DB) { return mockDb.update('attendance', id, attendanceData); }
      const repo = await getRepo(Attendance);
      const existing = await repo.findOneBy({ id });
      if (!existing) return null;
      repo.merge(existing, attendanceData); // Only updates provided fields
      await repo.save(existing);
      // Re-fetch to ensure relations are included if needed by caller
      return repo.findOne({ where: { id }, relations: ['employee', 'employee.department'] });
    },
     deleteAttendance: async (id) => {
       if (USE_MOCK_DB) { return mockDb.remove('attendance', id); }
       const repo = await getRepo(Attendance);
       const deleteResult = await repo.delete(id);
       return { success: deleteResult.affected > 0 };
     },
    // Example: Leave
    getLeaveById: async (id) => {
        if (USE_MOCK_DB) { return mockDb.findById('leave', id); }
        const repo = await getRepo(Leave);
        return repo.findOne({ where: { id }, relations: ["employee", "approver", "employee.department"] }); // Add relations needed by API
    },
     getLeaveRequests: async (options = {}) => {
         if (USE_MOCK_DB) { return mockDb.findAll('leave', options); }
         const repo = await getRepo(Leave);
         let query = repo.createQueryBuilder("leave")
             .leftJoinAndSelect("leave.employee", "employee")
             .leftJoinAndSelect("employee.department", "department")
             .leftJoinAndSelect("leave.approver", "approver");
        // Apply filters, take/skip from options
         if (options.status) query.andWhere("leave.status IN (:...status)", { status: Array.isArray(options.status) ? options.status : [options.status] });
         if (options.employeeId) query.andWhere("leave.employeeId = :employeeId", { employeeId: options.employeeId });
         // Date overlap check needs careful implementation here if added
         if (options.dateOverlaps) {
              query.andWhere('(leave.startDate <= :endDate AND leave.endDate >= :startDate)',
                 { startDate: options.dateOverlaps.start, endDate: options.dateOverlaps.end });
         }

         const [requests, total] = await query
            .skip(options.offset || 0)
            .take(options.limit || 20)
            .orderBy("leave.requestDate", "DESC")
            .getManyAndCount();

         return {
             leaveRequests: requests,
             pagination: { total, limit: options.limit || 20, offset: options.offset || 0 }
         };
     },
     createLeave: async (leaveData) => {
       if (USE_MOCK_DB) { return mockDb.create('leave', leaveData); }
       const repo = await getRepo(Leave);
       const dataToCreate = { ...leaveData };
       if (leaveData.employeeId) dataToCreate.employee = { id: leaveData.employeeId };
       if (leaveData.approverId) dataToCreate.approver = { id: leaveData.approverId };
       delete dataToCreate.employeeId; delete dataToCreate.approverId;
       dataToCreate.requestDate = dataToCreate.requestDate || new Date();
       dataToCreate.status = dataToCreate.status || 'pending';
       const leave = repo.create(dataToCreate);
       await repo.save(leave);
       return leave;
     },
     updateLeave: async (id, leaveData) => {
       if (USE_MOCK_DB) { return mockDb.update('leave', id, leaveData); }
       const repo = await getRepo(Leave);
       const existing = await repo.findOneBy({ id });
       if (!existing) return null;
       const dataToUpdate = { ...leaveData };
        if (leaveData.approverId !== undefined) dataToUpdate.approver = leaveData.approverId ? { id: leaveData.approverId } : null;
       delete dataToUpdate.approverId; delete dataToUpdate.employeeId;
       repo.merge(existing, dataToUpdate);
       await repo.save(existing);
       return repo.findOne({ where: { id }, relations: ["employee", "approver", "employee.department"] }); // Re-fetch with relations
     },
     deleteLeave: async (id) => {
        if (USE_MOCK_DB) { return mockDb.remove('leave', id); }
        const repo = await getRepo(Leave);
        const deleteResult = await repo.delete(id);
        return { success: deleteResult.affected > 0 };
     },


  // ==================== Dashboard Methods ====================
  getDashboardStats: async () => {
    if (USE_MOCK_DB) { /* ... mock logic ... */ }

    // Ensure connected before running multiple queries
    await initializeDataSource();

    const employeeRepo = AppDataSource.getRepository(Employee);
    const departmentRepo = AppDataSource.getRepository(Department);
    const leaveRepo = AppDataSource.getRepository(Leave);
    const complianceRepo = AppDataSource.getRepository(Compliance);
    const attendanceRepo = AppDataSource.getRepository(Attendance);


    // Use Promise.all for parallel counts
    const [totalEmployees, totalDepartments, pendingLeaveRequests] = await Promise.all([
      employeeRepo.count({ where: { status: 'Active' } }), // Use status from Employee entity
      departmentRepo.count(),
      leaveRepo.count({ where: { status: 'pending' } })
    ]);

    // Expiring compliance (calculate dates without TypeORM's Between)
    const today = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);

     // Use QueryBuilder for date range
     const expiringCompliance = await complianceRepo.createQueryBuilder("compliance")
       .where("compliance.status = :status", { status: 'Active' }) // Use status from Compliance entity
       .andWhere("compliance.expirationDate >= :today", { today: today })
       .andWhere("compliance.expirationDate <= :future", { future: thirtyDaysLater })
       .getCount();


    // Today's attendance (assuming 'Present' status exists in Attendance entity)
     const todayStr = today.toISOString().split('T')[0]; // Format date as YYYY-MM-DD
     const todayAttendance = await attendanceRepo.count({
         where: {
             date: todayStr,
             status: 'Present' // Use status from Attendance entity
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