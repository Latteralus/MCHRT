// tests/fixtures/documentFixtures.ts
import { faker } from '@faker-js/faker';
import Document, { DocumentCreationAttributes } from '@/modules/documents/models/Document'; // Adjust path if needed
import path from 'path';

// Interface for overrides
interface DocumentOverrides {
  title?: string | undefined;
  filePath?: string | undefined;
  fileType?: string | undefined;
  fileSize?: number | undefined;
  ownerId?: number | undefined;
  employeeId?: number | undefined;
  departmentId?: number | undefined;
  version?: number | undefined;
  description?: string | undefined;
}

// Function to generate raw document data
export const generateDocumentData = (overrides: DocumentOverrides = {}): Partial<Document> => {
  const fileName = `${faker.lorem.word()}-${faker.string.uuid()}.pdf`; // Example filename
  // Example path structure - adjust based on actual storage logic
  const filePath = path.join(
    overrides.departmentId ? `department_${overrides.departmentId}` : (overrides.employeeId ? `employee_${overrides.employeeId}` : 'general'),
    fileName
  );

  return {
    // Start with overrides
    ...overrides,
    // Set defaults if not provided
    title: overrides.title ?? faker.system.commonFileName('pdf'),
    filePath: overrides.filePath ?? filePath,
    fileType: overrides.fileType ?? 'application/pdf',
    fileSize: overrides.fileSize ?? faker.number.int({ min: 10000, max: 5000000 }), // 10KB - 5MB
    version: overrides.version ?? 1,
    description: overrides.description ?? faker.lorem.sentence(),
    // ownerId, employeeId, departmentId should ideally come from overrides
  };
};

// Function to create a document record in the database
export const createTestDocument = async (overrides: DocumentOverrides = {}): Promise<Document> => {
  const documentData = generateDocumentData(overrides);

  // Ensure required fields are present (adjust if ownerId etc. become mandatory)
  if (!documentData.title || !documentData.filePath) {
      throw new Error('Title and filePath are required to create a document fixture.');
  }

  try {
    // Use Document.create
    const document = await Document.create(documentData as DocumentCreationAttributes);
    return document;
  } catch (error) {
    console.error("Error creating test document:", error);
     // If filePath uniqueness constraint fails, try again with a different path
    if (error instanceof Error && error.name === 'SequelizeUniqueConstraintError') {
      console.warn("Unique constraint violation for filePath, retrying document creation...");
      const newOverrides = { ...overrides };
      delete newOverrides.filePath; // Remove potentially conflicting path override
      return createTestDocument(newOverrides); // Retry without the specific path override
    }
    throw error; // Re-throw other errors
  }
};

// Example usage:
// const doc1 = await createTestDocument({ ownerId: userId });
// const empDoc = await createTestDocument({ employeeId: empId, title: 'Performance Review' });