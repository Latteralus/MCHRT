# MVP Development Checklist

## Phase 1: Project Setup & Core Infrastructure
- [x] Initialize Next.js project with TypeScript
- [x] Set up project folder structure
- [x] Configure ESLint and Prettier
- [x] Create mock database (SQLite) configuration
- [x] Set up NextAuth with CredentialsProvider
- [x] Implement basic authentication (login page)
- [x] Create basic layout components (MainLayout, Sidebar) (TopBar removed)
- [ ] Set up core UI component library
- [x] Configure environment variables
- [x] Set up local filesystem for document storage

## Phase 2: Database Models & Core API Routes
- [x] Define User model with roles
- [x] Define Department model
- [x] Define Employee model with encryption for SSN (Encryption logic TBD)
- [x] Define Attendance model
- [x] Define Leave model
- [x] Define Compliance model
- [x] Define Document model
- [x] Create model associations (File created)
- [x] Create migrations for all models
- [x] Generate seed data for development (Core models seeded)
- [x] Implement API routes for CRUD operations on all models (Basic implementation)
- [ ] Add RBAC middleware for API routes (Middleware created, partially applied)

## Phase 3: Employee Management Module
- [/] Build employee list page with filtering (Basic page created)
- [/] Create employee detail page (Basic page created)
- [x] Implement employee CRUD forms (Basic new/edit pages created)
- [x] Add department assignment functionality (Dropdown added to forms)
- [x] Create profile page for self-service (Basic page structure created)
- [ ] Implement RBAC for employee data access

## Phase 4: Attendance & Leave Management
- [ ] Create attendance entry form
- [ ] Build attendance list view
- [ ] Implement attendance filtering and reporting
- [ ] Create leave request form
- [ ] Build leave request list view
- [ ] Implement basic approval workflow
- [ ] Add leave balance tracking

## Phase 5: Compliance & Document Management
- [ ] Build license/certification tracking interface
- [ ] Implement expiration monitoring
- [ ] Create compliance dashboard
- [ ] Build document upload functionality
- [ ] Create document browser/viewer
- [ ] Implement RBAC for document access
- [ ] Set up document metadata management

## Phase 6: Dashboard & Reporting
- [ ] Create main dashboard matching design
- [ ] Implement key metrics cards
- [ ] Build activity feed component
- [ ] Add department-based views
- [ ] Create basic data export functionality

## Phase 7: Onboarding & Offboarding
- [ ] Build basic onboarding checklist templates
- [ ] Create offboarding process templates
- [ ] Implement email reminder functionality
- [ ] Add task assignment interface

## Phase 8: Testing & Documentation
- [ ] Create unit tests for critical functions
- [ ] Add integration tests for API routes
- [ ] Implement E2E tests for critical user flows
- [ ] Document database schema
- [ ] Create API documentation
- [ ] Add JSDoc for key functions

## Phase 9: MVP Polish & Deployment
- [ ] Perform code review and refactoring
- [ ] Fix identified bugs and issues
- [ ] Optimize performance
- [ ] Create demo data for presentation
- [ ] Set up deployment configuration
- [ ] Document known limitations and future improvements

