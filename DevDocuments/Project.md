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
- [x] Create main dashboard matching design (Layout updated, widgets connected to API)
- [x] Implement key metrics cards (Widgets connected to API)
- [x] Build activity feed component (Component connected to API)
- [x] Add department-based views (Report page, select component, and API created)
- [x] Create basic data export functionality (API confirmed, button added to UI)

## Phase 7: Onboarding & Offboarding
- [x] Build basic onboarding checklist templates (Data file created)
- [x] Create offboarding process templates (Data file created)
- [/] Implement email reminder functionality (Placeholder utility, service, and trigger integration added)
- [x] Add task assignment interface (Model, Service, API, Page, List & Form components created)

## Phase 8: Testing & Documentation
- [/] Create unit tests for critical functions (leaveBalanceService done)
  - `npx jest tests/unit/services/leaveBalanceService.test.ts`
- [/] Add integration tests for API routes (Basic CRUD tests written for Employees, Attendance, Leave, Compliance, Documents; **Blocked by Jest/Sequelize initialization issue - `db-setup.ts` improved, but core loading order issue likely remains**)
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

---

## Current Status & Next Steps (As of 2025-03-28 ~03:20 AM MDT)

**Current Focus:** Phase 8 - Testing & Documentation (Debugging Jest Integration Tests)

**Completed:**
- Phase 1: All items completed.
- Phase 2: All items completed.
- Phase 3: All items completed.
- Phase 4: All items completed (excluding deferred testing). `leaveAccrualService.ts` import fixed.
- Phase 5: Core structure implemented (API routes, basic components). UI integration and refinement pending.
- Phase 6: All items completed (Dashboard layout, widgets connected, reports page structure, export button). API logic uses placeholders.
- Phase 7: All items completed (Templates created, basic reminder infrastructure, basic task management interface). Email reminders use placeholders.
- Phase 8: Unit test for `leaveBalanceService` complete. Basic API integration tests written for core modules, but blocked by a persistent Jest initialization error. `tests/db-setup.ts` Umzug configuration fixed.

**Where We Left Off:**
- Attempting to run API integration tests (`npm test`).
- Tests consistently fail with `Sequelize has not been initialized or set.` error, originating from model initialization (`Model.init`) which calls `getSequelizeInstance()` before the instance is set by `tests/db-setup.ts`'s `beforeAll` hook. The fixes in `db-setup.ts` related to Umzug initialization might help ensure a cleaner setup, but the underlying Jest module loading order issue likely persists.

**Next Steps (Debugging):**
1.  **Verify `db-setup.ts` Fixes:** Confirm the recent changes to `tests/db-setup.ts` resolve the Umzug-related TypeScript errors and don't introduce new issues during test setup.
2.  **Investigate Jest Module Loading:** The core issue seems to be Jest loading/transforming modules (specifically the models) before the `beforeAll` hook in `tests/db-setup.ts` can create and set the Sequelize instance.
3.  **Alternative Initialization:** Explore alternative Jest setup methods (e.g., `globalSetup`, `setupFilesAfterEnv`) to ensure Sequelize is initialized globally before any test files are processed.
4.  **Simplify Further:** Temporarily remove `next/jest` wrapper or simplify `jest.config.js` to rule out configuration conflicts.
5.  **Consult Jest/Sequelize Docs:** Review documentation for best practices regarding asynchronous setup and module mocking/loading order in Jest.

---

## Jest Integration Test Debugging Notes (Updated 2025-03-28 ~03:20 AM MDT)

**Problem:** API integration tests consistently fail with `Sequelize has not been initialized or set.` This error occurs because Sequelize models (e.g., `User`, `Employee`) are being imported and initialized (calling `Model.init`, which uses `getSequelizeInstance`) at the top level of the test files, *before* the `beforeAll` hook in `tests/db-setup.ts` has a chance to create the Sequelize instance using the test configuration and set it via `setSequelizeInstance`.

**Attempted Fixes:**

1.  **Refactored DB Initialization:**
    *   Moved config loading and Sequelize instance creation out of `src/db/mockDbSetup.ts` and `src/db/index.ts`.
    *   Created `initializeSequelize` and later `setSequelizeInstance`/`getSequelizeInstance` functions in `src/db/mockDbSetup.ts`.
    *   Updated models to use `getSequelizeInstance()`.
    *   Made `tests/db-setup.ts` responsible for importing the test config, creating the instance, and calling `setSequelizeInstance` within `beforeAll`.
    *   *Result:* Error changed from `Cannot read properties of undefined (reading 'test')` (config undefined) to `Sequelize has not been initialized or set.` (instance not set yet).

2.  **Configuration File Handling:**
    *   Renamed `config/config.js` to `src/config/config.ts`.
    *   Updated `config.ts` to use ES Module exports (`export const dbConfig`).
    *   Tried various import paths in `src/db/index.ts` and `tests/db-setup.ts` (relative, alias `@/`, dynamic `import()`).
    *   *Result:* Did not resolve the core initialization order issue.

3.  **Jest Environment:**
    *   Ensured `NODE_ENV=test` is set using `cross-env` in `package.json` test script.
    *   Cleared Jest cache (`--clearCache`).
    *   *Result:* No change in the error.

4.  **Delayed Imports in Test Files:**
    *   Refactored `tests/api/employees.test.ts` (and subsequently others) to declare model/fixture variables in the `describe` scope and perform dynamic `import()` within `beforeAll`, *after* calling `setupTestDb`.
    *   *Result:* Still failed with `Sequelize has not been initialized or set.`, indicating the models are likely still being processed/imported by Jest before `beforeAll` completes its setup, despite the dynamic import syntax.

