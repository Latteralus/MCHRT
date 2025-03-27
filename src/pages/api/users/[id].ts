import type { NextApiRequest, NextApiResponse } from 'next';
import User from '@/modules/auth/models/User';
import bcrypt from 'bcrypt';
import { withRole } from '@/lib/middleware/withRole'; // Import withRole
import { AuthenticatedNextApiHandler } from '@/lib/middleware/withAuth'; // Import handler type
// import { defineAssociations } from '@/db/associations';

// TODO: Add more granular authorization checks (e.g., Admin or self for certain actions)
// TODO: Add proper error handling and validation
// TODO: Prevent users from changing their own role unless they are Admin?
// TODO: Handle password updates securely (e.g., require current password)

// Ensure associations are defined
// defineAssociations();

const saltRounds = 10; // Cost factor for bcrypt hashing

// Define the core handler logic expecting authentication and session
const handler: AuthenticatedNextApiHandler = async (req, res, session) => {
  const { method } = req;
  const { id } = req.query; // Get the user ID from the URL path

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'User ID is required' });
  }

  const userId = parseInt(id, 10);
  if (isNaN(userId)) {
    return res.status(400).json({ message: 'Invalid User ID format' });
  }

  let user; // To store the found user

  switch (method) {
    case 'GET':
      // Handle GET request - Retrieve a single user by ID (excluding password hash)
      try {
        user = await User.findByPk(userId, {
          attributes: { exclude: ['passwordHash'] }
        });
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
      } catch (error) {
        console.error(`Error fetching user ${userId}:`, error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
      break;

    case 'PUT':
      // Handle PUT request - Update a user by ID
      try {
        user = await User.findByPk(userId);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }

        const { username, password, role, departmentId } = req.body;

        // Prepare update data
        const updateData: Partial<User> = {};
        if (username) updateData.username = username;
        if (role) updateData.role = role;
        // Allow setting departmentId to null or a value
        if (departmentId !== undefined) updateData.departmentId = departmentId;

        // Handle password update separately and securely
        if (password) {
          // TODO: Add validation - e.g., require current password for changes
          updateData.passwordHash = await bcrypt.hash(password, saltRounds);
        }

        await user.update(updateData);

        // Exclude password hash from the response
        const { passwordHash: _, ...userResponse } = user.toJSON();
        res.status(200).json(userResponse);

      } catch (error: any) {
        console.error(`Error updating user ${userId}:`, error);
        if (error.name === 'SequelizeUniqueConstraintError') {
          return res.status(409).json({ message: 'Username already exists' });
        }
        res.status(500).json({ message: 'Internal Server Error' });
      }
      break;

    case 'DELETE':
      // Handle DELETE request - Delete a user by ID
      try {
        user = await User.findByPk(userId);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }

        // TODO: Add checks - prevent deleting self? Prevent deleting last admin?
        await user.destroy();
        res.status(204).end(); // No content to send back
      } catch (error) {
        console.error(`Error deleting user ${userId}:`, error);
        // Consider potential foreign key constraint errors if not handled by DB
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