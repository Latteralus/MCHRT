// tests/api/leave.test.ts
import { createMocks, RequestMethod } from 'node-mocks-http';
import { NextApiRequest, NextApiResponse } from 'next';
import handler from '@/pages/api/leave'; // Assuming default export for index route
import leaveIdHandler from '@/pages/api/leave/[id]'; // Assuming default export for [id] route
// Import approve/reject handlers if they are separate files
// import approveHandler from '@/pages/api/leave/[id]/approve';
// import rejectHandler from '@/pages/api/leave/[id]/reject';
import { setupTestDb, teardownTestDb, clearTestDb } from '../db-setup';
import User from '@/modules/auth/models/User';
import Employee from '@/modules/employees/models/Employee';
import Leave from '@/modules/leave/models/Leave';
import { createTestUser } from '../fixtures/userFixtures';
import { createTestEmployee } from '../fixtures/employeeFixtures';
import { createTestLeave, generateLeaveData } from '../fixtures/leaveFixtures';
import { Role } from '@/types/roles';
import { faker } from '@faker-js/faker';
// Mock next-auth session
jest.mock('next-auth/react', () => ({
  getSession: jest.fn(),
}));
import { getSession } from 'next-auth/react'; // Import the mocked version

// Helper to mock session
const mockGetSession = getSession as jest.MockedFunction<typeof getSession>;


