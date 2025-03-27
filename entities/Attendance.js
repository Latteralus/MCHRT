// entities/Attendance.js
import { EntitySchema } from "typeorm";

// Enum for attendance status
export const AttendanceStatus = {
  PRESENT: "Present",
  ABSENT: "Absent",
  LATE: "Late",
  HALF_DAY: "Half Day",
  WORK_FROM_HOME: "Work From Home",
  ON_LEAVE: "On Leave",
  HOLIDAY: "Holiday"
};

// Class definition for IntelliSense/typing
export class Attendance {
  id;
  employee;
  employeeId;
  date;
  timeIn;
  timeOut;
  status;
  notes;
  createdAt;
  updatedAt;
  totalHours;
}

// Entity Schema definition for TypeORM
export const AttendanceEntity = new EntitySchema({
  name: "Attendance",
  target: Attendance,
  tableName: "attendance_records",
  columns: {
    id: {
      primary: true,
      type: "uuid",
      generated: "uuid"
    },
    employeeId: {
      type: "uuid"
    },
    date: {
      type: "date"
    },
    timeIn: {
      type: "time",
      nullable: true
    },
    timeOut: {
      type: "time",
      nullable: true
    },
    status: {
      type: "enum",
      enum: Object.values(AttendanceStatus),
      default: AttendanceStatus.PRESENT
    },
    notes: {
      type: "varchar",
      nullable: true
    },
    totalHours: {
      type: "decimal",
      precision: 4,
      scale: 2,
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
    employee: {
      target: "Employee",
      type: "many-to-one",
      joinColumn: {
        name: "employeeId"
      },
      onDelete: "CASCADE"
    }
  },
  indices: [
    {
      name: "IDX_ATTENDANCE_EMPLOYEE_DATE",
      columns: ["employeeId", "date"],
      unique: true
    },
    {
      name: "IDX_ATTENDANCE_DATE",
      columns: ["date"]
    },
    {
      name: "IDX_ATTENDANCE_STATUS",
      columns: ["status"]
    }
  ]
});

// Helper function to calculate total hours
export const calculateTotalHours = (timeIn, timeOut) => {
  if (!timeIn || !timeOut) {
    return null;
  }
  
  // Parse time strings into Date objects
  const [inHours, inMinutes] = timeIn.split(':').map(Number);
  const [outHours, outMinutes] = timeOut.split(':').map(Number);
  
  const today = new Date();
  const inTime = new Date(today);
  inTime.setHours(inHours, inMinutes, 0);
  
  const outTime = new Date(today);
  outTime.setHours(outHours, outMinutes, 0);
  
  // Handle case where employee clocks out after midnight
  if (outTime < inTime) {
    outTime.setDate(outTime.getDate() + 1);
  }
  
  // Calculate difference in milliseconds
  const diffMs = outTime - inTime;
  
  // Convert to hours and round to 2 decimal places
  const diffHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
  
  return diffHours;
};

// Helper function to get attendance summary for a time period
export const getAttendanceSummary = async (employeeId, startDate, endDate, dbService) => {
  const attendanceRecords = await dbService.getAttendanceRecords({
    employeeId,
    startDate,
    endDate
  });
  
  const summary = {
    totalDays: 0,
    present: 0,
    absent: 0,
    late: 0,
    halfDay: 0,
    workFromHome: 0,
    onLeave: 0,
    holidays: 0,
    totalHoursWorked: 0
  };
  
  // Calculate the number of working days in the period
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (day.getDay() !== 0 && day.getDay() !== 6) {
      summary.totalDays++;
    }
  }
  
  // Process attendance records
  for (const record of attendanceRecords) {
    switch (record.status) {
      case AttendanceStatus.PRESENT:
        summary.present++;
        break;
      case AttendanceStatus.ABSENT:
        summary.absent++;
        break;
      case AttendanceStatus.LATE:
        summary.late++;
        break;
      case AttendanceStatus.HALF_DAY:
        summary.halfDay++;
        break;
      case AttendanceStatus.WORK_FROM_HOME:
        summary.workFromHome++;
        break;
      case AttendanceStatus.ON_LEAVE:
        summary.onLeave++;
        break;
      case AttendanceStatus.HOLIDAY:
        summary.holidays++;
        break;
    }
    
    if (record.totalHours) {
      summary.totalHoursWorked += parseFloat(record.totalHours);
    }
  }
  
  // Calculate attendance rate
  summary.attendanceRate = Math.round((summary.present + summary.workFromHome + summary.halfDay * 0.5) / 
    (summary.totalDays - summary.holidays) * 100) || 0;
  
  return summary;
};

export default AttendanceEntity;