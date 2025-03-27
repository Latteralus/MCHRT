// utils/dbService.js
import { mockDb } from './mockDb';

// =========================================================================
// DATABASE SWITCH (Mock vs Real)
// -------------------------------------------------------------------------
// Controls whether the application uses the mock database or attempts to
// connect to the real database configured in utils/db.js.
//
// Set the environment variable USE_MOCK_DB to 'true' to use the mock database.
// Set USE_MOCK_DB to 'false' or leave it unset to use the real database.
//
// Example (.env.local or environment setup):
// USE_MOCK_DB=true   // Use Mock DB for development/testing
// # USE_MOCK_DB=false  // Use Real DB for staging/production
// =========================================================================
const USE_MOCK_DB = process.env.USE_MOCK_DB === 'true';

// Import real database implementation if not using mock
let realDb = null;
if (!USE_MOCK_DB) {
  // Dynamically import the real database connection logic
  // Ensure './db' exports the necessary functions or an object with them.
  try {
    // Assuming './db' default exports an object compatible with the dbService methods
    realDb = require('./db').default;
    if (!realDb) {
      console.warn("Attempted to load real DB, but './db' export was empty or invalid.");
      // Optionally, throw an error if real DB is mandatory when USE_MOCK_DB is false
      // throw new Error("Real database implementation failed to load.");
    }
  } catch (error) {
    console.error("Error loading real database implementation from './db':", error);
    // Optionally, throw an error to prevent startup without a DB
    // throw new Error("Failed to load real database implementation.");
  }
} else {
  console.log("Using Mock Database (USE_MOCK_DB is set to true).");
}


/**
 * Database service that abstracts the actual database implementation.
 * Whether using mock or real database, the API remains consistent.
 */
