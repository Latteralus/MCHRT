# Mountain Care HR Management Platform - Technical Document (Revised)

## 1. Introduction

Mountain Care is a Next.js-based, single-tenant HR Management platform intended for a Compounding Pharmacy environment. It handles core HR functionalities—employee management, attendance tracking, leave management, onboarding/offboarding automation, compliance (including HIPAA considerations for employee data), document management, and basic reporting. The target organization has approximately 250 employees across departments including Administration, Human Resources, Operations, Compounding, and Shipping, and does not experience significant usage spikes.

**MVP Focus:** While this document outlines the comprehensive technical plan, the initial development phase will focus on delivering a Minimum Viable Product (MVP) encompassing basic functionality for all core modules.

**UI Goal:** The user interface should aim to closely match the provided dashboard design screenshot.

## 2. Architectural Approach

### Monolithic, Modular Organization

- Front-end and back-end (API routes) are part of the same Next.js codebase.
- Features are separated into modules (employee, attendance, leave, compliance, etc.) for clarity and maintainability.

### Why a Modular Monolith?

- **Simplicity**: Easier for a small-to-medium HR team or a single-tenant setup.
- **Unified Deployment**: Simple to deploy on Vercel (or a single Docker instance) without complex orchestrations.
- **Future Flexibility**: Should demands grow, modules can be broken out into separate services.

## 3. Technology Stack

### Frameworks & Libraries

- **Next.js** (React 19+) for front-end + server-side rendering
- **NextAuth.js** for authentication, configured with **CredentialsProvider**
- **Sequelize** as the ORM for structured database access
- **PostgreSQL** for the primary relational database
- **Node.js** (16+ recommended)

### Key Rationale

- **Sequelize & PostgreSQL**: A mature and feature-rich combination well-suited for relational data and complex queries. Sequelize supports transactions, migrations, and various querying methods.
- **Next.js**: Provides both client and server logic in one place, plus easy serverless deployment options.
- **NextAuth.js CredentialsProvider**: Allows for secure username/password authentication as required, with email login disabled.
- **Single-Tenancy**: Data modeling is simpler than multi-tenant (no separate tenant tables or schemas needed).

## 4. Front-End & Back-End Communication

### Next.js API Routes

- Each domain has a dedicated route (e.g., `/api/employees`, `/api/attendance`) handling CRUD operations via Sequelize.
- Requests use fetch() or axios from the client to these serverless endpoints.

### Data Flow

Front-End → API Route → Sequelize → PostgreSQL

The NextAuth.js session ensures secure authentication tokens or cookies are attached to these requests.

## 5. Database & Data Storage

### Schema Design

While final designs may vary, below are examples of likely tables in PostgreSQL:

**Users** (for authentication via NextAuth + role management):
- id, username, passwordHash, role, departmentId, createdAt, updatedAt (*Note: No email field required for login*)

**Employees**:
- id, firstName, lastName, ssn (*handle with care*), departmentId, positionId (FK), hireDate, status ('Onboarding', 'Active', 'Terminating', 'Terminated', 'On Leave', 'Vacation'), etc.

**Departments**:
- id, name (Administration, Human Resources, Operations, Compounding, Shipping), managerId, etc.
**Positions**:
- id, name (e.g., 'Manager', 'Pharmacist', 'Pharmacy Technician')


**Attendance**:
- id, employeeId, date (DATEONLY), timeIn (DATETIME), timeOut (DATETIME), etc.

**Leave**:
- id, employeeId, startDate, endDate, leaveType, status, etc.

**Compliance**:
- id, employeeId, licenseType, expirationDate, status, etc.

**Documents**:
- id, title, filePath (*path on local server*), ownerId, version, createdAt, updatedAt

**Offboardings**:
- id, employeeId (FK, unique), exitDate (DATEONLY), reason (TEXT), status ('Pending', 'InProgress', 'Completed', 'Cancelled'), createdAt, updatedAt

**OnboardingTemplates**:
- id, templateCode (String, unique), name, description, createdAt, updatedAt

**OnboardingTemplateItems**:
- id, templateId (FK), taskDescription, responsibleRole, dueDays, notes, createdAt, updatedAt

**ActivityLogs**:
- id, userId (FK), actionType, entityType, entityId, description, details (JSON), createdAt

**TaskTemplates**:
- id, description, defaultAssignedRole, createdAt, updatedAt

**OffboardingTasks**:
- id, offboardingId (FK), description, status ('Pending', 'Completed'), assignedToUserId (FK), assignedRole, createdAt, updatedAt

