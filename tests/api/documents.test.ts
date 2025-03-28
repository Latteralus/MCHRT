// tests/api/documents.test.ts
import { createMocks, RequestMethod } from 'node-mocks-http';
import { NextApiRequest, NextApiResponse } from 'next';
import handler from '@/pages/api/documents'; // Assuming default export for index route
import documentIdHandler from '@/pages/api/documents/[id]'; // Assuming default export for [id] route
import uploadHandler from '@/pages/api/documents/upload'; // Assuming default export for upload
// import fileHandler from '@/pages/api/documents/[id]/file'; // Assuming default export for file download - COMMENTED OUT
import { setupTestDb, teardownTestDb, clearTestDb } from '../db-setup';
// Models and fixtures will be imported inside describe block
import { Role } from '@/types/roles';
import { faker } from '@faker-js/faker';
import formidable from 'formidable'; // Import formidable
import fs from 'fs'; // Import fs for mocking
import path from 'path'; // Import path for joining paths
// Mock next-auth session
jest.mock('next-auth/react', () => ({
  getSession: jest.fn(),
}));
import { getSession } from 'next-auth/react'; // Import the mocked version

// Mock formidable
jest.mock('formidable');
// Mock fs.promises (specifically rename for moving uploaded files)
jest.mock('fs', () => {
    const originalFs = jest.requireActual('fs');
    const Stream = require('stream'); // Import Stream for mocking createReadStream

    return {
        ...originalFs,
        promises: {
            ...originalFs.promises,
            rename: jest.fn().mockResolvedValue(undefined),
            mkdir: jest.fn().mockResolvedValue(undefined),
            stat: jest.fn().mockResolvedValue({ // Mock stat to return file info
                size: 12345, // Example size
                isFile: () => true,
            }),
            unlink: jest.fn().mockResolvedValue(undefined), // Mock unlink to resolve successfully
        },
        createReadStream: jest.fn(() => { // Mock createReadStream
            const readable = new Stream.Readable();
            readable._read = () => {}; // Noop _read implementation
            // Push some mock data to the stream
            readable.push('mock file content');
            readable.push(null); // Signal end of stream
            return readable;
        }),
    };
});


// Helper to mock session
const mockGetSession = getSession as jest.MockedFunction<typeof getSession>;
// Helper for mocked fs.promises.rename
const mockFsRename = fs.promises.rename as jest.MockedFunction<typeof fs.promises.rename>;


