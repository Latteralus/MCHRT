// utils/seed.js
// Refactored to use dbService
import { dbService } from '@/utils/dbService'; // Use path alias
import bcrypt from "bcryptjs";
import { format, subYears, subMonths, addDays } from "date-fns";

/**
 * Utility to seed the database with initial data for development
 */

// NOTE: Database connection (initialize/destroy) is now managed internally by dbService or mockDb.
// No need for initializeDb or ensureDbConnected here.

// Seed departments
const seedDepartments = async () => {
  // Check if departments already exist using dbService
  const existingDepartments = await dbService.getDepartments();
  if (existingDepartments.length > 0) {
    console.log(`Skipping department seeding - ${existingDepartments.length} departments already exist`);
    return existingDepartments; // Return existing departments
  }

  // Create departments
  const departmentData = [
    { name: "Executive", description: "Leadership and strategic direction" },
    { name: "Human Resources", description: "Employee management and company culture" },
    { name: "Finance", description: "Financial planning and accounting" },
    { name: "Information Technology", description: "Technology infrastructure and support" },
    { name: "Operations", description: "Day-to-day business operations" },
    { name: "Marketing", description: "Brand management and marketing campaigns" },
    { name: "Sales", description: "Customer acquisition and account management" },
    { name: "Customer Support", description: "Customer service and support" },
    { name: "Legal", description: "Legal compliance and risk management" },
    { name: "Research & Development", description: "Product and service innovation" }
  ];

  const createdDepartments = [];
  for (const deptData of departmentData) {
    const createdDept = await dbService.createDepartment(deptData);
    createdDepartments.push(createdDept);
  }

  console.log(`Created ${createdDepartments.length} departments`);
  return createdDepartments;
};

// Seed users
const seedUsers = async (departments) => {
    const existingUsers = await dbService.getUsers();
    if (existingUsers.length > 0) {
        console.log(`Skipping user seeding - ${existingUsers.length} users already exist`);
        // Try to find key users if they exist
        const admin = existingUsers.find(u => u.email === "admin@mountaincare.com");
        const hrManager = existingUsers.find(u => u.email === "faith@mountaincare.com");
        // Finding department managers is more complex, skip for simplicity if seeding is skipped
        return { admin, hrManager, departmentManagers: [] };
    }


    // Hash passwords
    const adminPasswordHash = await bcrypt.hash("admin123", 10);
    const hrPasswordHash = await bcrypt.hash("hr123", 10);
    const managerPasswordHash = await bcrypt.hash("manager123", 10);
    const employeePasswordHash = await bcrypt.hash("employee123", 10);

    // Find specific departments by name
    const itDepartment = departments.find(d => d.name === "Information Technology");
    const hrDepartment = departments.find(d => d.name === "Human Resources");

    // Create admin user
    const adminData = {
        name: "System Administrator",
        email: "admin@mountaincare.com",
        username: "admin", // Added username
        passwordHash: adminPasswordHash,
        role: "admin",
        departmentId: itDepartment?.id // Use optional chaining
    };
    const admin = await dbService.createUser(adminData);

    // Create HR manager
    const hrManagerData = {
        name: "Faith Calkins",
        email: "faith@mountaincare.com",
        username: "fcalkins", // Added username
        passwordHash: hrPasswordHash,
        role: "hr_manager",
        departmentId: hrDepartment?.id
    };
    const hrManager = await dbService.createUser(hrManagerData);

    // Create department managers
    const departmentManagers = [];
    for (const dept of departments) {
        // Skip IT (admin is there) and HR (HR manager is there)
        if (dept.id === itDepartment?.id || dept.id === hrDepartment?.id) continue;

        const firstName = `${dept.name.split(' ')[0]} Manager`;
        const lastName = dept.name.split(' ').length > 1 ? dept.name.split(' ').slice(1).join(' ') : 'User';
        const usernameBase = `${firstName.charAt(0)}${lastName}`.toLowerCase().replace(/[^a-z0-9]/g, "");
        const email = `manager.${dept.name.toLowerCase().replace(/[^a-z0-9]/g, "")}@mountaincare.com`;

        const deptManagerData = {
            name: `${firstName} ${lastName}`.trim(),
            email: email,
            username: usernameBase || `manager${dept.id}`, // Ensure username exists
            passwordHash: managerPasswordHash,
            role: "department_manager",
            departmentId: dept.id
        };
        const savedManager = await dbService.createUser(deptManagerData);
        departmentManagers.push({ manager: savedManager, department: dept });
    }

    // Create regular employees (one for each department)
    for (const dept of departments) {
        const employeeName = `Employee ${dept.name}`;
        const email = `employee.${dept.name.toLowerCase().replace(/[^a-z0-9]/g, "")}@mountaincare.com`;
        const usernameBase = `emp${dept.name.toLowerCase().replace(/[^a-z0-9]/g, "")}`;

        const employeeUserData = {
            name: employeeName,
            email: email,
            username: usernameBase || `employee${dept.id}`, // Ensure username exists
            passwordHash: employeePasswordHash,
            role: "employee",
            departmentId: dept.id
        };
        await dbService.createUser(employeeUserData);
    }

    console.log(`Created users: 1 admin, 1 HR manager, ${departmentManagers.length} department managers, and ${departments.length} regular employees`);
    return { admin, hrManager, departmentManagers };
};


