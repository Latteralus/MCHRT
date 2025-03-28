import React from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import MainLayout from '@/components/layouts/MainLayout';
import Head from 'next/head';

// Import Existing Widgets
import ComplianceStatsWidget from '@/components/dashboard/widgets/ComplianceStatsWidget';
import ExpiringComplianceWidget from '@/components/dashboard/widgets/ExpiringComplianceWidget';
import EmployeeStats from '@/components/dashboard/widgets/EmployeeStats'; // Uncommented
import AttendanceWidget from '@/components/dashboard/widgets/AttendanceWidget'; // Uncommented
import LeaveWidget from '@/components/dashboard/widgets/LeaveWidget'; // Uncommented
import RecentDocuments from '@/components/dashboard/widgets/RecentDocuments'; // Uncommented
import ActivityFeed from '@/components/dashboard/ActivityFeed'; // Uncommented

// Placeholder: Import API functions to fetch data for widgets if needed server-side

interface DashboardPageProps {
    userName?: string | null;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ userName }) => {
    // TODO: Fetch widget data client-side using hooks (e.g., SWR or React Query)

    return (
        <MainLayout>
            <Head>
                <title>Dashboard - Mountain Care HR</title>
            </Head>
            <div className="container mx-auto p-4">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold">Dashboard</h1>
                    <p className="text-gray-600">Welcome back{userName ? `, ${userName}` : ''}!</p>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Stats Cards/Widgets */}
                    <div className="lg:col-span-1">
                        <EmployeeStats /> {/* Uncommented */}
                    </div>
                    <div className="lg:col-span-1">
                        <AttendanceWidget /> {/* Uncommented */}
                    </div>
                     <div className="lg:col-span-1">
                        <LeaveWidget /> {/* Uncommented */}
                    </div>
                     <div className="lg:col-span-1">
                        {/* Compliance Stats Widget */}
                        <ComplianceStatsWidget />
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3">
                         {/* Expiring Compliance Widget */}
                         <div className="mb-6">
                             <ExpiringComplianceWidget />
                         </div>
                         {/* Activity Feed */}
                         <div className="mb-6">
                             <ActivityFeed /> {/* Uncommented */}
                         </div>
                    </div>

                    {/* Sidebar Area (Right) */}
                    <div className="lg:col-span-1">
                         {/* Recent Documents */}
                         <div className="mb-6">
                             <RecentDocuments /> {/* Uncommented */}
                         </div>
                         {/* Add other widgets here if needed */}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);

    if (!session) {
        return { redirect: { destination: '/login', permanent: false } };
    }

    // TODO: Fetch initial dashboard data if needed

    return {
        props: {
            userName: session.user?.name ?? null,
            session, // Pass session if needed by MainLayout
        },
    };
};

export default DashboardPage;