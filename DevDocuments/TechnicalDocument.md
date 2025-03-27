# Mountain Care HR Management Platform - Technical Document

## 1. Introduction

Mountain Care is a Next.js-based, single-tenant HR Management platform intended to handle core HR functionalities—employee management, attendance tracking, leave management, onboarding/offboarding automation, compliance (including HIPAA considerations), document management, and basic reporting. The target organization has approximately 250 employees and does not experience significant usage spikes.

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
- **NextAuth.js** for authentication
- **TypeORM** as the ORM for structured database access, using EntitySchema approach
- **PostgreSQL** for the primary relational database
- **Node.js** (16+ recommended)

### Key Rationale

- **TypeORM & PostgreSQL**: Well-suited for relational data and transactions. TypeORM simplifies migrations, schema updates, and eliminates most raw SQL complexities.
- **Next.js**: Provides both client and server logic in one place, plus easy serverless deployment.
- **Single-Tenancy**: Data modeling is simpler than multi-tenant (no separate tenant tables or schemas needed).
- **EntitySchema Approach**: Ensures compatibility with serverless environments like Vercel by avoiding TypeScript decorators.

## 4. Front-End & Back-End Communication

### Next.js API Routes

- Each domain has a dedicated route (e.g., `/api/employees`, `/api/attendance`) handling CRUD via TypeORM.
- Requests use fetch() or axios from the client to these serverless endpoints.

### Data Flow

Front-End → API Route → TypeORM → PostgreSQL

The NextAuth.js session ensures secure authentication tokens or cookies are attached to these requests.

## 5. Database & Data Storage

### Schema Design

While final designs may vary, below are examples of likely tables in PostgreSQL:

**Users** (for authentication via NextAuth + role management):
- id, name, email, passwordHash, role, departmentId, createdAt, updatedAt

**Employees**:
- id, firstName, lastName, departmentId, position, hireDate, etc.

**Departments**:
- id, name, managerId, etc.

**Attendance**:
- id, employeeId, date, timeIn, timeOut, etc.

**Leave**:
- id, employeeId, startDate, endDate, leaveType, status, etc.

**Compliance**:
- id, employeeId, licenseType, expirationDate, status, etc.

**Documents**:
- id, title, filePath, ownerId, version, createdAt, updatedAt

Note: Onboarding/offboarding can have their own tables or be integrated into Employees/Tasks tables, depending on the complexity of automation.

### TypeORM Entity Management

- Using TypeORM's EntitySchema approach rather than TypeScript decorators for better compatibility with serverless environments
- Schema definitions maintained in individual entity files using JavaScript classes and schemas
- Database synchronization available for development; migrations for production

### Backup & Recovery

- A backup every 8 hours is recommended. Tools like pg_dump or cloud provider snapshots can achieve this schedule.
- Plan for point-in-time recovery if storing transaction logs.

## 6. Core Features & Modules

Below is a more precise alignment with your clarifications:

### Employee Management

- ~250 employees; no large concurrency or peak usage concerns.
- Department-based roles and permissions for managers vs. employees.
- CRUD (create, read, update, delete) with separate detail pages for each employee.

### Onboarding/Offboarding Automation

- Custom tasks assigned (equipment provisioning, document collection, orientation schedule).
- Automated notifications or checklists triggered by hiring/termination events.
- Optional advanced features: e-signatures, scheduling exit interviews.

### Attendance Tracking

- Daily logs with time in/out.
- Potential to integrate with a scheduling or timeclock system.
- Summaries and attendance analytics (e.g., monthly absenteeism rate).

### Leave Management

- Submission forms, approval flows, calendar visualization.
- Department heads or HR managers can approve, reject, or adjust requests.
- Integration with attendance to avoid double-booking or conflicting data.

### Compliance (HIPAA & Expirations)

- Track licenses/certifications, set expiry reminders.
- Store potentially sensitive health-related details for employees (subject to HIPAA).
- Apply encryption at rest for relevant fields (TypeORM can integrate with Postgres-level encryption or external KMS).

### Document Management

- Upload documents, store path references in Postgres.
- Version control and departmental permission checks.
- 60-day retention for logs/auditing: keep track of who accessed/modified each document.

### Reporting & Analytics

- Basic data exports (CSV or PDF) for attendance, leave requests, compliance statuses.
- Potentially display high-level HR metrics (turnover rate, time-to-hire, etc.).
- Storage of logs for 60 days.

### Settings & Configuration

- Roles and department-based access (RBAC).
- System-level preferences (notifications, backup schedules).
- Self-service for employees to update personal info; managers and HR staff have higher privileges.

## 7. Environment Setup & Configuration

### Required Variables (.env.local):

