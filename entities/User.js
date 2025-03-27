// entities/User.js
import { EntitySchema } from "typeorm";

// Enum for user roles - updated to match our application needs
export const UserRole = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  EMPLOYEE: "Employee"
};

// Class definition for IntelliSense/typing
export class User {
  id;
  username;
  firstName;
  lastName;
  email;
  passwordHash;
  role;
  department;
  departmentId;
  lastLogin;
  createdAt;
  updatedAt;
  resetPasswordToken;
  resetPasswordExpires;
  isActive;
}

// Entity Schema definition for TypeORM
export const UserEntity = new EntitySchema({
  name: "User",
  target: User,
  tableName: "users",
  columns: {
    id: {
      primary: true,
      type: "uuid",
      generated: "uuid"
    },
    username: {
      type: "varchar",
      length: 50,
      unique: true,
      nullable: true // Allow null during migration period
    },
    firstName: {
      type: "varchar",
      length: 100
    },
    lastName: {
      type: "varchar",
      length: 100
    },
    email: {
      type: "varchar",
      unique: true
    },
    passwordHash: {
      type: "varchar"
    },
    role: {
      type: "enum",
      enum: Object.values(UserRole),
      default: UserRole.EMPLOYEE
    },
    departmentId: {
      type: "uuid",
      nullable: true
    },
    lastLogin: {
      type: "timestamp",
      nullable: true
    },
    createdAt: {
      type: "timestamp",
      createDate: true
    },
    updatedAt: {
      type: "timestamp",
      updateDate: true
    },
    resetPasswordToken: {
      type: "varchar",
      nullable: true
    },
    resetPasswordExpires: {
      type: "timestamp",
      nullable: true
    },
    isActive: {
      type: "boolean",
      default: true
    }
  },
  relations: {
    department: {
      type: "many-to-one",
      target: "Department",
      joinColumn: {
        name: "departmentId"
      },
      nullable: true
    }
  },
  indices: [
    {
      name: "IDX_USER_EMAIL",
      columns: ["email"]
    },
    {
      name: "IDX_USER_USERNAME",
      columns: ["username"]
    },
    {
      name: "IDX_USER_DEPARTMENT",
      columns: ["departmentId"]
    }
  ]
});

// Helper function to get full name
export const getUserFullName = (user) => {
  return `${user.firstName} ${user.lastName}`;
};

// Helper function to create a safe user object (without sensitive data)
export const createSafeUser = (user) => {
  if (!user) return null;
  
  const { passwordHash, resetPasswordToken, resetPasswordExpires, ...safeUser } = user;
  return {
    ...safeUser,
    fullName: getUserFullName(user)
  };
};

export default UserEntity;