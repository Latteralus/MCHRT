// tests/api/leave.test.ts
import { createMocks, RequestMethod } from 'node-mocks-http';
import { NextApiRequest, NextApiResponse } from 'next';
// Import handlers inside describe block
// import handler from '@/pages/api/leave';
// import leaveIdHandler from '@/pages/api/leave/[id]';
// Import approve/reject handlers if they are separate files
// import approveHandler from '@/pages/api/leave/[id]/approve';
// import rejectHandler from '@/pages/api/leave/[id]/reject';
// import { setupTestDb, teardownTestDb, clearTestDb } from '../db-setup'; // No longer needed here
import { Role } from '@/types/roles';
import { faker } from '@faker-js/faker';

// Models and fixtures will be imported dynamically
// import User from '@/modules/auth/models/User';
// import Employee from '@/modules/employees/models/Employee';
// import Leave from '@/modules/leave/models/Leave';
// import { createTestUser } from '../fixtures/userFixtures';
// import { createTestEmployee } from '../fixtures/employeeFixtures';
// import { createTestLeave, generateLeaveData } from '../fixtures/leaveFixtures';

// Mock next-auth session
jest.mock('next-auth/react', () => ({
  getSession: jest.fn(),
}));
import { getSession } from 'next-auth/react'; // Import the mocked version

// Helper to mock session
const mockGetSession = getSession as jest.MockedFunction<typeof getSession>;


