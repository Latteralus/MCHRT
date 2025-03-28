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
        <Card>
            <div className="p-4">
                <h3 className="text-md font-semibold text-gray-800 mb-4">Recent Activity</h3>

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
                            <div className="space-y-4">
                                {activities.map((activity, index) => (
                                    <div key={activity.id} className="relative pl-8">
                                        {/* Timeline line */}
                                        {index < activities.length - 1 && ( // Corrected operator
                                            <span className="absolute left-[10px] top-5 -bottom-4 w-0.5 bg-gray-200" aria-hidden="true"></span>
                                        )}
                                        {/* Timeline badge/icon */}
                                        {/* Ensure color classes are correctly generated (bg-* from text-*) */}
                                        <div className={`absolute left-0 top-0.5 flex h-5 w-5 items-center justify-center rounded-full ${activity.color.replace('text-', 'bg-').replace('-500', '-100')}`}>
                                            <Icon iconName={activity.icon} className={`h-3 w-3 ${activity.color}`} />
                                        </div>
                                        {/* Content */}
                                        <p className="text-xs text-gray-500">{activity.time}</p>
                                        <p className="text-sm text-gray-700">
                                            <span className="font-medium text-gray-900">{activity.user}</span> {activity.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                         {/* Link to view all activity */}
                         <div className="mt-5 text-right">
                             <Link href="/activity" className="text-sm font-medium text-teal-600 hover:text-teal-800">
                                 View all activity <Icon iconName="fas fa-arrow-right" className="ml-1 text-xs" />
                             </Link>
                         </div>
                    </>
                )}
            </div>
        </Card>
    );
};

export default ActivityFeed;