export const dbService = {
  /**
   * Determines if the mock database is in use
   * @returns {boolean} True if using mock database
   */
  isMockDb: () => USE_MOCK_DB,

  /**
   * Resets the mock database to initial state (for development/testing)
   */
  resetMockDb: () => {
    if (USE_MOCK_DB) {
      return mockDb.reset();
    }
    return Promise.reject(new Error('Reset not available for non-mock database'));
  },

  // ==================== User Methods ====================

  /**
   * Get user by email
   * @param {string} email - User email address
   * @returns {Promise<object|null>} User object or null if not found
   */
  getUserByEmail: async (email) => {
    if (USE_MOCK_DB) {
      const users = await mockDb.findAll('users', { email });
      return users[0] || null;
    }
    if (!realDb?.getUserByEmail) throw new Error("Real DB method 'getUserByEmail' not loaded.");
    return realDb.getUserByEmail(email);
  },

  /**
   * Get user by username
   * @param {string} username - Username
   * @returns {Promise<object|null>} User object or null if not found
   */
  getUserByUsername: async (username) => {
    if (USE_MOCK_DB) {
      const users = await mockDb.findAll('users', { username });
      return users[0] || null;
    }
    if (!realDb?.getUserByUsername) throw new Error("Real DB method 'getUserByUsername' not loaded.");
    return realDb.getUserByUsername(username);
  },

  /**
   * Get user by ID
   * @param {string} id - User ID
   * @returns {Promise<object|null>} User object or null if not found
   */
  getUserById: async (id) => {
    if (USE_MOCK_DB) {
      return mockDb.findById('users', id);
    }
    if (!realDb?.getUserById) throw new Error("Real DB method 'getUserById' not loaded.");
    return realDb.getUserById(id);
  },

  /**
   * Get all users
   * @param {object} options - Query options (pagination, filters)
   * @returns {Promise<Array>} Array of user objects
   */
  getUsers: async (options = {}) => {
    if (USE_MOCK_DB) {
      return mockDb.findAll('users', options);
    }
    if (!realDb?.getUsers) throw new Error("Real DB method 'getUsers' not loaded.");
    return realDb.getUsers(options);
  },

  /**
   * Create a new user
   * @param {object} userData - User data
   * @returns {Promise<object>} Created user object
   */
  createUser: async (userData) => {
    if (USE_MOCK_DB) {
      return mockDb.create('users', userData);
    }
    if (!realDb?.createUser) throw new Error("Real DB method 'createUser' not loaded.");
    return realDb.createUser(userData);
  },

  /**
   * Update an existing user
   * @param {string} id - User ID
   * @param {object} userData - Updated user data
   * @returns {Promise<object>} Updated user object
   */
  updateUser: async (id, userData) => {
    if (USE_MOCK_DB) {
      return mockDb.update('users', id, userData);
    }
    if (!realDb?.updateUser) throw new Error("Real DB method 'updateUser' not loaded.");
    return realDb.updateUser(id, userData);
  },

  /**
   * Delete a user
   * @param {string} id - User ID
   * @returns {Promise<boolean>} Success indicator
   */
  deleteUser: async (id) => {
    if (USE_MOCK_DB) {
      return mockDb.remove('users', id);
    }
    if (!realDb?.deleteUser) throw new Error("Real DB method 'deleteUser' not loaded.");
    return realDb.deleteUser(id);
  },

  // ==================== Employee Methods ====================

  /**
   * Get employee by ID
   * @param {string} id - Employee ID
   * @returns {Promise<object|null>} Employee object or null if not found
   */
  getEmployeeById: async (id) => {
    if (USE_MOCK_DB) {
      return mockDb.findById('employees', id);
    }
    if (!realDb?.getEmployeeById) throw new Error("Real DB method 'getEmployeeById' not loaded.");
    return realDb.getEmployeeById(id);
  },

  /**
   * Get all employees
   * @param {object} options - Query options (pagination, filters)
   * @returns {Promise<Array>} Array of employee objects
   */
  getEmployees: async (options = {}) => {
    if (USE_MOCK_DB) {
      return mockDb.findAll('employees', options);
    }
    if (!realDb?.getEmployees) throw new Error("Real DB method 'getEmployees' not loaded.");
    return realDb.getEmployees(options);
  },

  /**
   * Create a new employee
   * @param {object} employeeData - Employee data
   * @returns {Promise<object>} Created employee object
   */
  createEmployee: async (employeeData) => {
    if (USE_MOCK_DB) {
      return mockDb.create('employees', employeeData);
    }
    if (!realDb?.createEmployee) throw new Error("Real DB method 'createEmployee' not loaded.");
    return realDb.createEmployee(employeeData);
  },

  /**
   * Update an existing employee
   * @param {string} id - Employee ID
   * @param {object} employeeData - Updated employee data
   * @returns {Promise<object>} Updated employee object
   */
  updateEmployee: async (id, employeeData) => {
    if (USE_MOCK_DB) {
      return mockDb.update('employees', id, employeeData);
    }
    if (!realDb?.updateEmployee) throw new Error("Real DB method 'updateEmployee' not loaded.");
    return realDb.updateEmployee(id, employeeData);
  },

  /**
   * Delete an employee
   * @param {string} id - Employee ID
   * @returns {Promise<boolean>} Success indicator
   */
  deleteEmployee: async (id) => {
    if (USE_MOCK_DB) {
      return mockDb.remove('employees', id);
    }
    if (!realDb?.deleteEmployee) throw new Error("Real DB method 'deleteEmployee' not loaded.");
    return realDb.deleteEmployee(id);
  },

  // ==================== Department Methods ====================

  /**
   * Get department by ID
   * @param {string} id - Department ID
   * @returns {Promise<object|null>} Department object or null if not found
   */
  getDepartmentById: async (id) => {
    if (USE_MOCK_DB) {
      return mockDb.findById('departments', id);
    }
    if (!realDb?.getDepartmentById) throw new Error("Real DB method 'getDepartmentById' not loaded.");
    return realDb.getDepartmentById(id);
  },

  /**
   * Get all departments
   * @param {object} options - Query options (pagination, filters)
   * @returns {Promise<Array>} Array of department objects
   */
  getDepartments: async (options = {}) => {
    if (USE_MOCK_DB) {
      return mockDb.findAll('departments', options);
    }
    if (!realDb?.getDepartments) throw new Error("Real DB method 'getDepartments' not loaded.");
    return realDb.getDepartments(options);
  },

  /**
   * Create a new department
   * @param {object} departmentData - Department data
   * @returns {Promise<object>} Created department object
   */
  createDepartment: async (departmentData) => {
    if (USE_MOCK_DB) {
      return mockDb.create('departments', departmentData);
    }
    if (!realDb?.createDepartment) throw new Error("Real DB method 'createDepartment' not loaded.");
    return realDb.createDepartment(departmentData);
  },

  /**
   * Update an existing department
   * @param {string} id - Department ID
   * @param {object} departmentData - Updated department data
   * @returns {Promise<object>} Updated department object
   */
  updateDepartment: async (id, departmentData) => {
    if (USE_MOCK_DB) {
      return mockDb.update('departments', id, departmentData);
    }
    if (!realDb?.updateDepartment) throw new Error("Real DB method 'updateDepartment' not loaded.");
    return realDb.updateDepartment(id, departmentData);
  },

  /**
   * Delete a department
   * @param {string} id - Department ID
   * @returns {Promise<boolean>} Success indicator
   */
  deleteDepartment: async (id) => {
    if (USE_MOCK_DB) {
      return mockDb.remove('departments', id);
    }
    if (!realDb?.deleteDepartment) throw new Error("Real DB method 'deleteDepartment' not loaded.");
    return realDb.deleteDepartment(id);
  },

  // ==================== Attendance Methods ====================

  /**
   * Get attendance record by ID
   * @param {string} id - Attendance record ID
   * @returns {Promise<object|null>} Attendance record or null if not found
   */
  getAttendanceById: async (id) => {
    if (USE_MOCK_DB) {
      return mockDb.findById('attendance', id);
    }
    if (!realDb?.getAttendanceById) throw new Error("Real DB method 'getAttendanceById' not loaded.");
    return realDb.getAttendanceById(id);
  },

  /**
   * Get attendance records
   * @param {object} options - Query options (employeeId, date range, pagination)
   * @returns {Promise<Array>} Array of attendance records
   */
  getAttendanceRecords: async (options = {}) => {
    if (USE_MOCK_DB) {
      // Mock DB specific filtering logic might need refinement
      let results = await mockDb.findAll('attendance', options);
      if (options.date) {
        const dateStr = options.date instanceof Date ? options.date.toISOString().split('T')[0] : options.date;
        results = results.filter(record => {
          const recordDateStr = record.date instanceof Date ?
            record.date.toISOString().split('T')[0] : record.date;
          return recordDateStr === dateStr;
        });
      }
      // Add filtering for date ranges if needed for mock
      return results;
    }
    if (!realDb?.getAttendanceRecords) throw new Error("Real DB method 'getAttendanceRecords' not loaded.");
    return realDb.getAttendanceRecords(options);
  },

  /**
   * Get attendance by employee ID
   * @param {string} employeeId - Employee ID
   * @returns {Promise<Array>} Array of attendance records
   */
  getAttendanceByEmployeeId: async (employeeId) => {
    if (USE_MOCK_DB) {
      return mockDb.findAll('attendance', { employeeId });
    }
    if (!realDb?.getAttendanceByEmployeeId) throw new Error("Real DB method 'getAttendanceByEmployeeId' not loaded.");
    return realDb.getAttendanceByEmployeeId(employeeId);
  },

  /**
   * Get attendance by date
   * @param {Date|string} date - Date to filter by
   * @returns {Promise<Array>} Array of attendance records
   */
  getAttendanceByDate: async (date) => {
    if (USE_MOCK_DB) {
      const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;
      return mockDb.findAll('attendance').then(records => {
        return records.filter(record => {
          const recordDateStr = record.date instanceof Date ?
            record.date.toISOString().split('T')[0] : record.date;
          return recordDateStr === dateStr;
        });
      });
    }
     if (!realDb?.getAttendanceByDate) throw new Error("Real DB method 'getAttendanceByDate' not loaded.");
    return realDb.getAttendanceByDate(date);
  },

  /**
   * Create a new attendance record
   * @param {object} attendanceData - Attendance record data
   * @returns {Promise<object>} Created attendance record
   */
  createAttendance: async (attendanceData) => {
    if (USE_MOCK_DB) {
      return mockDb.create('attendance', attendanceData);
    }
    if (!realDb?.createAttendance) throw new Error("Real DB method 'createAttendance' not loaded.");
    return realDb.createAttendance(attendanceData);
  },

  /**
   * Update an existing attendance record
   * @param {string} id - Attendance record ID
   * @param {object} attendanceData - Updated attendance data
   * @returns {Promise<object>} Updated attendance record
   */
  updateAttendance: async (id, attendanceData) => {
    if (USE_MOCK_DB) {
      return mockDb.update('attendance', id, attendanceData);
    }
     if (!realDb?.updateAttendance) throw new Error("Real DB method 'updateAttendance' not loaded.");
    return realDb.updateAttendance(id, attendanceData);
  },

  /**
   * Delete an attendance record
   * @param {string} id - Attendance record ID
   * @returns {Promise<boolean>} Success indicator
   */
  deleteAttendance: async (id) => {
    if (USE_MOCK_DB) {
      return mockDb.remove('attendance', id);
    }
    if (!realDb?.deleteAttendance) throw new Error("Real DB method 'deleteAttendance' not loaded.");
    return realDb.deleteAttendance(id);
  },

  // ==================== Leave Methods ====================

  /**
   * Get leave request by ID
   * @param {string} id - Leave request ID
   * @returns {Promise<object|null>} Leave request or null if not found
   */
  getLeaveById: async (id) => {
    if (USE_MOCK_DB) {
      return mockDb.findById('leave', id);
    }
    if (!realDb?.getLeaveById) throw new Error("Real DB method 'getLeaveById' not loaded.");
    return realDb.getLeaveById(id);
  },

  /**
   * Get leave requests
   * @param {object} options - Query options (employeeId, status, date range)
   * @returns {Promise<Array>} Array of leave requests
   */
  getLeaveRequests: async (options = {}) => {
    if (USE_MOCK_DB) {
      return mockDb.findAll('leave', options);
    }
    if (!realDb?.getLeaveRequests) throw new Error("Real DB method 'getLeaveRequests' not loaded.");
    return realDb.getLeaveRequests(options);
  },

  /**
   * Get leave by employee ID
   * @param {string} employeeId - Employee ID
   * @returns {Promise<Array>} Array of leave requests
   */
  getLeaveByEmployeeId: async (employeeId) => {
    if (USE_MOCK_DB) {
      return mockDb.findAll('leave', { employeeId });
    }
    if (!realDb?.getLeaveByEmployeeId) throw new Error("Real DB method 'getLeaveByEmployeeId' not loaded.");
    return realDb.getLeaveByEmployeeId(employeeId);
  },

  /**
   * Create a new leave request
   * @param {object} leaveData - Leave request data
   * @returns {Promise<object>} Created leave request
   */
  createLeave: async (leaveData) => {
    if (USE_MOCK_DB) {
      return mockDb.create('leave', leaveData);
    }
    if (!realDb?.createLeave) throw new Error("Real DB method 'createLeave' not loaded.");
    return realDb.createLeave(leaveData);
  },

  /**
   * Update an existing leave request
   * @param {string} id - Leave request ID
   * @param {object} leaveData - Updated leave request data
   * @returns {Promise<object>} Updated leave request
   */
  updateLeave: async (id, leaveData) => {
    if (USE_MOCK_DB) {
      return mockDb.update('leave', id, leaveData);
    }
    if (!realDb?.updateLeave) throw new Error("Real DB method 'updateLeave' not loaded.");
    return realDb.updateLeave(id, leaveData);
  },

  /**
   * Delete a leave request
   * @param {string} id - Leave request ID
   * @returns {Promise<boolean>} Success indicator
   */
  deleteLeave: async (id) => {
    if (USE_MOCK_DB) {
      return mockDb.remove('leave', id);
    }
    if (!realDb?.deleteLeave) throw new Error("Real DB method 'deleteLeave' not loaded.");
    return realDb.deleteLeave(id);
  },

  // ==================== Compliance Methods ====================

  /**
   * Get compliance record by ID
   * @param {string} id - Compliance record ID
   * @returns {Promise<object|null>} Compliance record or null if not found
   */
  getComplianceById: async (id) => {
    if (USE_MOCK_DB) {
      return mockDb.findById('compliance', id);
    }
    if (!realDb?.getComplianceById) throw new Error("Real DB method 'getComplianceById' not loaded.");
    return realDb.getComplianceById(id);
  },

  /**
   * Get compliance records
   * @param {object} options - Query options (employeeId, status, type)
   * @returns {Promise<Array>} Array of compliance records
   */
  getComplianceRecords: async (options = {}) => {
    if (USE_MOCK_DB) {
      return mockDb.findAll('compliance', options);
    }
    if (!realDb?.getComplianceRecords) throw new Error("Real DB method 'getComplianceRecords' not loaded.");
    return realDb.getComplianceRecords(options);
  },
  /**
   * Get compliance by employee ID
   * @param {string} employeeId - Employee ID
   * @returns {Promise<Array>} Array of compliance records
   */
  getComplianceByEmployeeId: async (employeeId) => {
    if (USE_MOCK_DB) {
      return mockDb.findAll('compliance', { employeeId });
    }
    if (!realDb?.getComplianceByEmployeeId) throw new Error("Real DB method 'getComplianceByEmployeeId' not loaded.");
    return realDb.getComplianceByEmployeeId(employeeId);
  },

  /**
   * Get expiring compliance records
   * @param {number} daysUntil - Number of days to look ahead
   * @returns {Promise<Array>} Array of compliance records expiring within the specified days
   */
  getExpiringCompliance: async (daysUntil) => {
    if (USE_MOCK_DB) {
      const today = new Date();
      const futureDate = new Date(today);
      futureDate.setDate(futureDate.getDate() + daysUntil);

      return mockDb.findAll('compliance').then(records => {
        return records.filter(record => {
          const expirationDate = new Date(record.expirationDate); // Ensure it's a Date object
          return expirationDate >= today &&
                 expirationDate <= futureDate &&
                 record.status === 'Active';
        });
      });
    }
    if (!realDb?.getExpiringCompliance) throw new Error("Real DB method 'getExpiringCompliance' not loaded.");
    return realDb.getExpiringCompliance(daysUntil);
  },

  /**
   * Create a new compliance record
   * @param {object} complianceData - Compliance record data
   * @returns {Promise<object>} Created compliance record
   */
  createCompliance: async (complianceData) => {
    if (USE_MOCK_DB) {
      return mockDb.create('compliance', complianceData);
    }
    if (!realDb?.createCompliance) throw new Error("Real DB method 'createCompliance' not loaded.");
    return realDb.createCompliance(complianceData);
  },

  /**
   * Update an existing compliance record
   * @param {string} id - Compliance record ID
   * @param {object} complianceData - Updated compliance data
   * @returns {Promise<object>} Updated compliance record
   */
  updateCompliance: async (id, complianceData) => {
    if (USE_MOCK_DB) {
      return mockDb.update('compliance', id, complianceData);
    }
    if (!realDb?.updateCompliance) throw new Error("Real DB method 'updateCompliance' not loaded.");
    return realDb.updateCompliance(id, complianceData);
  },

  /**
   * Delete a compliance record
   * @param {string} id - Compliance record ID
   * @returns {Promise<boolean>} Success indicator
   */
  deleteCompliance: async (id) => {
    if (USE_MOCK_DB) {
      return mockDb.remove('compliance', id);
    }
    if (!realDb?.deleteCompliance) throw new Error("Real DB method 'deleteCompliance' not loaded.");
    return realDb.deleteCompliance(id);
  },

  // ==================== Document Methods ====================

  /**
   * Get document by ID
   * @param {string} id - Document ID
   * @returns {Promise<object|null>} Document or null if not found
   */
  getDocumentById: async (id) => {
    if (USE_MOCK_DB) {
      return mockDb.findById('documents', id);
    }
    if (!realDb?.getDocumentById) throw new Error("Real DB method 'getDocumentById' not loaded.");
    return realDb.getDocumentById(id);
  },

  /**
   * Get documents
   * @param {object} options - Query options (ownerId, type, tags)
   * @returns {Promise<Array>} Array of documents
   */
  getDocuments: async (options = {}) => {
    if (USE_MOCK_DB) {
      return mockDb.findAll('documents', options);
    }
    if (!realDb?.getDocuments) throw new Error("Real DB method 'getDocuments' not loaded.");
    return realDb.getDocuments(options);
  },

  /**
   * Get documents by department
   * @param {string} departmentId - Department ID
   * @returns {Promise<Array>} Array of documents
   */
  getDocumentsByDepartment: async (departmentId) => {
    if (USE_MOCK_DB) {
      // Get department-specific docs and general docs (departmentId = null)
      return mockDb.findAll('documents').then(docs => {
        return docs.filter(doc =>
          doc.departmentId === departmentId || doc.departmentId === null
        );
      });
    }
    if (!realDb?.getDocumentsByDepartment) throw new Error("Real DB method 'getDocumentsByDepartment' not loaded.");
    return realDb.getDocumentsByDepartment(departmentId);
  },

  /**
   * Create a new document
   * @param {object} documentData - Document data
   * @returns {Promise<object>} Created document
   */
  createDocument: async (documentData) => {
    if (USE_MOCK_DB) {
      return mockDb.create('documents', documentData);
    }
    if (!realDb?.createDocument) throw new Error("Real DB method 'createDocument' not loaded.");
    return realDb.createDocument(documentData);
  },

  /**
   * Update an existing document
   * @param {string} id - Document ID
   * @param {object} documentData - Updated document data
   * @returns {Promise<object>} Updated document
   */
  updateDocument: async (id, documentData) => {
    if (USE_MOCK_DB) {
      return mockDb.update('documents', id, documentData);
    }
    if (!realDb?.updateDocument) throw new Error("Real DB method 'updateDocument' not loaded.");
    return realDb.updateDocument(id, documentData);
  },

  /**
   * Delete a document
   * @param {string} id - Document ID
   * @returns {Promise<boolean>} Success indicator
   */
  deleteDocument: async (id) => {
    if (USE_MOCK_DB) {
      return mockDb.remove('documents', id);
    }
    if (!realDb?.deleteDocument) throw new Error("Real DB method 'deleteDocument' not loaded.");
    return realDb.deleteDocument(id);
  },

  // ==================== Dashboard Methods ====================

  /**
   * Get dashboard statistics
   * @returns {Promise<object>} Object containing dashboard statistics
   */
  getDashboardStats: async () => {
    if (USE_MOCK_DB) {
      const employees = await mockDb.findAll('employees');
      const departments = await mockDb.findAll('departments');
      const pendingLeave = await mockDb.findAll('leave', { status: 'Pending' });
      const complianceRecords = await mockDb.findAll('compliance');
      const attendanceRecords = await mockDb.findAll('attendance');

      const employeesCount = employees.length;
      const departmentsCount = departments.length;
      const pendingLeaveCount = pendingLeave.length;

      const today = new Date();
      const thirtyDaysLater = new Date(today);
      thirtyDaysLater.setDate(today.getDate() + 30);
      const expiringComplianceCount = complianceRecords.filter(record => {
        const expirationDate = new Date(record.expirationDate);
        return expirationDate >= today &&
               expirationDate <= thirtyDaysLater &&
               record.status === 'Active';
      }).length;

      const todayStr = today.toISOString().split('T')[0];
      const todayAttendanceCount = attendanceRecords.filter(record => {
        const recordDate = record.date instanceof Date ?
          record.date.toISOString().split('T')[0] : record.date;
        return recordDate === todayStr;
      }).length;

      return {
        totalEmployees: employeesCount,
        totalDepartments: departmentsCount,
        pendingLeaveRequests: pendingLeaveCount,
        expiringCompliance: expiringComplianceCount,
        todayAttendance: todayAttendanceCount,
        attendanceRate: employeesCount > 0 ? Math.round((todayAttendanceCount / employeesCount) * 100) : 0
      };
    }
    if (!realDb?.getDashboardStats) throw new Error("Real DB method 'getDashboardStats' not loaded.");
    return realDb.getDashboardStats();
  }
}