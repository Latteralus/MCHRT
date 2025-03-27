// utils/dbService.js
import { mockDb } from './mockDb';

// To switch to real database implementation later, change this to false
const USE_MOCK_DB = true;

// Import real database if not using mock
let realDb = null;
if (!USE_MOCK_DB) {
  // This would be imported dynamically when implemented
  // realDb = require('./db').default;
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
    return Promise.reject(new Error('Reset not available for production database'));
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
    return realDb.getUserByUsername ? realDb.getUserByUsername(username) : null;
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
    return realDb.getAttendanceById(id);
  },

  /**
   * Get attendance records
   * @param {object} options - Query options (employeeId, date range, pagination)
   * @returns {Promise<Array>} Array of attendance records
   */
  getAttendanceRecords: async (options = {}) => {
    if (USE_MOCK_DB) {
      if (options.date) {
        // Convert to date string for comparison since we're using in-memory DB
        const dateStr = options.date instanceof Date ? options.date.toISOString().split('T')[0] : options.date;
        return mockDb.findAll('attendance').then(records => {
          return records.filter(record => {
            const recordDateStr = record.date instanceof Date ? 
              record.date.toISOString().split('T')[0] : record.date;
            return recordDateStr === dateStr;
          });
        });
      }
      return mockDb.findAll('attendance', options);
    }
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
    return realDb.getAttendanceByEmployeeId(employeeId);
  },

  /**
   * Get attendance by date
   * @param {Date|string} date - Date to filter by
   * @returns {Promise<Array>} Array of attendance records
   */
  getAttendanceByDate: async (date) => {
    if (USE_MOCK_DB) {
      // Convert to date string for comparison since we're using in-memory DB
      const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;
      return mockDb.findAll('attendance').then(records => {
        return records.filter(record => {
          const recordDateStr = record.date instanceof Date ? 
            record.date.toISOString().split('T')[0] : record.date;
          return recordDateStr === dateStr;
        });
      });
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
    return realDb.getComplianceByEmployeeId(employeeId);
  },

  /**
   * Get expiring compliance records
   * @param {number} daysUntil - Number of days to look ahead
   * @returns {Promise<Array>} Array of compliance records expiring within the specified days
   */
  getExpiringCompliance: async (daysUntil) => {
    if (USE_MOCK_DB) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysUntil);
      
      return mockDb.findAll('compliance').then(records => {
        return records.filter(record => {
          return record.expirationDate <= futureDate && record.status === 'Active';
        });
      });
    }
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
    return realDb.deleteDocument(id);
  },

  // ==================== Dashboard Methods ====================

  /**
   * Get dashboard statistics
   * @returns {Promise<object>} Object containing dashboard statistics
   */
  getDashboardStats: async () => {
    if (USE_MOCK_DB) {
      // Get counts for various entities
      const employeesCount = (await mockDb.findAll('employees')).length;
      const departmentsCount = (await mockDb.findAll('departments')).length;
      const pendingLeave = (await mockDb.findAll('leave', { status: 'Pending' })).length;
      
      // Get upcoming compliance expirations (next 30 days)
      const today = new Date();
      const thirtyDaysLater = new Date(today);
      thirtyDaysLater.setDate(today.getDate() + 30);
      
      const complianceRecords = await mockDb.findAll('compliance');
      const expiringCompliance = complianceRecords.filter(record => {
        return record.expirationDate >= today && 
              record.expirationDate <= thirtyDaysLater && 
              record.status === 'Active';
      }).length;
      
      // Today's attendance
      const todayStr = today.toISOString().split('T')[0];
      const attendanceRecords = await mockDb.findAll('attendance');
      const todayAttendance = attendanceRecords.filter(record => {
        const recordDate = record.date instanceof Date ? 
          record.date.toISOString().split('T')[0] : record.date;
        return recordDate === todayStr;
      }).length;
      
      return {
        totalEmployees: employeesCount,
        totalDepartments: departmentsCount,
        pendingLeaveRequests: pendingLeave,
        expiringCompliance,
        todayAttendance,
        attendanceRate: Math.round((todayAttendance / employeesCount) * 100) || 0
      };
    }
    return realDb.getDashboardStats();
  }
}