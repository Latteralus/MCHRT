import { Sequelize } from 'sequelize';
import path from 'path';

// --- Load Config ---
// Use require due to module.exports in config.ts
const dbConfig = require('../config/config');
const env = process.env.NODE_ENV || 'development';
const config = dbConfig[env];

if (!config) {
  throw new Error(`Database configuration for environment '${env}' not found.`);
}

// --- Resolve SQLite Path ---
const currentConfig = { ...config };
if (currentConfig.dialect === 'sqlite' && currentConfig.storage && currentConfig.storage !== ':memory:' && !path.isAbsolute(currentConfig.storage)) {
  currentConfig.storage = path.join(process.cwd(), currentConfig.storage);
  console.log(`[DB Index] Resolved SQLite path for env '${env}': ${currentConfig.storage}`);
} else if (currentConfig.dialect === 'sqlite') {
    console.log(`[DB Index] Using SQLite path for env '${env}': ${currentConfig.storage}`);
}

// --- Create Sequelize Instance ---
console.log(`[DB Index] Creating Sequelize instance for env '${env}'...`);
const sequelize = new Sequelize(currentConfig);
console.log(`[DB Index] Sequelize instance created.`);

// --- Import and Initialize Models ---
// Import initializer functions and call them with the sequelize instance
import { initializeDepartment } from '@/modules/organization/models/Department';
const Department = initializeDepartment(sequelize);

import { initializeEmployee } from '@/modules/employees/models/Employee';
const Employee = initializeEmployee(sequelize);

import { initializeAttendance } from '@/modules/attendance/models/Attendance';
const Attendance = initializeAttendance(sequelize);

import { initializeLeave } from '@/modules/leave/models/Leave';
const Leave = initializeLeave(sequelize);

import { initializeLeaveBalance } from '@/modules/leave/models/LeaveBalance';
const LeaveBalance = initializeLeaveBalance(sequelize);

import { initializeUser } from '@/modules/auth/models/User';
const User = initializeUser(sequelize);

import { initializeCompliance } from '@/modules/compliance/models/Compliance';
const Compliance = initializeCompliance(sequelize);

import { initializeDocument } from '@/modules/documents/models/Document';
const Document = initializeDocument(sequelize);

import { initializePosition } from '@/modules/organization/models/Position';
const Position = initializePosition(sequelize);

import { initializeOffboarding } from '@/modules/offboarding/models/Offboarding';
const Offboarding = initializeOffboarding(sequelize);

import { initializeOnboardingTemplate } from '@/modules/onboarding/models/OnboardingTemplate';
const OnboardingTemplate = initializeOnboardingTemplate(sequelize);

import { initializeOnboardingTemplateItem } from '@/modules/onboarding/models/OnboardingTemplateItem';
const OnboardingTemplateItem = initializeOnboardingTemplateItem(sequelize);

import { initializeActivityLog } from '@/modules/logging/models/ActivityLog';
const ActivityLog = initializeActivityLog(sequelize);

import { initializeTaskTemplate } from '@/modules/offboarding/models/TaskTemplate';
const TaskTemplate = initializeTaskTemplate(sequelize);

import { initializeOffboardingTask } from '@/modules/offboarding/models/OffboardingTask';
const OffboardingTask = initializeOffboardingTask(sequelize);

import { initializeTask } from '@/modules/tasks/models/Task'; // Import Task initializer
const Task = initializeTask(sequelize); // Initialize Task

console.log(`[DB Index] Models initialized.`);

// --- Define Associations ---
// Call the static associate method on each model
const models = {
  Department,
  Employee,
  Attendance,
  Leave,
  LeaveBalance,
  User,
  Compliance,
  Document,
  Position,
  Offboarding,
  OnboardingTemplate,
  OnboardingTemplateItem,
  ActivityLog,
  TaskTemplate,
  OffboardingTask,
  Task, // Add Task model
};

Object.values(models).forEach((model: any) => {
  if (model.associate) {
    // Pass the full models object to each associate method
    model.associate(models);
  }
});
console.log(`[DB Index] Associations defined.`);


// --- Test Connection (Optional) ---
// async function testDbConnection() {
//   try {
//     await sequelize.authenticate();
//     console.log('[DB Index] Database connection has been established successfully.');
//   } catch (error) {
//     console.error('[DB Index] Unable to connect to the database:', error);
//   }
// }
// testDbConnection();


// --- Exports ---
// Export sequelize instance and initialized models
export {
  sequelize,
  User,
  Department,
  Employee,
  Attendance,
  Leave,
  LeaveBalance,
  Compliance,
  Document,
  Position,
  Offboarding,
  OnboardingTemplate,
  OnboardingTemplateItem,
  ActivityLog,
  TaskTemplate,
  OffboardingTask,
  Task, // Export Task model
};

// Optional: Export a 'db' object containing all models
const db = {
  sequelize,
  Sequelize, // Export Sequelize class itself if needed
  User,
  Department,
  Employee,
  Attendance,
  Leave,
  LeaveBalance,
  Compliance,
  Document,
  Position,
  Offboarding,
  OnboardingTemplate,
  OnboardingTemplateItem,
  ActivityLog,
  TaskTemplate,
  OffboardingTask,
  Task, // Add Task to db object
};

export default db;
console.log(`[DB Index] Module fully initialized and exported.`);