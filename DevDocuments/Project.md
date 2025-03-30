# MVP Development Checklist

## Phase 1: Project Setup & Core Infrastructure
- [x] Initialize Next.js project with TypeScript
- [x] Set up project folder structure
- [x] Configure ESLint and Prettier
- [x] Create mock database (SQLite) configuration (`src/config/config.ts`)
- [x] Set up NextAuth with CredentialsProvider
- [x] Implement basic authentication (login page)
- [x] Create basic layout components (MainLayout, Sidebar) (TopBar removed)
- [x] Set up core UI component library (Basic components created in src/components/ui/)
- [x] Configure environment variables
- [x] Set up local filesystem for document storage

## Phase 2: Database Models & Core API Routes
- [x] Define User model with roles
- [x] Define Department model
- [x] Define Employee model (Position changed to FK `positionId`)
- [x] Define Attendance model
- [x] Define Leave model
- [x] Define Compliance model
- [x] Define Document model
- [x] Define Position model # Added
- [x] Define Offboarding model # Added
- [x] Define OnboardingTemplate model # Added
- [x] Define OnboardingTemplateItem model # Added
- [x] Define ActivityLog model # Added
- [x] Create model associations (Updated for Position, Offboarding, Onboarding Templates, ActivityLog)
- [x] Create migrations for all models (Added Position, Offboarding, Onboarding Templates & Items, ActivityLog)
- [x] Generate seed data for development (Core models, admin user, Positions, Onboarding Templates & Items seeded)
- [x] Implement API routes for CRUD operations on core models (Added Position, Offboarding, Onboarding stats/list, ActivityLog list)
- [x] Add RBAC middleware for API routes (Applied to Employees, Attendance, Leave, Documents)

## Phase 3: Employee Management Module
- [x] Build employee list page with filtering (Basic page created)
- [x] Create employee detail page (Basic page created)
- [x] Implement employee CRUD forms (New Employee form updated with Position dropdown, default date)
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
- [x] Create main dashboard matching design (Layout updated, widgets connected to API)
- [x] Implement key metrics cards (Widgets connected to API, calculations updated for trends, rates partially implemented)
- [x] Build activity feed component (Component connected to API, ActivityLog backend implemented)
- [x] Add department-based views (Report page, select component, and API created)
- [x] Create basic data export functionality (API confirmed, button added to UI)

## Phase 7: Onboarding & Offboarding
- [x] Build basic onboarding checklist templates (Moved to database tables: OnboardingTemplates, OnboardingTemplateItems)
- [x] Create offboarding process templates (Data file created - Consider moving to DB)
- [x] Implement automatic onboarding task creation from templates (Added service logic, triggered on employee creation)
- [x] Add task assignment interface (Model, Service, API, Page, List & Form components created)
- [x] Implement Offboarding page (FE page created, connected to API, New Offboarding form created & connected)
- [x] Implement basic Activity Logging (DB table, service, integrated into key APIs)

## Phase 8: Testing & Documentation
- [x] Create unit tests for critical functions (`leaveBalanceService` tests now pass) `npx jest tests/unit/services/leaveBalanceService.test.ts`
- [/] Add integration tests for API routes (Basic CRUD tests written; Initialization fixed, but full suite run has isolation issues)
- [ ] Implement E2E tests for critical user flows
- [ ] Document database schema
- [ ] Create API documentation
- [ ] Add JSDoc for key functions

## Phase 9: MVP Polish & Deployment
- [ ] Perform code review and refactoring
- [x] Fix identified bugs and issues (Login layout, Vercel builds, Link component usage, duplicate imports, API type errors)
- [ ] Optimize performance
- [ ] Create demo data for presentation
- [ ] Set up deployment configuration
- [ ] Document known limitations and future improvements

---

## Current Status & Next Steps (As of 2025-03-28 ~10:50 PM MDT)

**Current Focus:** Phase 8 - Testing & Documentation / Phase 9 - Polish

**Completed Since Last Update:**
- **Phase 2 Additions:** Added Position, Offboarding, OnboardingTemplate, OnboardingTemplateItem, ActivityLog models, migrations, associations, and basic API endpoints. Seeded templates/positions.
- **Phase 3 Updates:** Updated New Employee form (position dropdown, default date).
- **Phase 6 Updates:** Verified dashboard widgets use API. Implemented Activity Logging backend and connected Activity Feed. Updated dashboard metrics API calculations (trends implemented, rates partially implemented).
- **Phase 7 Updates:** Moved onboarding templates to DB. Implemented automatic onboarding task creation. Implemented Offboarding page/form frontend and backend API. Updated Offboarding page/task list to use live data.
- **Phase 9 Updates:** Fixed Next.js Link component usage errors. Fixed duplicate import build error. Fixed API type errors.

