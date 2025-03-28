import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon'; // Assuming Icon component exists and can be used for badges
import Link from 'next/link';
import axios from 'axios'; // Import axios

// Define the structure for an activity item (matching the API response)
interface ActivityItemData { // Renamed for clarity
    id: number | string;
    time: string;
    description: string;
    user: string;
    // icon and color might not be needed if using semantic CSS structure
}

const ActivityFeed: React.FC = () => {
    const [activities, setActivities] = useState<ActivityItemData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchActivities = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch data from the activity endpoint (e.g., limit to 5 items)
                const response = await axios.get('/api/dashboard/activity?limit=5');
                // Assuming API returns array of {id, time, description, user}
                if (Array.isArray(response.data)) {
                    setActivities(response.data);
                } else {
                    // Handle potential structure mismatch if API changes
                    console.warn('Received unexpected data structure for activities:', response.data);
                    setActivities([]); // Set empty to avoid errors
                    // Optionally throw error if data is critical
                    // throw new Error('Invalid data structure received for activities');
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

    // Loading State (Kept original utility classes for now)
    if (loading) {
        return (
            <Card className="h-full">
                <div className="flex flex-col justify-center items-center h-full p-4">
                    <p className="text-gray-500">Loading activity...</p>
                </div>
            </Card>
        );
    }

    // Error State (Kept original utility classes for now)
    if (error) {
        return (
            <Card className="h-full border-red-200 bg-red-50">
                <div className="flex flex-col h-full p-4">
                     <div className="flex items-center text-sm text-red-600 mb-2">
                        <Icon iconName="fas fa-exclamation-triangle" className="mr-2" />
                        Error Loading Activity
                    </div>
                    <p className="text-xs text-red-700">{error}</p>
                </div>
            </Card>
        );
    }

    // Success State - Refactored with Semantic CSS
    return (
        <Card className="h-full">
            {/* Use semantic CardHeader */}
            <div className="card-header">
                <h3 className="card-title">Recent Activity</h3>
                <Link href="/activity" className="action-link">
                    View all <i className="fas fa-chevron-right"></i>
                </Link>
            </div>
            {/* Use semantic CardBody */}
            <div className="card-body">
                {activities.length === 0 ? (
                     <p>No recent activity.</p>
                ) : (
                    // Use semantic activity item structure
                    <div> {/* Wrapper div for activity items */}
                        {activities.map((activity) => (
                            <div key={activity.id} className="activity-item">
                                <div className="activity-badge"></div> {/* Badge styled by CSS */}
                                <div className="activity-time">{activity.time}</div>
                                <div className="activity-description">
                                    <span className="activity-user">{activity.user}</span> {activity.description}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Card>
    );
};

export default ActivityFeed;