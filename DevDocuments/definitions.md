# Project Definitions &amp; Seeding Process

This document provides definitions for key terms used within the Mountain Care HR project and explains the process for seeding the database with fake data for development purposes.

## Key Definitions

*   **User:** Represents an individual who can log in to the system. Users have roles (e.g., 'admin', 'employee') and are linked to an Employee record. Key attributes include `username`, `passwordHash`, `role`.
*   **Employee:** Represents a person employed by the organization. Linked to a User record. Contains personal and employment details like `firstName`, `lastName`, `position`, `hireDate`, `departmentId`.
*   **Department:** Represents an organizational unit (e.g., Administration, Human Resources, Operations, Hospice, Wellness, Compounding). Employees belong to a Department. Key attributes include `name`.
*   **Attendance:** Records an employee's presence, absence, or leave status for a specific date. Key attributes include `employeeId`, `date`, `status` ('present', 'absent', 'leave').
*   **Leave Balance:** Tracks the remaining leave time (sick, vacation, personal) for an employee. Key attributes include `employeeId`, `sickLeaveBalance`, `vacationLeaveBalance`, `personalLeaveBalance`.
*   **Onboarding:** The process of integrating a new employee into the organization. Involves checklists and tasks.
*   **Offboarding:** The process of managing an employee's departure from the organization. Involves checklists and tasks.
*   **Compliance Item:** Represents a requirement or certification an employee must maintain (e.g., HIPAA training, license expiration).
*   **Document:** Represents files uploaded or managed within the system, often related to employees or compliance.

## Database Seeding

Seeding populates the development database with realistic fake data, allowing developers to test features without manually creating numerous records.

### Seeding Method

This project uses Sequelize CLI seeders. The primary seeder for fake data is located at:

*   `src/db/seeders/002-fake-data.js`

This seeder generates:
1.  **Departments:** Creates standard departments ('Administration', 'Human Resources', 'Operations', 'Hospice', 'Wellness', 'Compounding') if they don't exist.
2.  **Users:** Creates a set number (currently 50) of fake users with the role 'employee', generic usernames (`user1`, `user2`, etc.), and a default password (`password123`). It avoids creating duplicates if run multiple times.
3.  **Employees:** Creates corresponding employee records for the fake users, assigning them random departments, job titles, and hire dates. It avoids creating duplicates if run multiple times.
4.  *(Future/Simplified)*: The seeder structure includes placeholders for generating Attendance and Leave Balance records, which are currently skipped for simplicity but can be added later.

### How to Run Seeding

Seeding requires two steps due to the project using TypeScript models:

1.  **Compile Models:** The TypeScript models need to be compiled into JavaScript so the standard Sequelize CLI seeder can use them. A dedicated tsconfig (`tsconfig.seed.json`) is used for this.
    ```bash
    npm run db:seed:compile
    ```
    This command runs `tsc -p tsconfig.seed.json` and outputs the compiled JavaScript files into the `./dist-seed` directory.

2.  **Run Seeder:** Execute the standard Sequelize CLI command to run all pending seeders.
    ```bash
    npm run db:seed:all
    ```
    This command runs `sequelize db:seed:all`, which finds and executes the `up` method in `src/db/seeders/002-fake-data.js`. This script then `require`s the compiled JavaScript models from `./dist-seed` to interact with the database.

**Note:** If you modify any TypeScript models (`src/modules/**/*.ts`) or the `src/db/sequelize.ts` file, you **must** re-run `npm run db:seed:compile` before running `npm run db:seed:all` to ensure the seeder uses the latest compiled code.