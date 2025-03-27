// entities/Employee.js
import { EntitySchema } from "typeorm";

// Enum for employment status
export const EmploymentStatus = {
  ACTIVE: "Active",
  ONBOARDING: "Onboarding",
  ON_LEAVE: "On Leave",
  TERMINATED: "Terminated",
  SUSPENDED: "Suspended"
};

// Enum for employment type
export const EmploymentType = {
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  CONTRACT: "Contract",
  TEMPORARY: "Temporary",
  INTERN: "Intern"
};

// Class definition for IntelliSense/typing
export class Employee {
  id;
  firstName;
  lastName;
  email;
  phone;
  address;
  city;
  state;
  zipCode;
  dateOfBirth;
  socialSecurityNumber;
  emergencyContactName;
  emergencyContactPhone;
  emergencyContactRelationship;
  hireDate;
  terminationDate;
  status;
  employmentType;
  position;
  salary;
  hourlyRate;
  managerNotes;
  department;
  departmentId;
  manager;
  managerId;
  attendanceRecords;
  leaveRequests;
  complianceRecords;
  documents;
  createdAt;
  updatedAt;
  
  // Virtual property (not stored in DB)
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}

// Entity Schema definition for TypeORM
export const EmployeeEntity = new EntitySchema({
  name: "Employee",
  target: Employee,
  tableName: "employees",
  columns: {
    id: {
      primary: true,
      type: "uuid",
      generated: "uuid"
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
    phone: {
      type: "varchar",
      length: 20,
      nullable: true
    },
    address: {
      type: "varchar",
      nullable: true
    },
    city: {
      type: "varchar",
      nullable: true
    },
    state: {
      type: "varchar",
      length: 2,
      nullable: true
    },
    zipCode: {
      type: "varchar",
      length: 10,
      nullable: true
    },
    dateOfBirth: {
      type: "date",
      nullable: true
    },
    socialSecurityNumber: {
      type: "varchar",
      nullable: true,
      // We need to ensure this field is encrypted for HIPAA compliance
      // Using the transformer pattern would be best
      // This would be implemented in the real database implementation
    },
    emergencyContactName: {
      type: "varchar",
      nullable: true
    },
    emergencyContactPhone: {
      type: "varchar",
      nullable: true
    },
    emergencyContactRelationship: {
      type: "varchar",
      nullable: true
    },
    hireDate: {
      type: "date"
    },
    terminationDate: {
      type: "date",
      nullable: true
    },
    status: {
      type: "enum",
      enum: Object.values(EmploymentStatus),
      default: EmploymentStatus.ONBOARDING
    },
    employmentType: {
      type: "enum",
      enum: Object.values(EmploymentType),
      default: EmploymentType.FULL_TIME
    },
    position: {
      type: "varchar",
      length: 100
    },
    salary: {
      type: "decimal",
      precision: 10,
      scale: 2,
      default: 0
    },
    hourlyRate: {
      type: "decimal",
      precision: 5,
      scale: 2,
      nullable: true
    },
    managerNotes: {
      type: "varchar",
      nullable: true
    },
    departmentId: {
      type: "uuid",
      nullable: true
    },
    managerId: {
      type: "uuid",
      nullable: true
    },
    createdAt: {
      type: "timestamp",
      createDate: true
    },
    updatedAt: {
      type: "timestamp",
      updateDate: true
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
    },
    manager: {
      type: "many-to-one",
      target: "Employee",
      joinColumn: {
        name: "managerId"
      },
      nullable: true
    },
    attendanceRecords: {
      type: "one-to-many",
      target: "Attendance",
      inverseSide: "employee"
    },
    leaveRequests: {
      type: "one-to-many",
      target: "Leave",
      inverseSide: "employee"
    },
    complianceRecords: {
      type: "one-to-many",
      target: "Compliance",
      inverseSide: "employee"
    },
    documents: {
      type: "one-to-many",
      target: "Document",
      inverseSide: "employee"
    }
  },
  indices: [
    {
      name: "IDX_EMPLOYEE_EMAIL",
      columns: ["email"]
    },
    {
      name: "IDX_EMPLOYEE_DEPARTMENT",
      columns: ["departmentId"]
    },
    {
      name: "IDX_EMPLOYEE_STATUS",
      columns: ["status"]
    },
    {
      name: "IDX_EMPLOYEE_HIRE_DATE",
      columns: ["hireDate"]
    }
  ]
});

// Helper function to get sensitive employee data with proper access control
export const getSensitiveEmployeeData = (employee, userRole) => {
  const { socialSecurityNumber, salary, ...basicData } = employee;
  
  // Only admin and HR roles should see sensitive data
  if (userRole === 'Admin' || userRole === 'Manager') {
    return employee;
  }
  
  return basicData;
};

// Helper function to create a safe employee object (without sensitive data)
export const createSafeEmployee = (employee) => {
  if (!employee) return null;
  
  const { socialSecurityNumber, salary, hourlyRate, managerNotes, ...safeEmployee } = employee;
  return {
    ...safeEmployee,
    fullName: `${employee.firstName} ${employee.lastName}`
  };
};

export default EmployeeEntity;