Note: Onboarding process relies on Tasks linked via relatedEntityType='Onboarding' and relatedEntityId=employeeId. Templates are now stored in the database. Offboarding uses the dedicated `Offboardings` table and automatically generates tasks from `TaskTemplates` into `OffboardingTasks`, also setting the `Employee` status to 'Terminating'.

### Sequelize Model Management

- **Initialization:** The Sequelize instance is created and configured in `src/db/index.ts`. This central file also imports initializer functions from each model file (e.g., `src/modules/.../models/MyModel.ts`). Each model file defines its class structure and exports an `initializeMyModel(sequelize)` function which calls `MyModel.init(...)` using the passed Sequelize instance. `src/db/index.ts` calls these initializers for all models.
- **Associations:** Model associations (e.g., `belongsTo`, `hasMany`) are defined within a static `associate(models)` method inside each model class file. After all models are initialized in `src/db/index.ts`, it iterates through the initialized models and calls their respective `associate` methods, passing the collection of all models to establish the relationships. This pattern avoids circular dependency issues during initialization.
- **Usage:** Other parts of the application (API routes, services) should import the initialized models directly from `src/db/index.ts` (e.g., `import { User, Department } from '@/db';`).
- **Migrations:** Database schema migrations continue to be managed using the Sequelize CLI.

### Backup & Recovery

- **Database:** A backup every 8 hours is recommended. Tools like pg_dump or cloud provider snapshots can achieve this schedule. Plan for point-in-time recovery if storing transaction logs.
- **Documents (Local Filesystem):** The backup strategy for documents stored on the local server filesystem is **deferred** and will be defined later.

## 6. Core Features & Modules (MVP Scope Included)

The MVP aims to provide basic, functional implementations for all modules listed below, using mock data initially where needed. Dashboard stats and feeds should be functional in the MVP.

### Employee Management
- Basic CRUD operations for ~250 employees.
- Department-based roles and permissions (details in Section 8).
- Detail pages for each employee.

### Onboarding/Offboarding Automation
- MVP: Onboarding templates stored in DB, tasks automatically created on employee creation based on position. Offboarding process initiated via form, sets Employee status to 'Terminating', and automatically creates default tasks based on Task Templates. Email reminders based on criteria (e.g., license expiry).
- Future: UI for managing templates, more sophisticated task assignment logic (finding manager/HR/IT), potential e-signatures, etc.

### Attendance Tracking
- MVP: Basic daily log viewing and entry.
- Future: Integration with scheduling/timeclocks, summaries, analytics.

### Leave Management
- MVP: Basic submission forms, viewing requests.
- Future: Approval flows, calendar visualization, integration with attendance.

### Compliance (HIPAA & Expirations)
- Track licenses/certifications, set expiry reminders (MVP includes tracking & email reminders).
- Store potentially sensitive employee details like **Social Security Numbers** (subject to HIPAA considerations for employee data, requiring encryption at rest and strict access controls). Note: No patient PHI involved.
- Apply encryption at rest for relevant sensitive fields.

### Document Management
- Upload documents to the **local server filesystem**, store path references in Postgres.
- MVP includes upload and **RBAC-controlled viewing** capabilities.
- Future: Version control, advanced permission checks. Auditing implemented via ActivityLogs table.

### Reporting & Analytics
- MVP: Basic data viewing corresponding to core features.
- Future: Basic data exports (CSV or PDF), high-level HR metrics. No complex custom reports required initially.

### Settings & Configuration
- Manage Roles and department-based access (RBAC).
- System-level preferences (notifications).
- Self-service for employees to update personal info; managers and HR staff have higher privileges.

## 7. Environment Setup & Configuration

### Required Variables (.env.local):

- DATABASE_URL=postgresql://...
- NEXTAUTH_SECRET=<some-random-string>
- NEXTAUTH_URL=<https://mountain-care.example.com>
- Additional secrets for encryption keys if storing sensitive data (like SSNs) in encrypted columns.
- `FILE_STORAGE_PATH`=</path/to/local/document/storage>

### Dependencies

- Node.js 16+
- Sequelize 6+
- PostgreSQL 12+
- Next.js 14+ and React 19+
- NextAuth 4+

### Automated Deployments

- Environment variables configuration depends on the chosen hosting (Vercel, Docker, AWS, etc.). Ensure the deployment environment can access the DB and the local filesystem path for documents.

## 8. Security & Access Control

### HIPAA Compliance (Employee Data)