**Outstanding Items / Next Steps:**
- **Phase 4:** Add tests for Attendance/Leave APIs/services.
- **Phase 5:** Implement UI for document metadata management.
- **Phase 6:** Refine Attendance Rate and Compliance Rate calculations in dashboard metrics API. Implement Compliance trend calculation.
- **Phase 7:** Refine assignee logic for automatically created onboarding tasks (Manager, HR, IT). Consider moving offboarding templates to DB.
- **Phase 8:** Continue writing integration tests (dealing with isolation issues). Implement E2E tests. Document DB schema and APIs. Add JSDoc.
- **Phase 9:** Code review/refactoring. Performance optimization. Create demo data. Deployment config. Document limitations.

---

## Jest Integration Test Debugging Notes (Updated 2025-03-28 ~12:18 PM MDT)

**Problem:** Initial attempts to run integration tests failed due to `Sequelize has not been initialized or set.` errors. Subsequent fixes led to `no such table` errors, and then `UNIQUE constraint failed` or `FOREIGN KEY constraint failed` errors when running the full suite.

**Root Cause Analysis:**
1.  **Initialization Error:** Caused by a race condition where model files (calling `getSequelizeInstance` during `Model.init`) were loaded by Jest before the asynchronous `setupTestDb` hook finished creating the Sequelize instance.
2.  **`no such table` Error:** Occurred when `clearTestDb` (running `beforeEach`) executed before `setupTestDb` (running `beforeAll`) had finished creating tables via migrations or `sync`.
3.  **Constraint Errors (Full Suite):** Likely caused by inadequate test isolation between files, even with `--runInBand`. The `clearTestDb` function (using either `destroy` or `sync({ force: true })`) doesn't seem to guarantee a perfectly clean slate when multiple test files run sequentially in the same process, leading to leftover data causing unique or foreign key violations in subsequent tests.

**Resolution Steps Taken:**

1.  **Synchronous Instance Creation:** Modified `src/db/mockDbSetup.ts` to create the Sequelize instance synchronously on module load. This resolved the initial `Sequelize has not been initialized` error.
2.  **Switched to `sync({ force: true })`:** Replaced Umzug migrations with `sequelize.sync({ force: true })` in `setupTestDb` to ensure schema matches models.
3.  **Refined `clearTestDb`:** Experimented with `destroy` loops vs. `sync({ force: true })` in the `beforeEach` hook. `sync({ force: true })` proved necessary for resetting state reliably *within* a single test file run sequentially, but still insufficient for full suite isolation. Reverted to `destroy` loop and back to `sync({ force: true })` multiple times while debugging related fixture issues. The final state uses `sync({ force: true })`.
4.  **Ordered Imports:** Ensured models were imported before `sync` and associations after `sync` in `setupTestDb`. Also tried importing associations *before* `sync` in `clearTestDb`, which didn't help. Removed explicit association imports from setup/clear functions as Sequelize handles them via model definitions.
5.  **Fixture Dependencies:** Modified `employeeFixtures` and `departmentFixtures` to ensure dependent `User` and `Department` records are created if not provided via overrides.
6.  **Username Uniqueness:** Modified `userFixtures` to use UUIDs for usernames to prevent collisions within a single test file execution. Reverted this while debugging `clearTestDb`, then potentially re-applied (final state uses UUIDs). *Correction: Final state uses faker + random numbers, not UUIDs.*
7.  **API/Test Logic Fixes:** Corrected assertions and payload formats in `attendance` and `compliance` tests based on actual API behavior (checking correct response property, using correct time formats).
8.  **Sequential Execution:** Used `jest --runInBand` to prevent parallel file execution, which helped isolate some issues but didn't solve the core state leakage problem between files.
9.  **Isolated File Testing:** Confirmed that individual test files (e.g., `employees.test.ts`, `attendance.test.ts`) pass when run alone, indicating the core logic within them is sound.

**Conclusion:** The primary blocker (Sequelize initialization) is resolved. Integration tests *can* be written and run successfully in isolation. However, running the *entire suite* reliably fails due to state not being perfectly reset between test files by the current `clearTestDb` implementation.