MCHRT/
│
├── public/                     # Static assets
│   ├── favicon.ico
│   ├── logo.svg
│   └── images/
│
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── auth/               # Authentication components
│   │   │   ├── LoginForm.tsx
│   │   │   └── PasswordReset.tsx
│   │   │
│   │   ├── common/             # Common UI elements
│   │   │   ├── Table.tsx
│   │   │   ├── Pagination.tsx
│   │   │   ├── FilterBar.tsx
│   │   │   ├── SortableHeader.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ErrorMessage.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   │
│   │   ├── dashboard/          # Dashboard components
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── Grid.tsx
│   │   │   ├── Container.tsx
│   │   │   ├── MetricCard.tsx
│   │   │   ├── MetricsRow.tsx
│   │   │   ├── ActivityFeed.tsx
│   │   │   ├── WidgetContainer.tsx
│   │   │   └── widgets/
│   │   │       ├── EmployeeStats.tsx
│   │   │       ├── AttendanceWidget.tsx
│   │   │       ├── ComplianceWidget.tsx
│   │   │       ├── LeaveWidget.tsx
│   │   │       └── RecentDocuments.tsx
│   │   │
│   │   ├── employees/          # Employee management components
│   │   │   ├── EmployeeList.tsx
│   │   │   ├── EmployeeFilters.tsx
│   │   │   ├── EmployeeDetails.tsx
│   │   │   ├── EmployeeTabs.tsx
│   │   │   ├── EmployeeForm.tsx
│   │   │   └── DepartmentSelect.tsx
│   │   │
│   │   ├── attendance/         # Attendance components
│   │   │   ├── AttendanceForm.tsx
│   │   │   ├── AttendanceList.tsx
│   │   │   └── DailyAttendance.tsx
│   │   │
│   │   ├── leave/              # Leave management components
│   │   │   ├── LeaveRequestForm.tsx
│   │   │   ├── LeaveRequestList.tsx
│   │   │   ├── ApprovalActions.tsx
│   │   │   └── LeaveBalance.tsx
│   │   │
│   │   ├── compliance/         # Compliance components
│   │   │   ├── LicenseList.tsx
│   │   │   ├── LicenseForm.tsx
│   │   │   ├── ExpirationMonitor.tsx
│   │   │   ├── ComplianceStats.tsx
│   │   │   ├── DepartmentCompliance.tsx
│   │   │   └── StatusCards.tsx
│   │   │
│   │   ├── documents/          # Document management components
│   │   │   ├── UploadForm.tsx
│   │   │   ├── DocumentList.tsx
│   │   │   ├── DocumentViewer.tsx
│   │   │   ├── DocumentFilters.tsx
│   │   │   └── MetadataEditor.tsx
│   │   │
│   │   ├── forms/              # Form components
│   │   │   ├── FormContainer.tsx
│   │   │   ├── FormField.tsx
│   │   │   ├── FormActions.tsx
│   │   │   ├── FormSection.tsx
│   │   │   ├── ValidationError.tsx
│   │   │   └── FormError.tsx
│   │   │
│   │   ├── layouts/            # Layout components
│   │   │   ├── MainLayout.tsx
│   │   │   └── AuthLayout.tsx
│   │   │
│   │   ├── navigation/         # Navigation components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopBar.tsx
│   │   │   ├── MobileMenu.tsx
│   │   │   └── Breadcrumb.tsx
│   │   │
│   │   ├── notifications/      # Notification components
│   │   │   ├── NotificationCenter.tsx
│   │   │   ├── NotificationItem.tsx
│   │   │   └── Toast.tsx
│   │   │
│   │   ├── onboarding/         # Onboarding components
│   │   │   ├── ChecklistTemplate.tsx
│   │   │   └── ChecklistEditor.tsx
│   │   │
│   │   ├── offboarding/        # Offboarding components
│   │   │   ├── ProcessTemplate.tsx
│   │   │   └── ProcessEditor.tsx
│   │   │
│   │   ├── profile/            # User profile components
│   │   │   └── ProfileForm.tsx
│   │   │
│   │   ├── reports/            # Reporting components
│   │   │   └── DepartmentReport.tsx
│   │   │
│   │   ├── tasks/              # Task management components
│   │   │   ├── TaskList.tsx
│   │   │   └── TaskForm.tsx
│   │   │
│   │   └── ui/                 # UI component library
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Input.tsx
│   │       ├── Select.tsx
│   │       ├── Modal.tsx
│   │       ├── Alert.tsx
│   │       ├── Badge.tsx
│   │       ├── Avatar.tsx
│   │       └── Icon.tsx
│   │
│   ├── config/                 # Configuration files
│   │   ├── navigation.ts       # Navigation configuration
│   │   └── permissions.ts      # RBAC permission matrices
│   │
│   ├── db/                     # Database setup
│   │   ├── config.ts           # Database configuration
│   │   ├── mockDbSetup.ts      # SQLite setup for development
│   │   ├── associations.ts     # Model associations
│   │   ├── migrations/         # Sequelize migrations
│   │   └── seeders/            # Data seeders
│   │
│   ├── lib/                    # Utility libraries
│   │   ├── activity/           # Activity tracking utilities
│   │   │   └── activityTracker.ts
│   │   │
│   │   ├── api/                # API utilities
│   │   │   ├── responses.ts    # API response utilities
│   │   │   ├── statusCodes.ts  # HTTP status codes
│   │   │   └── withErrorHandling.ts # Error wrapper
│   │   │
│   │   ├── auth/               # Authentication utilities
│   │   │   └── index.ts
│   │   │
│   │   ├── context/            # React context providers
│   │   │   └── NotificationContext.tsx
│   │   │
│   │   ├── cron/               # Scheduled jobs
│   │   │   ├── reminderJobs.ts
│   │   │   └── complianceJobs.ts
│   │   │
│   │   ├── dates/              # Date utilities
│   │   │   └── expirationUtil.ts
│   │   │
│   │   ├── email/              # Email utilities
│   │   │   └── sendEmail.ts
│   │   │
│   │   ├── encryption/         # Encryption utilities
│   │   │   └── index.ts
│   │   │
│   │   ├── errors/             # Error handling
│   │   │   ├── appErrors.ts    # Error class hierarchy
│   │   │   └── errorReporter.ts # Error reporting
│   │   │
│   │   ├── export/             # Export utilities
│   │   │   └── csvExporter.ts
│   │   │
│   │   ├── fileUpload/         # File upload utilities
│   │   │   ├── uploadHandler.ts
│   │   │   └── pathGenerator.ts
│   │   │
│   │   ├── hooks/              # React hooks
│   │   │   ├── useEmployees.ts
│   │   │   ├── useEmployee.ts
│   │   │   ├── useAttendance.ts
│   │   │   ├── useLeaveRequests.ts
│   │   │   ├── useLicenses.ts
│   │   │   ├── useForm.ts
│   │   │   └── useFormValidation.ts
│   │   │
│   │   ├── logger/             # Logging utility
│   │   │   └── index.ts
│   │   │
│   │   ├── middleware/         # API route middleware
│   │   │   ├── checkRole.ts    # Role checking
│   │   │   ├── checkDepartmentAccess.ts # Department access
│   │   │   └── documentAccess.ts # Document access
│   │   │
│   │   ├── password/           # Password utilities
│   │   │   └── index.ts
│   │   │
│   │   ├── rbac/               # RBAC utilities
│   │   │   ├── index.ts
│   │   │   └── departmentAccess.ts
│   │   │
│   │   ├── session/            # Session management
│   │   │   └── index.ts
│   │   │
│   │   ├── validation/         # Validation
│   │   │   ├── index.ts        # Core validation utilities
│   │   │   ├── employeeSchema.ts
│   │   │   ├── attendanceSchema.ts
│   │   │   └── leaveSchema.ts
│   │   │
│   │   └── withAuth.ts         # Auth HOC for route protection
│   │
│   ├── modules/                # Business logic modules
│   │   ├── attendance/         # Attendance module
│   │   │   ├── models/         # Sequelize models
│   │   │   │   └── Attendance.ts
│   │   │   └── services/       # Business logic services
│   │   │       └── attendanceService.ts
│   │   │
│   │   ├── auth/               # Authentication module
│   │   │   ├── models/         # Sequelize models
│   │   │   │   └── User.ts
│   │   │   └── services/       # Business logic services
│   │   │       └── authService.ts
│   │   │
│   │   ├── compliance/         # Compliance module
│   │   │   ├── models/         # Sequelize models
│   │   │   │   └── Compliance.ts
│   │   │   └── services/       # Business logic services
│   │   │       ├── expirationService.ts
│   │   │       └── notificationService.ts
│   │   │
│   │   ├── dashboard/          # Dashboard module
│   │   │   └── services/       # Business logic services
│   │   │       ├── metricsService.ts
│   │   │       └── activityService.ts
│   │   │
│   │   ├── documents/          # Document management module
│   │   │   ├── models/         # Sequelize models
│   │   │   │   └── Document.ts
│   │   │   └── services/       # Business logic services
│   │   │       ├── storageService.ts
│   │   │       ├── accessControlService.ts
│   │   │       └── metadataService.ts
│   │   │
│   │   ├── employees/          # Employee management module
│   │   │   ├── models/         # Sequelize models
│   │   │   │   └── Employee.ts
│   │   │   └── services/       # Business logic services
│   │   │       ├── employeeService.ts
│   │   │       └── profileService.ts
│   │   │
│   │   ├── leave/              # Leave management module
│   │   │   ├── models/         # Sequelize models
│   │   │   │   └── Leave.ts
│   │   │   └── services/       # Business logic services
│   │   │       ├── approvalService.ts
│   │   │       └── leaveBalanceService.ts
│   │   │
│   │   ├── notifications/      # Notifications module
│   │   │   ├── services/       # Business logic services
│   │   │   │   └── reminderService.ts
│   │   │   └── templates/      # Email templates
│   │   │       └── expiration-reminder.html
│   │   │
│   │   ├── offboarding/        # Offboarding module
│   │   │   └── data/           # Template data
│   │   │       └── processTemplates.ts
│   │   │
│   │   ├── onboarding/         # Onboarding module
│   │   │   └── data/           # Template data
│   │   │       └── checklistTemplates.ts
│   │   │
│   │   ├── organization/       # Organization module
│   │   │   ├── models/         # Sequelize models
│   │   │   │   └── Department.ts
│   │   │   └── services/       # Business logic services
│   │   │       └── departmentService.ts
│   │   │
│   │   ├── reports/            # Reporting module
│   │   │   └── services/       # Business logic services
│   │   │       └── departmentReportService.ts
│   │   │
│   │   └── tasks/              # Task management module
│   │       ├── models/         # Sequelize models
│   │       │   └── Task.ts
│   │       └── services/       # Business logic services
│   │           └── taskService.ts
│   │
│   ├── pages/                  # Next.js pages
│   │   ├── _app.tsx            # App wrapper component
│   │   ├── _document.tsx       # Document wrapper component
│   │   ├── _error.tsx          # Error page component
│   │   ├── 404.tsx             # Not found page
│   │   ├── 500.tsx             # Server error page
│   │   ├── index.tsx           # Dashboard/home page
│   │   ├── login.tsx           # Login page
│   │   ├── profile.tsx         # User profile page (Created)
│   │   │
│   │   ├── api/                # API routes
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth].ts    # NextAuth setup
│   │   │   │
│   │   │   ├── attendance/
│   │   │   │   ├── index.ts           # GET, POST
│   │   │   │   ├── [id].ts            # GET, PUT, DELETE
│   │   │   │   ├── bulk.ts            # Bulk operations
│   │   │   │   └── export.ts          # CSV export
│   │   │   │
│   │   │   ├── compliance/
│   │   │   │   ├── index.ts           # GET, POST
│   │   │   │   ├── [id].ts            # GET, PUT, DELETE
│   │   │   │   ├── expiring.ts        # Expiring items
│   │   │   │   ├── stats.ts           # Compliance stats
│   │   │   │   └── export.ts          # CSV export
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   ├── metrics.ts         # Dashboard metrics
│   │   │   │   └── activity.ts        # Activity feed
│   │   │   │
│   │   │   ├── documents/
│   │   │   │   ├── index.ts           # GET, POST
│   │   │   │   ├── [id].ts            # GET, PUT, DELETE
│   │   │   │   ├── upload.ts          # File upload
│   │   │   │   ├── [id]/file.ts       # File serving
│   │   │   │   └── [id]/metadata.ts   # Metadata management
│   │   │   │
│   │   │   ├── employees/
│   │   │   │   ├── index.ts           # GET, POST
│   │   │   │   ├── [id].ts            # GET, PUT, DELETE
│   │   │   │   ├── [id]/department.ts # Department assignment
│   │   │   │   ├── [id]/leave-balance.ts # Leave balance
│   │   │   │   └── export.ts          # CSV export
│   │   │   │
│   │   │   ├── leave/
│   │   │   │   ├── index.ts           # GET, POST
│   │   │   │   ├── [id].ts            # GET, PUT, DELETE
│   │   │   │   ├── [id]/approve.ts    # Approval
│   │   │   │   ├── [id]/reject.ts     # Rejection
│   │   │   │   └── export.ts          # CSV export
│   │   │   │
│   │   │   ├── notifications/
│   │   │   │   └── send-reminder.ts   # Send reminders
│   │   │   │
│   │   │   ├── onboarding/
│   │   │   │   └── templates.ts       # Checklist templates
│   │   │   │
│   │   │   ├── offboarding/
│   │   │   │   └── templates.ts       # Process templates
│   │   │   │
│   │   │   ├── reports/
│   │   │   │   └── departments.ts     # Department reports
│   │   │   │
│   │   │   └── tasks/
│   │   │       ├── index.ts           # GET, POST
│   │   │       └── [id].ts            # GET, PUT, DELETE
│   │   │
│   │   ├── attendance/
│   │   │   ├── index.tsx              # Attendance list page
│   │   │   ├── record.tsx             # Record attendance page
│   │   │   └── daily.tsx              # Daily view page
│   │   │
│   │   ├── compliance/
│   │   │   ├── index.tsx              # Compliance dashboard
│   │   │   └── settings.tsx           # Compliance settings
│   │   │
│   │   ├── documents/
│   │   │   ├── index.tsx              # Document library
│   │   │   └── upload.tsx             # Upload page
│   │   │
│   │   ├── employees/
│   │   │   ├── index.tsx              # Employee list
│   │   │   ├── new.tsx                # Add new employee page
│   │   │   └── [id]/
│   │   │       ├── index.tsx          # Employee details (assuming [id].tsx moved here or duplicated)
│   │   │       └── edit.tsx           # Edit employee page
│   │   │
│   │   ├── leave/
│   │   │   ├── index.tsx              # Leave requests list
│   │   │   ├── request.tsx            # Request leave page
│   │   │   └── [id].tsx               # Request details
│   │   │
│   │   ├── onboarding/
│   │   │   └── index.tsx              # Onboarding dashboard
│   │   │
│   │   ├── offboarding/
│   │   │   └── index.tsx              # Offboarding dashboard
│   │   │
│   │   ├── reports/
│   │   │   └── departments.tsx        # Department reports
│   │   │
│   │   └── tasks/
│   │       └── index.tsx              # Task management
│   │
│   ├── styles/                 # CSS and styling
│   │   ├── globals.css         # Global styles
│   │   └── theme.ts           # Design tokens
│   │
│   └── types/                  # TypeScript types
│       ├── index.ts            # Core type definitions
│       ├── roles.ts            # Role enums
│       └── leave.ts            # Leave type enums
│
├── local-storage/              # Local filesystem storage
│   └── documents/              # Document storage
│       ├── administration/     # Admin documents
│       ├── compliance/         # Compliance documents
│       ├── hr/                 # HR documents
│       └── employees/          # Employee documents
│
├── tests/                      # Test files
│   ├── setup.js                # Test setup
│   │
│   ├── api/                    # API tests
│   │   ├── helpers.ts          # Test helpers
│   │   ├── employees.test.ts   # Employee API tests
│   │   ├── attendance.test.ts  # Attendance API tests
│   │   ├── leave.test.ts       # Leave API tests
│   │   ├── compliance.test.ts  # Compliance API tests
│   │   ├── documents.test.ts   # Document API tests
│   │   └── auth.test.ts        # Auth API tests
│   │
│   ├── fixtures/               # Test fixtures
│   │   ├── userFixtures.ts     # User fixtures
│   │   ├── employeeFixtures.ts # Employee fixtures
│   │   ├── departmentFixtures.ts # Department fixtures
│   │   ├── attendanceFixtures.ts # Attendance fixtures
│   │   ├── leaveFixtures.ts    # Leave fixtures
│   │   └── complianceFixtures.ts # Compliance fixtures
│   │
│   ├── rbac/                   # RBAC tests
│   │   ├── adminPermissions.test.ts  # Admin tests
│   │   ├── managerPermissions.test.ts # Manager tests
│   │   └── employeePermissions.test.ts # Employee tests
│   │
│   ├── security/               # Security tests
│   │   ├── encryption.test.ts  # Encryption tests
│   │   ├── sensitiveData.test.ts # SSN handling tests
│   │   ├── accessControl.test.ts # Access control tests
│   │   └── dataMasking.test.ts # Data masking tests
│   │
│   ├── db-setup.ts             # Database setup for tests
│   └── utils/                  # Test utilities
│       └── rbacHelpers.ts      # RBAC test helpers
│
├── e2e/                        # End-to-end tests
│   ├── auth.spec.ts            # Auth E2E tests
│   ├── employees.spec.ts       # Employee E2E tests
│   ├── leave.spec.ts           # Leave E2E tests
│   ├── documents.spec.ts       # Document E2E tests
│   └── utils/                  # E2E test utilities
│
├── docs/                       # Documentation
│   ├── database/               # Database documentation
│   │   ├── schema.md           # Schema documentation
│   │   ├── erd.png             # Entity relationship diagram
│   │   └── associations.md     # Model associations
│   │
│   └── api/                    # API documentation
│
├── .env.development            # Development environment variables
├── .env.test                   # Test environment variables
├── .env.local.example          # Example local environment variables
├── .gitignore                  # Git ignore file
├── .nvmrc                      # Node version
├── next.config.js              # Next.js configuration
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── jest.config.js              # Jest configuration
├── playwright.config.ts        # Playwright configuration
├── sequelize.config.js         # Sequelize CLI config
└── vercel.json                 # Vercel deployment config

