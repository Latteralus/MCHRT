# Project Definitions & Seeding Process

This document provides definitions for key terms used within the Mountain Care HR project and explains the process for seeding the database with fake data for development purposes.

## Key Definitions

*   **User:** Represents an individual who can log in to the system. Users have roles (e.g., 'admin', 'employee') and are linked to an Employee record. Key attributes include `username`, `passwordHash`, `role`.
*   **Employee:** Represents a person employed by the organization. Linked to a User record. Contains personal and employment details like `firstName`, `lastName`, `positionId` (FK to Position), `hireDate`, `departmentId`, and `status` ('Onboarding', 'Active', 'Terminating', 'Terminated', 'On Leave', 'Vacation').
*   **Department:** Represents an organizational unit (e.g., Administration, Human Resources, Operations, Hospice, Wellness, Compounding). Employees belong to a Department. Key attributes include `name`.
*   **Attendance:** Records an employee's presence for a specific date, typically via clock-in/out times. Key attributes include `employeeId`, `date`, `timeIn`, `timeOut`.
*   **Leave Balance:** Tracks the remaining leave time (sick, vacation, personal) for an employee. Key attributes include `employeeId`, `sickLeaveBalance`, `vacationLeaveBalance`, `personalLeaveBalance`.
*   **Onboarding:** The process of integrating a new employee into the organization. Involves checklists and tasks.
*   **Offboarding:** The process of managing an employee's departure from the organization. Involves checklists and tasks.
*   **Compliance Item:** Represents a requirement or certification an employee must maintain (e.g., HIPAA training, license expiration).
*   **Document:** Represents files uploaded or managed within the system, often related to employees or compliance.
*   **Position:** Represents a job title within the organization (e.g., Manager, Pharmacist). Linked from Employee. Key attributes include `name`.
*   **Offboarding:** Represents the process of managing an employee's departure. Linked to an Employee. Creating an Offboarding record sets the Employee status to 'Terminating' and triggers the creation of default Offboarding Tasks based on Task Templates. Key attributes include `employeeId`, `exitDate`, `status`.
*   **Onboarding Template:** Stores the definition of a standard onboarding checklist. Key attributes include `templateCode`, `name`.
*   **Onboarding Template Item:** Stores an individual task definition within an Onboarding Template. Key attributes include `templateId`, `taskDescription`, `responsibleRole`, `dueDays`.
*   **Activity Log:** Records significant actions performed by users within the system. Key attributes include `userId`, `actionType`, `description`, `entityType`, `entityId`.
*   **Task Template:** Stores definitions for default tasks, primarily used for offboarding currently. Key attributes include `description`, `defaultAssignedRole`.
*   **Offboarding Task:** Represents an individual task assigned as part of an Offboarding process. Linked to an Offboarding record. Key attributes include `offboardingId`, `description`, `status`, `assignedToUserId`, `assignedRole`.

## Database Seeding

Seeding populates the development database with realistic fake data, allowing developers to test features without manually creating numerous records.

### Seeding Method

This project uses Sequelize CLI seeders. The primary seeder for fake data is located at:

*   `src/db/seeders/002-fake-data.js` (for fake employees/users)
*   `migrations/YYYYMMDDHHMMSS-create-onboarding-template-items.js` (seeds initial onboarding templates and items)
*   `migrations/YYYYMMDDHHMMSS-create-positions.js` (seeds initial positions)
*   `src/db/seeders/YYYYMMDDHHMMSS-default-offboarding-task-templates.js` (seeds default offboarding tasks)

This seeder generates:
1.  **Departments:** Creates standard departments ('Administration', 'Human Resources', 'Operations', 'Hospice', 'Wellness', 'Compounding') if they don't exist.
2.  **Users:** Creates a set number (currently 50) of fake users with the role 'employee', generic usernames (`user1`, `user2`, etc.), and a default password (`password123`). It avoids creating duplicates if run multiple times.
3.  **Employees:** Creates corresponding employee records for the fake users, assigning them random departments, *position IDs* (referencing seeded positions), and hire dates. It avoids creating duplicates if run multiple times.
4.  **Positions & Onboarding Templates/Items:** Seeded via their respective migration files.
5.  *(Future/Simplified)*: The seeder structure includes placeholders for generating Attendance and Leave Balance records, which are currently skipped for simplicity but can be added later.

### How to Run Seeding

**Note:** The model initialization pattern has been refactored (using initializer functions and a central `src/db/index.ts`). The seeding process described below relies on compiling TypeScript models to JavaScript (`./dist-seed`) for use by standard Sequelize CLI seeders. This compilation and the seeders themselves likely need adjustment to work with the new model structure (e.g., requiring `dist-seed/db/index.js` and accessing initialized models from there, instead of requiring individual compiled model files).

Seeding currently requires two steps:

1.  **Compile Models:** The TypeScript models and the central DB index file need to be compiled into JavaScript so the standard Sequelize CLI seeder can use them. A dedicated tsconfig (`tsconfig.seed.json`) is used for this. **(This step might need verification/adjustment after model refactoring)**.
    ```bash
    npm run db:seed:compile
    ```
    This command runs `tsc -p tsconfig.seed.json` and outputs the compiled JavaScript files into the `./dist-seed` directory.

2.  **Run Seeder:** Execute the standard Sequelize CLI command to run all pending seeders.
    ```bash
    npm run db:seed:all
    ```
    This command now runs `npm run build:config && npx sequelize-cli db:seed:all`. It first ensures the `src/config/config.js` file is up-to-date, then finds and executes the `up` method in the seeder files (like `src/db/seeders/002-fake-data.js`). These scripts then `require` the compiled JavaScript output from `./dist-seed` (likely needing to target `dist-seed/db/index.js`) to interact with the database using the initialized models.

**Important:** If you modify any TypeScript models (`src/modules/**/*.ts`) or the central DB initializer (`src/db/index.ts`), you **must** re-run `npm run db:seed:compile` before running `npm run db:seed:all` to ensure the seeder uses the latest compiled code. The `npm run db:seed:all` command automatically handles rebuilding the `src/config/config.js` file if `src/config/config.ts` changes.