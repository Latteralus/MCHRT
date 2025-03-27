// entities/Document.js
import { EntitySchema } from "typeorm";

// Enum for document types
export const DocumentType = {
  EMPLOYEE_RECORD: "employee_record",
  POLICY: "policy",
  CONTRACT: "contract",
  HANDBOOK: "handbook",
  LICENSE: "license",
  CERTIFICATION: "certification",
  MEDICAL: "medical",
  PERFORMANCE_REVIEW: "performance_review",
  TAX_FORM: "tax_form",
  TRAINING: "training",
  OTHER: "other"
};

// Enum for document access levels
export const DocumentAccessLevel = {
  PUBLIC: "public",           // All employees can view
  DEPARTMENT: "department",   // Only department members and above
  MANAGER: "manager",         // Only managers and above
  HR: "hr",                   // Only HR staff and admins
  ADMIN: "admin",             // Only admins
  INDIVIDUAL: "individual"    // Only the specific employee
};

// Entity Schema definition for TypeORM
const Document = new EntitySchema({
  name: "Document",
  tableName: "documents",
  columns: {
    id: {
      primary: true,
      type: "uuid",
      generated: "uuid"
    },
    title: {
      type: "varchar",
      length: 255
    },
    description: {
      type: "text",
      nullable: true
    },
    documentType: {
      type: "enum",
      enum: Object.values(DocumentType),
      default: DocumentType.OTHER
    },
    accessLevel: {
      type: "enum",
      enum: Object.values(DocumentAccessLevel),
      default: DocumentAccessLevel.HR
    },
    fileName: {
      type: "varchar",
      length: 255
    },
    filePath: {
      type: "varchar",
      length: 512
    },
    fileSize: {
      type: "int",
      nullable: true
    },
    mimeType: {
      type: "varchar",
      length: 100,
      nullable: true
    },
    isEncrypted: {
      type: "boolean",
      default: false
    },
    isHIPAASensitive: {
      type: "boolean",
      default: false
    },
    version: {
      type: "int",
      default: 1
    },
    expirationDate: {
      type: "date",
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
    accessLog: {
      type: "json",
      nullable: true
    },
    retentionPeriod: {
      type: "int",
      default: 365 // Default to 1 year in days
    },
    scheduledDeletionDate: {
      type: "date",
      nullable: true
    },
    tags: {
      type: "simple-array",
      nullable: true
    },
    externalReference: {
      type: "varchar",
      length: 255,
      nullable: true
    },
    requiresAcknowledgment: {
      type: "boolean",
      default: false
    },
    acknowledgments: {
      type: "json",
      nullable: true
    }
  },
  relations: {
    employee: {
      type: "many-to-one",
      target: "Employee",
      joinColumn: {
        name: "employeeId"
      },
      nullable: true
    },
    department: {
      type: "many-to-one",
      target: "Department",
      joinColumn: {
        name: "departmentId"
      },
      nullable: true
    },
    uploadedBy: {
      type: "many-to-one",
      target: "User",
      joinColumn: {
        name: "uploadedById"
      }
    }
  },
  indices: [
    {
      name: "idx_document_type",
      columns: ["documentType"]
    },
    {
      name: "idx_document_access",
      columns: ["accessLevel"]
    },
    {
      name: "idx_document_employee",
      columns: ["employeeId"]
    },
    {
      name: "idx_document_department",
      columns: ["departmentId"]
    },
    {
      name: "idx_document_expiration",
      columns: ["expirationDate"]
    },
    {
      name: "idx_document_deletion",
      columns: ["scheduledDeletionDate"]
    }
  ]
});

export default Document;