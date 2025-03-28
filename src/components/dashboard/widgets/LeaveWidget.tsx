import React from 'react';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';

// Placeholder: Fetch actual data
const mockData = {
    pendingRequests: 12,
    trendPercent: 2.5,
    trendDirection: 'down' as 'up' | 'down',
};

const LeaveWidget: React.FC = () => {
    const { pendingRequests, trendPercent, trendDirection } = mockData;

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