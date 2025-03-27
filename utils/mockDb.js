// utils/mockDb.js
import bcrypt from 'bcryptjs';

// Initial data for the mock database
const initialData = {
  users: [
    {
      id: '1',
      username: 'fcalkins',
      email: 'fcalkins@mountaincare.example',
      firstName: 'Faith',
      lastName: 'Calkins',
      passwordHash: '$2a$10$YgVzXa13OVWe6JlFV6TP8.M5WnGGgpRXQZcMhXAUa7cmRSVFRSjPi', // hash for 'password'
      role: 'Admin',
      departmentId: '2', // Human Resources
      createdAt: '2023-01-15T08:00:00.000Z',
      updatedAt: '2023-01-15T08:00:00.000Z'
    },
    {
      id: '2',
      username: 'jharper',
      email: 'jharper@mountaincare.example',
      firstName: 'James',
      lastName: 'Harper',
      passwordHash: '$2a$10$YgVzXa13OVWe6JlFV6TP8.M5WnGGgpRXQZcMhXAUa7cmRSVFRSjPi', // hash for 'password'
      role: 'Manager',
      departmentId: '1', // Administration
      createdAt: '2023-01-16T09:30:00.000Z',
      updatedAt: '2023-01-16T09:30:00.000Z'
    },
    {
      id: '3',
      username: 'mfuentes',
      email: 'mfuentes@mountaincare.example',
      firstName: 'Maria',
      lastName: 'Fuentes',
      passwordHash: '$2a$10$YgVzXa13OVWe6JlFV6TP8.M5WnGGgpRXQZcMhXAUa7cmRSVFRSjPi', // hash for 'password'
      role: 'Employee',
      departmentId: '3', // Operations
      createdAt: '2023-01-17T10:15:00.000Z',
      updatedAt: '2023-01-17T10:15:00.000Z'
    },
    {
      id: '4',
      username: 'admin',
      email: 'admin@mountaincare.example',
      firstName: 'System',
      lastName: 'Administrator',
      passwordHash: '$2a$10$YgVzXa13OVWe6JlFV6TP8.M5WnGGgpRXQZcMhXAUa7cmRSVFRSjPi', // hash for 'password'
      role: 'SuperAdmin',
      departmentId: null,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z'
    }
  ],
  employees: [
    {
      id: '1',
      firstName: 'Faith',
      lastName: 'Calkins',
      departmentId: '2',
      position: 'HR Director',
      hireDate: '2020-03-15',
      email: 'fcalkins@mountaincare.example',
      phone: '555-123-4567',
      address: '123 Main St, Anytown, USA',
      status: 'Active',
      emergencyContact: {
        name: 'John Calkins',
        relationship: 'Spouse',
        phone: '555-987-6543'
      },
      createdAt: '2023-01-15T08:00:00.000Z',
      updatedAt: '2023-01-15T08:00:00.000Z'
    },
    {
      id: '2',
      firstName: 'James',
      lastName: 'Harper',
      departmentId: '1',
      position: 'Pharmacy Director',
      hireDate: '2021-05-10',
      email: 'jharper@mountaincare.example',
      phone: '555-234-5678',
      address: '456 Elm St, Anytown, USA',
      status: 'Active',
      emergencyContact: {
        name: 'Emily Harper',
        relationship: 'Spouse',
        phone: '555-876-5432'
      },
      createdAt: '2023-01-16T09:30:00.000Z',
      updatedAt: '2023-01-16T09:30:00.000Z'
    },
    {
      id: '3',
      firstName: 'Maria',
      lastName: 'Fuentes',
      departmentId: '3',
      position: 'Lead Pharmacy Technician',
      hireDate: '2022-02-20',
      email: 'mfuentes@mountaincare.example',
      phone: '555-345-6789',
      address: '789 Oak St, Anytown, USA',
      status: 'Active',
      emergencyContact: {
        name: 'Carlos Fuentes',
        relationship: 'Brother',
        phone: '555-765-4321'
      },
      createdAt: '2023-01-17T10:15:00.000Z',
      updatedAt: '2023-01-17T10:15:00.000Z'
    }
  ],
  departments: [
    {
      id: '1',
      name: 'Administration',
      managerId: '2',
      description: 'Handles overall pharmacy management and administration',
      createdAt: '2023-01-10T08:00:00.000Z',
      updatedAt: '2023-01-10T08:00:00.000Z'
    },
    {
      id: '2',
      name: 'Human Resources',
      managerId: '1',
      description: 'Manages employee recruitment, benefits, and HR functions',
      createdAt: '2023-01-10T08:15:00.000Z',
      updatedAt: '2023-01-10T08:15:00.000Z'
    },
    {
      id: '3',
      name: 'Operations',
      managerId: '3',
      description: 'Handles day-to-day pharmacy operations, inventory, and dispensing',
      createdAt: '2023-01-10T08:30:00.000Z',
      updatedAt: '2023-01-10T08:30:00.000Z'
    }
  ],
  attendance: [
    {
      id: '1',
      employeeId: '1',
      date: '2023-03-01',
      timeIn: '08:00:00',
      timeOut: '17:00:00',
      status: 'Present',
      notes: null,
      createdAt: '2023-03-01T17:05:00.000Z',
      updatedAt: '2023-03-01T17:05:00.000Z'
    },
    {
      id: '2',
      employeeId: '2',
      date: '2023-03-01',
      timeIn: '07:45:00',
      timeOut: '16:30:00',
      status: 'Present',
      notes: null,
      createdAt: '2023-03-01T16:35:00.000Z',
      updatedAt: '2023-03-01T16:35:00.000Z'
    },
    {
      id: '3',
      employeeId: '3',
      date: '2023-03-01',
      timeIn: '08:15:00',
      timeOut: '17:15:00',
      status: 'Present',
      notes: null,
      createdAt: '2023-03-01T17:20:00.000Z',
      updatedAt: '2023-03-01T17:20:00.000Z'
    },
    // Add today's date for statistics
    {
      id: '4',
      employeeId: '1',
      date: new Date().toISOString().split('T')[0],
      timeIn: '08:00:00',
      timeOut: null, // Still at work
      status: 'Present',
      notes: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '5',
      employeeId: '2',
      date: new Date().toISOString().split('T')[0],
      timeIn: '07:50:00',
      timeOut: null, // Still at work
      status: 'Present',
      notes: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  leave: [
    {
      id: '1',
      employeeId: '1',
      leaveType: 'Vacation',
      startDate: '2023-04-10',
      endDate: '2023-04-14',
      status: 'Approved',
      reason: 'Annual family vacation',
      approvedBy: '2',
      createdAt: '2023-03-15T10:00:00.000Z',
      updatedAt: '2023-03-16T14:30:00.000Z'
    },
    {
      id: '2',
      employeeId: '2',
      leaveType: 'Sick',
      startDate: '2023-03-05',
      endDate: '2023-03-06',
      status: 'Approved',
      reason: 'Flu symptoms',
      approvedBy: '1',
      createdAt: '2023-03-04T09:00:00.000Z',
      updatedAt: '2023-03-04T11:45:00.000Z'
    },
    {
      id: '3',
      employeeId: '3',
      leaveType: 'Personal',
      startDate: '2023-03-20',
      endDate: '2023-03-20',
      status: 'Pending',
      reason: 'Family appointment',
      approvedBy: null,
      createdAt: '2023-03-10T15:20:00.000Z',
      updatedAt: '2023-03-10T15:20:00.000Z'
    }
  ],
  compliance: [
    {
      id: '1',
      employeeId: '2',
      licenseType: 'Pharmacist License',
      licenseNumber: 'PH12345',
      issuedDate: '2022-01-15',
      expirationDate: new Date(new Date().setDate(new Date().getDate() + 20)), // 20 days from now
      status: 'Active',
      verifiedBy: '1',
      verifiedDate: '2022-01-20',
      createdAt: '2022-01-20T10:00:00.000Z',
      updatedAt: '2022-01-20T10:00:00.000Z'
    },
    {
      id: '2',
      employeeId: '3',
      licenseType: 'Pharmacy Technician Certification',
      licenseNumber: 'TECH7890',
      issuedDate: '2022-02-10',
      expirationDate: new Date(new Date().setDate(new Date().getDate() + 45)), // 45 days from now
      status: 'Active',
      verifiedBy: '1',
      verifiedDate: '2022-02-15',
      createdAt: '2022-02-15T11:30:00.000Z',
      updatedAt: '2022-02-15T11:30:00.000Z'
    },
    {
      id: '3',
      employeeId: '2',
      licenseType: 'CPR Certification',
      licenseNumber: 'CPR2023-456',
      issuedDate: '2022-06-01',
      expirationDate: new Date(new Date().setDate(new Date().getDate() + 15)), // 15 days from now
      status: 'Active',
      verifiedBy: '1',
      verifiedDate: '2022-06-05',
      createdAt: '2022-06-05T09:15:00.000Z',
      updatedAt: '2022-06-05T09:15:00.000Z'
    }
  ],
  documents: [
    {
      id: '1',
      title: 'Employee Handbook',
      filePath: '/documents/employee-handbook-2023.pdf',
      ownerId: '1',
      departmentId: null, // Available to all departments
      version: '2023.1',
      tags: ['handbook', 'policies', 'procedures'],
      createdAt: '2023-01-05T08:00:00.000Z',
      updatedAt: '2023-01-05T08:00:00.000Z'
    },
    {
      id: '2',
      title: 'Pharmacy Operations Manual',
      filePath: '/documents/pharmacy-operations-manual.pdf',
      ownerId: '2',
      departmentId: '3', // Operations department
      version: '3.2',
      tags: ['operations', 'pharmacy', 'procedures'],
      createdAt: '2023-01-10T09:30:00.000Z',
      updatedAt: '2023-02-15T14:45:00.000Z'
    },
    {
      id: '3',
      title: 'HIPAA Compliance Guidelines',
      filePath: '/documents/hipaa-guidelines.pdf',
      ownerId: '1',
      departmentId: null, // Available to all departments
      version: '2022.2',
      tags: ['compliance', 'hipaa', 'privacy'],
      createdAt: '2022-11-20T10:15:00.000Z',
      updatedAt: '2022-11-20T10:15:00.000Z'
    }
  ]
};

// Make a deep copy of the data
const cloneData = (data) => JSON.parse(JSON.stringify(data));

// In-memory database
let data = cloneData(initialData);

// Track the next ID for each entity (for auto-increment)
const nextIds = {
  users: 5,  // Updated since we added the admin user
  employees: 4,
  departments: 4,
  attendance: 6,
  leave: 4,
  compliance: 4,
  documents: 4
};

// Helper to generate ID
const generateId = (entity) => {
  const id = nextIds[entity].toString();
  nextIds[entity]++;
  return id;
};

// Helper to match filters
const matchesFilter = (item, filter = {}) => {
  return Object.keys(filter).every(key => {
    // Skip null/undefined filters
    if (filter[key] === null || filter[key] === undefined) {
      return true;
    }
    
    // Handle nested paths like 'emergencyContact.name'
    if (key.includes('.')) {
        const parts = key.split('.');
        let value = item;
        for (const part of parts) {
          if (!value || value[part] === undefined) {
            return false;
          }
          value = value[part];
        }
        return value === filter[key];
      }
      
      return item[key] === filter[key];
    });
  };
  
  // Mock database implementation
  export const mockDb = {
    // Reset to initial data (for testing)
    reset: () => {
      data = cloneData(initialData);
      Object.keys(nextIds).forEach(key => {
        nextIds[key] = Math.max(...data[key].map(item => parseInt(item.id))) + 1;
      });
      return true;
    },
    
    // Generic CRUD operations
    findAll: async (entity, filter = {}) => {
      if (!data[entity]) {
        throw new Error(`Entity '${entity}' not found in mock database`);
      }
      
      // Apply filters if provided
      if (Object.keys(filter).length > 0) {
        return data[entity].filter(item => matchesFilter(item, filter));
      }
      
      return data[entity];
    },
    
    findById: async (entity, id) => {
      if (!data[entity]) {
        throw new Error(`Entity '${entity}' not found in mock database`);
      }
      
      return data[entity].find(item => item.id === id) || null;
    },
    
    create: async (entity, itemData) => {
      if (!data[entity]) {
        throw new Error(`Entity '${entity}' not found in mock database`);
      }
      
      const now = new Date().toISOString();
      const newItem = {
        ...itemData,
        id: generateId(entity),
        createdAt: itemData.createdAt || now,
        updatedAt: itemData.updatedAt || now
      };
      
      // Special cases for password hashing
      if (entity === 'users' && itemData.password && !itemData.passwordHash) {
        newItem.passwordHash = bcrypt.hashSync(itemData.password, 10);
        delete newItem.password;
      }
      
      data[entity].push(newItem);
      return newItem;
    },
    
    update: async (entity, id, itemData) => {
      if (!data[entity]) {
        throw new Error(`Entity '${entity}' not found in mock database`);
      }
      
      const index = data[entity].findIndex(item => item.id === id);
      if (index === -1) {
        throw new Error(`Item with id '${id}' not found in ${entity}`);
      }
      
      // Special case for password updates
      if (entity === 'users' && itemData.password) {
        itemData.passwordHash = bcrypt.hashSync(itemData.password, 10);
        delete itemData.password;
      }
      
      const updatedItem = {
        ...data[entity][index],
        ...itemData,
        id, // Ensure ID cannot be changed
        updatedAt: itemData.updatedAt || new Date().toISOString()
      };
      
      data[entity][index] = updatedItem;
      return updatedItem;
    },
    
    remove: async (entity, id) => {
      if (!data[entity]) {
        throw new Error(`Entity '${entity}' not found in mock database`);
      }
      
      const index = data[entity].findIndex(item => item.id === id);
      if (index === -1) {
        return false;
      }
      
      data[entity].splice(index, 1);
      return true;
    },
    
    // Transaction support (simplified for mock)
    transaction: async (callback) => {
      // Create a backup of the current data state
      const backupData = cloneData(data);
      
      try {
        // Execute the callback with a transaction object
        const result = await callback({
          findAll: mockDb.findAll,
          findById: mockDb.findById,
          create: mockDb.create,
          update: mockDb.update,
          remove: mockDb.remove
        });
        
        return result;
      } catch (error) {
        // Rollback on error
        data = backupData;
        throw error;
      }
    }
  };