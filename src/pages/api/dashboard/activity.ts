import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { withErrorHandling } from '@/lib/api/withErrorHandling';
import { ActivityLog, User } from '@/db'; // Import initialized models from central index
import { formatDistanceToNow } from 'date-fns'; // For relative time formatting
// Associations are defined centrally in src/db/sequelize.ts now
// Define the structure for an activity item
interface ActivityItem {
    id: number | string; // Use string if IDs are UUIDs
    time: string; // Consider using Date object and formatting on client
    description: string;
    user: string; // User's name or identifier
    actionType?: string; // Type of action (e.g., CREATE, UPDATE, LOGIN)
    entityType?: string; // Type of entity affected (e.g., Employee, Leave)
    // icon and color might not be needed if using semantic CSS structure on client
    // Optional: Add link for more details
    // link?: string;
}

// Mock data removed


// Associations are defined centrally in src/db/sequelize.ts now
// defineAssociations(); // Removed local call

const handler = async (req: NextApiRequest, res: NextApiResponse<ActivityItem[] | { message: string }>) => {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

    const session = await getSession({ req });
    if (!session?.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // Optional: Role check
    // await withRole(['Admin', 'Manager'])(req, res);

    try {
        // --- Fetch Activity Data ---
        const limit = parseInt(req.query.limit as string) || 5; // Default limit

        const logs = await ActivityLog.findAll({
            limit: limit,
            order: [['createdAt', 'DESC']],
            // Ensure actionType and entityType are fetched if they exist on the model
            attributes: ['id', 'description', 'createdAt', 'userId', 'actionType', 'entityType'], // Add necessary fields
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'username'] // Explicitly fetch id and username
            }]
        });

        // Map database logs to the ActivityItem structure expected by the frontend
        const activities: ActivityItem[] = logs.map(log => ({
            id: log.id,
            // Format timestamp to relative time string
            time: formatDistanceToNow(log.createdAt, { addSuffix: true }),
            description: log.description,
            user: log.user?.username || 'System', // Use username or 'System' if user is null
            actionType: log.actionType, // Map actionType
            entityType: log.entityType, // Map entityType
            // icon and color are removed as they are better handled by frontend based on actionType/entityType
        }));

        return res.status(200).json(activities);

    } catch (error) {
        console.error('Error fetching dashboard activity:', error);
        // Let withErrorHandling manage the response
        throw error;
    }
};

export default withErrorHandling(handler);