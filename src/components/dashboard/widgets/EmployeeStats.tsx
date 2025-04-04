import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import axios from 'axios'; // Import axios for fetching

// Define the expected structure for the employee stats part of the API response
interface EmployeeStatsData {
    total: number;
    trendPercent: number;
    trendDirection: 'up' | 'down';
}

const EmployeeStats: React.FC = () => {
    const [stats, setStats] = useState<EmployeeStatsData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch data from the metrics endpoint
                const response = await axios.get('/api/dashboard/metrics');
                // Assuming the API returns the full DashboardMetrics object, extract employeeStats
                if (response.data && response.data.employeeStats) { // Corrected operator
                    setStats(response.data.employeeStats);
                } else {
                    throw new Error('Invalid data structure received from API');
                }
            } catch (err: any) {
                console.error('Error fetching employee stats:', err);
                setError(err.response?.data?.message || err.message || 'Failed to load employee statistics.');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []); // Empty dependency array means this runs once on mount

    // Loading State
    if (loading) {
        return (
            <Card className="h-full">
                <div className="flex flex-col justify-center items-center h-full p-4">
                    <p className="text-gray-500">Loading stats...</p>
                    {/* Optional: Add a spinner */}
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

    // Success State - Display fetched data
    const { total, trendPercent, trendDirection } = stats;

    return (
        <> {/* Wrap content in a fragment */}
            {/* Apply semantic classes based on global.css */}
            {/* Assuming Card component provides the base .card style */}
        <Card className="stat-card"> {/* Use stat-card class */}
            {/* Apply flex layout within card-body */}
            <div className="card-body">
                {/* Left side content */}
                <div className="stat-content-left">
                    <div className="stat-label">
                        <Icon iconName="fas fa-users" />
                        Total Employees
                    </div>
                </div>
                {/* Right side content */}
                <div className="stat-content-right" style={{textAlign: 'right'}}>
                    <div className="stat-value">
                        {total}
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
        </> /* Close fragment */
    );
};

export default EmployeeStats;