---

## Current Status & Next Steps (As of 2025-03-27 ~7:07 PM MDT)

**Current Focus:** Phase 3 - Employee Management Module

**Completed:**
- Phase 1: All items completed.
- Phase 2: All items completed (Basic API routes implemented, RBAC middleware created and applied as initial wrappers).
- Phase 3:
  - Basic Employee List page created (`src/pages/employees/index.tsx`).
  - Basic Employee Detail page created (`src/pages/employees/[id]/index.tsx` or similar).
  - Implemented basic employee CRUD forms (`src/pages/employees/new.tsx`, `src/pages/employees/[id]/edit.tsx`).
  - Added department assignment dropdown to CRUD forms.
  - Created basic profile page structure (`src/pages/profile.tsx`).

**Where We Left Off:**
- Completed the basic structure and department dropdowns for employee CRUD forms and the initial profile page.

**Next Steps:**
1.  Implement RBAC for employee data access (Step 35). This involves:
    *   Refining API route middleware (`src/lib/middleware/`) to check roles and potentially department access for employee endpoints.
    *   Ensuring front-end components conditionally render actions (like edit/delete buttons) based on user permissions.
2.  Refine RBAC checks within API handlers for more granular permissions (e.g., department scope, self-access) as noted in TODO comments (Relates to Step 27 & 35).
3.  Continue with subsequent phases (Phase 4 onwards).