describe('Leave API Routes', () => {
  // Import handlers dynamically after setup
  let handler: typeof import('@/pages/api/leave').default;
  let leaveIdHandler: typeof import('@/pages/api/leave/[id]').default;
  let User: typeof import('@/modules/auth/models/User').default;
  let Employee: typeof import('@/modules/employees/models/Employee').default;
  let Leave: typeof import('@/modules/leave/models/Leave').default;
  let createTestUser: typeof import('../fixtures/userFixtures').createTestUser;
  let createTestEmployee: typeof import('../fixtures/employeeFixtures').createTestEmployee;
  let createTestLeave: typeof import('../fixtures/leaveFixtures').createTestLeave;
  let generateLeaveData: typeof import('../fixtures/leaveFixtures').generateLeaveData;
  // Import approve/reject handlers if needed
  // let approveHandler: typeof import('@/pages/api/leave/[id]/approve').default;
  // let rejectHandler: typeof import('@/pages/api/leave/[id]/reject').default;


  beforeAll(async () => {
    // Dynamically import handlers AFTER setup in jest.setup.ts runs
    handler = (await import('@/pages/api/leave')).default;
    leaveIdHandler = (await import('@/pages/api/leave/[id]')).default;
    User = (await import('@/modules/auth/models/User')).default;
    Employee = (await import('@/modules/employees/models/Employee')).default;
    Leave = (await import('@/modules/leave/models/Leave')).default;
    const userFixtures = await import('../fixtures/userFixtures');
    createTestUser = userFixtures.createTestUser;
    const employeeFixtures = await import('../fixtures/employeeFixtures');
    createTestEmployee = employeeFixtures.createTestEmployee;
    const leaveFixtures = await import('../fixtures/leaveFixtures');
    createTestLeave = leaveFixtures.createTestLeave;
    generateLeaveData = leaveFixtures.generateLeaveData;
    // approveHandler = (await import('@/pages/api/leave/[id]/approve')).default;
    // rejectHandler = (await import('@/pages/api/leave/[id]/reject')).default;
  });

  // Clear data between tests
  // Note: jest.setup.ts runs beforeEach(clearTestDb)
  beforeEach(async () => {
    // jest.setup.ts now handles clearing the DB via clearTestDb()
    mockGetSession.mockClear();
  });

  describe('GET /api/leave', () => {
    it('should return a list of leave requests for an authorized user (admin)', async () => {
      // 1. Seed database
      const adminUser = await createTestUser({ role: Role.ADMIN });
      const employee = await createTestEmployee({});
      const leave1 = await createTestLeave({ employeeId: employee.get('id') as number, status: 'Pending' });
      const leave2 = await createTestLeave({ employeeId: employee.get('id') as number, status: 'Approved' });

      // 2. Mock session
      mockGetSession.mockResolvedValue({
        user: { id: adminUser.get('id') as number, role: adminUser.get('role') as string },
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
      expect(responseData[0]).toHaveProperty('id', leave1.get('id') as number);
      expect(responseData[0]).toHaveProperty('employeeId', employee.get('id') as number);
      expect(responseData[0]).toHaveProperty('status', 'Pending');
      expect(responseData[1]).toHaveProperty('id', leave2.get('id') as number);
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
      const employee = await createTestEmployee({ userId: user.get('id') as number });

      // 2. Prepare request data
      const leavePayload = {
        // employeeId should likely be inferred from session, not passed in body
        // employeeId: employee.get('id') as number,
        startDate: '2024-04-10',
        endDate: '2024-04-12',
        leaveType: 'Vacation',
        reason: 'Family trip',
      };

      // 3. Mock session (assuming employee is logged in)
      mockGetSession.mockResolvedValue({
        user: { id: user.get('id') as number, role: user.get('role') as string, employeeId: employee.get('id') as number }, // Include employeeId in session user
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
      expect(responseData).toHaveProperty('employeeId', employee.get('id') as number); // Verify it's assigned correctly
      expect(responseData).toHaveProperty('startDate', leavePayload.startDate);
      expect(responseData).toHaveProperty('endDate', leavePayload.endDate);
      expect(responseData).toHaveProperty('leaveType', leavePayload.leaveType);
      expect(responseData).toHaveProperty('reason', leavePayload.reason);
      expect(responseData).toHaveProperty('status', 'Pending'); // Default status

      // 7. Verify record created in DB
      const createdRecord = await Leave.findByPk(responseData.id);
      expect(createdRecord).not.toBeNull();
      expect(createdRecord?.get('employeeId')).toBe(employee.get('id') as number);
      expect(createdRecord?.get('startDate')).toBe(leavePayload.startDate);
      expect(createdRecord?.get('status')).toBe('Pending');
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
      const leave = await createTestLeave({ employeeId: employee.get('id') as number });

      // 2. Mock session
      mockGetSession.mockResolvedValue({
        user: { id: adminUser.get('id') as number, role: adminUser.get('role') as string },
        expires: faker.date.future().toISOString(),
      });

      // 3. Mock request/response objects
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: { id: (leave.get('id') as number).toString() },
      });

      // 4. Call the handler
      await leaveIdHandler(req, res);

      // 5. Assert response status and data
      expect(res._getStatusCode()).toBe(200);
      const responseData = res._getJSONData();
      expect(responseData).toHaveProperty('id', leave.get('id') as number);
      expect(responseData).toHaveProperty('employeeId', leave.get('employeeId') as number);
      expect(responseData).toHaveProperty('startDate', leave.get('startDate') as unknown as string);
      expect(responseData).toHaveProperty('endDate', leave.get('endDate') as unknown as string);
      expect(responseData).toHaveProperty('status', leave.get('status') as string);
    });

    it('should return 404 if leave request is not found', async () => {
        const adminUser = await createTestUser({ role: Role.ADMIN });
        const nonExistentId = 99999;
        mockGetSession.mockResolvedValue({
          user: { id: adminUser.get('id') as number, role: adminUser.get('role') as string },
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
        const leave = await createTestLeave({ employeeId: employee.get('id') as number });
        mockGetSession.mockResolvedValue(null);
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: 'GET',
          query: { id: (leave.get('id') as number).toString() },
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
      const employee = await createTestEmployee({ userId: user.get('id') as number });
      const leave = await createTestLeave({ employeeId: employee.get('id') as number, status: 'Pending' });

      // 2. Prepare update data
      const updatePayload = {
        status: 'Cancelled',
      };

      // 3. Mock session (employee logged in)
      mockGetSession.mockResolvedValue({
        user: { id: user.get('id') as number, role: user.get('role') as string, employeeId: employee.get('id') as number },
        expires: faker.date.future().toISOString(),
      });

      // 4. Mock request/response objects
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'PUT',
        query: { id: (leave.get('id') as number).toString() },
        body: updatePayload,
      });

      // 5. Call the handler
      await leaveIdHandler(req, res);

      // 6. Assert response status and data
      expect(res._getStatusCode()).toBe(200);
      const responseData = res._getJSONData();
      expect(responseData).toHaveProperty('id', leave.get('id') as number);
      expect(responseData).toHaveProperty('status', 'Cancelled');

      // 7. Verify update in DB
      await leave.reload();
      expect(leave.get('status')).toBe('Cancelled');
    });

    it('should return 403 when trying to update another employee\'s leave request', async () => {
        // 1. Seed database
        const user1 = await createTestUser({ role: Role.EMPLOYEE });
        const employee1 = await createTestEmployee({ userId: user1.get('id') as number });
        const user2 = await createTestUser({ role: Role.EMPLOYEE }); // Different user/employee
        const employee2 = await createTestEmployee({ userId: user2.get('id') as number });
        const leave = await createTestLeave({ employeeId: employee2.get('id') as number, status: 'Pending' }); // Leave belongs to employee2

        // 2. Prepare update data
        const updatePayload = { status: 'Cancelled' };

        // 3. Mock session (employee1 logged in)
        mockGetSession.mockResolvedValue({
          user: { id: user1.get('id') as number, role: user1.get('role') as string, employeeId: employee1.get('id') as number },
          expires: faker.date.future().toISOString(),
        });

        // 4. Mock request/response objects
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: 'PUT',
          query: { id: (leave.get('id') as number).toString() }, // Trying to update leave belonging to employee2
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
      const leave = await createTestLeave({ employeeId: employee.get('id') as number });
      const leaveId = leave.get('id') as number; // Store ID

      // 2. Mock session
      mockGetSession.mockResolvedValue({
        user: { id: adminUser.get('id') as number, role: adminUser.get('role') as string },
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
        const employee = await createTestEmployee({ userId: user.get('id') as number });
        const leave = await createTestLeave({ employeeId: employee.get('id') as number });

        // 2. Mock session
        mockGetSession.mockResolvedValue({
          user: { id: user.get('id') as number, role: user.get('role') as string, employeeId: employee.get('id') as number },
          expires: faker.date.future().toISOString(),
        });

        // 3. Mock request/response objects
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: 'DELETE',
          query: { id: (leave.get('id') as number).toString() },
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