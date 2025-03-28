// src/components/dashboard/widgets/ComplianceStatsWidget.tsx
import React, { useState, useEffect } from 'react';
// Placeholder: Import API function to fetch compliance stats
// import { fetchComplianceStats } from '@/lib/api/compliance'; // Adjust path
// Placeholder: Import Card and Stat components from UI library

interface ComplianceStats {
    complianceRate: number; // Overall percentage
    expiringSoonCount: number;
    expiredCount: number;
}

// Mock API function
const mockFetchComplianceStats = async (): Promise<ComplianceStats> => {
    console.log('Mock fetching compliance stats...');
    await new Promise(resolve => setTimeout(resolve, 700)); // Simulate delay
    return {
        complianceRate: 98.2, // Example rate
        expiringSoonCount: 5, // Example count
        expiredCount: 2, // Example count
    };
};

const ComplianceStatsWidget: React.FC = () => {
    const [stats, setStats] = useState<ComplianceStats | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setIsLoading(true);
        setError(null);
        // Replace with actual API call: fetchComplianceStats
        mockFetchComplianceStats()
            .then(data => setStats(data))
            .catch(err => {
                console.error("Failed to fetch compliance stats:", err);
                setError("Could not load stats");
            })
            .finally(() => setIsLoading(false));
    }, []);

    // Placeholder: Replace with actual Card/Stat components
    return (
        <div className="card stat-card h-full"> {/* Assuming stat-card class exists */}
            <div className="card-body">
                <div className="stat-label">
                    <i className="fas fa-shield-alt mr-2 text-blue-500"></i> {/* Example icon */}
                    Compliance Rate
                </div>
                {isLoading && <div className="text-gray-500">Loading...</div>}
                {error && <div className="text-red-500">{error}</div>}
                {stats && !isLoading && !error && (
                    <>
                        <div className="stat-value">{stats.complianceRate.toFixed(1)}%</div>
                        <div className="stat-description mt-auto">
                            {stats.expiringSoonCount > 0 && (
                                <span className="text-yellow-600 mr-2">{stats.expiringSoonCount} expiring soon</span>
                            )}
                             {stats.expiredCount > 0 && (
                                <span className="text-red-600">{stats.expiredCount} expired</span>
                            )}
                             {stats.expiringSoonCount === 0 && stats.expiredCount === 0 && (
                                <span className="text-green-600">All items compliant</span>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ComplianceStatsWidget;