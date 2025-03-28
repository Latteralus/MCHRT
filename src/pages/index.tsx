import React from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import MainLayout from '@/components/layouts/MainLayout';
import Head from 'next/head';
import Link from 'next/link'; // Import Link for navigation

// Import Existing Widgets
import ComplianceStatsWidget from '@/components/dashboard/widgets/ComplianceStatsWidget';
import ExpiringComplianceWidget from '@/components/dashboard/widgets/ExpiringComplianceWidget';
import EmployeeStats from '@/components/dashboard/widgets/EmployeeStats';
import AttendanceWidget from '@/components/dashboard/widgets/AttendanceWidget';
import LeaveWidget from '@/components/dashboard/widgets/LeaveWidget';
import RecentDocuments from '@/components/dashboard/widgets/RecentDocuments';
import ActivityFeed from '@/components/dashboard/ActivityFeed';

// Placeholder: Import API functions to fetch data for widgets if needed server-side
// Placeholder: Import Icon component if available, e.g., import Icon from '@/components/ui/Icon';

interface DashboardPageProps {
    userName?: string | null;
}

// Placeholder Quick Access Card Component
const QuickAccessCard: React.FC<{ title: string; description: string; link: string; iconClass: string }> = ({ title, description, link, iconClass }) => (
    <div className="card module-card bg-white shadow rounded-lg overflow-hidden transition-transform duration-200 ease-in-out hover:-translate-y-1 hover:shadow-md">
        <div className="module-card-body p-6 flex flex-col items-center text-center">
            <div className="module-icon w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mb-4">
                {/* Placeholder for Icon component or <i> tag */}
                <i className={`${iconClass} text-teal-600 text-2xl`}></i>
            </div>
            <h4 className="module-title text-lg font-semibold mb-2">{title}</h4>
            <p className="module-description text-sm text-gray-600 mb-4">{description}</p>
            <Link href={link} className="action-link text-teal-600 font-semibold text-sm hover:text-teal-800 hover:underline">
                Go <i className="fas fa-chevron-right text-xs ml-1"></i> {/* Assuming Font Awesome */}
            </Link>
        </div>
    </div>
);


const DashboardPage: React.FC<DashboardPageProps> = ({ userName }) => {
    // TODO: Fetch widget data client-side using hooks (e.g., SWR or React Query)

    return (
        <MainLayout>
            <Head>
                <title>Dashboard - Mountain Care HR</title>
                {/* Include Font Awesome if needed and not globally available */}
                {/* <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" /> */}
            </Head>
            {/* Use main-content equivalent padding and structure */}
            <div className="p-8"> {/* Equivalent to main-content padding */}
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div className="page-title mb-4 md:mb-0">
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                        <div className="page-subtitle text-gray-600 mt-1">Welcome back{userName ? `, ${userName}` : ''}! Here&apos;s what&apos;s happening today.</div>
                    </div>
                    <div className="header-actions flex items-center gap-4 w-full md:w-auto">
                        {/* Search Box - Placeholder */}
                        <div className="search-box relative hidden md:block">
                             <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"></i> {/* Assuming Font Awesome */}
                             <input
                                type="text"
                                placeholder="Search..."
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                             />
                        </div>
                        {/* Notification Badge - Placeholder */}
                        <div className="notification-badge relative cursor-pointer">
                            <button className="w-10 h-10 flex items-center justify-center bg-white border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100 transition-colors">
                                <i className="fas fa-bell"></i> {/* Assuming Font Awesome */}
                            </button>
                            {/* Example badge count */}
                            <span className="badge absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">3</span>
                        </div>
                        {/* New Employee Button */}
                         <Link href="/employees/new" className="btn btn-primary bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors flex items-center gap-2">
                             <i className="fas fa-plus"></i> {/* Assuming Font Awesome */}
                             New Employee
                         </Link>
                    </div>
                </div>

                {/* Dashboard Grid - 12 Columns */}
                <div className="grid grid-cols-12 gap-6">
                    {/* Stats Row */}
                    <div className="col-span-12 sm:col-span-6 md:col-span-3">
                        <EmployeeStats />
                    </div>
                    <div className="col-span-12 sm:col-span-6 md:col-span-3">
                        <AttendanceWidget />
                    </div>
                     <div className="col-span-12 sm:col-span-6 md:col-span-3">
                        <LeaveWidget />
                    </div>
                     <div className="col-span-12 sm:col-span-6 md:col-span-3">
                        <ComplianceStatsWidget />
                    </div>

                    {/* License Expiry / Expiring Compliance */}
                    <div className="col-span-12 md:col-span-4">
                         <ExpiringComplianceWidget />
                    </div>

                    {/* Recent Activity */}
                    <div className="col-span-12 md:col-span-8">
                         <ActivityFeed />
                    </div>

                    {/* Recent Documents - Example placement, could be elsewhere */}
                     <div className="col-span-12 md:col-span-4"> {/* Adjust span as needed */}
                         <RecentDocuments />
                     </div>

                    {/* Quick Access Section */}
                    <div className="col-span-12 mt-4">
                        <h3 className="text-xl font-semibold mb-4 text-gray-800">Quick Access</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                             {/* Replicate QuickAccessCard for each module */}
                             <QuickAccessCard
                                title="Onboarding"
                                description="Add new employees"
                                link="/onboarding" // Adjust link as needed
                                iconClass="fas fa-user-plus" // Assuming Font Awesome
                             />
                             <QuickAccessCard
                                title="Compliance"
                                description="Track licenses"
                                link="/compliance" // Adjust link as needed
                                iconClass="fas fa-clipboard-check" // Assuming Font Awesome
                             />
                             <QuickAccessCard
                                title="Time Off"
                                description="Manage leave requests"
                                link="/leave" // Adjust link as needed
                                iconClass="fas fa-clock" // Assuming Font Awesome
                             />
                             <QuickAccessCard
                                title="Documents"
                                description="Upload and manage files"
                                link="/documents" // Adjust link as needed
                                iconClass="fas fa-file-upload" // Assuming Font Awesome
                             />
                             <QuickAccessCard
                                title="Reports"
                                description="Generate HR analytics"
                                link="/reports" // Adjust link as needed
                                iconClass="fas fa-chart-line" // Assuming Font Awesome
                             />
                        </div>
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

    // TODO: Fetch initial dashboard data if needed (e.g., for widgets that don't fetch client-side)

    return {
        props: {
            userName: session.user?.name ?? null, // Use name, default to null if unavailable
            session, // Pass session if needed by MainLayout or other components
        },
    };
};

export default DashboardPage;