describe('Document API Routes', () => {
  // Import models and fixtures inside describe
  let User: typeof import('@/modules/auth/models/User').default;
  let Employee: typeof import('@/modules/employees/models/Employee').default;
  let Document: typeof import('@/modules/documents/models/Document').default;
  let createTestUser: typeof import('../fixtures/userFixtures').createTestUser;
  let createTestEmployee: typeof import('../fixtures/employeeFixtures').createTestEmployee;
  let createTestDocument: typeof import('../fixtures/documentFixtures').createTestDocument;
  let generateDocumentData: typeof import('../fixtures/documentFixtures').generateDocumentData;

  beforeAll(async () => {
    // Perform DB setup which initializes Sequelize
    await setupTestDb();

    // Dynamically import models and fixtures AFTER setup
    User = (await import('@/modules/auth/models/User')).default;
    Employee = (await import('@/modules/employees/models/Employee')).default;
    Document = (await import('@/modules/documents/models/Document')).default;
    const userFixtures = await import('../fixtures/userFixtures');
    createTestUser = userFixtures.createTestUser;
    const employeeFixtures = await import('../fixtures/employeeFixtures');
    createTestEmployee = employeeFixtures.createTestEmployee;
    const documentFixtures = await import('../fixtures/documentFixtures');
    createTestDocument = documentFixtures.createTestDocument;
    generateDocumentData = documentFixtures.generateDocumentData;
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  // Clear data between tests
  beforeEach(async () => {
    await clearTestDb();
    mockGetSession.mockClear();
    // Reset any other mocks (like formidable) if needed
  });

  describe('GET /api/documents', () => {
    it('should return a list of documents for an authorized user (admin)', async () => {
      // 1. Seed database
      const adminUser = await createTestUser({ role: Role.ADMIN });
      // Create documents (ownerId might be relevant depending on API logic)
      const doc1 = await createTestDocument({ ownerId: adminUser.id, title: 'Doc A' });
      const doc2 = await createTestDocument({ ownerId: adminUser.id, title: 'Doc B' });

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
      // Check if the returned data looks like document metadata
      expect(responseData[0]).toHaveProperty('id', doc1.id);
      expect(responseData[0]).toHaveProperty('title', 'Doc A');
      expect(responseData[0]).toHaveProperty('filePath', doc1.filePath);
      expect(responseData[1]).toHaveProperty('id', doc2.id);
      expect(responseData[1]).toHaveProperty('title', 'Doc B');
    });

     it('should return 401 if user is not authenticated', async () => {
       mockGetSession.mockResolvedValue(null);
       const { req, res } = createMocks<NextApiRequest, NextApiResponse>({ method: 'GET' });
       await handler(req, res);
       expect(res._getStatusCode()).toBe(401);
    });

    // TODO: Add tests for filtering (employeeId, departmentId, title), RBAC
  });

  describe('POST /api/documents/upload', () => {
    // Get the mocked formidable instance
    const mockFormidable = formidable as jest.Mocked<any>;

    beforeEach(() => {
        // Reset mocks specific to this describe block if needed
        mockFormidable.mockClear();
        // Reset fs mocks if they were called in ways that need resetting
        mockFsRename.mockClear();
    });

    it('should upload a new document when called by an authorized user', async () => {
      // 1. Seed database
      const adminUser = await createTestUser({ role: Role.ADMIN });
      const employee = await createTestEmployee({}); // Optional: if associating with employee

      // 2. Mock session
      mockGetSession.mockResolvedValue({
        user: { id: adminUser.id, username: adminUser.username, role: adminUser.role },
        expires: faker.date.future().toISOString(),
      });

      // 3. Prepare mock form data (fields and files)
      const mockFile = {
        filepath: '/tmp/mockfile123', // Temporary path provided by formidable
        originalFilename: 'test-document.pdf',
        mimetype: 'application/pdf',
        size: 12345,
      };
      const mockFields = {
        title: ['Test Document Title'], // formidable parses fields as arrays
        employeeId: [employee.id.toString()], // Example: associating with an employee
        description: ['A test description.'],
      };

      // Configure the mock formidable parse method
      const mockParse = jest.fn((req, callback) => {
          // Simulate successful parsing with the mock data
          callback(null, mockFields, { file: [mockFile] }); // Assuming the file input name is 'file'
      });
      mockFormidable.mockImplementation(() => ({ // Mock the instance creation
          parse: mockParse,
      }));


      // 4. Mock request/response objects
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        // Headers might be needed depending on how formidable/handler checks content-type
        headers: {
            'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW',
        },
      });

      // 5. Call the handler
      await uploadHandler(req, res);

      // 6. Assert response status and data
      expect(res._getStatusCode()).toBe(201);
      const responseData = res._getJSONData();
      expect(responseData).toHaveProperty('id');
      expect(responseData).toHaveProperty('title', mockFields.title[0]);
      expect(responseData).toHaveProperty('employeeId', employee.id);
      expect(responseData).toHaveProperty('fileType', mockFile.mimetype);
      expect(responseData).toHaveProperty('fileSize', mockFile.size);
      expect(responseData).toHaveProperty('filePath'); // Check that a filePath is returned

      // 7. Verify DB record creation
      const createdRecord = await Document.findByPk(responseData.id);
      expect(createdRecord).not.toBeNull();
      expect(createdRecord?.title).toBe(mockFields.title[0]);
      expect(createdRecord?.filePath).toBe(responseData.filePath); // Ensure DB path matches response path

      // 8. Verify file system mock (rename) was called (optional but good)
      // This depends heavily on the implementation detail of where the file is saved
      // Example: expect(mockFsRename).toHaveBeenCalledWith(mockFile.filepath, expect.stringContaining(mockFile.originalFilename));
      expect(mockFsRename).toHaveBeenCalled(); // Basic check that rename was attempted

    });

    // TODO: Add tests for validation errors (missing file, invalid fields), RBAC, file type limits, fs errors
  });

  describe('GET /api/documents/[id]', () => {
    it('should return metadata for a specific document for an authorized user', async () => {
      // 1. Seed database
      const adminUser = await createTestUser({ role: Role.ADMIN });
      const doc = await createTestDocument({ ownerId: adminUser.id });

      // 2. Mock session
      mockGetSession.mockResolvedValue({
        user: { id: adminUser.id, username: adminUser.username, role: adminUser.role },
        expires: faker.date.future().toISOString(),
      });

      // 3. Mock request/response objects
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: { id: doc.id.toString() },
      });

      // 4. Call the handler
      await documentIdHandler(req, res);

      // 5. Assert response status and data
      expect(res._getStatusCode()).toBe(200);
      const responseData = res._getJSONData();
      expect(responseData).toHaveProperty('id', doc.id);
      expect(responseData).toHaveProperty('title', doc.title);
      expect(responseData).toHaveProperty('filePath', doc.filePath);
      expect(responseData).toHaveProperty('fileSize', doc.fileSize);
      // Should not return the actual file content here, just metadata
    });

    it('should return 404 if document is not found', async () => {
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
        await documentIdHandler(req, res);
        expect(res._getStatusCode()).toBe(404);
    });

     it('should return 401 if user is not authenticated', async () => {
        const doc = await createTestDocument({}); // Need an ID
        mockGetSession.mockResolvedValue(null);
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: 'GET',
          query: { id: doc.id.toString() },
        });
        await documentIdHandler(req, res);
        expect(res._getStatusCode()).toBe(401);
    });

    // TODO: Add tests for RBAC (employee seeing own/dept docs, manager seeing dept docs)
  });

  describe('PUT /api/documents/[id]', () => {
    it('should update metadata for a specific document when called by an authorized user', async () => {
      // 1. Seed database
      const adminUser = await createTestUser({ role: Role.ADMIN });
      const doc = await createTestDocument({ ownerId: adminUser.id, title: 'Old Title' });

      // 2. Prepare update data
      const updatePayload = {
        title: 'New Updated Title',
        description: 'Updated description.',
        // Add other fields that should be updatable (e.g., employeeId, departmentId)
      };

      // 3. Mock session
      mockGetSession.mockResolvedValue({
        user: { id: adminUser.id, username: adminUser.username, role: adminUser.role },
        expires: faker.date.future().toISOString(),
      });

      // 4. Mock request/response objects
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'PUT',
        query: { id: doc.id.toString() },
        body: updatePayload,
      });

      // 5. Call the handler
      await documentIdHandler(req, res);

      // 6. Assert response status and data
      expect(res._getStatusCode()).toBe(200);
      const responseData = res._getJSONData();
      expect(responseData).toHaveProperty('id', doc.id);
      expect(responseData).toHaveProperty('title', updatePayload.title);
      expect(responseData).toHaveProperty('description', updatePayload.description);

      // 7. Verify update in DB
      await doc.reload();
      expect(doc.title).toBe(updatePayload.title);
      expect(doc.description).toBe(updatePayload.description);
    });

    it('should return 404 if document to update is not found', async () => {
        const adminUser = await createTestUser({ role: Role.ADMIN });
        const nonExistentId = 99999;
        const updatePayload = { title: 'New Title' };
        mockGetSession.mockResolvedValue({
          user: { id: adminUser.id, username: adminUser.username, role: adminUser.role },
          expires: faker.date.future().toISOString(),
        });
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: 'PUT',
          query: { id: nonExistentId.toString() },
          body: updatePayload,
        });
        await documentIdHandler(req, res);
        expect(res._getStatusCode()).toBe(404);
    });

    // TODO: Add tests for validation errors, RBAC (e.g., only owner or admin can update?)
  });

  /* // COMMENTED OUT - Requires fileHandler implementation and potentially more fs mocks
   describe('GET /api/documents/[id]/file', () => {
    // Get mocked fs functions
    const mockFsStat = fs.promises.stat as jest.MockedFunction<typeof fs.promises.stat>;
    const mockCreateReadStream = fs.createReadStream as jest.MockedFunction<typeof fs.createReadStream>;

    beforeEach(() => {
        mockFsStat.mockClear();
        mockCreateReadStream.mockClear();
        // Reset mock implementation if needed, e.g., stat result
        mockFsStat.mockResolvedValue({ size: 54321, isFile: () => true } as any);
    });

    it('should return the file content for an authorized user', async () => {
      // 1. Seed database
      const adminUser = await createTestUser({ role: Role.ADMIN });
      const doc = await createTestDocument({
          ownerId: adminUser.id,
          filePath: 'test/path/document.pdf', // Use a predictable path for the test
          fileType: 'application/pdf',
          fileSize: 54321,
      });

      // 2. Mock session
      mockGetSession.mockResolvedValue({
        user: { id: adminUser.id, username: adminUser.username, role: adminUser.role },
        expires: faker.date.future().toISOString(),
      });

      // 3. Mock request/response objects
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: { id: doc.id.toString() },
      });

      // 4. Call the handler
      // We need to await the end of the stream piping
      await new Promise<void>(async (resolve) => {
          res.on('end', resolve); // Resolve the promise when the response stream ends
          // await fileHandler(req, res); // Handler doesn't exist yet
      });


      // 5. Assert response status and headers
      expect(res._getStatusCode()).toBe(200);
      expect(res._getHeaders()).toHaveProperty('content-type', 'application/pdf');
      expect(res._getHeaders()).toHaveProperty('content-length', '54321');
      // Check if Content-Disposition is set correctly (optional, depends on handler)
      // expect(res._getHeaders()).toHaveProperty('content-disposition', expect.stringContaining(doc.title));

      // 6. Assert that fs functions were called
      expect(mockFsStat).toHaveBeenCalledWith(expect.stringContaining(doc.filePath));
      expect(mockCreateReadStream).toHaveBeenCalledWith(expect.stringContaining(doc.filePath));

      // 7. Assert the streamed content (optional, depends on mock stream implementation)
      // This requires capturing the output stream, which node-mocks-http doesn't do easily by default.
      // For basic testing, checking headers and mock calls is often sufficient.
      // expect(res._getData()).toBe('mock file content'); // This might not work as expected with streams

    });

    // TODO: Add tests for not found (DB record or file system file), RBAC, 401
  });
  */

  describe('DELETE /api/documents/[id]', () => {
    // Get mocked fs.promises.unlink
    const mockFsUnlink = fs.promises.unlink as jest.MockedFunction<typeof fs.promises.unlink>;

    beforeEach(() => {
        mockFsUnlink.mockClear();
    });

    it('should delete a specific document and its file when called by an admin', async () => {
      // 1. Seed database
      const adminUser = await createTestUser({ role: Role.ADMIN });
      const doc = await createTestDocument({
          ownerId: adminUser.id,
          filePath: 'test/to/be/deleted.txt', // Use a predictable path
      });
      const docId = doc.id;
      const docPath = doc.filePath;

      // 2. Mock session
      mockGetSession.mockResolvedValue({
        user: { id: adminUser.id, username: adminUser.username, role: adminUser.role },
        expires: faker.date.future().toISOString(),
      });

      // 3. Mock request/response objects
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'DELETE',
        query: { id: docId.toString() },
      });

      // 4. Call the handler
      await documentIdHandler(req, res);

      // 5. Assert response status
      expect([200, 204]).toContain(res._getStatusCode());

      // 6. Verify record deleted from DB
      const deletedRecord = await Document.findByPk(docId);
      expect(deletedRecord).toBeNull();

      // 7. Verify fs.promises.unlink was called with the correct path
      expect(mockFsUnlink).toHaveBeenCalledWith(expect.stringContaining(docPath));
    });

    it('should return 404 if document to delete is not found', async () => {
        const adminUser = await createTestUser({ role: Role.ADMIN });
        const nonExistentId = 99999;
        mockGetSession.mockResolvedValue({
          user: { id: adminUser.id, username: adminUser.username, role: adminUser.role },
          expires: faker.date.future().toISOString(),
        });
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: 'DELETE',
          query: { id: nonExistentId.toString() },
        });
        await documentIdHandler(req, res);
        expect(res._getStatusCode()).toBe(404);
        expect(mockFsUnlink).not.toHaveBeenCalled(); // Ensure unlink wasn't called if record not found
    });

    // TODO: Add tests for RBAC (non-admin attempting delete), fs unlink errors
  });
});