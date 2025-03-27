import { AppDataSource } from "./db";
import bcrypt from "bcryptjs";
import User from "../entities/User";
import Department from "../entities/Department";
import Employee from "../entities/Employee";
import Attendance from "../entities/Attendance";
import Leave from "../entities/Leave";
import Compliance from "../entities/Compliance";
import Document from "../entities/Document";
import { format, subYears, subMonths, addDays } from "date-fns";

/**
 * Utility to seed the database with initial data for development
 */

// Initialize the database connection
const initializeDb = async () => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("Database connection initialized");
    }
    return AppDataSource;
  } catch (error) {
    console.error("Error initializing database connection:", error);
    throw error;
  }
};

// Seed departments
const seedDepartments = async () => {
  const departmentRepository = AppDataSource.getRepository(Department);
  
  // Check if departments already exist
  const count = await departmentRepository.count();
  if (count > 0) {
    console.log(`Skipping department seeding - ${count} departments already exist`);
    return;
  }
  
  // Create departments
  const departments = [
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
  
  for (const dept of departments) {
    const department = departmentRepository.create(dept);
    await departmentRepository.save(department);
  }
  
  console.log(`Created ${departments.length} departments`);
  return departmentRepository.find();
};

// Seed users
const seedUsers = async (departments) => {
  const userRepository = AppDataSource.getRepository(User);
  
  // Check if users already exist
  const count = await userRepository.count();
  if (count > 0) {
    console.log(`Skipping user seeding - ${count} users already exist`);
    return;
  }
  
  // Create admin user
  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  const itDepartment = departments.find(d => d.name === "Information Technology");
  
  const admin = userRepository.create({
    name: "System Administrator",
    email: "admin@mountaincare.com",
    passwordHash: adminPasswordHash,
    role: "admin",
    departmentId: itDepartment?.id
  });
  
  await userRepository.save(admin);
  
  // Create HR manager
  const hrPasswordHash = await bcrypt.hash("hr123", 10);
  const hrDepartment = departments.find(d => d.name === "Human Resources");
  
  const hrManager = userRepository.create({
    name: "Faith Calkins",
    email: "faith@mountaincare.com",
    passwordHash: hrPasswordHash,
    role: "hr_manager",
    departmentId: hrDepartment?.id
  });
  
  await userRepository.save(hrManager);
  
  // Create department managers
  const departmentManagers = [];
  
  for (const dept of departments) {
    if (dept.name !== "Human Resources") { // HR manager already created
      const managerPasswordHash = await bcrypt.hash("manager123", 10);
      const firstName = `${dept.name.split(' ')[0]} Manager`;
      const lastName = dept.name.split(' ').length > 1 ? dept.name.split(' ').slice(1).join(' ') : '';
      
      const deptManager = userRepository.create({
        name: `${firstName} ${lastName}`.trim(),
        email: `manager.${dept.name.toLowerCase().replace(/[^a-z0-9]/g, "")}@mountaincare.com`,
        passwordHash: managerPasswordHash,
        role: "department_manager",
        departmentId: dept.id
      });
      
      const savedManager = await userRepository.save(deptManager);
      departmentManagers.push({ manager: savedManager, department: dept });
    }
  }
  
  // Create regular employees (one for each department)
  const employeePasswordHash = await bcrypt.hash("employee123", 10);
  
  for (const dept of departments) {
    const employeeName = `Employee ${dept.name}`;
    const employeeEmail = `employee.${dept.name.toLowerCase().replace(/[^a-z0-9]/g, "")}@mountaincare.com`;
    
    const employee = userRepository.create({
      name: employeeName,
      email: employeeEmail,
      passwordHash: employeePasswordHash,
      role: "employee",
      departmentId: dept.id
    });
    
    await userRepository.save(employee);
  }
  
  console.log(`Created users: 1 admin, 1 HR manager, ${departmentManagers.length} department managers, and ${departments.length} regular employees`);
  
  return { admin, hrManager, departmentManagers };
};

// Update departments with managers
const updateDepartmentManagers = async (departmentManagers) => {
  const departmentRepository = AppDataSource.getRepository(Department);
  
  for (const { manager, department } of departmentManagers) {
    department.managerId = manager.id;
    await departmentRepository.save(department);
  }
  
  console.log("Updated departments with manager IDs");
};

// Seed employees
const seedEmployees = async (departments, users) => {
  const employeeRepository = AppDataSource.getRepository(Employee);
  const userRepository = AppDataSource.getRepository(User);
  
  // Check if employees already exist
  const count = await employeeRepository.count();
  if (count > 0) {
    console.log(`Skipping employee seeding - ${count} employees already exist`);
    return;
  }
  
  // Get all users except admin
  const allUsers = await userRepository.find();
  const nonAdminUsers = allUsers.filter(user => user.role !== "admin");
  
  // Create employee records for each user
  for (const user of nonAdminUsers) {
    // Find department for this user
    const department = departments.find(d => d.id === user.departmentId);
    if (!department) continue;
    
    // Generate a hire date between 1-5 years ago
    const yearsAgo = Math.floor(Math.random() * 5) + 1;
    const hireDate = subYears(new Date(), yearsAgo);
    
    // Set position based on role
    let position = "Staff Member";
    let employmentType = "full_time";
    let status = "active";
    
    if (user.role === "hr_manager") {
      position = "HR Director";
    } else if (user.role === "department_manager") {
      position = `${department.name} Manager`;
    }
    
    // Extract first and last name
    const nameParts = user.name.split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
    
    // Create employee
    const salary = position.includes("Manager") ? 
      Math.round(85000 + Math.random() * 40000) : 
      Math.round(50000 + Math.random() * 30000);
    
    const employee = employeeRepository.create({
      firstName,
      lastName,
      email: user.email,
      phone: `555-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
      address: `${Math.floor(100 + Math.random() * 9900)} Main St`,
      city: "Seattle",
      state: "WA",
      zipCode: "98101",
      hireDate,
      status,
      employmentType,
      position,
      salary,
      department: { id: department.id }
    });
    
    const savedEmployee = await employeeRepository.save(employee);
    
    // Link employee to user
    user.employee = { id: savedEmployee.id };
    await userRepository.save(user);
  }
  
  console.log(`Created ${nonAdminUsers.length} employee records`);
};

// Seed attendance records
const seedAttendance = async () => {
  const attendanceRepository = AppDataSource.getRepository(Attendance);
  const employeeRepository = AppDataSource.getRepository(Employee);
  
  // Check if attendance records already exist
  const count = await attendanceRepository.count();
  if (count > 0) {
    console.log(`Skipping attendance seeding - ${count} records already exist`);
    return;
  }
  
  // Get all active employees
  const employees = await employeeRepository.find({
    where: { status: "active" }
  });
  
  // Create attendance records for the last 7 days
  const records = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Skip weekends (Saturday and Sunday)
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;
    
    for (const employee of employees) {
      // Random time variations for realistic data
      const hourVariation = Math.random() * 0.5 - 0.25; // -15 to +15 minutes
      const timeIn = new Date(date);
      timeIn.setHours(8 + hourVariation, Math.round(Math.random() * 59), 0);
      
      const timeOut = new Date(date);
      // Some employees might still be at work today
      const hasTimeOut = i > 0 || (today.getHours() >= 17);
      
      if (hasTimeOut) {
        timeOut.setHours(17 + hourVariation, Math.round(Math.random() * 59), 0);
      } else {
        timeOut.setHours(0, 0, 0); // No time out yet
      }
      
      const attendance = attendanceRepository.create({
        employee: { id: employee.id },
        date: date,
        timeIn: hasTimeOut ? timeIn : null,
        timeOut: hasTimeOut ? timeOut : null,
        status: "present",
        notes: ""
      });
      
      records.push(attendance);
    }
  }
  
  await attendanceRepository.save(records);
  console.log(`Created ${records.length} attendance records`);
};

// Seed leave requests
const seedLeave = async () => {
  const leaveRepository = AppDataSource.getRepository(Leave);
  const employeeRepository = AppDataSource.getRepository(Employee);
  const userRepository = AppDataSource.getRepository(User);
  
  // Check if leave requests already exist
  const count = await leaveRepository.count();
  if (count > 0) {
    console.log(`Skipping leave request seeding - ${count} records already exist`);
    return;
  }
  
  // Get all active employees
  const employees = await employeeRepository.find({
    where: { status: "active" }
  });
  
  // Get HR manager for approvals
  const hrManager = await userRepository.findOne({
    where: { role: "hr_manager" },
    relations: ['employee']
  });
  
  // Create different types of leave requests
  const leaveTypes = ['vacation', 'sick', 'personal', 'bereavement', 'maternity/paternity'];
  const statusTypes = ['pending', 'approved', 'rejected'];
  
  const leaveRequests = [];
  
  // Past approved leaves
  for (let i = 0; i < 5; i++) {
    const employee = employees[Math.floor(Math.random() * employees.length)];
    const leaveType = leaveTypes[Math.floor(Math.random() * leaveTypes.length)];
    
    // Random date in last 3 months
    const startDate = subMonths(new Date(), Math.floor(Math.random() * 3) + 1);
    startDate.setDate(Math.floor(Math.random() * 20) + 1); // Random day of month
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + Math.floor(Math.random() * 5) + 1); // 1-5 days
    
    const leaveRequest = leaveRepository.create({
      employee: { id: employee.id },
      leaveType,
      startDate,
      endDate,
      status: 'approved',
      reason: `${leaveType.charAt(0).toUpperCase() + leaveType.slice(1)} leave`,
      requestDate: subDays(startDate, 14), // Requested 2 weeks before
      approver: hrManager ? { id: hrManager.employee.id } : null,
      approvalDate: subDays(startDate, 7) // Approved 1 week before
    });
    
    leaveRequests.push(leaveRequest);
  }
  
  // Future pending leaves
  for (let i = 0; i < 3; i++) {
    const employee = employees[Math.floor(Math.random() * employees.length)];
    const leaveType = leaveTypes[Math.floor(Math.random() * leaveTypes.length)];
    
    // Random date in next 3 months
    const startDate = addDays(new Date(), Math.floor(Math.random() * 60) + 15); // 15-75 days in future
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + Math.floor(Math.random() * 5) + 1); // 1-5 days
    
    const leaveRequest = leaveRepository.create({
      employee: { id: employee.id },
      leaveType,
      startDate,
      endDate,
      status: 'pending',
      reason: `Future ${leaveType} leave`,
      requestDate: new Date() // Requested today
    });
    
    leaveRequests.push(leaveRequest);
  }
  
  await leaveRepository.save(leaveRequests);
  console.log(`Created ${leaveRequests.length} leave requests`);
};

// Seed compliance records
const seedCompliance = async () => {
  const complianceRepository = AppDataSource.getRepository(Compliance);
  const employeeRepository = AppDataSource.getRepository(Employee);
  const userRepository = AppDataSource.getRepository(User);
  
  // Check if compliance records already exist
  const count = await complianceRepository.count();
  if (count > 0) {
    console.log(`Skipping compliance seeding - ${count} records already exist`);
    return;
  }
  
  // Get all active employees
  const employees = await employeeRepository.find({
    where: { status: "active" }
  });
  
  // Get HR manager for verifications
  const hrManager = await userRepository.findOne({
    where: { role: "hr_manager" },
    relations: ['employee']
  });
  
  // Common compliance types
  const complianceTypes = [
    { type: "HIPAA Training", isHIPAASensitive: true },
    { type: "CPR Certification", isHIPAASensitive: false },
    { type: "Professional License", isHIPAASensitive: false },
    { type: "Annual Health Screening", isHIPAASensitive: true },
    { type: "Drug Testing", isHIPAASensitive: true },
    { type: "Safety Training", isHIPAASensitive: false },
    { type: "Background Check", isHIPAASensitive: true }
  ];
  
  const complianceRecords = [];
  
  // Create some compliance records for each employee
  for (const employee of employees) {
    // Add 1-3 random compliance records per employee
    const numRecords = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < numRecords; i++) {
      // Pick a random compliance type
      const complianceInfo = complianceTypes[Math.floor(Math.random() * complianceTypes.length)];
      
      // Generate issue date between 6 months and 2 years ago
      const monthsAgo = Math.floor(Math.random() * 18) + 6;
      const issuedDate = subMonths(new Date(), monthsAgo);
      
      // Generate expiration date between now and 1 year from now
      const daysInFuture = Math.floor(Math.random() * 365) + 1;
      const expirationDate = addDays(new Date(), daysInFuture);
      
      // Create verification date shortly after issue date
      const verificationDate = addDays(issuedDate, Math.floor(Math.random() * 14) + 1);
      
      // Create a license/certification number
      const licenseNumber = `${complianceInfo.type.substring(0, 3).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`;
      
      // Create compliance record
      const compliance = complianceRepository.create({
        employee: { id: employee.id },
        licenseType: complianceInfo.type,
        licenseNumber,
        issuedDate,
        expirationDate,
        status: "active",
        isHIPAASensitive: complianceInfo.isHIPAASensitive,
        reminderSent: false,
        lastVerificationDate: verificationDate,
        verifiedBy: hrManager ? hrManager.name : "System Administrator", 
        verifierId: hrManager ? hrManager.id : null,
        notes: `Standard ${complianceInfo.type} certification`
      });
      
      complianceRecords.push(compliance);
    }
  }
  
  // Create some expired records for testing reminders
  for (let i = 0; i < 3; i++) {
    const employee = employees[Math.floor(Math.random() * employees.length)];
    const complianceInfo = complianceTypes[Math.floor(Math.random() * complianceTypes.length)];
    
    // Generate expired date in the past
    const daysAgo = Math.floor(Math.random() * 30) + 1;
    const expirationDate = subDays(new Date(), daysAgo);
    
    // Issue date a year before expiration
    const issuedDate = subYears(expirationDate, 1);
    
    // Create verification date shortly after issue date
    const verificationDate = addDays(issuedDate, Math.floor(Math.random() * 14) + 1);
    
    // Create a license/certification number
    const licenseNumber = `${complianceInfo.type.substring(0, 3).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`;
    
    // Create compliance record
    const compliance = complianceRepository.create({
      employee: { id: employee.id },
      licenseType: complianceInfo.type,
      licenseNumber,
      issuedDate,
      expirationDate,
      status: "expired",
      isHIPAASensitive: complianceInfo.isHIPAASensitive,
      reminderSent: true,
      lastVerificationDate: verificationDate,
      verifiedBy: hrManager ? hrManager.name : "System Administrator", 
      verifierId: hrManager ? hrManager.id : null,
      notes: `Expired ${complianceInfo.type} certification`
    });
    
    complianceRecords.push(compliance);
  }
  
  // Create some about-to-expire records (next 30 days)
  for (let i = 0; i < 3; i++) {
    const employee = employees[Math.floor(Math.random() * employees.length)];
    const complianceInfo = complianceTypes[Math.floor(Math.random() * complianceTypes.length)];
    
    // Generate expiration date in the next 30 days
    const daysInFuture = Math.floor(Math.random() * 30) + 1;
    const expirationDate = addDays(new Date(), daysInFuture);
    
    // Issue date a year before expiration
    const issuedDate = subYears(expirationDate, 1);
    
    // Create verification date shortly after issue date
    const verificationDate = addDays(issuedDate, Math.floor(Math.random() * 14) + 1);
    
    // Create a license/certification number
    const licenseNumber = `${complianceInfo.type.substring(0, 3).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`;
    
    // Create compliance record
    const compliance = complianceRepository.create({
      employee: { id: employee.id },
      licenseType: complianceInfo.type,
      licenseNumber,
      issuedDate,
      expirationDate,
      status: "active",
      isHIPAASensitive: complianceInfo.isHIPAASensitive,
      reminderSent: daysInFuture < 15, // Reminder sent if expiring within 15 days
      lastVerificationDate: verificationDate,
      verifiedBy: hrManager ? hrManager.name : "System Administrator", 
      verifierId: hrManager ? hrManager.id : null,
      notes: `${complianceInfo.type} expires soon`
    });
    
    complianceRecords.push(compliance);
  }
  
  await complianceRepository.save(complianceRecords);
  console.log(`Created ${complianceRecords.length} compliance records`);
};

// Seed documents
const seedDocuments = async () => {
  const documentRepository = AppDataSource.getRepository(Document);
  const userRepository = AppDataSource.getRepository(User);
  const departmentRepository = AppDataSource.getRepository(Department);
  
  // Check if documents already exist
  const count = await documentRepository.count();
  if (count > 0) {
    console.log(`Skipping document seeding - ${count} documents already exist`);
    return;
  }
  
  // Get HR manager
  const hrManager = await userRepository.findOne({
    where: { role: "hr_manager" }
  });
  
  // Get departments
  const departments = await departmentRepository.find();
  
  const documents = [
    // Company-wide documents
    {
      title: "Employee Handbook",
      filePath: "/documents/employee-handbook-2023.pdf",
      version: "2.1",
      owner: hrManager,
      department: null, // Available to all departments
      tags: ["policies", "handbook", "hr"],
      isPublic: true
    },
    {
      title: "HIPAA Compliance Guidelines",
      filePath: "/documents/hipaa-guidelines.pdf",
      version: "1.3",
      owner: hrManager,
      department: null, // Available to all departments
      tags: ["hipaa", "compliance", "privacy"],
      isPublic: true
    },
    {
      title: "Benefits Overview",
      filePath: "/documents/benefits-overview.pdf",
      version: "2023.1",
      owner: hrManager,
      department: null, // Available to all departments
      tags: ["benefits", "hr", "insurance"],
      isPublic: true
    },
    
    // Department-specific documents
    ...departments.map(dept => ({
      title: `${dept.name} Department Procedures`,
      filePath: `/documents/${dept.name.toLowerCase().replace(/\s+/g, "-")}-procedures.pdf`,
      version: "1.0",
      owner: hrManager,
      department: dept,
      tags: ["procedures", "department", dept.name.toLowerCase()],
      isPublic: false
    }))
  ];
  
  for (const doc of documents) {
    const document = documentRepository.create({
      title: doc.title,
      filePath: doc.filePath,
      version: doc.version,
      owner: doc.owner ? { id: doc.owner.id } : null,
      department: doc.department ? { id: doc.department.id } : null,
      tags: doc.tags,
      isPublic: doc.isPublic,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await documentRepository.save(document);
  }
  
  console.log(`Created ${documents.length} documents`);
};

// Run the seeding process
const runSeed = async () => {
  try {
    const dataSource = await initializeDb();
    
    // Seed in order of dependencies
    const departments = await seedDepartments();
    const users = await seedUsers(departments);
    
    // Update departments with manager IDs if needed
    if (users?.departmentManagers?.length > 0) {
      await updateDepartmentManagers(users.departmentManagers);
    }
    
    await seedEmployees(departments, users);
    await seedAttendance();
    await seedLeave();
    await seedCompliance();
    await seedDocuments();
    
    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    // Close the connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
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