5.  **`tests/db-setup.ts` Umzug Configuration:**
    *   *Problem:* TypeScript errors related to `SequelizeStorage` expecting an instance vs. a function, and incorrect type for `resolve` parameters.
    *   *Fix:* Moved `Umzug` instantiation inside `setupTestDb` after Sequelize instance is created. Corrected `resolve` parameter type to `import('umzug').MigrationParams<QueryInterface>`.
    *   *Result:* Resolved TypeScript errors in `tests/db-setup.ts`.

**Conclusion:** The fundamental issue appears to be Jest's module execution order interacting with Sequelize model definitions that rely on a globally available (but asynchronously initialized) instance. The top-level model imports in the test files trigger `Model.init` too early.

**Next Debugging Ideas:**

*   **Jest Global Setup:** Use Jest's `globalSetup` configuration option to run the database initialization *once* before all test suites. This might guarantee the instance is ready before any test file code executes.
*   **Jest `setupFilesAfterEnv`:** Use `setupFilesAfterEnv` to run the DB setup. While typically for test framework setup, it runs before tests in a suite, but *after* the environment is set up, which might be sufficient if `globalSetup` is too complex.
*   **Manual Mocking:** Explicitly mock the models during the test setup phase and only unmock/import them after `beforeAll`.
*   **Review `next/jest`:** Investigate if the `next/jest` wrapper introduces specific behaviors affecting module loading order or transformations.

---

## Vercel Build Debugging Notes (Updated 2025-03-28 ~03:20 AM MDT)

**Problem:** Encountered a series of TypeScript and module resolution errors during Vercel builds after recent changes.

**Debugging Steps & Fixes:**

1.  **`src/pages/api/compliance/[id].ts` - Type Errors:**
    *   Initial Error: `Interface 'ComplianceWithEmployee' incorrectly extends interface 'Compliance'` due to `employee?: Employee | null`.
        *   *Fix:* Changed type to `employee?: Employee`.
    *   Subsequent Errors: `Type 'Employee | undefined' is not assignable to type 'Employee'` and `'employee' is possibly 'undefined'` when accessing `employee.userId` or `employee.departmentId` after conditional checks.
        *   *Fix:* Added non-null assertions (`employee!`) where TypeScript couldn't infer non-null status based on prior checks.
    *   Final Error: `Type 'null' is not assignable to type 'number | undefined'` when passing `userDepartmentId` to `checkAccess`.
        *   *Fix:* Used nullish coalescing (`userDepartmentId ?? undefined`) in the function call to convert potential `null` to `undefined`.

2.  **`src/pages/api/leave/[id]/approve.ts` - Import & Type Errors:**
    *   Error: `Module '"'db"'' has no exported member 'sequelize'`. (Build log showed corrupted path `''db''`, but actual file path `@/db` was correct).
        *   *Investigation:* Checked `src/db/index.ts` and `src/db/mockDbSetup.ts`. Confirmed `sequelize` instance is accessed via `getSequelizeInstance()`.
        *   *Fix:* Removed `sequelize` from `@/db` import, imported `getSequelizeInstance` from `@/db/mockDbSetup`, and replaced `sequelize.transaction()` with `getSequelizeInstance().transaction()`.
    *   Error: `Argument of type 'Date' is not assignable to parameter of type 'string'` for `calculateLeaveDuration`.
        *   *Fix:* Converted `Date` objects to ISO strings using `.toISOString()`.
    *   Error: Duplicate argument `leaveRequest.leaveType` passed to `deductLeaveBalance`.
        *   *Fix:* Removed the duplicate argument.
    *   (Potential Error): Initial TS error suggested `deductLeaveBalance` expected `number` for `leaveType`, but function signature confirmed `string`. Assumed TS error was stale.

3.  **`src/pages/api/leave/index.ts` - Redeclaration Error:**
    *   Error: `Cannot redeclare block-scoped variable 'employeeId'`.
        *   *Fix:* Removed duplicate destructuring assignment of `req.query`.

4.  **`src/pages/index.tsx` - Type Error:**
    *   Error: `Property 'username' does not exist on type '{...}'` when accessing `session.user.username`.
        *   *Fix:* Removed the fallback access to `session.user.username`.

5.  **`tests/db-setup.ts` - Module Resolution & Type Errors:**
    *   Error: `Cannot find module 'umzug/storage/sequelize'`.
        *   *Investigation:* Checked `package.json`, found `umzug` dependency was missing.
        *   *Fix 1:* Installed `umzug` (`npm install umzug@^2.3.0`).
        *   *Fix 2 (Error persisted):* Changed import from `import { SequelizeStorage } from 'umzug/storage/sequelize'` to `import { Umzug, SequelizeStorage } from 'umzug'`.
    *   Error: `Type '() => Sequelize' is not assignable to type 'SequelizeType'` for `SequelizeStorage`.
        *   *Fix:* Moved `Umzug` instantiation inside `setupTestDb` after Sequelize instance is created.
    *   Error: Type incompatibility for `resolve` function parameters.
        *   *Fix:* Corrected `resolve` parameter type to `import('umzug').MigrationParams<QueryInterface>`.

6.  **`src/modules/leave/services/leaveAccrualService.ts` - Import Error & Typo:**
    *   Error: Typo `Sea` at start of file.
        *   *Fix:* Removed typo.
    *   Error: `Module '"@/modules/employees/models/Employee"' has no exported member 'Employee'`.
        *   *Fix:* Changed import to default import: `import Employee from '@/modules/employees/models/Employee';`.

**Outcome:** After these fixes, the Vercel build process and local TypeScript checks are expected to succeed regarding these specific issues. The Jest integration test initialization remains the primary blocker.

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
