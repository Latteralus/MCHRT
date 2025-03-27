import type { NextApiRequest, NextApiResponse } from 'next';
import Department from '@/modules/organization/models/Department';
import { withRole } from '@/lib/middleware/withRole';
import { AuthenticatedNextApiHandler } from '@/lib/middleware/withAuth'; // Correct import source
// import { defineAssociations } from '@/db/associations'; // Ensure associations are defined

// TODO: Add more granular error handling and validation

// Ensure associations are defined (call this once, perhaps in a central db setup file)
// defineAssociations();

// Define the core handler logic expecting authentication and session
const handler: AuthenticatedNextApiHandler = async (req, res, session) => {
  const { method } = req;
  const { id } = req.query; // Get the department ID from the URL path

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Department ID is required' });
  }

  const departmentId = parseInt(id, 10);
  if (isNaN(departmentId)) {
    return res.status(400).json({ message: 'Invalid Department ID format' });
  }

  let department; // To store the found department

  switch (method) {
    case 'GET':
      // Handle GET request - Retrieve a single department by ID
      try {
        department = await Department.findByPk(departmentId);
        if (!department) {
          return res.status(404).json({ message: 'Department not found' });
        }
        res.status(200).json(department);
      } catch (error) {
        console.error(`Error fetching department ${departmentId}:`, error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
      break;

    case 'PUT':
      // Handle PUT request - Update a department by ID
      try {
        department = await Department.findByPk(departmentId);
        if (!department) {
          return res.status(404).json({ message: 'Department not found' });
        }

        const { name, managerId } = req.body;
        // Basic validation
        if (!name) {
            return res.status(400).json({ message: 'Department name is required' });
        }

        await department.update({ name, managerId });
        res.status(200).json(department); // Return the updated department
      } catch (error: any) {
        console.error(`Error updating department ${departmentId}:`, error);
         if (error.name === 'SequelizeUniqueConstraintError') {
          return res.status(409).json({ message: 'Department name already exists' });
        }
        res.status(500).json({ message: 'Internal Server Error' });
      }
      break;

    case 'DELETE':
      // Handle DELETE request - Delete a department by ID
      try {
        department = await Department.findByPk(departmentId);
        if (!department) {
          return res.status(404).json({ message: 'Department not found' });
        }

        await department.destroy();
        res.status(204).end(); // No content to send back
      } catch (error) {
        console.error(`Error deleting department ${departmentId}:`, error);
        // Consider potential foreign key constraint errors if not handled by DB (e.g., ON DELETE RESTRICT)
        res.status(500).json({ message: 'Internal Server Error' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

// Wrap the handler with the RBAC middleware, allowing only Admins
export default withRole(['Admin'], handler);