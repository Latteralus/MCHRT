import type { NextApiRequest, NextApiResponse } from 'next';
import { User } from '@/db'; // Import initialized User model from central index
import bcrypt from 'bcrypt';
import { withRole } from '@/lib/middleware/withRole'; // Import withRole
import { AuthenticatedNextApiHandler } from '@/lib/middleware/withAuth'; // Import handler type
// import { defineAssociations } from '@/db/associations';

// TODO: Add more granular error handling and validation
// TODO: Implement more secure password handling (e.g., client-side hashing, complexity rules)

// Ensure associations are defined
// defineAssociations();

const saltRounds = 10; // Cost factor for bcrypt hashing

// Define the core handler logic expecting authentication and session
const handler: AuthenticatedNextApiHandler = async (req, res, session) => {
  const { method } = req;

  switch (method) {
    case 'GET':
      // Handle GET request - List all users (excluding password hash)
      try {
        const users = await User.findAll({
          attributes: { exclude: ['passwordHash'] } // Never return password hashes
        });
        res.status(200).json(users);
      } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
      break;

    case 'POST':
      // Handle POST request - Create a new user
      try {
        const { username, password, role, departmentId } = req.body;

        // Basic validation
        if (!username || !password || !role) {
          return res.status(400).json({ message: 'Username, password, and role are required' });
        }

        // Hash the password before storing
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const newUser = await User.create({
          username,
          passwordHash, // Store the hashed password
          role,
          departmentId
        });

        // Exclude password hash from the response using destructuring
        const { passwordHash: _, ...userResponse } = newUser.toJSON();


        res.status(201).json(userResponse);
      } catch (error: any) {
        console.error('Error creating user:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
          return res.status(409).json({ message: 'Username already exists' });
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