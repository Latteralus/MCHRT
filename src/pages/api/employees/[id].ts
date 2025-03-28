import type { NextApiRequest, NextApiResponse } from 'next';
import { Employee } from '@/db'; // Import Employee from the central DB index
import { withEmployeeAccess } from '@/lib/middleware/withEmployeeAccess'; // Import the new middleware
import { AuthenticatedNextApiHandler } from '@/lib/middleware/withAuth'; // Import handler type
// import { defineAssociations } from '@/db/associations'; // No longer needed here

// TODO: Implement database lookups within withEmployeeAccess middleware
// TODO: Add proper error handling and validation
// TODO: Implement SSN encryption/decryption logic

// Ensure associations are defined
// defineAssociations();

// Define the core handler logic expecting authentication and session
const handler: AuthenticatedNextApiHandler = async (req, res, session) => {
  const { method } = req;
  const { id } = req.query; // Get the employee ID from the URL path

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Employee ID is required' });
  }

  const employeeId = parseInt(id, 10);
  if (isNaN(employeeId)) {
    return res.status(400).json({ message: 'Invalid Employee ID format' });
  }

  let employee; // To store the found employee

  switch (method) {
    case 'GET':
      // Handle GET request - Retrieve a single employee by ID (excluding encrypted SSN)
      try {
        employee = await Employee.findByPk(employeeId, {
          attributes: { exclude: ['ssnEncrypted'] }
          // TODO: Include associated data like Department if needed
          // include: [{ model: Department, as: 'department' }]
        });
        if (!employee) {
          return res.status(404).json({ message: 'Employee not found' });
        }
        res.status(200).json(employee);
      } catch (error) {
        console.error(`Error fetching employee ${employeeId}:`, error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
      break;

    case 'PUT':
      // Handle PUT request - Update an employee by ID
      try {
        employee = await Employee.findByPk(employeeId);
        if (!employee) {
          return res.status(404).json({ message: 'Employee not found' });
        }

        const { firstName, lastName, ssn, departmentId, position, hireDate } = req.body;

        // Prepare update data
        const updateData: Partial<Employee> = {};
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (departmentId !== undefined) updateData.departmentId = departmentId;
        if (position !== undefined) updateData.position = position;
        if (hireDate !== undefined) updateData.hireDate = hireDate;

        // Handle SSN update separately
        if (ssn) {
          // TODO: Implement actual SSN encryption here
          updateData.ssnEncrypted = `encrypted(${ssn})`; // Replace with real encryption
        } else if (ssn === null || ssn === '') {
           // Allow clearing the SSN if needed (set encrypted field to null/undefined)
           updateData.ssnEncrypted = undefined; // Or null, depending on DB/model definition
        }


        await employee.update(updateData);

        // Exclude encrypted SSN from the response
        const { ssnEncrypted: _, ...employeeResponse } = employee.toJSON();
        res.status(200).json(employeeResponse);

      } catch (error: any) {
        console.error(`Error updating employee ${employeeId}:`, error);
        // Handle potential errors
        res.status(500).json({ message: 'Internal Server Error' });
      }
      break;

    case 'DELETE':
      // Handle DELETE request - Delete an employee by ID
      try {
        employee = await Employee.findByPk(employeeId);
        if (!employee) {
          return res.status(404).json({ message: 'Employee not found' });
        }

        // Consider implications of deleting an employee (e.g., related records)
        await employee.destroy();
        res.status(204).end(); // No content to send back
      } catch (error) {
        console.error(`Error deleting employee ${employeeId}:`, error);
        // Handle potential foreign key constraint errors if ON DELETE RESTRICT is used elsewhere
        res.status(500).json({ message: 'Internal Server Error' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

// Wrap the handler with the granular employee access middleware
export default withEmployeeAccess(handler);