import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card'; // Assuming Card component exists
import Icon from '@/components/ui/Icon'; // Assuming Icon component exists
import axios from 'axios'; // Import axios

// Define the expected structure for the compliance stats part of the API response
interface ComplianceStatsData {
    rate: number;
    trendPercent: number; // Added trend data based on other widgets
    trendDirection: 'up' | 'down'; // Added trend data based on other widgets
    // Note: expiringSoonCount and expiredCount are not in the current API response,
    // they might need to be added to the API or fetched separately if needed for this specific widget.
}

const ComplianceStatsWidget: React.FC = () => {
    const [stats, setStats] = useState<ComplianceStatsData | null>(null);
    const [loading, setLoading] = useState<boolean>(true); // Renamed for consistency
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get('/api/dashboard/metrics');
                // Extract complianceStats from the response
                if (response.data && response.data.complianceStats) {
                    setStats(response.data.complianceStats);
                } else {
                    throw new Error('Invalid data structure received for compliance stats');
                }
            } catch (err: any) {
                console.error('Error fetching compliance stats:', err);
                setError(err.response?.data?.message || err.message || 'Failed to load compliance statistics.');
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
        <Card className="stat-card">
            {/* Apply flex layout within card-body */}
            <div className="card-body">
                 {/* Left side content */}
                 <div className="stat-content-left">
                    <div className="stat-label">
                        <Icon iconName="fas fa-clipboard-list" />
                        Compliance Rate
                    </div>
                </div>
                {/* Right side content */}
                <div className="stat-content-right" style={{textAlign: 'right'}}>
                    <div className="stat-value">
                        {rate.toFixed(1)}%
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

export default ComplianceStatsWidget;