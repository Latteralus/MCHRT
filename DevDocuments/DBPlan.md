# Mountain Care HR Management Platform - Database Implementation Plan

## Overview
This document outlines the implementation plan for the Mountain Care HR Management platform's database layer. The plan uses a mock database implementation for development purposes, which can be easily switched to a production PostgreSQL database when ready.

## Implementation Approach

The database implementation follows these key principles:

1. **Separation of Concerns**: A database service layer abstracts the actual database implementation, providing a consistent API regardless of the underlying storage mechanism.

2. **Easy Switching**: Toggling between mock and real database implementations is controlled by a single flag in the database service.

3. **Realistic Data**: The mock database is pre-populated with realistic sample data to facilitate development and testing.

4. **Consistent API**: Both mock and real implementations will use the same method names and parameters, minimizing code changes when switching.

## Files Structure

### Core Database Files
- [x] `utils/mockDb.js` - In-memory mock database implementation
- [x] `utils/dbService.js` - Database service layer that abstracts the underlying implementation
- [x] `utils/db.js` - Real database implementation (for PostgreSQL with TypeORM)

### API Routes
- [x] **User API Routes**
  - [x] `pages/api/auth/[...nextauth].js` - Authentication with NextAuth
  - [x] `pages/api/users/index.js` - List and create users
  - [x] `pages/api/users/[id].js` - Get, update, delete specific users

- [x] **Employee API Routes**
  - [x] `pages/api/employees/index.js` - List and create employees
  - [x] `pages/api/employees/[id].js` - Get, update, delete specific employees

- [x] **Department API Routes**
  - [x] `pages/api/departments/index.js` - List and create departments
  - [x] `pages/api/departments/[id].js` - Get, update, delete specific departments

- [x] **Attendance API Routes**
  - [x] `pages/api/attendance/index.js` - List and create attendance records
  - [x] `pages/api/attendance/[id].js` - Get, update, delete specific attendance records

- [x] **Leave API Routes**
  - [x] `pages/api/leave/index.js` - List and create leave requests
  - [x] `pages/api/leave/[id].js` - Get, update, delete specific leave requests

- [x] **Compliance API Routes**
  - [x] `pages/api/compliance/index.js` - List and create compliance records
  - [x] `pages/api/compliance/[id].js` - Get, update, delete specific compliance records

- [x] **Document API Routes**
  - [x] `pages/api/documents/index.js` - List and create documents
  - [x] `pages/api/documents/[id].js` - Get, update, delete specific documents

### Entity Models
- [x] `entities/User.js` - User entity definition
- [x] `entities/Employee.js` - Employee entity definition
- [x] `entities/Department.js` - Department entity definition
- [x] `entities/Attendance.js` - Attendance entity definition
- [x] `entities/Leave.js` - Leave entity definition
- [x] `entities/Compliance.js` - Compliance entity definition
- [x] `entities/Document.js` - Document entity definition

### Utilities
- [x] `utils/apiHandler.js` - Wrapper for API routes with error handling
- [x] `utils/seed.js` - Database seeding utility

### Authentication
- [x] `components/auth/AuthProvider.jsx` - React Context for session data
- [x] `pages/login.js` - Login page

### UI Components
- [x] **Employee Components**  [Note: No Adjustments were made, review if necessary!]
  - [x] `components/employee/EmployeeList.jsx`
  - [x] `components/employee/EmployeeProfile.jsx`
  - [x] `components/employee/EmployeeForm.jsx`

- [x] **Attendance Components** [Note: No Adjustments were made, review if necessary!]
  - [x] `components/attendance/AttendanceLog.jsx`
  - [x] `components/attendance/AttendanceCalendar.jsx`

- [x] **Leave Components**
  - [x] `components/leave/LeaveRequestForm.jsx`
  - [x] `components/leave/LeaveList.jsx`
  - [x] `components/leave/LeaveCalendar.jsx`

- [x] **Dashboard Components**
  - [x] `components/dashboard/StatCard.jsx`
  - [x] `components/dashboard/DashboardGrid.jsx`

## Implementation Steps

### Phase 1: Core Database Infrastructure
1. [x] Complete mock database implementation
2. [x] Implement database service layer
3. [x] Create API handling utility

### Phase 2: Authentication System
1. [x] Implement NextAuth configuration
2. [ ] Create AuthProvider component
3. [ ] Build login page
4. [ ] Update _app.js with session handling

### Phase 3: API Routes Implementation
1. [ ] Implement API routes for each entity
2. [ ] Add error handling and validation
3. [ ] Implement role-based access control

### Phase 4: UI Components Development
1. [ ] Build employee management components
2. [ ] Implement attendance and leave components
3. [ ] Create dashboard with real data display

### Phase 5: Production Database Preparation
1. [ ] Set up PostgreSQL and TypeORM
2. [ ] Implement real database service
3. [ ] Test with both implementations
4. [ ] Switch to production database when ready

## Migration to Production Database

When ready to switch to the production PostgreSQL database:

1. Complete the `utils/db.js` implementation with TypeORM
2. Update `.env.local` with PostgreSQL connection details
3. Set `USE_MOCK_DB = false` in `dbService.js`
4. Run any necessary migrations
5. Validate that all functionality works as expected

## Development and Testing Tips

1. Use the `isMockDb()` helper to display development-only UI elements
2. Use `resetMockDb()` to reset the mock database to its initial state during testing
3. Test both happy paths and error scenarios with the mock implementation
4. Use the mock implementation for unit tests and CI/CD pipelines

## Conclusion

This database implementation plan provides a flexible approach for developing the Mountain Care HR Management platform. By starting with a mock database, you can rapidly develop and test the application's features without waiting for the full PostgreSQL setup, while ensuring a smooth transition to the production database when ready.