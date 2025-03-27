// entities/Department.js
import { EntitySchema } from "typeorm";

// Class definition for IntelliSense/typing
export class Department {
  id;
  name;
  description;
  manager;
  managerId;
  createdAt;
  updatedAt;
  employees;
  users;
  documents;
}

// Entity Schema definition for TypeORM
export const DepartmentEntity = new EntitySchema({
  name: "Department",
  target: Department,
  tableName: "departments",
  columns: {
    id: {
      primary: true,
      type: "uuid",
      generated: "uuid"
    },
    name: {
      type: "varchar",
      length: 100,
      unique: true
    },
    description: {
      type: "varchar",
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
    manager: {
      type: "many-to-one",
      target: "Employee",
      joinColumn: {
        name: "managerId"
      },
      nullable: true
    },
    employees: {
      type: "one-to-many",
      target: "Employee",
      inverseSide: "department"
    },
    users: {
      type: "one-to-many",
      target: "User",
      inverseSide: "department"
    },
    documents: {
      type: "one-to-many",
      target: "Document",
      inverseSide: "department"
    }
  },
  indices: [
    {
      name: "IDX_DEPARTMENT_NAME",
      columns: ["name"],
      unique: true
    },
    {
      name: "IDX_DEPARTMENT_MANAGER",
      columns: ["managerId"]
    }
  ]
});

// Helper function to get department details with employee count
export const getDepartmentWithEmployeeCount = async (department, dbService) => {
  if (!department) return null;
  
  const employees = await dbService.getEmployees({ departmentId: department.id });
  
  return {
    ...department,
    employeeCount: employees.length
  };
};

export default DepartmentEntity;