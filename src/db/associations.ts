// Import all models
import User from '@/modules/auth/models/User';
import Department from '@/modules/organization/models/Department';
import Employee from '@/modules/employees/models/Employee';
import Attendance from '@/modules/attendance/models/Attendance';
import Leave from '@/modules/leave/models/Leave';
import LeaveBalance from '@/modules/leave/models/LeaveBalance'; // Import the new model
import Compliance from '@/modules/compliance/models/Compliance';
import Document from '@/modules/documents/models/Document';
import { Position } from '@/modules/organization/models/Position';
import { Offboarding } from '@/modules/offboarding/models/Offboarding';
import { OnboardingTemplate } from '@/modules/onboarding/models/OnboardingTemplate'; // Import Template model
import { OnboardingTemplateItem } from '@/modules/onboarding/models/OnboardingTemplateItem';
import { ActivityLog } from '@/modules/logging/models/ActivityLog'; // Import ActivityLog model

// Define associations function
export const defineAssociations = () => {
  // User <-> Department Associations
  // A User belongs to one Department
  User.belongsTo(Department, {
    foreignKey: 'departmentId',
    as: 'department', // Allows User.getDepartment()
  });
  // A Department can have multiple Users
  Department.hasMany(User, {
    foreignKey: 'departmentId',
    as: 'users', // Allows Department.getUsers()
  });
  // A Department has one Manager (who is a User)
  Department.belongsTo(User, {
    foreignKey: 'managerId',
    as: 'manager', // Allows Department.getManager()
  });
  // Optional: A User could manage a Department (inverse of above)
  // User.hasOne(Department, { foreignKey: 'managerId', as: 'managedDepartment' });

  // User <-> Employee Association (for linking login to employee record)
  // A User might be linked to one Employee record
  User.hasOne(Employee, {
    foreignKey: 'userId',
    as: 'employeeProfile', // Allows User.getEmployeeProfile()
  });
  // An Employee belongs to one User account
  Employee.belongsTo(User, {
    foreignKey: 'userId',
    as: 'userAccount', // Allows Employee.getUserAccount()
  });

  // Employee <-> Department Associations
  // An Employee belongs to one Department
  Employee.belongsTo(Department, {
    foreignKey: 'departmentId',
    as: 'department', // Allows Employee.getDepartment()
  });
  // A Department can have multiple Employees
  Department.hasMany(Employee, {
    foreignKey: 'departmentId',
    as: 'employees', // Allows Department.getEmployees()
  });

  // Employee <-> Position Associations
  // An Employee belongs to one Position
  Employee.belongsTo(Position, {
    foreignKey: 'positionId',
    as: 'position', // Allows Employee.getPosition()
  });
  // A Position can have multiple Employees
  Position.hasMany(Employee, {
    foreignKey: 'positionId',
    as: 'employees', // Allows Position.getEmployees()
  });

  // Employee <-> Attendance Associations
  // An Attendance record belongs to one Employee
  Attendance.belongsTo(Employee, {
    foreignKey: 'employeeId',
    as: 'employee', // Allows Attendance.getEmployee()
  });
  // An Employee can have multiple Attendance records
  Employee.hasMany(Attendance, {
    foreignKey: 'employeeId',
    as: 'attendanceRecords', // Allows Employee.getAttendanceRecords()
  });

  // Employee <-> Leave Associations
  // A Leave record belongs to one Employee
  Leave.belongsTo(Employee, {
    foreignKey: 'employeeId',
    as: 'employee', // Allows Leave.getEmployee()
  });
  // An Employee can have multiple Leave records
  Employee.hasMany(Leave, {
    foreignKey: 'employeeId',
    as: 'leaveRecords', // Allows Employee.getLeaveRecords()
  });
  // A Leave record is approved/rejected by one User (Approver)
  Leave.belongsTo(User, {
    foreignKey: 'approverId',
    as: 'approver', // Allows Leave.getApprover()
  });
  // Optional: A User can approve/reject multiple Leave records
  // User.hasMany(Leave, { foreignKey: 'approverId', as: 'approvedLeaves' });

  // Employee <-> LeaveBalance Associations
  // An Employee can have multiple LeaveBalance records (one per type)
  Employee.hasMany(LeaveBalance, {
    foreignKey: 'employeeId',
    as: 'leaveBalances', // Allows Employee.getLeaveBalances()
  });
  // A LeaveBalance record belongs to one Employee
  LeaveBalance.belongsTo(Employee, {
    foreignKey: 'employeeId',
    as: 'employee', // Allows LeaveBalance.getEmployee()
  });

  // Employee <-> Compliance Associations
  // A Compliance item belongs to one Employee
  Compliance.belongsTo(Employee, {
    foreignKey: 'employeeId',
    as: 'employee', // Allows Compliance.getEmployee()
  });
  // An Employee can have multiple Compliance items
  Employee.hasMany(Compliance, {
    foreignKey: 'employeeId',
    as: 'complianceItems', // Allows Employee.getComplianceItems()
  });

  // Employee <-> Offboarding Association (One-to-One)
  // An Employee has one Offboarding process
  Employee.hasOne(Offboarding, {
    foreignKey: 'employeeId',
    as: 'offboardingProcess', // Allows Employee.getOffboardingProcess()
  });
  // An Offboarding process belongs to one Employee
  Offboarding.belongsTo(Employee, {
    foreignKey: 'employeeId',
    as: 'employee', // Allows Offboarding.getEmployee()
  });

  // Document Associations
  // A Document belongs to one Owner (User)
  Document.belongsTo(User, {
    foreignKey: 'ownerId',
    as: 'owner', // Allows Document.getOwner()
  });
  // Optional: A User can own multiple Documents
  // User.hasMany(Document, { foreignKey: 'ownerId', as: 'ownedDocuments' });

  // A Document can belong to one Employee
  Document.belongsTo(Employee, {
    foreignKey: 'employeeId',
    as: 'employee', // Allows Document.getEmployee()
  });
  // Optional: An Employee can have multiple Documents associated
  // Employee.hasMany(Document, { foreignKey: 'employeeId', as: 'documents' });

  // A Document can belong to one Department
  Document.belongsTo(Department, {
    foreignKey: 'departmentId',
    as: 'department', // Allows Document.getDepartment()
  });
  // Optional: A Department can have multiple Documents associated
  // Department.hasMany(Document, { foreignKey: 'departmentId', as: 'documents' });

  // Onboarding Template <-> Items Association (One-to-Many)
  OnboardingTemplate.hasMany(OnboardingTemplateItem, {
    foreignKey: 'templateId',
    as: 'items', // Allows OnboardingTemplate.getItems()
  });
  OnboardingTemplateItem.belongsTo(OnboardingTemplate, {
    foreignKey: 'templateId',
    as: 'template', // Allows OnboardingTemplateItem.getTemplate()
  });

  // User <-> ActivityLog Association (One-to-Many)
  // A User can perform many actions (logs)
  User.hasMany(ActivityLog, {
    foreignKey: 'userId',
    as: 'activityLogs', // Allows User.getActivityLogs()
  });
  // An ActivityLog belongs to one User
  ActivityLog.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user', // Allows ActivityLog.getUser()
  });

  console.log('Sequelize associations defined.');
};

// Call the function to define associations immediately upon import,
// or export it to be called explicitly after Sequelize initialization.
// For simplicity here, we export it. It should be called after models are loaded.