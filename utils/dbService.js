// MCHRT/utils/dbService.js

import { mockDb } from './mockDb';

// =========================================================================
// DATABASE SWITCH (Mock vs Real)
// =========================================================================
const USE_MOCK_DB = process.env.USE_MOCK_DB === 'true';

// Import real database implementation if not using mock
let realDb = null;
if (!USE_MOCK_DB) {
  // Dynamically import the real database connection logic
  // Ensure './db' exports the necessary functions or an object with them.
  try {
    // Assuming './db' default exports an object compatible with the dbService methods
    // If using the conditional db.js, this will get an empty {} when mock is true,
    // or the full db object when mock is false.
    realDb = require('./db').default;
    // The checks inside each dbService method (e.g., !realDb?.getUserById)
    // will handle cases where realDb is null or {} and the method doesn't exist.
    if (!realDb || Object.keys(realDb).length === 0) {
        // This might trigger if realDb is expected but fails to load OR if mock is true (db={} exported)
        if(!USE_MOCK_DB) { // Only warn if we *expected* the real DB
             console.warn("Attempted to load real DB, but './db' export was empty or invalid. Ensure db.js exports methods correctly when USE_MOCK_DB is false.");
        }
    } else {
        console.log("Real DB object loaded from ./db");
    }
  } catch (error) {
    console.error("Error loading real database implementation from './db':", error);
    // If real DB is absolutely required when USE_MOCK_DB is false, throw an error here.
    if (!USE_MOCK_DB) {
         throw new Error(`Failed to load real database implementation. Build cannot continue without it when USE_MOCK_DB is not 'true'. Error: ${error.message}`);
    }
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
    // Return a resolved promise for consistency, but log it's a no-op
    console.warn("resetMockDb called, but not using mock database.");
    return Promise.resolve();
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
    // Check if realDb object exists AND has the method
    if (!realDb?.getUserByEmail) throw new Error("Real DB method 'getUserByEmail' not available or loaded.");
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
    if (!realDb?.getUserByUsername) throw new Error("Real DB method 'getUserByUsername' not available or loaded.");
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
    if (!realDb?.getUserById) throw new Error("Real DB method 'getUserById' not available or loaded.");
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
    if (!realDb?.getUsers) throw new Error("Real DB method 'getUsers' not available or loaded.");
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
    if (!realDb?.createUser) throw new Error("Real DB method 'createUser' not available or loaded.");
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
    if (!realDb?.updateUser) throw new Error("Real DB method 'updateUser' not available or loaded.");
    return realDb.updateUser(id, userData);
  },

  /**
   * Delete a user
   * @param {string} id - User ID
   * @returns {Promise<{success: boolean}>} Success indicator object
   */
  deleteUser: async (id) => {
    if (USE_MOCK_DB) {
      const success = await mockDb.remove('users', id);
      return { success }; // Match expected return type if real DB returns object
    }
    if (!realDb?.deleteUser) throw new Error("Real DB method 'deleteUser' not available or loaded.");
    return realDb.deleteUser(id); // Assuming real DB returns { success: boolean }
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
    if (!realDb?.getEmployeeById) throw new Error("Real DB method 'getEmployeeById' not available or loaded.");
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
    if (!realDb?.getEmployees) throw new Error("Real DB method 'getEmployees' not available or loaded.");
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
    if (!realDb?.createEmployee) throw new Error("Real DB method 'createEmployee' not available or loaded.");
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
    if (!realDb?.updateEmployee) throw new Error("Real DB method 'updateEmployee' not available or loaded.");
    return realDb.updateEmployee(id, employeeData);
  },

  /**
   * Delete an employee
   * @param {string} id - Employee ID
   * @returns {Promise<{success: boolean}>} Success indicator object
   */
  deleteEmployee: async (id) => {
    if (USE_MOCK_DB) {
       const success = await mockDb.remove('employees', id);
       return { success };
    }
    if (!realDb?.deleteEmployee) throw new Error("Real DB method 'deleteEmployee' not available or loaded.");
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
    if (!realDb?.getDepartmentById) throw new Error("Real DB method 'getDepartmentById' not available or loaded.");
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
    if (!realDb?.getDepartments) throw new Error("Real DB method 'getDepartments' not available or loaded.");
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
    if (!realDb?.createDepartment) throw new Error("Real DB method 'createDepartment' not available or loaded.");
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
    if (!realDb?.updateDepartment) throw new Error("Real DB method 'updateDepartment' not available or loaded.");
    return realDb.updateDepartment(id, departmentData);
  },

  /**
   * Delete a department
   * @param {string} id - Department ID
   * @returns {Promise<{success: boolean}>} Success indicator object
   */
  deleteDepartment: async (id) => {
    if (USE_MOCK_DB) {
      const success = await mockDb.remove('departments', id);
      return { success };
    }
    if (!realDb?.deleteDepartment) throw new Error("Real DB method 'deleteDepartment' not available or loaded.");
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
    if (!realDb?.getAttendanceById) throw new Error("Real DB method 'getAttendanceById' not available or loaded.");
    return realDb.getAttendanceById(id);
  },

  /**
   * Get attendance records
   * @param {object} options - Query options (employeeId, date range, pagination)
   * @returns {Promise<Array>} Array of attendance records
   */
  getAttendanceRecords: async (options = {}) => {
    if (USE_MOCK_DB) {
      // Mock DB specific filtering logic might need refinement based on mockDb.js implementation
      let results = await mockDb.findAll('attendance', options); // Assuming mockDb handles basic filtering
      // Add any specific date/range filtering not handled by mockDb.findAll
      return results;
    }
    if (!realDb?.getAttendanceRecords) throw new Error("Real DB method 'getAttendanceRecords' not available or loaded.");
    return realDb.getAttendanceRecords(options);
  },

  /**
   * Get attendance by employee ID
   * @param {string} employeeId - Employee ID
   * @returns {Promise<Array>} Array of attendance records
   */
  getAttendanceByEmployeeId: async (employeeId) => {
    if (USE_MOCK_DB) {
      // Assuming mockDb.findAll can filter by employeeId
      return mockDb.findAll('attendance', { employeeId });
    }
    // If realDb has this specific method (original db object did not)
    if (!realDb?.getAttendanceByEmployeeId) {
        // Fallback to using the general getAttendanceRecords if specific method is missing
        if (!realDb?.getAttendanceRecords) throw new Error("Real DB methods for attendance not available or loaded.");
        console.warn("Using getAttendanceRecords as fallback for getAttendanceByEmployeeId");
        return realDb.getAttendanceRecords({ employeeId });
    }
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
       // Assuming mockDb.findAll can filter by date string
      return mockDb.findAll('attendance', { date: dateStr });
    }
    // If realDb has this specific method (original db object did not)
     if (!realDb?.getAttendanceByDate) {
        if (!realDb?.getAttendanceRecords) throw new Error("Real DB methods for attendance not available or loaded.");
        console.warn("Using getAttendanceRecords as fallback for getAttendanceByDate");
        return realDb.getAttendanceRecords({ date });
     }
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
    if (!realDb?.createAttendance) throw new Error("Real DB method 'createAttendance' not available or loaded.");
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
     if (!realDb?.updateAttendance) throw new Error("Real DB method 'updateAttendance' not available or loaded.");
    return realDb.updateAttendance(id, attendanceData);
  },

  /**
   * Delete an attendance record
   * @param {string} id - Attendance record ID
   * @returns {Promise<{success: boolean}>} Success indicator object
   */
  deleteAttendance: async (id) => {
    if (USE_MOCK_DB) {
      const success = await mockDb.remove('attendance', id);
      return { success };
    }
    if (!realDb?.deleteAttendance) throw new Error("Real DB method 'deleteAttendance' not available or loaded.");
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
    if (!realDb?.getLeaveById) throw new Error("Real DB method 'getLeaveById' not available or loaded.");
    return realDb.getLeaveById(id);
  },

  /**
   * Get leave requests
   * @param {object} options - Query options (employeeId, status, date range)
   * @returns {Promise<Array|{leaveRequests: Array, pagination: object}>} Array or paginated object
   */
  getLeaveRequests: async (options = {}) => {
    if (USE_MOCK_DB) {
      // Mock DB might just return array, adjust based on mockDb implementation
      const requests = await mockDb.findAll('leave', options);
      // Simulate pagination object if needed by consumers
      return { leaveRequests: requests, pagination: { total: requests.length, limit: options.limit || requests.length, offset: options.offset || 0 } };
    }
    if (!realDb?.getLeaveRequests) throw new Error("Real DB method 'getLeaveRequests' not available or loaded.");
    // Assuming real DB implementation might return array or pagination object
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
     // Fallback logic similar to attendance
     if (!realDb?.getLeaveByEmployeeId) {
        if (!realDb?.getLeaveRequests) throw new Error("Real DB methods for leave not available or loaded.");
        console.warn("Using getLeaveRequests as fallback for getLeaveByEmployeeId");
        const result = await realDb.getLeaveRequests({ employeeId });
        // Adapt result if realDb.getLeaveRequests returns pagination object
        return Array.isArray(result) ? result : result.leaveRequests || [];
     }
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
    if (!realDb?.createLeave) throw new Error("Real DB method 'createLeave' not available or loaded.");
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
    if (!realDb?.updateLeave) throw new Error("Real DB method 'updateLeave' not available or loaded.");
    return realDb.updateLeave(id, leaveData);
  },

  /**
   * Delete a leave request
   * @param {string} id - Leave request ID
   * @returns {Promise<{success: boolean}>} Success indicator object
   */
  deleteLeave: async (id) => {
    if (USE_MOCK_DB) {
      const success = await mockDb.remove('leave', id);
      return { success };
    }
    if (!realDb?.deleteLeave) throw new Error("Real DB method 'deleteLeave' not available or loaded.");
    return realDb.deleteLeave(id);
  },

  // ==================== Compliance Methods ====================
  // ... (Implement Compliance methods similar to others, checking USE_MOCK_DB and realDb?.methodName) ...
   getComplianceById: async (id) => {
    if (USE_MOCK_DB) { return mockDb.findById('compliance', id); }
    if (!realDb?.getComplianceById) throw new Error("Real DB method 'getComplianceById' not available.");
    return realDb.getComplianceById(id);
  },
   getComplianceRecords: async (options = {}) => {
    if (USE_MOCK_DB) { return mockDb.findAll('compliance', options); }
    if (!realDb?.getComplianceRecords) throw new Error("Real DB method 'getComplianceRecords' not available.");
    return realDb.getComplianceRecords(options);
  },
  // etc. for create, update, delete, getExpiringCompliance...


  // ==================== Document Methods ====================
  // ... (Implement Document methods similar to others, checking USE_MOCK_DB and realDb?.methodName) ...
   getDocumentById: async (id) => {
    if (USE_MOCK_DB) { return mockDb.findById('documents', id); }
    if (!realDb?.getDocumentById) throw new Error("Real DB method 'getDocumentById' not available.");
    return realDb.getDocumentById(id);
  },
  getDocuments: async (options = {}) => {
    if (USE_MOCK_DB) { return mockDb.findAll('documents', options); }
    if (!realDb?.getDocuments) throw new Error("Real DB method 'getDocuments' not available.");
    return realDb.getDocuments(options);
  },
  // etc. for create, update, delete, getDocumentsByDepartment...


  // ==================== Dashboard Methods ====================

  /**
   * Get dashboard statistics
   * @returns {Promise<object>} Object containing dashboard statistics
   */
  getDashboardStats: async () => {
    if (USE_MOCK_DB) {
      // Keep the mock implementation as provided before
      const employees = await mockDb.findAll('employees');
      const departments = await mockDb.findAll('departments');
      const pendingLeave = await mockDb.findAll('leave', { status: 'pending' }); // Assuming status filter works
      const complianceRecords = await mockDb.findAll('compliance');
      const attendanceRecords = await mockDb.findAll('attendance');

      const employeesCount = employees.length;
      const departmentsCount = departments.length;
      const pendingLeaveCount = pendingLeave.length;

      const today = new Date();
      const thirtyDaysLater = new Date(today);
      thirtyDaysLater.setDate(today.getDate() + 30);
      const expiringComplianceCount = complianceRecords.filter(record => {
         // Basic date comparison for mock
         if (!record.expirationDate) return false;
         const expirationDate = new Date(record.expirationDate);
         return expirationDate >= today &&
                expirationDate <= thirtyDaysLater &&
                (record.status === 'Active' || record.status === 'active'); // Allow case variation
       }).length;

      const todayStr = today.toISOString().split('T')[0];
      const todayAttendanceCount = attendanceRecords.filter(record => {
         if(!record.date) return false;
         const recordDate = record.date instanceof Date ?
          record.date.toISOString().split('T')[0] : record.date.split('T')[0]; // Handle string dates
         // Basic status check
         return recordDate === todayStr && (record.status === 'Present' || record.status === 'present');
       }).length;
       const activeEmployeesCount = employees.filter(e => (e.status === 'Active' || e.status === 'active')).length;


      return {
        totalEmployees: employeesCount,
        totalDepartments: departmentsCount,
        pendingLeaveRequests: pendingLeaveCount,
        expiringCompliance: expiringComplianceCount,
        todayAttendance: todayAttendanceCount,
        // Calculate rate based on active employees if possible
        attendanceRate: activeEmployeesCount > 0 ? Math.round((todayAttendanceCount / activeEmployeesCount) * 100) : 0
      };
    }
    // Check for the real DB method
    if (!realDb?.getDashboardStats) throw new Error("Real DB method 'getDashboardStats' not available or loaded.");
    return realDb.getDashboardStats();
  }
};

// Helper function to ensure all expected methods exist on realDb if loaded
// This is optional but can help catch issues early if realDb.js export changes
function verifyRealDbMethods(dbObject) {
    const expectedMethods = [
        'getUserByEmail', 'getUserById', /* Add ALL methods expected by dbService */
        'getEmployees', 'createEmployee', 'updateEmployee', 'deleteEmployee',
        // ... etc ...
        'getDashboardStats'
    ];
    let allExist = true;
    for (const method of expectedMethods) {
        if (typeof dbObject[method] !== 'function') {
            console.error(`Real DB object from './db' is missing expected method: ${method}`);
            allExist = false;
            // Don't throw here, allow individual checks in dbService to handle it
        }
    }
    return allExist;
}

if (!USE_MOCK_DB && realDb) {
    console.log("Verifying Real DB methods...");
    verifyRealDbMethods(realDb);
}