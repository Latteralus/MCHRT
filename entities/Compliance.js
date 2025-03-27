// entities/Compliance.js
import { EntitySchema } from "typeorm";

const Compliance = new EntitySchema({
  name: "Compliance",
  tableName: "compliances",
  columns: {
    id: {
      primary: true,
      type: "uuid",
      generated: "uuid"
    },
    licenseType: {
      type: "varchar",
      length: 255
    },
    licenseNumber: {
      type: "varchar",
      length: 100,
      nullable: true
    },
    issueDate: {
      type: "date"
    },
    expirationDate: {
      type: "date"
    },
    status: {
      type: "varchar",
      length: 50,
      default: "valid"
    },
    notes: {
      type: "text",
      nullable: true
    },
    isHIPAASensitive: {
      type: "boolean",
      default: false
    },
    lastVerificationDate: {
      type: "date",
      nullable: true
    },
    verifiedBy: {
      type: "varchar",
      length: 255,
      nullable: true
    },
    attachmentPath: {
      type: "varchar",
      length: 512,
      nullable: true
    },
    reminderSent: {
      type: "boolean",
      default: false
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
    employee: {
      type: "many-to-one",
      target: "Employee",
      joinColumn: {
        name: "employeeId"
      },
      onDelete: "CASCADE"
    },
    department: {
      type: "many-to-one",
      target: "Department",
      joinColumn: {
        name: "departmentId"
      },
      nullable: true
    },
    verifier: {
      type: "many-to-one",
      target: "User",
      joinColumn: {
        name: "verifierId"
      },
      nullable: true
    }
  },
  indices: [
    {
      name: "idx_compliance_expiration",
      columns: ["expirationDate"]
    },
    {
      name: "idx_compliance_employee",
      columns: ["employeeId"]
    },
    {
      name: "idx_compliance_status",
      columns: ["status"]
    }
  ]
});

export default Compliance;