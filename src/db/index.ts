import { sequelize, testConnection } from './mockDbSetup'; // Import the initialized instance

// Import all models
import User from '@/modules/auth/models/User';
import Department from '@/modules/organization/models/Department';
import Employee from '@/modules/employees/models/Employee';
import Attendance from '@/modules/attendance/models/Attendance';
import Leave from '@/modules/leave/models/Leave';
import Compliance from '@/modules/compliance/models/Compliance';
import Document from '@/modules/documents/models/Document';

// Define an object to hold all models
const models = {
  User,
  Department,
  Employee,
  Attendance,
  Leave,
  Compliance,
  Document,
};

// Import and call the association definition function
import { defineAssociations } from './associations';
defineAssociations(); // Ensure associations are set up

// Optional: Test connection on startup (can be removed in production)
// testConnection();

// Export the sequelize instance and all models
export { sequelize, models, testConnection };

// Export models individually for easier direct import if preferred
export {
  User,
  Department,
  Employee,
  Attendance,
  Leave,
  Compliance,
  Document,
};