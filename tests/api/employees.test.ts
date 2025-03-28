// tests/api/employees.test.ts
import { createMocks, RequestMethod } from 'node-mocks-http';
import { NextApiRequest, NextApiResponse } from 'next';
import handler from '@/pages/api/employees'; // Assuming default export for index route
import employeeIdHandler from '@/pages/api/employees/[id]'; // Assuming default export for [id] route
// import { setupTestDb, teardownTestDb, clearTestDb } from '../db-setup'; // No longer needed here
import { Role } from '@/types/roles';
import { faker } from '@faker-js/faker'; // Import faker

// Import models and fixtures statically
import User from '@/modules/auth/models/User';
import Employee from '@/modules/employees/models/Employee';
import Department from '@/modules/organization/models/Department';
import { createTestUser, generateUserData } from '../fixtures/userFixtures';
import { createTestEmployee, generateEmployeeData } from '../fixtures/employeeFixtures';
import { createTestDepartment } from '../fixtures/departmentFixtures';

// Mock next-auth session
jest.mock('next-auth/react', () => ({
  getSession: jest.fn(),
}));
import { getSession } from 'next-auth/react'; // Import the mocked version

// Helper to mock session
const mockGetSession = getSession as jest.MockedFunction<typeof getSession>;


describe('Employee API Routes', () => {

  // Clear data between tests
  beforeEach(async () => {
    // jest.setup.ts now handles clearing the DB via clearTestDb()
    // Reset mocks before each test
    mockGetSession.mockClear();
  });

  describe('GET /api/employees', () => {
    it('should return a list of employees for an authorized user', async () => {
      // 1. Seed database
      const adminUser = await createTestUser({ role: Role.ADMIN });
      const dept = await createTestDepartment();
      const emp1 = await createTestEmployee({ departmentId: dept.id });
      const emp2 = await createTestEmployee({ departmentId: dept.id });

      // 2. Mock session
      mockGetSession.mockResolvedValue({
        user: { id: adminUser.id, username: adminUser.username, role: adminUser.role }, // Use username
        expires: faker.date.future().toISOString(),
      });

      // 3. Mock request/response objects
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
      });

      // 4. Call the handler
      await handler(req, res);

      // 5. Assert response status and data
      expect(res._getStatusCode()).toBe(200);
      const responseData = res._getJSONData();
      expect(Array.isArray(responseData)).toBe(true);
      expect(responseData).toHaveLength(2);
      // Check if the returned data looks like employees (e.g., check properties of the first one)
      expect(responseData[0]).toHaveProperty('id', emp1.id);
      expect(responseData[0]).toHaveProperty('firstName', emp1.firstName);
      expect(responseData[1]).toHaveProperty('id', emp2.id);
      expect(responseData[1]).toHaveProperty('lastName', emp2.lastName);
      // Ensure sensitive data is not returned by default
      expect(responseData[0]).not.toHaveProperty('ssnEncrypted');
    });

    it('should return 401 if user is not authenticated', async () => {
       // 1. Mock session (no user)
       mockGetSession.mockResolvedValue(null);

       // 2. Mock request/response objects
       const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
         method: 'GET',
       });

       // 3. Call the handler
       await handler(req, res);

       // 4. Assert response status
       expect(res._getStatusCode()).toBe(401); // Or 403 depending on auth middleware
    });

    // TODO: Add tests for filtering, pagination, RBAC (e.g., non-admin user access)
  });

  describe('POST /api/employees', () => {
    it('should create a new employee when called by an admin', async () => {
      // 1. Prepare prerequisite data
      const adminUser = await createTestUser({ role: Role.ADMIN });
      const dept = await createTestDepartment();
      // Use generateEmployeeData to get potential data
      const generatedData = generateEmployeeData({ departmentId: dept.id });

      // Construct the actual request body with only allowed fields for creation
      const requestBody = {
        firstName: generatedData.firstName,
        lastName: generatedData.lastName,
        departmentId: generatedData.departmentId,
        userId: generatedData.userId, // Include if applicable
        position: generatedData.position,
        hireDate: generatedData.hireDate, // Already formatted string or undefined
        ssnEncrypted: generatedData.ssnEncrypted, // Include placeholder if needed by API
        // Add any other fields expected by the POST endpoint based on EmployeeCreationAttributes
      };

      // 2. Mock session
      mockGetSession.mockResolvedValue({
        user: { id: adminUser.id, username: adminUser.username, role: adminUser.role }, // Use username
        expires: faker.date.future().toISOString(),
      });

      // 3. Mock request/response objects
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: requestBody, // Use the constructed body
      });

      // 4. Call the handler
      await handler(req, res);

      // 5. Assert response status and data
      expect(res._getStatusCode()).toBe(201);
      const responseData = res._getJSONData();
      expect(responseData).toHaveProperty('id'); // Should have an ID now
      expect(responseData).toHaveProperty('firstName', requestBody.firstName);
      expect(responseData).toHaveProperty('lastName', requestBody.lastName);
      expect(responseData).toHaveProperty('departmentId', requestBody.departmentId);
      // Ensure sensitive data is not returned
      expect(responseData).not.toHaveProperty('ssnEncrypted');

      // 6. Verify employee created in DB
      const createdEmployee = await Employee.findByPk(responseData.id);
      expect(createdEmployee).not.toBeNull();
      expect(createdEmployee?.firstName).toBe(requestBody.firstName);
      expect(createdEmployee?.departmentId).toBe(requestBody.departmentId);
    });

    it('should return 403 if user is not an admin', async () => {
        // 1. Prepare data
        const nonAdminUser = await createTestUser({ role: Role.EMPLOYEE }); // Or MANAGER
        const dept = await createTestDepartment();
        const generatedData = generateEmployeeData({ departmentId: dept.id });

        // Construct the actual request body
        const requestBody = {
          firstName: generatedData.firstName,
          lastName: generatedData.lastName,
          departmentId: generatedData.departmentId,
          // Add other necessary fields based on EmployeeCreationAttributes
        };

        // 2. Mock session
        mockGetSession.mockResolvedValue({
          user: { id: nonAdminUser.id, username: nonAdminUser.username, role: nonAdminUser.role }, // Use username
          expires: faker.date.future().toISOString(),
        });

        // 3. Mock request/response objects
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: 'POST',
          body: requestBody, // Use the constructed body
        });

        // 4. Call the handler
        await handler(req, res);

        // 5. Assert response status
        expect(res._getStatusCode()).toBe(403);
    });

    // TODO: Add tests for validation errors (e.g., missing required fields)
  });

  describe('GET /api/employees/[id]', () => {
    it('should return a specific employee when called by an authorized user', async () => {
      // 1. Seed database
      const adminUser = await createTestUser({ role: Role.ADMIN });
      const dept = await createTestDepartment();
      const employee = await createTestEmployee({ departmentId: dept.id });

      // 2. Mock session
      mockGetSession.mockResolvedValue({
        user: { id: adminUser.id, username: adminUser.username, role: adminUser.role }, // Use username
        expires: faker.date.future().toISOString(),
      });

      // 3. Mock request/response objects
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: {
          id: employee.id.toString(), // ID must be a string in query
        },
      });

      // 4. Call the handler for the [id] route
      await employeeIdHandler(req, res);

      // 5. Assert response status and data
      expect(res._getStatusCode()).toBe(200);
      const responseData = res._getJSONData();
      expect(responseData).toHaveProperty('id', employee.id);
      expect(responseData).toHaveProperty('firstName', employee.firstName);
      expect(responseData).toHaveProperty('lastName', employee.lastName);
      expect(responseData).toHaveProperty('departmentId', employee.departmentId);
      // Ensure sensitive data is not returned
      expect(responseData).not.toHaveProperty('ssnEncrypted');
    });

    it('should return 404 if employee is not found', async () => {
        // 1. Seed user
        const adminUser = await createTestUser({ role: Role.ADMIN });
        const nonExistentId = 99999;

        // 2. Mock session
        mockGetSession.mockResolvedValue({
          user: { id: adminUser.id, username: adminUser.username, role: adminUser.role }, // Use username
          expires: faker.date.future().toISOString(),
        });

        // 3. Mock request/response objects
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: 'GET',
          query: {
            id: nonExistentId.toString(),
          },
        });

        // 4. Call the handler
        await employeeIdHandler(req, res);

        // 5. Assert response status
        expect(res._getStatusCode()).toBe(404);
    });

    it('should return 401 if user is not authenticated', async () => {
        // 1. Seed employee (needed for ID)
        const dept = await createTestDepartment();
        const employee = await createTestEmployee({ departmentId: dept.id });

        // 2. Mock session (no user)
        mockGetSession.mockResolvedValue(null);

        // 3. Mock request/response objects
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: 'GET',
          query: {
            id: employee.id.toString(),
          },
        });

        // 4. Call the handler
        await employeeIdHandler(req, res);

        // 5. Assert response status
        expect(res._getStatusCode()).toBe(401); // Or 403
    });

    // TODO: Add tests for RBAC (e.g., employee accessing own data vs other's data)
  });

  describe('PUT /api/employees/[id]', () => {
    it('should update a specific employee when called by an admin', async () => {
      // 1. Seed database
      const adminUser = await createTestUser({ role: Role.ADMIN });
      const dept1 = await createTestDepartment({ name: 'Old Department' });
      const dept2 = await createTestDepartment({ name: 'New Department' });
      const employee = await createTestEmployee({ departmentId: dept1.id, firstName: 'InitialName' });

      // 2. Prepare update data
      const updateData = {
        firstName: 'UpdatedName',
        lastName: employee.lastName, // Keep last name the same
        departmentId: dept2.id, // Change department
        position: 'Senior Developer', // Add position
      };

      // 3. Mock session
      mockGetSession.mockResolvedValue({
        user: { id: adminUser.id, username: adminUser.username, role: adminUser.role }, // Use username
        expires: faker.date.future().toISOString(),
      });

      // 4. Mock request/response objects
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'PUT',
        query: {
          id: employee.id.toString(),
        },
        body: updateData,
      });

      // 5. Call the handler
      await employeeIdHandler(req, res);

      // 6. Assert response status and data
      expect(res._getStatusCode()).toBe(200);
      const responseData = res._getJSONData();
      expect(responseData).toHaveProperty('id', employee.id);
      expect(responseData).toHaveProperty('firstName', updateData.firstName);
      expect(responseData).toHaveProperty('lastName', updateData.lastName);
      expect(responseData).toHaveProperty('departmentId', updateData.departmentId);
      expect(responseData).toHaveProperty('position', updateData.position);
      expect(responseData).not.toHaveProperty('ssnEncrypted');

      // 7. Verify employee updated in DB
      await employee.reload(); // Reload instance from DB
      expect(employee.firstName).toBe(updateData.firstName);
      expect(employee.departmentId).toBe(updateData.departmentId);
      expect(employee.position).toBe(updateData.position);
    });

    it('should return 403 if user is not an admin', async () => {
        // 1. Seed data
        const nonAdminUser = await createTestUser({ role: Role.EMPLOYEE });
        const dept = await createTestDepartment();
        const employee = await createTestEmployee({ departmentId: dept.id });
        const updateData = { firstName: 'AttemptedUpdate' };

        // 2. Mock session
        mockGetSession.mockResolvedValue({
          user: { id: nonAdminUser.id, username: nonAdminUser.username, role: nonAdminUser.role }, // Use username
          expires: faker.date.future().toISOString(),
        });

        // 3. Mock request/response objects
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: 'PUT',
          query: { id: employee.id.toString() },
          body: updateData,
        });

        // 4. Call the handler
        await employeeIdHandler(req, res);

        // 5. Assert response status
        expect(res._getStatusCode()).toBe(403);
    });

    it('should return 404 if employee to update is not found', async () => {
        // 1. Seed user
        const adminUser = await createTestUser({ role: Role.ADMIN });
        const nonExistentId = 99999;
        const updateData = { firstName: 'AttemptedUpdate' };

        // 2. Mock session
        mockGetSession.mockResolvedValue({
          user: { id: adminUser.id, username: adminUser.username, role: adminUser.role }, // Use username
          expires: faker.date.future().toISOString(),
        });

        // 3. Mock request/response objects
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: 'PUT',
          query: { id: nonExistentId.toString() },
          body: updateData,
        });

        // 4. Call the handler
        await employeeIdHandler(req, res);

        // 5. Assert response status
        expect(res._getStatusCode()).toBe(404);
    });

    // TODO: Add tests for validation errors (e.g., invalid data types), RBAC (manager updating own dept)
  });

  describe('DELETE /api/employees/[id]', () => {
    it('should delete a specific employee when called by an admin', async () => {
      // 1. Seed database
      const adminUser = await createTestUser({ role: Role.ADMIN });
      const dept = await createTestDepartment();
      const employee = await createTestEmployee({ departmentId: dept.id });
      const employeeId = employee.id; // Store ID before deletion

      // 2. Mock session
      mockGetSession.mockResolvedValue({
        user: { id: adminUser.id, username: adminUser.username, role: adminUser.role },
        expires: faker.date.future().toISOString(),
      });

      // 3. Mock request/response objects
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'DELETE',
        query: {
          id: employeeId.toString(),
        },
      });

      // 4. Call the handler
      await employeeIdHandler(req, res);

      // 5. Assert response status (DELETE often returns 204 No Content or 200 OK)
      expect([200, 204]).toContain(res._getStatusCode());

      // 6. Verify employee deleted from DB
      const deletedEmployee = await Employee.findByPk(employeeId);
      expect(deletedEmployee).toBeNull();
    });

    it('should return 403 if user is not an admin', async () => {
        // 1. Seed data
        const nonAdminUser = await createTestUser({ role: Role.EMPLOYEE });
        const dept = await createTestDepartment();
        const employee = await createTestEmployee({ departmentId: dept.id });

        // 2. Mock session
        mockGetSession.mockResolvedValue({
          user: { id: nonAdminUser.id, username: nonAdminUser.username, role: nonAdminUser.role },
          expires: faker.date.future().toISOString(),
        });

        // 3. Mock request/response objects
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: 'DELETE',
          query: { id: employee.id.toString() },
        });

        // 4. Call the handler
        await employeeIdHandler(req, res);

        // 5. Assert response status
        expect(res._getStatusCode()).toBe(403);
    });

    it('should return 404 if employee to delete is not found', async () => {
        // 1. Seed user
        const adminUser = await createTestUser({ role: Role.ADMIN });
        const nonExistentId = 99999;

        // 2. Mock session
        mockGetSession.mockResolvedValue({
          user: { id: adminUser.id, username: adminUser.username, role: adminUser.role },
          expires: faker.date.future().toISOString(),
        });

        // 3. Mock request/response objects
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: 'DELETE',
          query: { id: nonExistentId.toString() },
        });

        // 4. Call the handler
        await employeeIdHandler(req, res);

        // 5. Assert response status
        expect(res._getStatusCode()).toBe(404);
    });

    // TODO: Add tests for RBAC (e.g., manager deleting own dept employee?)
  });
});