"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineAssociations = void 0;
// Import all models
const User_1 = __importDefault(require("@/modules/auth/models/User"));
const Department_1 = __importDefault(require("@/modules/organization/models/Department"));
const Employee_1 = __importDefault(require("@/modules/employees/models/Employee"));
const Attendance_1 = __importDefault(require("@/modules/attendance/models/Attendance"));
const Leave_1 = __importDefault(require("@/modules/leave/models/Leave"));
const LeaveBalance_1 = __importDefault(require("@/modules/leave/models/LeaveBalance")); // Import the new model
const Compliance_1 = __importDefault(require("@/modules/compliance/models/Compliance"));
const Document_1 = __importDefault(require("@/modules/documents/models/Document"));
// Define associations function
const defineAssociations = () => {
    // User <-> Department Associations
    // A User belongs to one Department
    User_1.default.belongsTo(Department_1.default, {
        foreignKey: 'departmentId',
        as: 'department', // Allows User.getDepartment()
    });
    // A Department can have multiple Users
    Department_1.default.hasMany(User_1.default, {
        foreignKey: 'departmentId',
        as: 'users', // Allows Department.getUsers()
    });
    // A Department has one Manager (who is a User)
    Department_1.default.belongsTo(User_1.default, {
        foreignKey: 'managerId',
        as: 'manager', // Allows Department.getManager()
    });
    // Optional: A User could manage a Department (inverse of above)
    // User.hasOne(Department, { foreignKey: 'managerId', as: 'managedDepartment' });
    // User <-> Employee Association (for linking login to employee record)
    // A User might be linked to one Employee record
    User_1.default.hasOne(Employee_1.default, {
        foreignKey: 'userId',
        as: 'employeeProfile', // Allows User.getEmployeeProfile()
    });
    // An Employee belongs to one User account
    Employee_1.default.belongsTo(User_1.default, {
        foreignKey: 'userId',
        as: 'userAccount', // Allows Employee.getUserAccount()
    });
    // Employee <-> Department Associations
    // An Employee belongs to one Department
    Employee_1.default.belongsTo(Department_1.default, {
        foreignKey: 'departmentId',
        as: 'department', // Allows Employee.getDepartment()
    });
    // A Department can have multiple Employees
    Department_1.default.hasMany(Employee_1.default, {
        foreignKey: 'departmentId',
        as: 'employees', // Allows Department.getEmployees()
    });
    // Employee <-> Attendance Associations
    // An Attendance record belongs to one Employee
    Attendance_1.default.belongsTo(Employee_1.default, {
        foreignKey: 'employeeId',
        as: 'employee', // Allows Attendance.getEmployee()
    });
    // An Employee can have multiple Attendance records
    Employee_1.default.hasMany(Attendance_1.default, {
        foreignKey: 'employeeId',
        as: 'attendanceRecords', // Allows Employee.getAttendanceRecords()
    });
    // Employee <-> Leave Associations
    // A Leave record belongs to one Employee
    Leave_1.default.belongsTo(Employee_1.default, {
        foreignKey: 'employeeId',
        as: 'employee', // Allows Leave.getEmployee()
    });
    // An Employee can have multiple Leave records
    Employee_1.default.hasMany(Leave_1.default, {
        foreignKey: 'employeeId',
        as: 'leaveRecords', // Allows Employee.getLeaveRecords()
    });
    // A Leave record is approved/rejected by one User (Approver)
    Leave_1.default.belongsTo(User_1.default, {
        foreignKey: 'approverId',
        as: 'approver', // Allows Leave.getApprover()
    });
    // Optional: A User can approve/reject multiple Leave records
    // User.hasMany(Leave, { foreignKey: 'approverId', as: 'approvedLeaves' });
    // Employee <-> LeaveBalance Associations
    // An Employee can have multiple LeaveBalance records (one per type)
    Employee_1.default.hasMany(LeaveBalance_1.default, {
        foreignKey: 'employeeId',
        as: 'leaveBalances', // Allows Employee.getLeaveBalances()
    });
    // A LeaveBalance record belongs to one Employee
    LeaveBalance_1.default.belongsTo(Employee_1.default, {
        foreignKey: 'employeeId',
        as: 'employee', // Allows LeaveBalance.getEmployee()
    });
    // Employee <-> Compliance Associations
    // A Compliance item belongs to one Employee
    Compliance_1.default.belongsTo(Employee_1.default, {
        foreignKey: 'employeeId',
        as: 'employee', // Allows Compliance.getEmployee()
    });
    // An Employee can have multiple Compliance items
    Employee_1.default.hasMany(Compliance_1.default, {
        foreignKey: 'employeeId',
        as: 'complianceItems', // Allows Employee.getComplianceItems()
    });
    // Document Associations
    // A Document belongs to one Owner (User)
    Document_1.default.belongsTo(User_1.default, {
        foreignKey: 'ownerId',
        as: 'owner', // Allows Document.getOwner()
    });
    // Optional: A User can own multiple Documents
    // User.hasMany(Document, { foreignKey: 'ownerId', as: 'ownedDocuments' });
    // A Document can belong to one Employee
    Document_1.default.belongsTo(Employee_1.default, {
        foreignKey: 'employeeId',
        as: 'employee', // Allows Document.getEmployee()
    });
    // Optional: An Employee can have multiple Documents associated
    // Employee.hasMany(Document, { foreignKey: 'employeeId', as: 'documents' });
    // A Document can belong to one Department
    Document_1.default.belongsTo(Department_1.default, {
        foreignKey: 'departmentId',
        as: 'department', // Allows Document.getDepartment()
    });
    // Optional: A Department can have multiple Documents associated
    // Department.hasMany(Document, { foreignKey: 'departmentId', as: 'documents' });
    console.log('Sequelize associations defined.');
};
exports.defineAssociations = defineAssociations;
// Call the function to define associations immediately upon import,
// or export it to be called explicitly after Sequelize initialization.
// For simplicity here, we export it. It should be called after models are loaded.
