import { DataTypes, Model, Optional, Sequelize } from 'sequelize'; // Added Sequelize import
import type { DepartmentModelClass } from '@/modules/organization/models/Department'; // Import Department class type
import type { EmployeeModelClass } from '@/modules/employees/models/Employee'; // Import Employee class type
import type { LeaveModelClass } from '@/modules/leave/models/Leave'; // Import Leave class type
import type { DocumentModelClass } from '@/modules/documents/models/Document'; // Import Document class type
import type { ActivityLogModelClass } from '@/modules/logging/models/ActivityLog'; // Import ActivityLog class type
import type { OffboardingTaskModelClass } from '@/modules/offboarding/models/OffboardingTask'; // Import OffboardingTask class type

// Define the attributes for the User model
interface UserAttributes {
  id: number;
  username: string;
  passwordHash: string;
  role: string; // Consider using an enum later (e.g., 'Admin', 'DepartmentHead', 'Employee')
  departmentId?: number; // Foreign key, optional for some roles?
  createdAt?: Date;
  updatedAt?: Date;
}

// Define creation attributes (optional fields for creation)
export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt' | 'departmentId'> {} // Added export

// Define the User model class
class User extends Model<UserAttributes, UserCreationAttributes> { // Removed 'implements UserAttributes'
  // Attributes are defined and typed by UserAttributes and UserCreationAttributes
  // Public class fields are removed to avoid shadowing Sequelize's getters/setters
  // See: https://sequelize.org/main/manual/model-basics.html#caveat-with-public-class-fields

  // Timestamps are managed by Sequelize based on model options and DB schema
  // public readonly createdAt!: Date; // Removed
  // public readonly updatedAt!: Date; // Removed

  // Define associations
  public static associate(models: {
    Department: typeof DepartmentModelClass;
    Employee: typeof EmployeeModelClass;
    Leave: typeof LeaveModelClass;
    Document: typeof DocumentModelClass;
    ActivityLog: typeof ActivityLogModelClass;
    OffboardingTask: typeof OffboardingTaskModelClass;
    // Add other models as needed
  }) {
    // A User belongs to one Department
    User.belongsTo(models.Department, {
      foreignKey: 'departmentId',
      as: 'department', // Allows User.getDepartment()
    });
    // Optional: A User could manage a Department (inverse of Department.belongsTo(User, { as: 'manager' }))
    // User.hasOne(models.Department, { foreignKey: 'managerId', as: 'managedDepartment' });

    // A User might be linked to one Employee record
    User.hasOne(models.Employee, {
      foreignKey: 'userId',
      as: 'employeeProfile', // Allows User.getEmployeeProfile()
    });

    // Optional: A User can approve/reject multiple Leave records
    // User.hasMany(models.Leave, { foreignKey: 'approverId', as: 'approvedLeaves' });

    // Optional: A User can own multiple Documents
    // User.hasMany(models.Document, { foreignKey: 'ownerId', as: 'ownedDocuments' });

    // A User can perform many actions (logs)
    User.hasMany(models.ActivityLog, {
      foreignKey: 'userId',
      as: 'activityLogs', // Allows User.getActivityLogs()
    });

    // Optional: A User can be assigned multiple OffboardingTasks
    // User.hasMany(models.OffboardingTask, { foreignKey: 'assignedToUserId', as: 'assignedOffboardingTasks' });
  }
}

// Export an initializer function
export const initializeUser = (sequelize: Sequelize) => {
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      passwordHash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING, // Consider DataTypes.ENUM('Admin', 'DepartmentHead', 'Employee')
        allowNull: false,
      },
      departmentId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Allow null for roles like Admin? Or handle association differently.
        references: {
          model: 'Departments', // This assumes a 'Departments' table exists
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', // Or 'RESTRICT' depending on requirements
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize: sequelize, // Use the passed instance
      tableName: 'Users', // Explicitly define table name
      // Optional: Add indexes here if needed
      // indexes: [{ unique: true, fields: ['username'] }]
    }
  );

  return User; // Return the initialized model
};

// Export the class type itself if needed elsewhere
export { User as UserModelClass };