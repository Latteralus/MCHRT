// tests/api/attendance.test.ts
import { createMocks, RequestMethod } from 'node-mocks-http';
import { NextApiRequest, NextApiResponse } from 'next';
// Import handlers inside describe block
// import handler from '@/pages/api/attendance';
// import attendanceIdHandler from '@/pages/api/attendance/[id]';
// import { setupTestDb, teardownTestDb, clearTestDb } from '../db-setup'; // No longer needed here
import { Role } from '@/types/roles';
import { faker } from '@faker-js/faker';
// Models and fixtures will be imported dynamically
// import User from '@/modules/auth/models/User';
// import Employee from '@/modules/employees/models/Employee';
// import Attendance from '@/modules/attendance/models/Attendance';
// import { createTestUser } from '../fixtures/userFixtures';
// import { createTestEmployee } from '../fixtures/employeeFixtures';
// import { createTestAttendance, generateAttendanceData } from '../fixtures/attendanceFixtures';

// Mock next-auth session
jest.mock('next-auth/react', () => ({
  getSession: jest.fn(),
}));
import { getSession } from 'next-auth/react'; // Import the mocked version

// Helper to mock session
const mockGetSession = getSession as jest.MockedFunction<typeof getSession>;


describe('Attendance API Routes', () => {
  // Declare variables for handlers, models, and fixtures
  let handler: typeof import('@/pages/api/attendance').default;
  let attendanceIdHandler: typeof import('@/pages/api/attendance/[id]').default;
  let User: typeof import('@/modules/auth/models/User').default;
  let Employee: typeof import('@/modules/employees/models/Employee').default;
  let Attendance: typeof import('@/modules/attendance/models/Attendance').default;
  let createTestUser: typeof import('../fixtures/userFixtures').createTestUser;
  let createTestEmployee: typeof import('../fixtures/employeeFixtures').createTestEmployee;
  let createTestAttendance: typeof import('../fixtures/attendanceFixtures').createTestAttendance;
  let generateAttendanceData: typeof import('../fixtures/attendanceFixtures').generateAttendanceData;

  beforeAll(async () => {
    // Dynamically import everything AFTER setup in jest.setup.ts runs
    handler = (await import('@/pages/api/attendance')).default;
    attendanceIdHandler = (await import('@/pages/api/attendance/[id]')).default;
    User = (await import('@/modules/auth/models/User')).default;
    Employee = (await import('@/modules/employees/models/Employee')).default;
    Attendance = (await import('@/modules/attendance/models/Attendance')).default;
    const userFixtures = await import('../fixtures/userFixtures');
    createTestUser = userFixtures.createTestUser;
    const employeeFixtures = await import('../fixtures/employeeFixtures');
    createTestEmployee = employeeFixtures.createTestEmployee;
    const attendanceFixtures = await import('../fixtures/attendanceFixtures');
    createTestAttendance = attendanceFixtures.createTestAttendance;
    generateAttendanceData = attendanceFixtures.generateAttendanceData;
  });

  // Clear data between tests
  // Note: jest.setup.ts runs beforeEach(clearTestDb)
  beforeEach(async () => {
    // jest.setup.ts now handles clearing the DB via clearTestDb()
    mockGetSession.mockClear();
  });

  describe('GET /api/attendance', () => {
    it('should return a list of attendance records for an authorized user', async () => {
      // 1. Seed database
      const adminUser = await createTestUser({ role: Role.ADMIN });
      const employee = await createTestEmployee({});
      const att1 = await createTestAttendance({ employeeId: employee.get('id') as number });
      const att2 = await createTestAttendance({ employeeId: employee.get('id') as number });

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
      // Check the 'records' property for the array (based on API handler return)
      expect(Array.isArray(responseData.records)).toBe(true);
      expect(responseData.records).toHaveLength(2);
      // Check if the returned data looks like attendance records
      // Access items within the 'records' array
      expect(responseData.records[0]).toHaveProperty('id', att1.get('id') as number);
      expect(responseData.records[0]).toHaveProperty('employeeId', employee.get('id') as number);
      expect(responseData.records[1]).toHaveProperty('id', att2.get('id') as number);
      expect(responseData.records[1]).toHaveProperty('date'); // Check if date exists
    });

    it('should return 401 if user is not authenticated', async () => {
       mockGetSession.mockResolvedValue(null);
       const { req, res } = createMocks<NextApiRequest, NextApiResponse>({ method: 'GET' });
       await handler(req, res);
       expect(res._getStatusCode()).toBe(401);
    });

    // TODO: Add tests for filtering (by employeeId, date range), RBAC (employee seeing own, manager seeing dept)
  });

  describe('POST /api/attendance', () => {
    it('should create a new attendance record when called by an authorized user', async () => {
      // 1. Seed database
      const adminUser = await createTestUser({ role: Role.ADMIN });
      const employee = await createTestEmployee({});

      // 2. Prepare request data
      const attendancePayload = {
        employeeId: employee.get('id') as number,
        date: '2024-03-28', // Use a specific date string
        // Send time in HH:MM:SS format as expected by the API validation
        timeIn: '08:00:00',
        timeOut: '17:00:00',
      };

      // 3. Mock session
      mockGetSession.mockResolvedValue({
        user: { id: adminUser.get('id') as number, role: adminUser.get('role') as string },
        expires: faker.date.future().toISOString(),
      });

      // 4. Mock request/response objects
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: attendancePayload,
      });

      // 5. Call the handler
      await handler(req, res);

      // 6. Assert response status and data
      expect(res._getStatusCode()).toBe(201);
      const responseData = res._getJSONData();
      expect(responseData).toHaveProperty('id');
      expect(responseData).toHaveProperty('employeeId', attendancePayload.employeeId);
      expect(responseData).toHaveProperty('date', attendancePayload.date); // Should match DATEONLY string
      // Check times (API returns ISO strings after saving Date objects)
      const expectedTimeInISO = new Date(`${attendancePayload.date}T${attendancePayload.timeIn}Z`).toISOString();
      const expectedTimeOutISO = new Date(`${attendancePayload.date}T${attendancePayload.timeOut}Z`).toISOString();
      expect(responseData.timeIn).toBe(expectedTimeInISO);
      expect(responseData.timeOut).toBe(expectedTimeOutISO);


      // 7. Verify record created in DB
      const createdRecord = await Attendance.findByPk(responseData.id);
      expect(createdRecord).not.toBeNull();
      expect(createdRecord?.get('employeeId')).toBe(attendancePayload.employeeId);
      expect(createdRecord?.get('date')).toBe(attendancePayload.date);
      // Check times in DB (compare ISO strings as DB stores Date objects)
      const expectedTimeInISO_DB = new Date(`${attendancePayload.date}T${attendancePayload.timeIn}Z`).toISOString();
      const expectedTimeOutISO_DB = new Date(`${attendancePayload.date}T${attendancePayload.timeOut}Z`).toISOString();
      expect((createdRecord?.get('timeIn') as Date | undefined)?.toISOString()).toBe(expectedTimeInISO_DB);
      expect((createdRecord?.get('timeOut') as Date | undefined)?.toISOString()).toBe(expectedTimeOutISO_DB);
    });

    it('should return 401 if user is not authenticated', async () => {
        const employee = await createTestEmployee({});
        const attendancePayload = { employeeId: employee.get('id') as number, date: '2024-03-28' };
        mockGetSession.mockResolvedValue(null);
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({ method: 'POST', body: attendancePayload });
        await handler(req, res);
        expect(res._getStatusCode()).toBe(401);
    });

    // TODO: Add tests for validation errors (missing fields, invalid data), RBAC (employee creating own?)
  });

  describe('GET /api/attendance/[id]', () => {
    it('should return a specific attendance record for an authorized user', async () => {
      // 1. Seed database
      const adminUser = await createTestUser({ role: Role.ADMIN });
      const employee = await createTestEmployee({});
      const attendance = await createTestAttendance({ employeeId: employee.get('id') as number });

      // 2. Mock session
      mockGetSession.mockResolvedValue({
        user: { id: adminUser.get('id') as number, role: adminUser.get('role') as string },
        expires: faker.date.future().toISOString(),
      });

      // 3. Mock request/response objects
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: {
          id: (attendance.get('id') as number).toString(),
        },
      });

      // 4. Call the handler
      await attendanceIdHandler(req, res);

      // 5. Assert response status and data
      expect(res._getStatusCode()).toBe(200);
      const responseData = res._getJSONData();
      expect(responseData).toHaveProperty('id', attendance.get('id') as number);
      expect(responseData).toHaveProperty('employeeId', attendance.get('employeeId') as number);
      expect(responseData).toHaveProperty('date', attendance.get('date') as unknown as string); // Date should be YYYY-MM-DD string
      // Compare times by converting potentially returned strings back to Date objects or comparing ISO strings
      const timeIn = attendance.get('timeIn') as Date | undefined;
      if (timeIn) {
        expect(new Date(responseData.timeIn).toISOString()).toBe(timeIn.toISOString());
      }
      const timeOut = attendance.get('timeOut') as Date | undefined;
      if (timeOut) {
        expect(new Date(responseData.timeOut).toISOString()).toBe(timeOut.toISOString());
      }
    });

    it('should return 404 if attendance record is not found', async () => {
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
        await attendanceIdHandler(req, res);
        expect(res._getStatusCode()).toBe(404);
    });

     it('should return 401 if user is not authenticated', async () => {
        const employee = await createTestEmployee({});
        const attendance = await createTestAttendance({ employeeId: employee.get('id') as number });
        mockGetSession.mockResolvedValue(null);
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: 'GET',
          query: { id: (attendance.get('id') as number).toString() },
        });
        await attendanceIdHandler(req, res);
        expect(res._getStatusCode()).toBe(401);
    });

    // TODO: Add tests for RBAC (employee seeing own, manager seeing dept)
  });

  describe('PUT /api/attendance/[id]', () => {
    it('should update a specific attendance record when called by an authorized user', async () => {
      // 1. Seed database
      const adminUser = await createTestUser({ role: Role.ADMIN });
      const employee = await createTestEmployee({});
      const attendance = await createTestAttendance({
        employeeId: employee.get('id') as number,
        date: '2024-03-28',
        timeIn: new Date('2024-03-28T08:00:00Z'),
      });

      // 2. Prepare update data
      const updatePayload = {
        timeOut: '16:30:00', // Send time in HH:MM:SS format
        // Optionally update other fields like timeIn or date if allowed by API
        // date: '2024-03-29', // Example: changing date
      };

      // 3. Mock session
      mockGetSession.mockResolvedValue({
        user: { id: adminUser.get('id') as number, role: adminUser.get('role') as string },
        expires: faker.date.future().toISOString(),
      });

      // 4. Mock request/response objects
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'PUT',
        query: { id: (attendance.get('id') as number).toString() },
        body: updatePayload,
      });

      // 5. Call the handler
      await attendanceIdHandler(req, res);

      // 6. Assert response status and data
      expect(res._getStatusCode()).toBe(200);
      const responseData = res._getJSONData();
      expect(responseData).toHaveProperty('id', attendance.get('id') as number);
      expect(responseData).toHaveProperty('employeeId', attendance.get('employeeId') as number);
      expect(responseData).toHaveProperty('date', attendance.get('date') as unknown as string); // Assuming date wasn't updated
      // Check updated timeOut
      // Expect API to return ISO string after saving Date object
      const expectedTimeOutISO = new Date(`${attendance.get('date') as unknown as string}T${updatePayload.timeOut}Z`).toISOString();
      expect(responseData.timeOut).toBe(expectedTimeOutISO);
      // Check timeIn remained the same (or was updated if included in payload)
      const timeIn = attendance.get('timeIn') as Date | undefined;
      expect(new Date(responseData.timeIn).toISOString()).toBe(timeIn?.toISOString());


      // 7. Verify update in DB
      await attendance.reload();
      // Check DB value (should be Date object, compare ISO strings)
      const expectedTimeOutISO_DB = new Date(`${attendance.get('date') as unknown as string}T${updatePayload.timeOut}Z`).toISOString();
      expect((attendance.get('timeOut') as Date | undefined)?.toISOString()).toBe(expectedTimeOutISO_DB);
    });

    it('should return 404 if attendance record to update is not found', async () => {
        const adminUser = await createTestUser({ role: Role.ADMIN });
        const nonExistentId = 99999;
        const updatePayload = { timeOut: new Date().toISOString() };
        mockGetSession.mockResolvedValue({
          user: { id: adminUser.get('id') as number, role: adminUser.get('role') as string },
          expires: faker.date.future().toISOString(),
        });
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: 'PUT',
          query: { id: nonExistentId.toString() },
          body: updatePayload,
        });
        await attendanceIdHandler(req, res);
        expect(res._getStatusCode()).toBe(404);
    });

     it('should return 401 if user is not authenticated', async () => {
        const employee = await createTestEmployee({});
        const attendance = await createTestAttendance({ employeeId: employee.get('id') as number });
        const updatePayload = { timeOut: new Date().toISOString() };
        mockGetSession.mockResolvedValue(null);
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: 'PUT',
          query: { id: (attendance.get('id') as number).toString() },
          body: updatePayload,
        });
        await attendanceIdHandler(req, res);
        expect(res._getStatusCode()).toBe(401);
    });

    // TODO: Add tests for validation errors, RBAC (employee updating own?)
  });

  describe('DELETE /api/attendance/[id]', () => {
    it('should delete a specific attendance record when called by an authorized user', async () => {
      // 1. Seed database
      const adminUser = await createTestUser({ role: Role.ADMIN });
      const employee = await createTestEmployee({});
      const attendance = await createTestAttendance({ employeeId: employee.get('id') as number });
      const attendanceId = attendance.get('id') as number; // Store ID before deletion

      // 2. Mock session
      mockGetSession.mockResolvedValue({
        user: { id: adminUser.get('id') as number, role: adminUser.get('role') as string },
        expires: faker.date.future().toISOString(),
      });

      // 3. Mock request/response objects
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'DELETE',
        query: { id: attendanceId.toString() },
      });

      // 4. Call the handler
      await attendanceIdHandler(req, res);

      // 5. Assert response status
      expect([200, 204]).toContain(res._getStatusCode()); // Allow 200 OK or 204 No Content

      // 6. Verify record deleted from DB
      const deletedRecord = await Attendance.findByPk(attendanceId);
      expect(deletedRecord).toBeNull();
    });

    it('should return 404 if attendance record to delete is not found', async () => {
        const adminUser = await createTestUser({ role: Role.ADMIN });
        const nonExistentId = 99999;
        mockGetSession.mockResolvedValue({
          user: { id: adminUser.get('id') as number, role: adminUser.get('role') as string },
          expires: faker.date.future().toISOString(),
        });
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: 'DELETE',
          query: { id: nonExistentId.toString() },
        });
        await attendanceIdHandler(req, res);
        expect(res._getStatusCode()).toBe(404);
    });

     it('should return 401 if user is not authenticated', async () => {
        const employee = await createTestEmployee({});
        const attendance = await createTestAttendance({ employeeId: employee.get('id') as number });
        mockGetSession.mockResolvedValue(null);
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: 'DELETE',
          query: { id: (attendance.get('id') as number).toString() },
        });
        await attendanceIdHandler(req, res);
        expect(res._getStatusCode()).toBe(401);
    });

    // TODO: Add tests for RBAC
  });
});