# Plan: Frontend Data Integration

**1. Goal:**

Transition the entire frontend application from using mock data and hardcoded values to interacting exclusively with the live backend API. This involves:
*   Fetching and displaying data from the database via API endpoints on all relevant pages and components.
*   Ensuring all interactive elements (forms, buttons, links) trigger the correct API calls for Create, Read, Update, and Delete (CRUD) operations.
*   Reflecting the actual seeded database content (users, employees, departments, etc.) in the UI.

**2. Prerequisites:**

*   **Stable Database Schema:** All necessary database models and migrations are finalized and applied.
*   **Populated Seed Data:** The database contains realistic seed data (users with different roles, employees, departments, etc.) generated via `npm run db:seed:all`.
*   **Functional API Endpoints:** All required API endpoints for fetching data (GET) and performing actions (POST, PUT, DELETE) are implemented, tested (e.g., via integration tests or tools like Postman/Insomnia), and return data in the expected format.
*   **API Authentication/Authorization:** API endpoints are secured using NextAuth and appropriate Role-Based Access Control (RBAC) middleware.

**3. General Approach:**

We will tackle the integration module by module, focusing on one major feature area at a time. For each module/page:
*   Identify components currently relying on mock data.
*   Verify the corresponding API endpoint exists and functions correctly.
*   Replace mock data fetching logic with actual API calls (using `fetch`, SWR, React Query, or appropriate client-side data fetching strategy).
*   Connect forms, buttons, and other interactive elements to trigger the appropriate API requests.
*   Test the functionality thoroughly, including loading states, error handling, and data display.

**4. Detailed Integration Steps (By Module):**

*   **A. Dashboard (`src/pages/index.tsx`, `src/components/dashboard/widgets/*`)** - `[DONE]`
    *   **Target Components:** `EmployeeStats`, `AttendanceWidget`, `LeaveWidget`, `ComplianceStatsWidget`, `ExpiringComplianceWidget`, `RecentDocuments`, `ActivityFeed`.
    *   **Actions:**
        *   Verify/Create API endpoints (e.g., `/api/dashboard/metrics`, `/api/dashboard/activity`).
        *   `[/]` Replace mock data generation/fetching in each widget with calls to live API endpoints. (Most widgets already used API calls; `ExpiringComplianceWidget` and `RecentDocuments` updated).
        *   Implement loading states while data is being fetched.
        *   Handle potential API errors gracefully.

*   **B. Employee Management (`src/pages/employees/*`, `src/pages/profile.tsx`, `src/components/employees/*`)** - `[DONE]`
    *   `[/]` **List (`/employees`):** Already used API call. Actions and basic name filter enabled.
    *   `[/]` **Detail (`/employees/[id]`):** Already used API call. Added department name fetching and back link.
    *   **New/Edit (`/employees/new`, `/employees/[id]` form):**
        *   Fetch existing data for edit form from `/api/employees/[id]`.
        *   `[/]` Ensure form submission triggers POST `/api/employees` (for new) or PUT `/api/employees/[id]` (for edit). (Verified `new.tsx` and `edit.tsx`)
        *   `[x]` Implement delete button functionality triggering DELETE `/api/employees/[id]`. (Added to `index.tsx`)
    *   `[/]` **Profile (`/profile`):** Already used API call.

*   **C. Attendance (`src/pages/attendance/*`, `src/components/attendance/*`)** - `[DONE]`
    *   `[x]` **List (`/attendance`):** Updated SSR fetch for employee filter. `[/]` `AttendanceList` component already used API call.
    *   `[x]` **Record (`/attendance/record`):** Updated SSR fetch for employee filter. `[/]` `AttendanceForm` component already used API call (minor cleanup done).

