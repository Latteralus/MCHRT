# MVP Development Checklist

## Phase 1: Project Setup & Core Infrastructure
- [x] Initialize Next.js project with TypeScript
- [x] Set up project folder structure
- [x] Configure ESLint and Prettier
- [x] Create mock database (SQLite) configuration
- [x] Set up NextAuth with CredentialsProvider
- [x] Implement basic authentication (login page)
- [x] Create basic layout components (MainLayout, Sidebar) (TopBar removed)
- [x] Set up core UI component library (Basic components created in src/components/ui/)
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
- [x] Add RBAC middleware for API routes (Applied to Employees, Attendance, Leave, Documents)

## Phase 3: Employee Management Module
- [x] Build employee list page with filtering (Basic page created)
- [x] Create employee detail page (Basic page created)
- [x] Implement employee CRUD forms (Basic new/edit pages created)
- [x] Add department assignment functionality (Dropdown added to forms)
- [x] Create profile page for self-service (Basic page structure created)
- [x] Implement RBAC for employee data access (Backend API route secured)

## Phase 4: Attendance & Leave Management
- [x] Create attendance entry form (FE Component + Page + API Integration)
- [x] Build attendance list view (FE Component + Page + API Integration)
- [/] Implement attendance filtering and reporting (API filtering done; Basic summary report page created)
- [x] Create leave request form (FE Component + Page + API Integration)
- [x] Build leave request list view (FE Component + Page + API Integration)
- [x] Implement basic approval workflow (Backend API routes + FE Integration)
- [x] Add leave balance tracking (Model, DB, Service, API Integration done; Accrual Service + API Trigger created)
- [x] Implement Frontend RBAC (Verified for Leave List)
- [ ] Add tests for API routes and services (Deferred)

## Phase 5: Compliance & Document Management
- [x] Build license/certification tracking interface (API, List, Form, Index page integrated)
- [x] Implement expiration monitoring (Service + API Trigger created)
- [x] Create compliance dashboard (Widgets created and integrated)
- [x] Build document upload functionality (API route, UploadForm integrated with modal)
- [x] Create document browser/viewer (API route, DocumentList integrated with download)
- [x] Implement RBAC for document access (Refined in list, upload, download, metadata routes)
- [/] Set up document metadata management (API route created, UI pending)

## Phase 6: Dashboard & Reporting
- [/] Create main dashboard matching design (Basic layout with placeholders)
- [/] Implement key metrics cards (Placeholder widgets created)
- [/] Build activity feed component (Placeholder component created)
- [/] Add department-based views (Placeholder report page created)
- [/] Create basic data export functionality (Employee CSV export API created)

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
│   │   │       ├── ComplianceStatsWidget.tsx  # Added
│   │   │       ├── ExpiringComplianceWidget.tsx # Added (Replaces ComplianceWidget?)
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
│   │   │   ├── ComplianceList.tsx   # Renamed/Replaced LicenseList? (Added)
│   │   │   ├── ComplianceForm.tsx   # Renamed/Replaced LicenseForm? (Added)
│   │   │   ├── ExpirationMonitor.tsx # Likely replaced by service logic
│   │   │   ├── ComplianceStats.tsx   # Component for stats (may be widget now)
│   │   │   ├── DepartmentCompliance.tsx
│   │   │   └── StatusCards.tsx
│   │   │
│   │   ├── documents/          # Document management components
│   │   │   ├── UploadForm.tsx      # Added
│   │   │   ├── DocumentList.tsx      # Added
│   │   │   ├── DocumentViewer.tsx    # Placeholder/Future
│   │   │   ├── DocumentFilters.tsx   # Placeholder/Future
│   │   │   └── MetadataEditor.tsx    # Placeholder/Future
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
│   │   │   ├── AttendanceSummaryReport.tsx # Added
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
│   │   │       ├── expirationService.ts    # Added
│   │   │       └── notificationService.ts  # Placeholder/Future
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
│   │   │       ├── leaveBalanceService.ts
│   │   │       └── leaveAccrualService.ts # Added
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
│   │   │   │   ├── index.ts           # Added (GET list, POST create)
│   │   │   │   ├── [id].ts            # Added (GET single, PUT, DELETE)
│   │   │   │   ├── expiring.ts        # Placeholder/Future (or handled by service)
│   │   │   │   ├── stats.ts           # Placeholder/Future
│   │   │   │   └── export.ts          # Placeholder/Future
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   ├── metrics.ts         # Dashboard metrics
│   │   │   │   └── activity.ts        # Activity feed
│   │   │   │
│   │   │   ├── cron/                # Added - API routes for scheduled tasks
│   │   │   │   ├── trigger-leave-accrual.ts # Added
│   │   │   │   └── trigger-compliance-check.ts # Added
│   │   │   │
│   │   │   ├── documents/
│   │   │   │   ├── index.ts           # Added (GET list)
│   │   │   │   ├── [id].ts            # Placeholder/Future (GET single, PUT metadata, DELETE)
│   │   │   │   ├── upload.ts          # Added (POST upload)
│   │   │   │   ├── [id]/file.ts       # Placeholder/Future (Secure file serving)
│   │   │   │   └── [id]/metadata.ts   # Placeholder/Future
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
│   │   │   ├── index.tsx              # Added (Compliance Tracking Page)
│   │   │   ├── dashboard.tsx          # Placeholder/Future (Or integrated into main dashboard)
│   │   │   └── settings.tsx           # Placeholder/Future
│   │   │
│   │   ├── documents/
│   │   │   ├── index.tsx              # Added (Document Management Page)
│   │   │   └── upload.tsx             # Placeholder/Future (Or integrated into index)
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
│   │   │   ├── attendance.tsx         # Added (Attendance Summary Report)
│   │   │   └── departments.tsx        # Placeholder/Future
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

