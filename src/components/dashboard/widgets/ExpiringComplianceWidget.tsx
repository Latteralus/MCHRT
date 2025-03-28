// src/components/dashboard/widgets/ExpiringComplianceWidget.tsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link'; // For linking to compliance page
// Placeholder: Import API function to fetch expiring items
// import { fetchExpiringComplianceItems } from '@/lib/api/compliance'; // Adjust path
// Placeholder: Import Card component and utility for date formatting/difference

interface ExpiringItem {
    id: number;
    employeeName: string;
    itemName: string;
    expirationDate: string; // ISO string or formatted date
    daysUntilExpiry: number; // Calculated difference
}

// Mock API function
const mockFetchExpiringItems = async (limit = 5): Promise<ExpiringItem[]> => {
    console.log(`Mock fetching top ${limit} expiring compliance items...`);
    await new Promise(resolve => setTimeout(resolve, 600)); // Simulate delay
    // Return mock data sorted by expiry date
    return [
        { id: 1, employeeName: 'Kirk, James', itemName: 'Pharmacist License', expirationDate: '2025-01-14', daysUntilExpiry: 7 }, // Example calculation needed
        { id: 2, employeeName: 'McCoy, Leonard', itemName: 'Pharmacy Tech License', expirationDate: '2025-01-28', daysUntilExpiry: 21 },
        { id: 3, employeeName: 'Uhura, Nyota', itemName: 'Controlled Substance License', expirationDate: '2025-02-04', daysUntilExpiry: 28 },
        // Add more mock items if needed
    ].slice(0, limit);
};

const ExpiringComplianceWidget: React.FC = () => {
    const [items, setItems] = useState<ExpiringItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setIsLoading(true);
        setError(null);
        // Replace with actual API call: fetchExpiringComplianceItems
        mockFetchExpiringItems()
            .then(data => setItems(data))
            .catch(err => {
                console.error("Failed to fetch expiring compliance items:", err);
                setError("Could not load expiring items");
            })
            .finally(() => setIsLoading(false));
    }, []);

    // Helper to determine status class based on days left
    const getStatusClass = (days: number): string => {
        if (days <= 7) return 'status-danger'; // Red for <= 7 days
        if (days <= 30) return 'status-warning'; // Yellow for <= 30 days
        return 'status-info'; // Default/blue for > 30 days (though API should filter)
    };
     const getStatusColor = (days: number): string => {
        if (days <= 7) return 'text-red-600 bg-red-100';
        if (days <= 30) return 'text-yellow-600 bg-yellow-100';
        return 'text-blue-600 bg-blue-100';
    };


    // Placeholder: Replace with actual Card component structure from example.md
    return (
        <div className="card h-full"> {/* Assuming card class exists */}
             <div className="card-header flex justify-between items-center">
                 <h3 className="card-title">Expiring Soon</h3>
                 <Link href="/compliance" className="action-link text-sm">
                     View all <i className="fas fa-chevron-right text-xs"></i>
                 </Link>
             </div>
             <div className="card-body">
                {isLoading && <div className="text-gray-500">Loading...</div>}
                {error && <div className="text-red-500">{error}</div>}
                {!isLoading && !error && items.length === 0 && (
                    <div className="text-gray-500 text-center py-4">No items expiring soon.</div>
                )}
                {!isLoading && !error && items.length > 0 && (
                    <div className="space-y-3">
                        {items.map((item) => (
                            // Mimic structure from example.md license-item
                            <div key={item.id} className="flex items-center">
                                {/* Placeholder Avatar/Initials */}
                                <div className="license-item-avatar mr-3 flex-shrink-0">
                                    {item.employeeName.split(',')[0]?.[0] || '?'}
                                    {item.employeeName.split(',')[1]?.trim()[0] || ''}
                                </div>
                                <div className="license-item-info flex-grow min-w-0">
                                     <div className="license-item-name font-medium truncate">{item.employeeName}</div>
                                     <div className="license-item-detail text-sm text-gray-500 truncate">{item.itemName}</div>
                                </div>
                                <div className={`license-status ml-2 flex-shrink-0 px-2 py-0.5 rounded text-xs font-semibold ${getStatusColor(item.daysUntilExpiry)}`}>
                                     {item.daysUntilExpiry} days
                                 </div>
                            </div>
                        ))}
                    </div>
                )}
             </div>
        </div>
    );
};

export default ExpiringComplianceWidget;