**Next Steps (Testing):**
*   Run tests individually (`npm test <path>`) or in small groups during development.
*   Defer further investigation into full suite isolation issues unless it becomes a critical blocker.

---

## Vercel Build & UI Debugging Notes (Updated 2025-03-28 ~11:07 AM MDT)

**Problem:** Encountered a series of TypeScript, module resolution, and UI layout errors during Vercel builds and local testing after recent changes.

**Debugging Steps & Fixes:**

1.  **`src/pages/api/compliance/[id].ts` - Type Errors:** (See previous notes) - Fixed.
2.  **`src/pages/api/leave/[id]/approve.ts` - Import & Type Errors:** (See previous notes) - Fixed.
3.  **`src/pages/api/leave/index.ts` - Redeclaration Error:** (See previous notes) - Fixed.
4.  **`src/pages/index.tsx` - Type Error:** (See previous notes) - Fixed.
5.  **`tests/db-setup.ts` - Module Resolution & Type Errors:** (See previous notes) - Fixed.
6.  **`src/modules/leave/services/leaveAccrualService.ts` - Import Error & Typo:** (See previous notes) - Fixed.
7.  **`tests/fixtures/attendanceFixtures.ts` - Build Error:** (See previous notes) - Fixed.
8.  **Login Page Layout (`src/pages/login.tsx`, `src/pages/_app.tsx`) - UI Bug:** (See previous notes) - Fixed.
9.  **Vercel Build (`tests/fixtures/*.ts`) - Type Errors:** Fixed type mismatches (`managerId: null` vs `number | undefined`, `hireDate: string` vs `Date | undefined`) by adjusting property assignment order in fixtures.
10. **Vercel Build (`tests/fixtures/userFixtures.ts`) - Type Errors:** Fixed incorrect property names (`name` vs `username`, `password` vs `passwordHash`) and removed non-existent properties (`email`, `isActive`) based on `User` model.
11. **`tests/fixtures/employeeFixtures.ts` - Missing Type:** Fixed by exporting `EmployeeCreationAttributes` from the model file.
12. **`src/types/next-auth.d.ts` & Test Mocks:** Added missing `employeeId` to session type definition and removed incorrect `username` from test mocks.
13. **Sequelize CLI Config:** Created `src/config/config.js` and updated `.sequelizerc` for CLI compatibility. Fixed seeder import issue by using hardcoded role string. Added admin user seeder.

**Outcome:** Vercel builds and local TypeScript checks pass. Login page layout is correct. Admin user seeder created. **Jest integration tests are unblocked but exhibit isolation issues when running the full suite.**

---

## Definitions

*   **RBAC (Role-Based Access Control):** A security approach that restricts system access to authorized users based on their roles within an organization.
*   **Sequelize:** A promise-based Node.js ORM (Object-Relational Mapper) for Postgres, MySQL, MariaDB, SQLite, and Microsoft SQL Server. It simplifies database interactions.
*   **Umzug:** A framework-agnostic migration tool for Node.js, often used with Sequelize to manage database schema changes.
*   **Next.js:** A React framework for building server-side rendered (SSR) and statically generated web applications.
*   **NextAuth.js:** An authentication library for Next.js applications, simplifying the implementation of various authentication strategies.
*   **Jest:** A JavaScript testing framework focusing on simplicity, often used for unit and integration testing.
*   **MVP (Minimum Viable Product):** A version of a new product that allows a team to collect the maximum amount of validated learning about customers with the least effort.
*   **ORM (Object-Relational Mapper):** A programming technique for converting data between incompatible type systems using object-oriented programming languages. This creates a "virtual object database" that can be used from within the programming language.
*   **API (Application Programming Interface):** A set of definitions and protocols for building and integrating application software.
*   **CRUD (Create, Read, Update, Delete):** The four basic functions of persistent storage.
*   **UI (User Interface):** The point of human-computer interaction and communication in a device, software application, or website.
*   **FE (Frontend):** The part of a website or application that the user interacts with directly (client-side).
*   **BE (Backend):** The server-side of an application, responsible for logic, database interactions, and serving data to the frontend.
*   **JSDoc:** A markup language used to annotate JavaScript source code files. Tools can process these annotations to produce documentation in formats like HTML.
*   **E2E (End-to-End) Tests:** A testing methodology used to test application flow from start to end. The purpose is to simulate real user scenarios.
*   **Per-Page Layouts (Next.js):** A pattern where individual page components can define their own layout structure, allowing flexibility beyond a single global layout defined in `_app.tsx`.
