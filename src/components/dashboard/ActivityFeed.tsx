import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import Link from 'next/link';
import axios from 'axios'; // Import axios

// Define the structure for an activity item (matching the API response)
interface ActivityItem {
    id: number | string;
    time: string;
    description: string;
    user: string;
    icon: string;
    color: string;
}

const ActivityFeed: React.FC = () => {
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchActivities = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch data from the activity endpoint (e.g., limit to 5 items)
                const response = await axios.get('/api/dashboard/activity?limit=5');
                if (Array.isArray(response.data)) {
                    setActivities(response.data);
                } else {
                    throw new Error('Invalid data structure received for activities');
                }
            } catch (err: any) {
                console.error('Error fetching activity feed:', err);
                setError(err.response?.data?.message || err.message || 'Failed to load activity feed.');
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, []);

    return (
        // Using Card component with flex column layout
        <Card className="h-full flex flex-col">
            {/* Card Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h3 className="text-md font-semibold text-gray-800">Recent Activity</h3>
                <Link href="/activity" className="text-sm font-medium text-teal-600 hover:text-teal-800">
                    View all <Icon iconName="fas fa-arrow-right" className="ml-1 text-xs" />
                </Link>
            </div>
            {/* Card Body */}
            <div className="p-4 flex-grow">
                {/* Loading State */}
                {loading && <p className="text-sm text-gray-500">Loading activity...</p>}

                {/* Error State */}
                {error && <p className="text-sm text-red-600">{error}</p>}

                {/* Success State */}
                {!loading && !error && (
                    <>
                        {activities.length === 0 ? (
                             <p className="text-sm text-gray-500">No recent activity.</p>
                        ) : (
                            // Updated List Format
                            <div className="space-y-4">
                                {activities.map((activity) => (
                                    <div key={activity.id} className="flex items-start space-x-3">
                                        {/* Icon with background */}
                                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${activity.color.replace('text-', 'bg-').replace('-500', '-100')}`}>
                                            <Icon iconName={activity.icon} className={`h-4 w-4 ${activity.color}`} />
                                        </div>
                                        {/* Text Content */}
                                        <div className="flex-grow">
                                            <p className="text-sm text-gray-700">
                                                <span className="font-semibold text-gray-900">{activity.user}</span> {activity.description}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {/* View All link moved to header */}
                    </>
                )}
            </div>
        </Card>
    );
};

export default ActivityFeed;