// Update departments with managers
const updateDepartmentManagers = async (departmentManagers) => {
    let updatedCount = 0;
    for (const { manager, department } of departmentManagers) {
        // Check if department needs update
        const currentDept = await dbService.getDepartmentById(department.id);
        if (currentDept && currentDept.managerId !== manager.id) {
            await dbService.updateDepartment(department.id, { managerId: manager.id });
            updatedCount++;
        }
    }
    if (updatedCount > 0) {
      console.log(`Updated ${updatedCount} departments with manager IDs`);
    } else {
      console.log("Department manager IDs seem up-to-date.");
    }
};

// Seed employees (linking to Users)
const seedEmployees = async (departments) => {
    const existingEmployees = await dbService.getEmployees();
    if (existingEmployees.length > 0) {
        console.log(`Skipping employee seeding - ${existingEmployees.length} employees already exist`);
        return;
    }

    // Get all users except admin
    const allUsers = await dbService.getUsers();
    const nonAdminUsers = allUsers.filter(user => user.role !== "admin");

    let createdCount = 0;
    for (const user of nonAdminUsers) {
        // Find department for this user
        const department = departments.find(d => d.id === user.departmentId);
        if (!department) {
            console.warn(`User ${user.id} (${user.email}) has invalid departmentId ${user.departmentId}. Skipping employee creation.`);
            continue;
        }

        // Check if employee already exists for this user email
        const existingEmpForUser = existingEmployees.find(emp => emp.email === user.email);
        if (existingEmpForUser) continue;

        // Generate hire date between 1-5 years ago
        const yearsAgo = Math.floor(Math.random() * 5) + 1;
        const hireDate = subYears(new Date(), yearsAgo);

        // Set position based on role
        let position = "Staff Member";
        if (user.role === "hr_manager") {
            position = "HR Director";
        } else if (user.role === "department_manager") {
            position = `${department.name} Manager`;
        }

        // Extract first and last name from user.name
        const nameParts = user.name.split(" ");
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : 'User'; // Default lastname

        const salary = position.includes("Manager") ?
          Math.round(85000 + Math.random() * 40000) :
          Math.round(50000 + Math.random() * 30000);

        const employeeData = {
            firstName,
            lastName,
            email: user.email,
            phone: `555-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
            address: `${Math.floor(100 + Math.random() * 9900)} Main St`,
            city: "Seattle",
            state: "WA",
            zipCode: "98101",
            hireDate,
            status: "active",
            employmentType: "full_time",
            position,
            salary,
            departmentId: department.id, // Pass ID directly
            userId: user.id // Link to user ID
        };

        const savedEmployee = await dbService.createEmployee(employeeData);
        createdCount++;

        // Link employee to user in User record using dbService
        // NOTE: dbService updateUser might not support linking relations directly like TypeORM.
        // This link might need to be established implicitly or via explicit relation fields if dbService handles it.
        // Assuming 'employeeId' exists on the user object managed by dbService:
        await dbService.updateUser(user.id, { employeeId: savedEmployee.id });

    }

    console.log(`Created ${createdCount} employee records`);
};

// Seed attendance records
const seedAttendance = async () => {
  const existingAttendance = await dbService.getAttendanceRecords();
  if (existingAttendance.length > 0) {
    console.log(`Skipping attendance seeding - ${existingAttendance.length} records already exist`);
    return;
  }

  const employees = await dbService.getEmployees({ status: "active" }); // Assuming filter works
  if (!employees || employees.length === 0) {
      console.warn("No active employees found to seed attendance for.");
      return;
  }

  const records = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip weekends

    for (const employee of employees) {
      const hourVariation = Math.random() * 0.5 - 0.25;
      const timeIn = new Date(date);
      timeIn.setHours(8 + hourVariation, Math.round(Math.random() * 59), 0);

      const timeOut = new Date(date);
      const hasTimeOut = i > 0 || (today.getHours() >= 17); // Only set timeOut if not today or if past 5 PM

      if (hasTimeOut) {
        timeOut.setHours(17 + hourVariation, Math.round(Math.random() * 59), 0);
      }

      const attendanceData = {
        employeeId: employee.id, // Pass ID
        date: date,
        timeIn: timeIn, // timeIn is always set for present days
        timeOut: hasTimeOut ? timeOut : null, // Null if no time out yet
        status: "present",
        notes: ""
      };
      // No need to call create here, batch later if dbService supports it, or create one by one
      records.push(attendanceData);
    }
  }

  let createdCount = 0;
  // Create records one by one using dbService
  for (const recordData of records) {
      try {
          await dbService.createAttendance(recordData);
          createdCount++;
      } catch (err) {
          // Handle potential conflicts (e.g., unique constraint) gracefully
          if (err.message.includes("already exists")) { // Adjust based on actual error
              console.warn(`Attendance record for employee ${recordData.employeeId} on ${recordData.date.toISOString().split('T')[0]} likely already exists. Skipping.`);
          } else {
              console.error(`Failed to create attendance record for employee ${recordData.employeeId}:`, err);
          }
      }
  }

  console.log(`Created ${createdCount} attendance records`);
};

// Seed leave requests
const seedLeave = async () => {
  const existingLeaves = await dbService.getLeaveRequests();
  if (existingLeaves.length > 0) {
    console.log(`Skipping leave request seeding - ${existingLeaves.length} records already exist`);
    return;
  }

  const employees = await dbService.getEmployees({ status: "active" });
   if (!employees || employees.length === 0) {
      console.warn("No active employees found to seed leave requests for.");
      return;
  }

  // Get HR manager's user record, then find corresponding employee record for approverId
  const hrUser = (await dbService.getUsers({ email: "faith@mountaincare.com" }))[0];
  let hrEmployeeId = null;
  if (hrUser) {
      const hrEmployee = (await dbService.getEmployees({ userId: hrUser.id }))[0]; // Assuming userId link exists
      if (hrEmployee) {
          hrEmployeeId = hrEmployee.id;
      } else {
          console.warn("HR Manager employee record not found, cannot set approver ID for leave requests.");
      }
  } else {
       console.warn("HR Manager user record not found, cannot set approver ID for leave requests.");
  }


  const leaveTypes = ['Vacation', 'Sick Leave', 'Personal', 'Bereavement', 'Maternity/Paternity']; // Match case used in mapping
  const leaveRequestsData = [];

  // Past approved leaves
  for (let i = 0; i < 5; i++) {
    const employee = employees[Math.floor(Math.random() * employees.length)];
    const leaveType = leaveTypes[Math.floor(Math.random() * leaveTypes.length)];
    const startDate = subMonths(new Date(), Math.floor(Math.random() * 3) + 1);
    startDate.setDate(Math.floor(Math.random() * 20) + 1);
    const endDate = addDays(startDate, Math.floor(Math.random() * 5) + 1);

    leaveRequestsData.push({
      employeeId: employee.id,
      leaveType,
      startDate,
      endDate,
      status: 'approved',
      reason: `${leaveType} leave`,
      requestDate: subDays(startDate, 14),
      approverId: hrEmployeeId, // Use the fetched HR employee ID
      approvalDate: subDays(startDate, 7)
    });
  }

  // Future pending leaves
  for (let i = 0; i < 3; i++) {
    const employee = employees[Math.floor(Math.random() * employees.length)];
    const leaveType = leaveTypes[Math.floor(Math.random() * leaveTypes.length)];
    const startDate = addDays(new Date(), Math.floor(Math.random() * 60) + 15);
    const endDate = addDays(startDate, Math.floor(Math.random() * 5) + 1);

    leaveRequestsData.push({
      employeeId: employee.id,
      leaveType,
      startDate,
      endDate,
      status: 'pending',
      reason: `Future ${leaveType} leave`,
      requestDate: new Date()
    });
  }

  let createdCount = 0;
  for (const reqData of leaveRequestsData) {
    await dbService.createLeave(reqData);
    createdCount++;
  }
  console.log(`Created ${createdCount} leave requests`);
};

// Seed compliance records
const seedCompliance = async () => {
  const existingCompliance = await dbService.getComplianceRecords();
  if (existingCompliance.length > 0) {
    console.log(`Skipping compliance seeding - ${existingCompliance.length} records already exist`);
    return;
  }

  const employees = await dbService.getEmployees({ status: "active" });
   if (!employees || employees.length === 0) {
      console.warn("No active employees found to seed compliance for.");
      return;
  }

  const hrUser = (await dbService.getUsers({ email: "faith@mountaincare.com" }))[0];
  const verifierName = hrUser ? hrUser.name : "System";
  const verifierId = hrUser ? hrUser.id : null; // Use User ID here as dbService might relate to User

  const complianceTypes = [
    { type: "HIPAA Training", isHIPAASensitive: true },
    { type: "CPR Certification", isHIPAASensitive: false },
    { type: "Professional License", isHIPAASensitive: false },
    { type: "Annual Health Screening", isHIPAASensitive: true },
    { type: "Drug Testing", isHIPAASensitive: true },
    { type: "Safety Training", isHIPAASensitive: false },
    { type: "Background Check", isHIPAASensitive: true }
  ];
  const complianceRecordsData = [];

  // Create active records
  for (const employee of employees) {
    const numRecords = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numRecords; i++) {
      const complianceInfo = complianceTypes[Math.floor(Math.random() * complianceTypes.length)];
      const monthsAgo = Math.floor(Math.random() * 18) + 6;
      const issuedDate = subMonths(new Date(), monthsAgo);
      const daysInFuture = Math.floor(Math.random() * 365) + 1;
      const expirationDate = addDays(new Date(), daysInFuture);
      const verificationDate = addDays(issuedDate, Math.floor(Math.random() * 14) + 1);
      const licenseNumber = `${complianceInfo.type.substring(0, 3).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`;

      complianceRecordsData.push({
        employeeId: employee.id,
        licenseType: complianceInfo.type,
        licenseNumber,
        issuedDate,
        expirationDate,
        status: "active",
        isHIPAASensitive: complianceInfo.isHIPAASensitive,
        reminderSent: false,
        lastVerificationDate: verificationDate,
        verifiedBy: verifierName,
        verifierId: verifierId, // Store User ID of verifier
        notes: `Standard ${complianceInfo.type} certification`
      });
    }
  }

  // Create expired records
  for (let i = 0; i < 3; i++) {
    const employee = employees[Math.floor(Math.random() * employees.length)];
    const complianceInfo = complianceTypes[Math.floor(Math.random() * complianceTypes.length)];
    const daysAgo = Math.floor(Math.random() * 30) + 1;
    const expirationDate = subDays(new Date(), daysAgo);
    const issuedDate = subYears(expirationDate, 1);
    const verificationDate = addDays(issuedDate, Math.floor(Math.random() * 14) + 1);
    const licenseNumber = `${complianceInfo.type.substring(0, 3).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`;

    complianceRecordsData.push({
      employeeId: employee.id,
      licenseType: complianceInfo.type,
      licenseNumber,
      issuedDate,
      expirationDate,
      status: "expired",
      isHIPAASensitive: complianceInfo.isHIPAASensitive,
      reminderSent: true,
      lastVerificationDate: verificationDate,
      verifiedBy: verifierName,
      verifierId: verifierId,
      notes: `Expired ${complianceInfo.type} certification`
    });
  }

    // Create about-to-expire records (next 30 days)
    for (let i = 0; i < 3; i++) {
        const employee = employees[Math.floor(Math.random() * employees.length)];
        const complianceInfo = complianceTypes[Math.floor(Math.random() * complianceTypes.length)];
        const daysInFuture = Math.floor(Math.random() * 30) + 1;
        const expirationDate = addDays(new Date(), daysInFuture);
        const issuedDate = subYears(expirationDate, 1);
        const verificationDate = addDays(issuedDate, Math.floor(Math.random() * 14) + 1);
        const licenseNumber = `${complianceInfo.type.substring(0, 3).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`;

        complianceRecordsData.push({
            employeeId: employee.id,
            licenseType: complianceInfo.type,
            licenseNumber,
            issuedDate,
            expirationDate,
            status: "active",
            isHIPAASensitive: complianceInfo.isHIPAASensitive,
            reminderSent: daysInFuture < 15,
            lastVerificationDate: verificationDate,
            verifiedBy: verifierName,
            verifierId: verifierId,
            notes: `${complianceInfo.type} expires soon`
        });
    }


  let createdCount = 0;
  for (const recordData of complianceRecordsData) {
    await dbService.createCompliance(recordData);
    createdCount++;
  }
  console.log(`Created ${createdCount} compliance records`);
};

// Seed documents
const seedDocuments = async () => {
  const existingDocs = await dbService.getDocuments();
  if (existingDocs.length > 0) {
    console.log(`Skipping document seeding - ${existingDocs.length} documents already exist`);
    return;
  }

  const hrUser = (await dbService.getUsers({ email: "faith@mountaincare.com" }))[0];
  const ownerId = hrUser ? hrUser.id : null; // Use User ID
  const departments = await dbService.getDepartments();

  const documentsData = [
    // Company-wide documents
    {
      title: "Employee Handbook",
      filePath: "/documents/employee-handbook-2023.pdf", // NOTE: filePath needs handling for cloud storage later
      version: "2.1",
      ownerId: ownerId,
      departmentId: null,
      tags: ["policies", "handbook", "hr"],
      isPublic: true,
      createdAt: new Date(), // Add creation timestamp
      updatedAt: new Date() // Add update timestamp
    },
    {
      title: "HIPAA Compliance Guidelines",
      filePath: "/documents/hipaa-guidelines.pdf",
      version: "1.3",
      ownerId: ownerId,
      departmentId: null,
      tags: ["hipaa", "compliance", "privacy"],
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: "Benefits Overview",
      filePath: "/documents/benefits-overview.pdf",
      version: "2023.1",
      ownerId: ownerId,
      departmentId: null,
      tags: ["benefits", "hr", "insurance"],
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // Department-specific documents
    ...departments.map(dept => ({
      title: `${dept.name} Department Procedures`,
      filePath: `/documents/${dept.name.toLowerCase().replace(/\s+/g, "-")}-procedures.pdf`,
      version: "1.0",
      ownerId: ownerId,
      departmentId: dept.id,
      tags: ["procedures", "department", dept.name.toLowerCase()],
      isPublic: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }))
  ];

  let createdCount = 0;
  for (const docData of documentsData) {
    await dbService.createDocument(docData);
    createdCount++;
  }
  console.log(`Created ${createdCount} documents`);
};

// Run the seeding process
const runSeed = async () => {
  try {
    console.log(`Starting database seeding... (Using ${dbService.isMockDb() ? 'Mock DB' : 'Real DB'})`);

    // Use mockDb reset if using mockDb
    if (dbService.isMockDb()) {
        await dbService.resetMockDb();
        console.log("Mock database reset.");
    }

    // Seed in order of dependencies
    const departments = await seedDepartments();
    const users = await seedUsers(departments);

    // Update departments with manager IDs if needed
    if (users?.departmentManagers?.length > 0) {
      await updateDepartmentManagers(users.departmentManagers);
    }

    await seedEmployees(departments); // Pass departments only
    await seedAttendance();
    await seedLeave();
    await seedCompliance();
    await seedDocuments();

    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    // No need to close connection - dbService or mockDb handles it.
    console.log("Seeding process finished.");
  }
};

// Run the seed function if this file is executed directly
if (require.main === module) {
  runSeed().catch(error => {
    console.error("Unhandled error during seeding:", error);
    process.exit(1);
  });
}

export default runSeed;