## Current Status & Next Steps (As of 2025-03-27 ~9:40 PM MDT)

**Current Focus:** Phase 5 - Compliance & Document Management (Core Structure)

**Completed:**
- Phase 1: All items completed.
- Phase 2: All items completed.
- Phase 3: All items completed.
- Phase 4: All items completed (excluding deferred testing).
    - Leave Accrual: Service (`leaveAccrualService`) and API trigger (`/api/cron/trigger-leave-accrual`) created.
    - Frontend RBAC: Verified for Leave Management actions.
    - Reporting: Basic Attendance Summary report page (`/reports/attendance`) and component created (using mock data).

**Phase 5 Progress (Core Structure Implemented):**
- **Compliance:**
    - API routes created for CRUD (`/api/compliance`, `/api/compliance/[id]`) with RBAC.
    - Frontend components (`ComplianceList`, `ComplianceForm`) and main page (`/compliance`) created with placeholders/mock data.
    - Expiration monitoring service (`expirationService`) and API trigger (`/api/cron/trigger-compliance-check`) created.
    - Dashboard widgets (`ComplianceStatsWidget`, `ExpiringComplianceWidget`) created with mock data.
- **Document Management:**
    - API route for upload (`/api/documents/upload`) created using `formidable`.
    - API route for listing (`/api/documents/index`) created with RBAC.
    - Frontend components (`UploadForm`, `DocumentList`) and main page (`/documents`) created with placeholders/mock data.
    - Basic RBAC implemented in API routes.

**Where We Left Off:**
- Core backend services and API routes for Phase 5 features are established.
- Frontend components and pages for Phase 5 are created but primarily use mock data and placeholders for full functionality (e.g., modals, API integration, file download).

**Next Steps (To Complete Phase 5 MVP):**
1.  **API Integration:** Connect frontend components (ComplianceList, ComplianceForm, DocumentList, UploadForm, dashboard widgets) to their respective backend API routes.
2.  **UI Implementation:** Replace placeholders with actual UI library components (Modals, Tables, Badges, etc.). Implement modal logic for ComplianceForm.
3.  **Secure File Serving:** Create an API route (e.g., `/api/documents/download/[filename]`) to securely serve files from local storage based on user permissions. Implement download links in `DocumentList`.
4.  **Refine RBAC:** Implement detailed RBAC checks within API handlers (e.g., can user X upload for employee Y?).
5.  **Metadata Management:** Implement API route and potentially UI for editing document metadata (title, description, associations).
6.  **Cron Job Setup:** Configure external cron jobs (e.g., Vercel) to trigger the accrual and compliance check API endpoints.
7.  **Dashboard Integration:** Add `ComplianceStatsWidget` and `ExpiringComplianceWidget` to the main dashboard page (`/`).
