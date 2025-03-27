MCHR/
├── components/
│   ├── common/
│   │   ├── Layout.jsx               // General layout (header, sidebar)
│   │   ├── Navbar.jsx               // Top navigation bar
│   │   └── Sidebar.jsx               // Sidebar component
│   ├── auth/
│   │   └── AuthProvider.jsx         // React Context for session data
│   ├── dashboard/
│   │   ├── StatCard.jsx             // Reusable stats card
│   │   └── DashboardGrid.jsx        // Dashboard layout
│   ├── employee/
│   │   ├── EmployeeList.jsx         // List of employees with filtering and sorting
│   │   ├── EmployeeProfile.jsx      // Employee details display
│   │   └── EmployeeForm.jsx         // Form for adding/editing employees
│   ├── attendance/                  // NEW SECTION
│   │   ├── AttendanceLog.jsx        // List view of attendance records
│   │   └── AttendanceCalendar.jsx   // Calendar view of attendance records
│   ├── leave/
│   │   ├── LeaveRequestForm.jsx
│   │   ├── LeaveList.jsx
│   │   └── LeaveCalendar.jsx
│   ├── compliance/
│   │   └── ComplianceCard.jsx
│   ├── onboarding/
│   │   └── OnboardingChecklist.jsx
│   └── documents/
│       └── DocumentManager.jsx
│
├── pages/
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth].js     // NextAuth config
│   │   ├── employees/
│   │   │   ├── index.js             // GET, POST
│   │   │   └── [id].js              // GET, PUT, DELETE
│   │   ├── departments/             // Department API routes
│   │   │   ├── index.js             // GET, POST
│   │   │   └── [id].js              // GET, PUT, DELETE
│   │   ├── attendance/              // NEW SECTION
│   │   │   ├── index.js             // GET, POST
│   │   │   └── [id].js              // GET, PUT, DELETE
│   │   ├── leave.js
│   │   ├── onboarding.js
│   │   ├── compliance.js
│   │   └── documents.js
│   │
│   ├── _app.js                      // Global wrapper (includes AuthProvider, global CSS)
│   ├── index.js                     // Dashboard homepage
│   ├── login.js                     // Public login route
│   ├── employees/
│   │   ├── index.js                 // Employee management overview
│   │   ├── [id].js                  // Individual employee profile
│   │   └── new.js                   // Create new employee
│   │   └── [id]/edit.js              // Edit employee page
│   ├── attendance/                  // NEW SECTION
│   │   ├── index.js                 // Attendance management page
│   │   └── [id].js                  // Edit attendance record
│   ├── leave.js
│   ├── onboarding.js
│   ├── compliance.js
│   ├── documents.js
│   ├── settings.js
│   └── reports.js
│
├── entities/
│   ├── User.js                      // TypeORM entity definitions using EntitySchema
│   ├── Employee.js
│   ├── Department.js
│   ├── Attendance.js                // NEW FILE
│   ├── Leave.js
│   ├── Compliance.js
│   └── Document.js
├── utils/
│   ├── db.js                        // Database connection utility
│   ├── apiHandler.js                // API route wrapper with error handling
│   ├── migration.js                 // Migration utility
│   └── seed.js                      // Database seeding utility
├── public/
│   └── images/
├── styles/
│   ├── globals.css
│   └── <module-specific>.module.css
├── .env.local.template              // NEW FILE - Template for environment variables
├── tsconfig.json                    // TypeScript configuration
├── next.config.js
├── package.json
├── DevDocuments/Checklist.md                     // Updated project checklist
└── README.md                        // Setup and development instructions