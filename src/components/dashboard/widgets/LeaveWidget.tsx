import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import axios from 'axios'; // Import axios

// Define the expected structure for the leave stats part of the API response
interface LeaveStatsData {
    pendingRequests: number;
    trendPercent: number;
    trendDirection: 'up' | 'down';
}

const LeaveWidget: React.FC = () => {
    const [stats, setStats] = useState<LeaveStatsData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get('/api/dashboard/metrics');
                // Extract leaveStats from the response
                if (response.data && response.data.leaveStats) { // Corrected operator
                    setStats(response.data.leaveStats);
                } else {
                    throw new Error('Invalid data structure received for leave stats');
                }
            } catch (err: any) {
                console.error('Error fetching leave stats:', err);
                setError(err.response?.data?.message || err.message || 'Failed to load leave statistics.');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    // Loading State
    if (loading) {
        return (
            <Card className="h-full">
                <div className="flex flex-col justify-center items-center h-full p-4">
                    <p className="text-gray-500">Loading stats...</p>
                </div>
            </Card>
        );
    }

    // Error State
    if (error || !stats) {
        return (
            <Card className="h-full border-red-200 bg-red-50">
                <div className="flex flex-col h-full p-4">
                     <div className="flex items-center text-sm text-red-600 mb-2">
                        <Icon iconName="fas fa-exclamation-triangle" className="mr-2" />
                        Error Loading Stats
                    </div>
                    <p className="text-xs text-red-700">{error || 'Could not load data.'}</p>
                </div>
            </Card>
        );
    }

    // Success State
    const { pendingRequests, trendPercent, trendDirection } = stats;

    return (
        <Card className="h-full">
            <div className="flex flex-col h-full p-4">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Icon iconName="fas fa-hourglass-half" className="mr-2 text-teal-600" />
                    Pending Leave Requests
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                    {pendingRequests}
                </div>
                <div className="text-xs text-gray-600 mt-auto">
                     <span className={`inline-flex items-center font-semibold px-1.5 py-0.5 rounded text-xs mr-1 ${
                        trendDirection === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                        <Icon iconName={trendDirection === 'up' ? 'fas fa-arrow-up' : 'fas fa-arrow-down'} className="mr-1" />
                        {trendPercent}%
                    </span>
                    from last month
                </div>
            </div>
        </Card>
    );
};

export default LeaveWidget;