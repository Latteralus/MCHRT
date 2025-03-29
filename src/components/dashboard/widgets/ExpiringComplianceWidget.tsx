// src/components/dashboard/widgets/ExpiringComplianceWidget.tsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link'; // For linking to compliance page
import axios from 'axios'; // Import axios
// Placeholder: If a dedicated API function exists, import it
// import { fetchExpiringComplianceItems } from '@/lib/api/compliance';
// Placeholder: Import Card component and utility for date formatting/difference
import Card from '@/components/ui/Card'; // Assuming Card component is refactored
import Icon from '@/components/ui/Icon'; // Assuming Icon component exists

interface ExpiringItem {
    id: number;
    employeeName: string;
    itemName: string;
    expirationDate: string; // ISO string or formatted date
    daysUntilExpiry: number; // Calculated difference
}

// Mock function removed, will use axios directly

const ExpiringComplianceWidget: React.FC = () => {
    const [items, setItems] = useState<ExpiringItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchExpiringItems = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Fetch data from the compliance endpoint with query parameters
                const response = await axios.get<ExpiringItem[]>('/api/compliance', {
                    params: {
                        expiringSoon: true, // Assuming the API supports this filter
                        limit: 5            // Limit the results
                    }
                });
                // Assuming the API returns an array matching ExpiringItem[]
                setItems(response.data);
            } catch (err: any) {
                console.error("Failed to fetch expiring compliance items:", err);
                setError(err.response?.data?.message || err.message || "Could not load expiring items");
            } finally {
                setIsLoading(false);
            }
        };

        fetchExpiringItems();
    }, []);

    // Helper to determine status class based on days left
    const getStatusClass = (days: number): string => {
        if (days <= 7) return 'status-danger'; // Red for <= 7 days
        if (days <= 30) return 'status-warning'; // Yellow for <= 30 days
        return 'status-info'; // Default/blue for > 30 days (though API should filter)
    };
    // Removed getStatusColor

    // Loading State (Kept original utility classes for now)
    if (isLoading) {
        return (
            <Card className="h-full">
                <div className="flex flex-col justify-center items-center h-full p-4">
                    <p className="text-gray-500">Loading...</p> {/* Updated text */}
                </div>
            </Card>
        );
    }

    // Error State (Kept original utility classes for now)
    if (error) { // Simplified condition
        return (
            <Card className="h-full border-red-200 bg-red-50">
                <div className="flex flex-col h-full p-4">
                     <div className="flex items-center text-sm text-red-600 mb-2">
                        <Icon iconName="fas fa-exclamation-triangle" className="mr-2" />
                        Error Loading Items
                    </div>
                    <p className="text-xs text-red-700">{error}</p>
                </div>
            </Card>
        );
    }

    // Success State - Refactored with Semantic CSS
    return (
        <Card className="h-full"> {/* Use Card component which applies .card class */}
             <div className="card-header">
                 <h3 className="card-title">License Operations</h3>
                 <Link href="/compliance" className="action-link">
                     View all <i className="fas fa-chevron-right"></i>
                 </Link>
             </div>
             <div className="card-body">
                {items.length === 0 && (
                    // Consider a specific class for empty state if needed
                    <div className="text-gray-500 text-center py-4">No items expiring soon.</div>
                )}
                {items.length > 0 && (
                    // No extra div needed, card-body provides container
                    <>
                        {items.map((item) => (
                            <div key={item.id} className="license-item">
                                <div className="license-item-avatar">
                                    {/* Generate initials */}
                                    {(item.employeeName.split(',')[0]?.[0] || '?') + (item.employeeName.split(',')[1]?.trim()[0] || '')}
                                </div>
                                <div className="license-item-info">
                                     <div className="license-item-name">{item.employeeName}</div>
                                     <div className="license-item-detail">{item.itemName}</div>
                                </div>
                                <div className={`license-status ${getStatusClass(item.daysUntilExpiry)}`}>
                                     {item.daysUntilExpiry} days
                                </div>
                            </div>
                        ))}
                    </>
                )}
             </div>
        </Card>
    );
};

export default ExpiringComplianceWidget;