- DATABASE_URL=postgresql://...
- NEXTAUTH_SECRET=<some-random-string>
- NEXTAUTH_URL=<https://mountain-care.example.com>
- Additional secrets for encryption keys if storing HIPAA data in an encrypted column.

### Dependencies

- Node.js 16+
- TypeORM 0.3+
- PostgreSQL 12+
- Next.js 14+ and React 19+
- NextAuth 4+

### Automated Deployments

- If using Vercel, environment variables can be set in project settings.
- If using Docker or AWS, ensure the container or server can access the DB.

## 8. Security & Access Control

### HIPAA Compliance

- **Encryption at Rest**: Use Postgres features like TDE (if available) or disk-level encryption.
- **Secure Transport**: Enforce HTTPS in production, SSL/TLS for DB connections.
- **Access Logs & Auditing**: Keep logs for 60 days to track user actions on sensitive data.

### Role-Based Access Control (RBAC)

- **Admins/HR Managers**: Full control over employee data, can manage departments.
- **Department Heads**: Limited to employees within their department.
- **Employees**: Access to their own profiles, attendance, and leave data.
- Department-based checks integrated with TypeORM queries (e.g., only fetch employees from allowed departments for a manager).

### Scheduled Tasks & Notifications

- Next.js environment or a Node-based cron for daily HIPAA compliance checks, license expirations, or daily backups.

### Authentication

- NextAuth.js: Session tokens (JWT or database sessions).
- Implement 2FA if required for compliance or sensitive operations.

## 9. Deployment & Hosting Plans

### Vercel

- Straightforward Next.js deployment.
- Automatic scaling of API routes; only pay for usage.
- Connect to a hosted PostgreSQL (e.g., Azure, Heroku, or AWS RDS).
- Works with the EntitySchema approach we've implemented.

### Docker / On-Prem (Alternate)

- Build a Docker image with npm run build && npm run start.
- Use docker-compose for local dev environment with a Postgres container.
- Could be deployed to AWS ECS/EKS or an on-prem Kubernetes cluster.

### CI/CD

- If on GitHub, use GitHub Actions to run tests, lint, build, and migrations prior to deployment.
- Migrations: Run using custom scripts or TypeORM CLI.

## 10. Maintenance & Scalability

### Logging & Monitoring

- Use console logs or Winston for structured logs.
- Monitoring solutions like Datadog, New Relic, or AWS CloudWatch if scaling beyond Vercel.

### Backup Strategy

- Database snapshots every 8 hours. Retain incremental logs or transaction logs for point-in-time restore if needed.
- For documents, consider a versioned object store (S3, local file system with versioning, or an external solution).

### Scheduled Jobs

- License expiry notifications and compliance checks can run as serverless cron jobs (e.g., Vercel Cron, GitHub Scheduled Workflows, or an external cron service).
- Email reminders or Slack notifications for tasks nearing deadlines.

### Scalability

- 250 employees is manageable with minimal concurrency concerns; the monolithic approach should suffice.
- Future growth can be handled by increasing DB resources or introducing caching (Redis). If user count grows significantly, consider microservices or splitting heavier modules.

### Ongoing Updates

- Maintain a CHANGELOG.md for version tracking.
- Keep Node.js, Next.js, and TypeORM updated for security patches.
- Regularly review logs and audits to ensure HIPAA and internal compliance.

## 11. Troubleshooting & Edge Cases

### Concurrency & Transactions

- Automated portions of onboarding/offboarding may require careful transaction handling to avoid partial data updates.
- TypeORM's transaction support ensures atomic operations.

### HIPAA & Data Privacy

- Must restrict access to any medical data to authorized personnel only.
- Sensitive columns (e.g., health details) should be encrypted or stored in a separate table if needed.

### Automatic Offboarding

- Removing or deactivating employees from the system must ensure no orphan records remain.
- Carefully revoke system access, handle final pay/leave, and archive relevant data.

### Department-based Roles

- Ensure queries filter by department for managers, or you risk data leaks.
- Implemented middleware to verify user's department ID before returning data.

## 12. Additional Considerations

### Documentation:

- Maintain code-level docs for critical modules.
- Provide internal Wiki pages for common HR workflows (like how to manage employee benefits, compliance, etc.).

### Integrations:

- If external payroll or benefits systems become necessary, maintain clean separation of concerns with dedicated modules or microservices in the future.

### Naming Conventions:

- Use PascalCase for React components and TypeORM entities, camelCase for function/variable names, UPPER_CASE for environment variables.

### Deployment Compatibility:

- Using EntitySchema approach instead of TypeScript decorators to ensure compatibility with Vercel and other serverless environments.
- Proper TypeScript configuration with experimentalDecorators enabled for development convenience.