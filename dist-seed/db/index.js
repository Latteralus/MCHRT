"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Document = exports.Compliance = exports.LeaveBalance = exports.Leave = exports.Attendance = exports.Employee = exports.Department = exports.User = exports.testConnection = exports.models = void 0;
// Only import testConnection - Initialization happens elsewhere
// Models will import getSequelizeInstance directly from mockDbSetup
const mockDbSetup_1 = require("./mockDbSetup");
Object.defineProperty(exports, "testConnection", { enumerable: true, get: function () { return mockDbSetup_1.testConnection; } });
// Import all models
const User_1 = __importDefault(require("@/modules/auth/models/User"));
exports.User = User_1.default;
const Department_1 = __importDefault(require("@/modules/organization/models/Department"));
exports.Department = Department_1.default;
const Employee_1 = __importDefault(require("@/modules/employees/models/Employee"));
exports.Employee = Employee_1.default;
const Attendance_1 = __importDefault(require("@/modules/attendance/models/Attendance"));
exports.Attendance = Attendance_1.default;
const Leave_1 = __importDefault(require("@/modules/leave/models/Leave"));
exports.Leave = Leave_1.default;
const LeaveBalance_1 = __importDefault(require("@/modules/leave/models/LeaveBalance")); // Import LeaveBalance model
exports.LeaveBalance = LeaveBalance_1.default;
const Compliance_1 = __importDefault(require("@/modules/compliance/models/Compliance"));
exports.Compliance = Compliance_1.default;
const Document_1 = __importDefault(require("@/modules/documents/models/Document"));
exports.Document = Document_1.default;
// Define an object to hold all models
const models = {
    User: User_1.default,
    Department: Department_1.default,
    Employee: Employee_1.default,
    Attendance: Attendance_1.default,
    Leave: Leave_1.default,
    LeaveBalance: LeaveBalance_1.default, // Add LeaveBalance
    Compliance: // Add LeaveBalance
    Compliance_1.default,
    Document: Document_1.default,
};
exports.models = models;
// Import and call the association definition function
const associations_1 = require("./associations");
(0, associations_1.defineAssociations)(); // Ensure associations are set up
