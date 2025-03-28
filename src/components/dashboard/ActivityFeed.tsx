import React from 'react';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import Link from 'next/link';

// Placeholder: Fetch actual activity data
const mockActivities = [
    { id: 1, time: 'Today, 10:30 AM', description: 'approved time off request for Emily Chen', user: 'Sarah Johnson', icon: 'fas fa-calendar-check', color: 'text-green-500' },
    { id: 2, time: 'Today, 9:45 AM', description: 'uploaded a new document to the compliance portal', user: 'David Wilson', icon: 'fas fa-file-upload', color: 'text-blue-500' },
    { id: 3, time: 'Today, 8:15 AM', description: 'completed onboarding for Mark Thompson', user: 'Lisa Patel', icon: 'fas fa-user-check', color: 'text-purple-500' },
    { id: 4, time: 'Yesterday, 4:30 PM', description: 'updated the employee handbook', user: 'James Rodriguez', icon: 'fas fa-file-alt', color: 'text-gray-500' },
    { id: 5, time: 'Yesterday, 2:15 PM', description: 'added 3 new training modules', user: 'Maria Garcia', icon: 'fas fa-chalkboard-teacher', color: 'text-indigo-500' },
];

const ActivityFeed: React.FC = () => {
    const activities = mockActivities; // Use mock data

    return (
        <Card>
            <div className="p-4">
                <h3 className="text-md font-semibold text-gray-800 mb-4">Recent Activity</h3>
                {activities.length === 0 ? (
                     <p className="text-sm text-gray-500">No recent activity.</p>
                ) : (
                    <div className="space-y-4">
                        {activities.map((activity, index) => (
                            <div key={activity.id} className="relative pl-8">
                                {/* Timeline line */}
                                {index < activities.length - 1 && (
                                    <span className="absolute left-[10px] top-5 -bottom-4 w-0.5 bg-gray-200" aria-hidden="true"></span>
                                )}
                                {/* Timeline badge/icon */}
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
            </div>
        </Card>
    );
};

export default ActivityFeed;