import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import axios from 'axios'; // Import axios

// Define the expected structure for the attendance stats part of the API response
interface AttendanceStatsData {
    rate: number;
    trendPercent: number;
    trendDirection: 'up' | 'down';
}

const AttendanceWidget: React.FC = () => {
    const [stats, setStats] = useState<AttendanceStatsData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get('/api/dashboard/metrics');
                // Extract attendanceStats from the response
                if (response.data && response.data.attendanceStats) {
                    setStats(response.data.attendanceStats);
                } else {
                    throw new Error('Invalid data structure received for attendance stats');
                }
            } catch (err: any) {
                console.error('Error fetching attendance stats:', err);
                setError(err.response?.data?.message || err.message || 'Failed to load attendance statistics.');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    // Loading State (Kept original utility classes for now)
    if (loading) {
        return (
            <Card className="h-full">
                <div className="flex flex-col justify-center items-center h-full p-4">
                    <p className="text-gray-500">Loading stats...</p>
                </div>
            </Card>
        );
    }

    // Error State (Kept original utility classes for now)
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

    // Success State - Refactored with Semantic CSS
    const { rate, trendPercent, trendDirection } = stats;

    return (
        // Apply semantic classes based on global.css
        <Card className="stat-card"> {/* Use stat-card class */}
            {/* Apply flex layout within card-body */}
            <div className="card-body">
                 {/* Left side content */}
                 <div className="stat-content-left">
                    <div className="stat-label">
                        <Icon iconName="fas fa-calendar-check" />
                        Attendance Rate
                    </div>
                </div>
                {/* Right side content */}
                <div className="stat-content-right" style={{textAlign: 'right'}}>
                    <div className="stat-value">
                        {rate.toFixed(1)}% {/* Format rate */}
                    </div>
                    <div className="stat-description">
                        <span className={`stat-trend ${trendDirection === 'up' ? 'trend-up' : 'trend-down'}`}>
                            <Icon iconName={trendDirection === 'up' ? 'fas fa-arrow-up' : 'fas fa-arrow-down'} />
                            {trendPercent}%
                        </span>
                        from last month
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default AttendanceWidget;