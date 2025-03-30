import type { NextApiRequest, NextApiResponse } from 'next';
import { Department } from '@/db'; // Import initialized Department model from central index
import { withRole } from '@/lib/middleware/withRole';
import { AuthenticatedNextApiHandler } from '@/lib/middleware/withAuth'; // Correct import source
// import { defineAssociations } from '@/db/associations'; // Ensure associations are defined

// TODO: Add more granular error handling and validation

// Ensure associations are defined (call this once, perhaps in a central db setup file)
// defineAssociations();

// Define the core handler logic expecting authentication and session
const handler: AuthenticatedNextApiHandler = async (req, res, session) => {
  const { method } = req;

  switch (method) {
    case 'GET':
      // Handle GET request - List all departments
      try {
        const departments = await Department.findAll();
        res.status(200).json(departments);
      } catch (error) {
        console.error('Error fetching departments:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
      break;

    case 'POST':
      // Handle POST request - Create a new department
      try {
        const { name, managerId } = req.body;

        // Basic validation
        if (!name) {
          return res.status(400).json({ message: 'Department name is required' });
        }

        const newDepartment = await Department.create({ name, managerId });
        res.status(201).json(newDepartment);
      } catch (error: any) {
        console.error('Error creating department:', error);
        // Handle potential unique constraint error
        if (error.name === 'SequelizeUniqueConstraintError') {
          return res.status(409).json({ message: 'Department name already exists' });
        }
        res.status(500).json({ message: 'Internal Server Error' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

// Wrap the handler with the RBAC middleware, allowing only Admins
export default withRole(['Admin'], handler);