import type { NextApiRequest, NextApiResponse } from 'next';
import Employee from '@/modules/employees/models/Employee';
import { withRole } from '@/lib/middleware/withRole'; // Import withRole
import { AuthenticatedNextApiHandler } from '@/lib/middleware/withAuth'; // Import handler type
// import { defineAssociations } from '@/db/associations';

// TODO: Add more granular authorization (e.g., DepartmentHead can only see/create in their dept)
// TODO: Add proper error handling and validation
// TODO: Implement SSN encryption before saving

// Ensure associations are defined
// defineAssociations();

// Define the core handler logic expecting authentication and session
const handler: AuthenticatedNextApiHandler = async (req, res, session) => {
  const { method } = req;

  switch (method) {
    case 'GET':
      // Handle GET request - List all employees (excluding encrypted SSN)
      try {
        // TODO: Add filtering, pagination, sorting options
        const employees = await Employee.findAll({
          attributes: { exclude: ['ssnEncrypted'] } // Exclude sensitive data
        });
        res.status(200).json(employees);
      } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
      break;

    case 'POST':
      // Handle POST request - Create a new employee
      try {
        const { firstName, lastName, ssn, departmentId, position, hireDate } = req.body;

        // Basic validation
        if (!firstName || !lastName) {
          return res.status(400).json({ message: 'First name and last name are required' });
        }

        // TODO: Implement actual SSN encryption here before creating the record
        // For now, we'll just store a placeholder or undefined if SSN is not provided
        const ssnEncrypted = ssn ? `encrypted(${ssn})` : undefined; // Replace with real encryption

        const newEmployee = await Employee.create({
          firstName,
          lastName,
          ssnEncrypted, // Store the (placeholder) encrypted SSN
          departmentId,
          position,
          hireDate
        });

        // Exclude encrypted SSN from the response
        const { ssnEncrypted: _, ...employeeResponse } = newEmployee.toJSON();
        res.status(201).json(employeeResponse);

      } catch (error: any) {
        console.error('Error creating employee:', error);
        // Handle potential errors (e.g., foreign key constraints if departmentId is invalid)
        res.status(500).json({ message: 'Internal Server Error' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

// Wrap the handler with the RBAC middleware, allowing Admins and Department Heads
export default withRole(['Admin', 'DepartmentHead'], handler);