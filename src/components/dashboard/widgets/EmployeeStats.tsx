import React from 'react';
import Card from '@/components/ui/Card'; // Assuming Card component exists
import Icon from '@/components/ui/Icon'; // Assuming Icon component exists

// Placeholder: Fetch actual data using hooks (SWR, React Query) or props
const mockData = {
    total: 198, // Example data
    trendPercent: 3.2,
    trendDirection: 'up' as 'up' | 'down',
};

const EmployeeStats: React.FC = () => {
    const { total, trendPercent, trendDirection } = mockData; // Use mock data for now

    return (
        <Card className="h-full"> {/* Use Card component */}
            <div className="flex flex-col h-full p-4"> {/* Adjusted padding */}
                <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Icon iconName="fas fa-users" className="mr-2 text-teal-600" /> {/* Use Icon component */}
                    Total Employees
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                    {total}
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

export default EmployeeStats;