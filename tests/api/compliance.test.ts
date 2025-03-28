// tests/api/compliance.test.ts
import { createMocks, RequestMethod } from 'node-mocks-http';
import { NextApiRequest, NextApiResponse } from 'next';
import handler from '@/pages/api/compliance'; // Assuming default export for index route
import complianceIdHandler from '@/pages/api/compliance/[id]'; // Assuming default export for [id] route
import { setupTestDb, teardownTestDb, clearTestDb } from '../db-setup';
import User from '@/modules/auth/models/User';
import Employee from '@/modules/employees/models/Employee';
import Compliance from '@/modules/compliance/models/Compliance';
import { createTestUser } from '../fixtures/userFixtures';
import { createTestEmployee } from '../fixtures/employeeFixtures';
import { createTestCompliance, generateComplianceData } from '../fixtures/complianceFixtures';
import { Role } from '@/types/roles';
import { faker } from '@faker-js/faker';
// Mock next-auth session
jest.mock('next-auth/react', () => ({
  getSession: jest.fn(),
}));
import { getSession } from 'next-auth/react'; // Import the mocked version

// Helper to mock session
const mockGetSession = getSession as jest.MockedFunction<typeof getSession>;


describe('Compliance API Routes', () => {
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

  describe('GET /api/compliance', () => {
    it('should return a list of compliance items for an authorized user (admin)', async () => {
      // 1. Seed database
      const adminUser = await createTestUser({ role: Role.ADMIN });
      const employee = await createTestEmployee({});
      const item1 = await createTestCompliance({ employeeId: employee.id, itemType: 'License' });
      const item2 = await createTestCompliance({ employeeId: employee.id, itemType: 'Training' });

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
      // Check if the returned data looks like compliance items
      expect(responseData[0]).toHaveProperty('id', item1.id);
      expect(responseData[0]).toHaveProperty('employeeId', employee.id);
      expect(responseData[0]).toHaveProperty('itemType', 'License');
      expect(responseData[1]).toHaveProperty('id', item2.id);
      expect(responseData[1]).toHaveProperty('itemType', 'Training');
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
        employeeId: employee.id,
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
        user: { id: adminUser.id, username: adminUser.username, role: adminUser.role },
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
      expect(createdRecord?.employeeId).toBe(compliancePayload.employeeId);
      expect(createdRecord?.itemName).toBe(compliancePayload.itemName);
      expect(createdRecord?.status).toBe(compliancePayload.status);
    });

    it('should return 403 if user is not an admin', async () => {
        const user = await createTestUser({ role: Role.EMPLOYEE });
        const employee = await createTestEmployee({ userId: user.id });
        const compliancePayload = { employeeId: employee.id, itemType: 'Test', itemName: 'Test Item' };
        mockGetSession.mockResolvedValue({
          user: { id: user.id, username: user.username, role: user.role },
          expires: faker.date.future().toISOString(),
        });
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({ method: 'POST', body: compliancePayload });
        await handler(req, res);
        expect(res._getStatusCode()).toBe(403); // Assuming only admin can create
    });

    // TODO: Add tests for validation errors (missing fields, invalid dates)
  });

  describe('GET /api/compliance/[id]', () => {
    it('should return a specific compliance item', async () => {
      // TODO: Implement test
      expect(true).toBe(true); // Placeholder
    });
    // TODO: Add tests for not found, RBAC
  });

  describe('PUT /api/compliance/[id]', () => {
    it('should update a specific compliance item', async () => {
      // TODO: Implement test
      expect(true).toBe(true); // Placeholder
    });
    // TODO: Add tests for validation errors, not found, RBAC
  });

  describe('DELETE /api/compliance/[id]', () => {
    it('should delete a specific compliance item', async () => {
      // TODO: Implement test
      expect(true).toBe(true); // Placeholder
    });
    // TODO: Add tests for not found, RBAC
  });
});