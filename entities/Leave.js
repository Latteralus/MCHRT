// entities/Leave.js
import { EntitySchema } from "typeorm";

// Enum for leave types
export const LeaveType = {
  VACATION: "Vacation",
  SICK: "Sick",
  PERSONAL: "Personal",
  BEREAVEMENT: "Bereavement",
  JURY_DUTY: "Jury Duty",
  MATERNITY: "Maternity",
  PATERNITY: "Paternity",
  UNPAID: "Unpaid",
  OTHER: "Other"
};

// Enum for leave status
export const LeaveStatus = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed"
};

// Class definition for IntelliSense/typing
export class Leave {
  id;
  startDate;
  endDate;
  leaveType;
  status;
  reason;
  totalDays;
  employee;
  employeeId;
  approvedBy;
  approvedById;
  approvedAt;
  approverNotes;
  createdAt;
  updatedAt;
  attachments;
  isFirstDayHalf;
  isLastDayHalf;
}

// Entity Schema definition for TypeORM
export const LeaveEntity = new EntitySchema({
  name: "Leave",
  target: Leave,
  tableName: "leave_requests",
  columns: {
    id: {
      primary: true,
      type: "uuid",
      generated: "uuid"
    },
    startDate: {
      type: "date"
    },
    endDate: {
      type: "date"
    },
    leaveType: {
      type: "enum",
      enum: Object.values(LeaveType),
      default: LeaveType.VACATION
    },
    status: {
      type: "enum",
      enum: Object.values(LeaveStatus),
      default: LeaveStatus.PENDING
    },
    reason: {
      type: "varchar",
      nullable: true
    },
    totalDays: {
      type: "decimal",
      precision: 4,
      scale: 2,
      default: 1
    },
    employeeId: {
      type: "uuid"
    },
    approvedById: {
      type: "uuid",
      nullable: true
    },
    approvedAt: {
      type: "timestamp",
      nullable: true
    },
    approverNotes: {
      type: "varchar",
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
    attachments: {
      type: "varchar",
      nullable: true
    },
    isFirstDayHalf: {
      type: "boolean",
      default: false
    },
    isLastDayHalf: {
      type: "boolean",
      default: false
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
    approvedBy: {
      type: "many-to-one",
      target: "User",
      joinColumn: {
        name: "approvedById"
      },
      nullable: true
    }
  },
  indices: [
    {
      name: "IDX_LEAVE_EMPLOYEE",
      columns: ["employeeId"]
    },
    {
      name: "IDX_LEAVE_STATUS",
      columns: ["status"]
    },
    {
      name: "IDX_LEAVE_DATES",
      columns: ["startDate", "endDate"]
    }
  ]
});

// Helper function to calculate the total days
export const calculateLeaveDays = (startDate, endDate, isFirstDayHalf = false, isLastDayHalf = false) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Calculate difference in days
  const diffTime = Math.abs(end - start);
  let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
  
  // Adjust for half days
  if (isFirstDayHalf) {
    diffDays -= 0.5;
  }
  
  if (isLastDayHalf) {
    diffDays -= 0.5;
  }
  
  return diffDays;
};

// Helper function to check if a leave request conflicts with existing requests
export const checkLeaveConflict = async (employeeId, startDate, endDate, leaveId = null, dbService) => {
  // Get all active leave requests for the employee
  const existingLeaves = await dbService.getLeaveRequests({
    employeeId,
    status: [LeaveStatus.APPROVED, LeaveStatus.PENDING]
  });
  
  // If updating an existing leave, exclude it from conflict check
  const relevantLeaves = leaveId 
    ? existingLeaves.filter(leave => leave.id !== leaveId)
    : existingLeaves;
  
  // Convert string dates to Date objects
  const newStartDate = new Date(startDate);
  const newEndDate = new Date(endDate);
  
  // Check for date overlaps
  for (const leave of relevantLeaves) {
    const leaveStartDate = new Date(leave.startDate);
    const leaveEndDate = new Date(leave.endDate);
    
    // Check if dates overlap
    if (
      (newStartDate <= leaveEndDate && newStartDate >= leaveStartDate) ||
      (newEndDate <= leaveEndDate && newEndDate >= leaveStartDate) ||
      (newStartDate <= leaveStartDate && newEndDate >= leaveEndDate)
    ) {
      return {
        conflict: true,
        conflictingLeave: leave
      };
    }
  }
  
  return { conflict: false };
};

export default LeaveEntity;