describe('Leave API Routes', () => {
  // Setup and teardown database before/after tests
  beforeAll(async () => {
    await setupTestDb();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  // Clear data between tests
  beforeEach(async () => {
    await clearTestDb();
    mockGetSession.mockClear();
  });

  describe('GET /api/leave', () => {
    it('should return a list of leave requests for an authorized user (admin)', async () => {
      // 1. Seed database
      const adminUser = await createTestUser({ role: Role.ADMIN });
      const employee = await createTestEmployee({});
      const leave1 = await createTestLeave({ employeeId: employee.id, status: 'Pending' });
      const leave2 = await createTestLeave({ employeeId: employee.id, status: 'Approved' });

      // 2. Mock session
      mockGetSession.mockResolvedValue({
        user: { id: adminUser.id, username: adminUser.username, role: adminUser.role },
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
      // Check if the returned data looks like leave requests
      expect(responseData[0]).toHaveProperty('id', leave1.id);
      expect(responseData[0]).toHaveProperty('employeeId', employee.id);
      expect(responseData[0]).toHaveProperty('status', 'Pending');
      expect(responseData[1]).toHaveProperty('id', leave2.id);
      expect(responseData[1]).toHaveProperty('status', 'Approved');
    });

     it('should return 401 if user is not authenticated', async () => {
       mockGetSession.mockResolvedValue(null);
       const { req, res } = createMocks<NextApiRequest, NextApiResponse>({ method: 'GET' });
       await handler(req, res);
       expect(res._getStatusCode()).toBe(401);
    });

    // TODO: Add tests for filtering (employeeId, status, date range), RBAC (employee seeing own, manager seeing dept)
  });

  describe('POST /api/leave', () => {
    it('should create a new leave request for the authenticated employee', async () => {
      // 1. Seed database
      // Create a user and link it to an employee
      const user = await createTestUser({ role: Role.EMPLOYEE });
      const employee = await createTestEmployee({ userId: user.id });

      // 2. Prepare request data
      const leavePayload = {
        // employeeId should likely be inferred from session, not passed in body
        // employeeId: employee.id,
        startDate: '2024-04-10',
        endDate: '2024-04-12',
        leaveType: 'Vacation',
        reason: 'Family trip',
      };

      // 3. Mock session (assuming employee is logged in)
      mockGetSession.mockResolvedValue({
        user: { id: user.id, username: user.username, role: user.role, employeeId: employee.id }, // Include employeeId in session user
        expires: faker.date.future().toISOString(),
      });

      // 4. Mock request/response objects
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: leavePayload,
      });

      // 5. Call the handler
      await handler(req, res);

      // 6. Assert response status and data
      expect(res._getStatusCode()).toBe(201);
      const responseData = res._getJSONData();
      expect(responseData).toHaveProperty('id');
      expect(responseData).toHaveProperty('employeeId', employee.id); // Verify it's assigned correctly
      expect(responseData).toHaveProperty('startDate', leavePayload.startDate);
      expect(responseData).toHaveProperty('endDate', leavePayload.endDate);
      expect(responseData).toHaveProperty('leaveType', leavePayload.leaveType);
      expect(responseData).toHaveProperty('reason', leavePayload.reason);
      expect(responseData).toHaveProperty('status', 'Pending'); // Default status

      // 7. Verify record created in DB
      const createdRecord = await Leave.findByPk(responseData.id);
      expect(createdRecord).not.toBeNull();
      expect(createdRecord?.employeeId).toBe(employee.id);
      expect(createdRecord?.startDate).toBe(leavePayload.startDate);
      expect(createdRecord?.status).toBe('Pending');
    });

    it('should return 401 if user is not authenticated', async () => {
        const leavePayload = { startDate: '2024-04-10', endDate: '2024-04-12', leaveType: 'Vacation' };
        mockGetSession.mockResolvedValue(null);
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({ method: 'POST', body: leavePayload });
        await handler(req, res);
        expect(res._getStatusCode()).toBe(401);
    });

    // TODO: Add tests for validation errors (missing fields, invalid dates, overlapping dates?), leave balance checks?
  });

  describe('GET /api/leave/[id]', () => {
    it('should return a specific leave request for an authorized user', async () => {
      // 1. Seed database
      const adminUser = await createTestUser({ role: Role.ADMIN });
      const employee = await createTestEmployee({});
      const leave = await createTestLeave({ employeeId: employee.id });

      // 2. Mock session
      mockGetSession.mockResolvedValue({
        user: { id: adminUser.id, username: adminUser.username, role: adminUser.role },
        expires: faker.date.future().toISOString(),
      });

      // 3. Mock request/response objects
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: { id: leave.id.toString() },
      });

      // 4. Call the handler
      await leaveIdHandler(req, res);

      // 5. Assert response status and data
      expect(res._getStatusCode()).toBe(200);
      const responseData = res._getJSONData();
      expect(responseData).toHaveProperty('id', leave.id);
      expect(responseData).toHaveProperty('employeeId', leave.employeeId);
      expect(responseData).toHaveProperty('startDate', leave.startDate);
      expect(responseData).toHaveProperty('endDate', leave.endDate);
      expect(responseData).toHaveProperty('status', leave.status);
    });

    it('should return 404 if leave request is not found', async () => {
        const adminUser = await createTestUser({ role: Role.ADMIN });
        const nonExistentId = 99999;
        mockGetSession.mockResolvedValue({
          user: { id: adminUser.id, username: adminUser.username, role: adminUser.role },
          expires: faker.date.future().toISOString(),
        });
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: 'GET',
          query: { id: nonExistentId.toString() },
        });
        await leaveIdHandler(req, res);
        expect(res._getStatusCode()).toBe(404);
    });

     it('should return 401 if user is not authenticated', async () => {
        const employee = await createTestEmployee({});
        const leave = await createTestLeave({ employeeId: employee.id });
        mockGetSession.mockResolvedValue(null);
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: 'GET',
          query: { id: leave.id.toString() },
        });
        await leaveIdHandler(req, res);
        expect(res._getStatusCode()).toBe(401);
    });

    // TODO: Add tests for RBAC (employee seeing own, manager seeing dept, other employee seeing denied)
  });

  describe('PUT /api/leave/[id]', () => {
    it('should allow an employee to cancel their own pending leave request', async () => {
      // 1. Seed database
      const user = await createTestUser({ role: Role.EMPLOYEE });
      const employee = await createTestEmployee({ userId: user.id });
      const leave = await createTestLeave({ employeeId: employee.id, status: 'Pending' });

      // 2. Prepare update data
      const updatePayload = {
        status: 'Cancelled',
      };

      // 3. Mock session (employee logged in)
      mockGetSession.mockResolvedValue({
        user: { id: user.id, username: user.username, role: user.role, employeeId: employee.id },
        expires: faker.date.future().toISOString(),
      });

      // 4. Mock request/response objects
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'PUT',
        query: { id: leave.id.toString() },
        body: updatePayload,
      });

      // 5. Call the handler
      await leaveIdHandler(req, res);

      // 6. Assert response status and data
      expect(res._getStatusCode()).toBe(200);
      const responseData = res._getJSONData();
      expect(responseData).toHaveProperty('id', leave.id);
      expect(responseData).toHaveProperty('status', 'Cancelled');

      // 7. Verify update in DB
      await leave.reload();
      expect(leave.status).toBe('Cancelled');
    });

    it('should return 403 when trying to update another employee\'s leave request', async () => {
        // 1. Seed database
        const user1 = await createTestUser({ role: Role.EMPLOYEE });
        const employee1 = await createTestEmployee({ userId: user1.id });
        const user2 = await createTestUser({ role: Role.EMPLOYEE }); // Different user/employee
        const employee2 = await createTestEmployee({ userId: user2.id });
        const leave = await createTestLeave({ employeeId: employee2.id, status: 'Pending' }); // Leave belongs to employee2

        // 2. Prepare update data
        const updatePayload = { status: 'Cancelled' };

        // 3. Mock session (employee1 logged in)
        mockGetSession.mockResolvedValue({
          user: { id: user1.id, username: user1.username, role: user1.role, employeeId: employee1.id },
          expires: faker.date.future().toISOString(),
        });

        // 4. Mock request/response objects
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: 'PUT',
          query: { id: leave.id.toString() }, // Trying to update leave belonging to employee2
          body: updatePayload,
        });

        // 5. Call the handler
        await leaveIdHandler(req, res);

        // 6. Assert response status
        expect(res._getStatusCode()).toBe(403); // Or 404 depending on how auth is handled
    });

    // TODO: Add tests for validation (invalid status transition), not found, admin updates
  });

  describe('DELETE /api/leave/[id]', () => {
    it('should delete a specific leave request when called by an admin', async () => {
      // 1. Seed database
      const adminUser = await createTestUser({ role: Role.ADMIN });
      const employee = await createTestEmployee({});
      const leave = await createTestLeave({ employeeId: employee.id });
      const leaveId = leave.id; // Store ID

      // 2. Mock session
      mockGetSession.mockResolvedValue({
        user: { id: adminUser.id, username: adminUser.username, role: adminUser.role },
        expires: faker.date.future().toISOString(),
      });

      // 3. Mock request/response objects
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'DELETE',
        query: { id: leaveId.toString() },
      });

      // 4. Call the handler
      await leaveIdHandler(req, res);

      // 5. Assert response status
      expect([200, 204]).toContain(res._getStatusCode());

      // 6. Verify record deleted from DB
      const deletedRecord = await Leave.findByPk(leaveId);
      expect(deletedRecord).toBeNull();
    });

    it('should return 403 if a non-admin tries to delete a leave request', async () => {
        // 1. Seed database
        const user = await createTestUser({ role: Role.EMPLOYEE });
        const employee = await createTestEmployee({ userId: user.id });
        const leave = await createTestLeave({ employeeId: employee.id });

        // 2. Mock session
        mockGetSession.mockResolvedValue({
          user: { id: user.id, username: user.username, role: user.role, employeeId: employee.id },
          expires: faker.date.future().toISOString(),
        });

        // 3. Mock request/response objects
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: 'DELETE',
          query: { id: leave.id.toString() },
        });

        // 4. Call the handler
        await leaveIdHandler(req, res);

        // 5. Assert response status
        expect(res._getStatusCode()).toBe(403); // Assuming non-admins cannot delete
    });

    // TODO: Add tests for not found
  });

  // Add describe blocks for approve/reject if handlers exist
  // describe('POST /api/leave/[id]/approve', () => { ... });
  // describe('POST /api/leave/[id]/reject', () => { ... });

});