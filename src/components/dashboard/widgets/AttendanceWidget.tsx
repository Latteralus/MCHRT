import React from 'react';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';

// Placeholder: Fetch actual data
const mockData = {
    rate: 96.5,
    trendPercent: 1.8,
    trendDirection: 'up' as 'up' | 'down',
};

const AttendanceWidget: React.FC = () => {
    const { rate, trendPercent, trendDirection } = mockData;

    return (
        <Card className="h-full">
            <div className="flex flex-col h-full p-4">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Icon iconName="fas fa-calendar-check" className="mr-2 text-teal-600" />
                    Attendance Rate
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                    {rate}%
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

export default AttendanceWidget;