import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { withErrorHandling } from '@/lib/api/withErrorHandling';
// import { withRole } from '@/lib/middleware/withRole'; // Optional: Add role check if needed

// Define the structure for an activity item
interface ActivityItem {
    id: number | string; // Use string if IDs are UUIDs
    time: string; // Consider using Date object and formatting on client
    description: string;
    user: string; // User's name or identifier
    icon: string; // Font Awesome class name (e.g., 'fas fa-user-check')
    color: string; // Tailwind CSS text color class (e.g., 'text-green-500')
    // Optional: Add link for more details
    // link?: string;
}

// Placeholder: Mock data generation function
const generateMockActivities = (count = 5): ActivityItem[] => {
    const activities: ActivityItem[] = [
        { id: 1, time: 'Today, 10:30 AM', description: 'approved time off request for Emily Chen', user: 'Sarah Johnson', icon: 'fas fa-calendar-check', color: 'text-green-500' },
        { id: 2, time: 'Today, 9:45 AM', description: 'uploaded a new document to the compliance portal', user: 'David Wilson', icon: 'fas fa-file-upload', color: 'text-blue-500' },
        { id: 3, time: 'Today, 8:15 AM', description: 'completed onboarding for Mark Thompson', user: 'Lisa Patel', icon: 'fas fa-user-check', color: 'text-purple-500' },
        { id: 4, time: 'Yesterday, 4:30 PM', description: 'updated the employee handbook', user: 'James Rodriguez', icon: 'fas fa-file-alt', color: 'text-gray-500' },
        { id: 5, time: 'Yesterday, 2:15 PM', description: 'added 3 new training modules', user: 'Maria Garcia', icon: 'fas fa-chalkboard-teacher', color: 'text-indigo-500' },
    ];
    // Return a slice based on the requested count
    return activities.slice(0, count);
};


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
        // TODO: Replace with actual logic to fetch recent activities from the database
        // This might involve querying an 'ActivityLog' table or using a service.
        // Example: const activities = await ActivityLog.findAll({ limit: 10, order: [['createdAt', 'DESC']] });
        // Need to map the database result to the ActivityItem structure.

        const limit = parseInt(req.query.limit as string) || 5; // Allow specifying limit via query param
        const activities = generateMockActivities(limit); // Use mock data for now

        return res.status(200).json(activities);

    } catch (error) {
        console.error('Error fetching dashboard activity:', error);
        // Let withErrorHandling manage the response
        throw error;
    }
};

export default withErrorHandling(handler);