- **Encryption at Rest**: Use appropriate methods (e.g., Postgres extensions like pgcrypto, application-level encryption, or disk-level encryption) for sensitive fields like SSNs.
- **Secure Transport**: Enforce HTTPS in production, SSL/TLS for DB connections.
- **Access Logs & Auditing**: Implemented via `ActivityLogs` table. Retention policy TBD (depends on DB backup/archiving). Tracks key actions like creation, updates, approvals.

### Role-Based Access Control (RBAC)

- **Admin Role:** Assigned to "Administration Managers" and "Human Resources Managers". Grants full access across all departments and system settings.
- **Department Head Role:** Assigned to managers of Operations, Compounding, or Shipping. Grants access to manage employees and data *only* within their specific department.
- **Employee Role:** Applies to standard employees and non-manager Administration staff. Grants access only to their own personal information and general company documents/resources.
- RBAC checks integrated into API routes and data queries (Sequelize scopes/hooks).

### Document Access Control (Local Filesystem)
- Access to documents stored on the local filesystem will be controlled via application-level RBAC checks, ensuring users can only access documents permitted by their role and department association. Filesystem permissions should be restrictive, allowing access primarily via the application service account.

### Authentication

- Implemented using **NextAuth.js** with the **CredentialsProvider**.
- Handles login via unique **username** and password. Email is not used for login.
- Consider implementing 2FA if required for compliance or sensitive operations in the future.

## 9. Deployment & Hosting Plans

### Vercel (for testing)

- Straightforward Next.js deployment.
- Automatic scaling of API routes.
- Requires connecting to a hosted PostgreSQL (e.g., Vercel Postgres, Azure, Heroku, AWS RDS).
- **Challenge:** Vercel's serverless nature might complicate direct access to a persistent local filesystem for documents. Requires careful consideration or alternative storage (like S3/compatible service) if using Vercel.

### CI/CD

- Use tools like GitHub Actions to run tests, lint, build, and migrations prior to deployment.
- Migrations: Run using the Sequelize CLI as part of the deployment process.

## 10. Maintenance & Scalability

### Logging & Monitoring

- Use console logs or a library like Winston for structured application logs.
- Implement basic health checks. Monitoring solutions (Datadog, New Relic, CloudWatch) can be added if needed.

### Backup Strategy

- **Database:** Snapshots every 8 hours (via hosting provider or `pg_dump`).
- **Documents (Local Filesystem):** Strategy is **deferred** and needs to be defined. Consider filesystem-level backups or syncing to a secondary location.

### Scheduled Jobs

- Implement using Node-cron, external cron services, or platform-specific features for tasks like license expiry notifications and compliance checks.

### Scalability

- The initial ~250 employee count is manageable with the monolithic approach.
- **Local Storage:** User is confident current infrastructure can handle document volume, with plans to expand server storage units if needed. Future growth might necessitate evaluating cloud storage options.
- Database performance can be scaled by increasing resources or introducing caching (Redis) if required.

### Ongoing Updates

- Maintain a CHANGELOG.md.
- Keep Node.js, Next.js, Sequelize, and other dependencies updated.
- Regularly review logs and audits.

## 11. Error Handling Approach

- Implement centralized error logging (e.g., using Winston or a similar library).
- API routes should return standardized error responses (e.g., consistent JSON structure with appropriate HTTP status codes) to the client.
- Front-end should handle API errors gracefully, providing user-friendly feedback.

## 12. Testing Strategy

- **Unit Tests:** Use a framework like Jest to test critical business logic, utility functions, and potentially Sequelize model validations.
- **Integration Tests:** Test API routes, ensuring they interact correctly with the database (or mock DB) and enforce RBAC rules. Tools like Supertest can be used.
- **End-to-End (E2E) Tests:** Use frameworks like Cypress or Playwright to test key user flows through the UI.
- **Mock Database:** Utilize a mock database setup (e.g., using SQLite with Sequelize) during development and automated testing (especially for the MVP) to enable rapid feedback cycles. Ensure the mock setup can simulate necessary data and relationships, including RBAC scenarios, and is designed for easy transition to PostgreSQL.

## 13. Additional Considerations

### Documentation:
- Maintain code-level docs (JSDoc/TSDoc) for critical modules and functions.
- Provide internal Wiki pages or guides for common HR workflows.

### Integrations:
- Currently none planned. If external systems (payroll, benefits) are needed later, design modules for clean separation.

### Naming Conventions:
- Use PascalCase for React components and Sequelize models, camelCase for function/variable names, UPPER_CASE for environment variables.