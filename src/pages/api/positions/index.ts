import type { NextApiRequest, NextApiResponse } from 'next';
import { Position } from '@/modules/organization/models/Position'; // Adjust path if needed
import { withErrorHandling } from '@/lib/api/withErrorHandling'; // Assuming error handler exists
import { defineAssociations } from '@/db/associations'; // Ensure associations are defined

// Define associations (important for Sequelize to work correctly)
defineAssociations();

// Define the expected response data structure
type PositionData = {
  id: number;
  name: string;
};

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PositionData[] | { message: string }>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    const positions = await Position.findAll({
      attributes: ['id', 'name'], // Only select necessary fields
      order: [['name', 'ASC']], // Order alphabetically by name
    });

    res.status(200).json(positions);
  } catch (error) {
    // Error handling is managed by withErrorHandling, but log here if needed
    console.error('Error fetching positions:', error);
    // The wrapper will handle sending the 500 response
    throw error; // Re-throw for the wrapper to catch
  }
}

// Wrap the handler with error handling middleware
export default withErrorHandling(handler);