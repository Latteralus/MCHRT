// tests/api/compliance.test.ts
import { createMocks, RequestMethod } from 'node-mocks-http';
import { NextApiRequest, NextApiResponse } from 'next';
// Import handlers inside describe block
// import handler from '@/pages/api/compliance';
// import complianceIdHandler from '@/pages/api/compliance/[id]';
// import { setupTestDb, teardownTestDb, clearTestDb } from '../db-setup'; // No longer needed here
import { Role } from '@/types/roles';
import { faker } from '@faker-js/faker';

// Models and fixtures will be imported dynamically
// import User from '@/modules/auth/models/User';
// import Employee from '@/modules/employees/models/Employee';
// import Compliance from '@/modules/compliance/models/Compliance';
// import { createTestUser } from '../fixtures/userFixtures';
// import { createTestEmployee } from '../fixtures/employeeFixtures';
// import { createTestCompliance, generateComplianceData } from '../fixtures/complianceFixtures';

// Mock next-auth session
jest.mock('next-auth/react', () => ({
  getSession: jest.fn(),
}));
import { getSession } from 'next-auth/react'; // Import the mocked version

// Helper to mock session
const mockGetSession = getSession as jest.MockedFunction<typeof getSession>;


describe('Compliance API Routes', () => {
  // Declare variables for handlers, models, and fixtures
  let handler: typeof import('@/pages/api/compliance').default;
  let complianceIdHandler: typeof import('@/pages/api/compliance/[id]').default;
  let User: typeof import('@/modules/auth/models/User').default;
  let Employee: typeof import('@/modules/employees/models/Employee').default;
  let Compliance: typeof import('@/modules/compliance/models/Compliance').default;
  let createTestUser: typeof import('../fixtures/userFixtures').createTestUser;
  let createTestEmployee: typeof import('../fixtures/employeeFixtures').createTestEmployee;
  let createTestCompliance: typeof import('../fixtures/complianceFixtures').createTestCompliance;
  let generateComplianceData: typeof import('../fixtures/complianceFixtures').generateComplianceData;

  beforeAll(async () => {
    // Dynamically import everything AFTER setup in jest.setup.ts runs
    handler = (await import('@/pages/api/compliance')).default;
    complianceIdHandler = (await import('@/pages/api/compliance/[id]')).default;
    User = (await import('@/modules/auth/models/User')).default;
    Employee = (await import('@/modules/employees/models/Employee')).default;
    Compliance = (await import('@/modules/compliance/models/Compliance')).default;
    const userFixtures = await import('../fixtures/userFixtures');
    createTestUser = userFixtures.createTestUser;
    const employeeFixtures = await import('../fixtures/employeeFixtures');
    createTestEmployee = employeeFixtures.createTestEmployee;
    const complianceFixtures = await import('../fixtures/complianceFixtures');
    createTestCompliance = complianceFixtures.createTestCompliance;
    generateComplianceData = complianceFixtures.generateComplianceData;
  });

  // Clear data between tests
  // Note: jest.setup.ts runs beforeEach(clearTestDb)
  beforeEach(async () => {
    // jest.setup.ts now handles clearing the DB via clearTestDb()
    mockGetSession.mockClear();
  });

  describe('GET /api/compliance', () => {
    it('should return a list of compliance items for an authorized user (admin)', async () => {
      // 1. Seed database
      const adminUser = await createTestUser({ role: Role.ADMIN });
      const employee = await createTestEmployee({});
      const item1 = await createTestCompliance({ employeeId: employee.get('id') as number, itemType: 'License' });
      const item2 = await createTestCompliance({ employeeId: employee.get('id') as number, itemType: 'Training' });

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
      // Check the 'items' property for the array
      expect(Array.isArray(responseData.items)).toBe(true);
      expect(responseData.items).toHaveLength(2);
      // Check if the returned data looks like compliance items
      // Access items within the 'items' array
      expect(responseData.items[0]).toHaveProperty('id', item1.get('id') as number);
      expect(responseData.items[0]).toHaveProperty('employeeId', employee.get('id') as number);
      expect(responseData.items[0]).toHaveProperty('itemType', 'License');
      expect(responseData.items[1]).toHaveProperty('id', item2.get('id') as number);
      expect(responseData.items[1]).toHaveProperty('itemType', 'Training');
    });

     it('should return 401 if user is not authenticated', async () => {
       mockGetSession.mockResolvedValue(null);
       const { req, res } = createMocks<NextApiRequest, NextApiResponse>({ method: 'GET' });
       await handler(req, res);
       expect(res._getStatusCode()).toBe(401);
    });

    // TODO: Add tests for filtering (employeeId, itemType, status), RBAC
  });

  describe('POST /api/compliance', () => {
    it('should create a new compliance item when called by an admin', async () => {
      // 1. Seed database
      const adminUser = await createTestUser({ role: Role.ADMIN });
      const employee = await createTestEmployee({});

      // 2. Prepare request data
      const compliancePayload = {
        employeeId: employee.get('id') as number,
        itemType: 'Certification',
        itemName: 'Advanced CPR',
        authority: 'Red Cross',
        issueDate: '2024-01-15',
        expirationDate: '2026-01-14',
        // Status might be set automatically or passed, assuming passed here for test
        status: 'Active',
      };

      // 3. Mock session
      mockGetSession.mockResolvedValue({
        user: { id: adminUser.get('id') as number, role: adminUser.get('role') as string },
        expires: faker.date.future().toISOString(),
      });

      // 4. Mock request/response objects
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: compliancePayload,
      });

      // 5. Call the handler
      await handler(req, res);

      // 6. Assert response status and data
      expect(res._getStatusCode()).toBe(201);
      const responseData = res._getJSONData();
      expect(responseData).toHaveProperty('id');
      expect(responseData).toHaveProperty('employeeId', compliancePayload.employeeId);
      expect(responseData).toHaveProperty('itemType', compliancePayload.itemType);
      expect(responseData).toHaveProperty('itemName', compliancePayload.itemName);
      expect(responseData).toHaveProperty('status', compliancePayload.status);
      expect(responseData).toHaveProperty('expirationDate', compliancePayload.expirationDate);

      // 7. Verify record created in DB
      const createdRecord = await Compliance.findByPk(responseData.id);
      expect(createdRecord).not.toBeNull();
      expect(createdRecord?.get('employeeId')).toBe(compliancePayload.employeeId);
      expect(createdRecord?.get('itemName')).toBe(compliancePayload.itemName);
      expect(createdRecord?.get('status')).toBe(compliancePayload.status);
    });

    it('should return 403 if user is not an admin', async () => {
        const user = await createTestUser({ role: Role.EMPLOYEE });
        const employee = await createTestEmployee({ userId: user.get('id') as number });
        const compliancePayload = { employeeId: employee.get('id') as number, itemType: 'Test', itemName: 'Test Item' };
        mockGetSession.mockResolvedValue({
          user: { id: user.get('id') as number, role: user.get('role') as string },
          expires: faker.date.future().toISOString(),
        });
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({ method: 'POST', body: compliancePayload });
        await handler(req, res);
        expect(res._getStatusCode()).toBe(403); // Assuming only admin can create
    });

    // TODO: Add tests for validation errors (missing fields, invalid dates)
  });

  describe('GET /api/compliance/[id]', () => {
    it('should return a specific compliance item for an authorized user', async () => {
      // 1. Seed database
      const adminUser = await createTestUser({ role: Role.ADMIN });
      const employee = await createTestEmployee({});
      const item = await createTestCompliance({ employeeId: employee.get('id') as number });

      // 2. Mock session
      mockGetSession.mockResolvedValue({
        user: { id: adminUser.get('id') as number, role: adminUser.get('role') as string },
        expires: faker.date.future().toISOString(),
      });

      // 3. Mock request/response objects
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: { id: (item.get('id') as number).toString() },
      });

      // 4. Call the handler
      await complianceIdHandler(req, res);

      // 5. Assert response status and data
      expect(res._getStatusCode()).toBe(200);
      const responseData = res._getJSONData();
      expect(responseData).toHaveProperty('id', item.get('id') as number);
      expect(responseData).toHaveProperty('employeeId', item.get('employeeId') as number);
      expect(responseData).toHaveProperty('itemName', item.get('itemName') as string);
      expect(responseData).toHaveProperty('status', item.get('status') as string);
    });

    it('should return 404 if compliance item is not found', async () => {
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
        await complianceIdHandler(req, res);
        expect(res._getStatusCode()).toBe(404);
    });

     it('should return 401 if user is not authenticated', async () => {
        const employee = await createTestEmployee({});
        const item = await createTestCompliance({ employeeId: employee.get('id') as number });
        mockGetSession.mockResolvedValue(null);
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: 'GET',
          query: { id: (item.get('id') as number).toString() },
        });
        await complianceIdHandler(req, res);
        expect(res._getStatusCode()).toBe(401);
    });

    // TODO: Add tests for RBAC (employee seeing own, manager seeing dept)
  });

  describe('PUT /api/compliance/[id]', () => {
    it('should update a specific compliance item when called by an admin', async () => {
      // 1. Seed database
      const adminUser = await createTestUser({ role: Role.ADMIN });
      const employee = await createTestEmployee({});
      const item = await createTestCompliance({
        employeeId: employee.get('id') as number,
        itemName: 'Initial Training',
        status: 'PendingReview',
      });

      // 2. Prepare update data
      const updatePayload = {
        itemName: 'Completed Initial Training',
        status: 'Active',
        issueDate: '2024-03-28', // Add issue date upon completion
      };

      // 3. Mock session
      mockGetSession.mockResolvedValue({
        user: { id: adminUser.get('id') as number, role: adminUser.get('role') as string },
        expires: faker.date.future().toISOString(),
      });

      // 4. Mock request/response objects
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'PUT',
        query: { id: (item.get('id') as number).toString() },
        body: updatePayload,
      });

      // 5. Call the handler
      await complianceIdHandler(req, res);

      // 6. Assert response status and data
      expect(res._getStatusCode()).toBe(200);
      const responseData = res._getJSONData();
      expect(responseData).toHaveProperty('id', item.get('id') as number);
      expect(responseData).toHaveProperty('itemName', updatePayload.itemName);
      expect(responseData).toHaveProperty('status', updatePayload.status);
      expect(responseData).toHaveProperty('issueDate', updatePayload.issueDate);

      // 7. Verify update in DB
      await item.reload();
      expect(item.get('itemName')).toBe(updatePayload.itemName);
      expect(item.get('status')).toBe(updatePayload.status);
      expect(item.get('issueDate')).toBe(updatePayload.issueDate);
    });

    it('should return 403 if user is not an admin', async () => {
        const user = await createTestUser({ role: Role.EMPLOYEE });
        const employee = await createTestEmployee({ userId: user.get('id') as number });
        const item = await createTestCompliance({ employeeId: employee.get('id') as number });
        const updatePayload = { status: 'Active' };
        mockGetSession.mockResolvedValue({
          user: { id: user.get('id') as number, role: user.get('role') as string },
          expires: faker.date.future().toISOString(),
        });
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: 'PUT',
          query: { id: (item.get('id') as number).toString() },
          body: updatePayload,
        });
        await complianceIdHandler(req, res);
        expect(res._getStatusCode()).toBe(403); // Assuming only admin can update
    });

    // TODO: Add tests for validation errors, not found
  });

  describe('DELETE /api/compliance/[id]', () => {
    it('should delete a specific compliance item when called by an admin', async () => {
      // 1. Seed database
      const adminUser = await createTestUser({ role: Role.ADMIN });
      const employee = await createTestEmployee({});
      const item = await createTestCompliance({ employeeId: employee.get('id') as number });
      const itemId = item.get('id') as number; // Store ID

      // 2. Mock session
      mockGetSession.mockResolvedValue({
        user: { id: adminUser.get('id') as number, role: adminUser.get('role') as string },
        expires: faker.date.future().toISOString(),
      });

      // 3. Mock request/response objects
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'DELETE',
        query: { id: itemId.toString() },
      });

      // 4. Call the handler
      await complianceIdHandler(req, res);

      // 5. Assert response status
      expect([200, 204]).toContain(res._getStatusCode());

      // 6. Verify record deleted from DB
      const deletedRecord = await Compliance.findByPk(itemId);
      expect(deletedRecord).toBeNull();
    });

    it('should return 403 if user is not an admin', async () => {
        const user = await createTestUser({ role: Role.EMPLOYEE });
        const employee = await createTestEmployee({ userId: user.get('id') as number });
        const item = await createTestCompliance({ employeeId: employee.get('id') as number });
        mockGetSession.mockResolvedValue({
          user: { id: user.get('id') as number, role: user.get('role') as string },
          expires: faker.date.future().toISOString(),
        });
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: 'DELETE',
          query: { id: (item.get('id') as number).toString() },
        });
        await complianceIdHandler(req, res);
        expect(res._getStatusCode()).toBe(403); // Assuming only admin can delete
    });

    // TODO: Add tests for not found
  });
});