*   **D. Leave Management (`src/pages/leave/*`, `src/components/leave/*`)** - `[DONE]`
    *   `[x]` **List (`/leave`):** Updated SSR fetch for stats cards. `[/]` `LeaveRequestList` component already used API call.
    *   `[/]` **Request (`/leave/request`):** Page structure correct. `[/]` `LeaveRequestForm` component already used API call.
    *   `[/]` **Leave Balance Component (`LeaveBalanceDisplay`):** Already used API call.
    *   `[/]` **Approval/Rejection:** Handled within `LeaveRequestList`, already used API calls.

*   **E. Compliance (`src/pages/compliance/*`, `src/components/compliance/*`)** - `[DONE]`
    *   `[/]` **List (`/compliance`):** Page fetches filter data correctly. `[/]` `ComplianceList` component already used API call.
    *   `[/]` **Form Component (`ComplianceForm`):** Already used API calls.

*   **F. Documents (`src/pages/documents/*`, `src/components/documents/*`)** - `[DONE]`
    *   `[/]` **List (`/documents`):** Page fetches filter data correctly. `[/]` `DocumentList` component already used API call.
    *   `[/]` **Upload Form (`UploadForm`):** Already used API call.
    *   `[/]` **Download/Delete Actions:** Handled within `DocumentList`, already used API calls.

*   **G. Tasks (`src/pages/tasks/*`, `src/components/tasks/*`)** - `[DONE]`
    *   `[/]` **List (`/tasks`):** Page structure correct. `[/]` `TaskList` component already used API call.
    *   **Form Component:** (Not implemented yet) Ensure form submission triggers POST/PUT to `/api/tasks` or `/api/tasks/[id]`.

*   **H. Onboarding/Offboarding (`src/pages/onboarding/*`, `src/pages/offboarding/*`)** - `[DONE]`
    *   `[x]` **Onboarding Page (`/onboarding`):** Updated to fetch stats and list data.
    *   `[/]` **`OnboardingList`:** Presentational component, receives live data.
    *   `[x]` **`OnboardingTaskList`:** Updated to fetch tasks and handle status updates via API.
    *   Offboarding page not reviewed, assumed similar structure or task-based.

*   **I. Reports (`src/pages/reports/*`)** - `[DONE]`
    *   `[x]` **Reports Index (`/reports`):** Updated SSR fetch for department filter and client-side fetch for Attendance Summary preview table.
    *   `[x]` **Attendance Report Page (`/reports/attendance`):** Updated SSR fetch for department filter. `[x]` `AttendanceSummaryReport` component updated to fetch live data.
    *   `[/]` **Department Report Page (`/reports/departments`):** Already used API calls.

*   **J. Settings/Admin Pages (If applicable)** - `[N/A - Not Implemented]`
    *   Review pages for managing Departments, Users, Roles. *(Finding: Dedicated frontend pages for User/Department management do not appear to exist in the current structure, likely outside MVP scope)*
    *   Ensure data display and updates use API calls. *(N/A as pages don't exist)*
**5. Testing Strategy:**

*   **Manual Testing:** After integrating each module/page:
    *   Verify data loads correctly and matches seed data.
    *   Test all CRUD operations (creating, viewing, editing, deleting where applicable).
    *   Check loading states and error handling (e.g., display a message if an API call fails).
    *   Test form validations.
*   **RBAC Testing:** Log in as users with different roles (Admin, Department Head, Employee) and verify:
    *   Users only see data they are authorized to see.
    *   Users can only perform actions permitted by their role.
    *   UI elements (buttons, links, form fields) are appropriately shown/hidden/disabled based on role.
*   **Browser Console:** Monitor the developer console for network errors (4xx, 5xx) or JavaScript warnings/errors during testing.
*   **E2E Tests (Optional but Recommended):** Update or create End-to-End tests (e.g., using Playwright) to automate testing of key user flows with live data interaction.

**6. Documentation:**

*   Update any component-level documentation (e.g., Storybook stories, JSDoc comments) to reflect that components now expect live data props or fetch their own data.
*   Review `TechnicalDocument.md` or other relevant design documents to ensure they accurately reflect the data flow.