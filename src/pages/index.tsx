import React from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';

// Import Existing Widgets
import ComplianceStatsWidget from '@/components/dashboard/widgets/ComplianceStatsWidget';
import ExpiringComplianceWidget from '@/components/dashboard/widgets/ExpiringComplianceWidget';
import EmployeeStats from '@/components/dashboard/widgets/EmployeeStats';
import AttendanceWidget from '@/components/dashboard/widgets/AttendanceWidget';
import LeaveWidget from '@/components/dashboard/widgets/LeaveWidget';
import RecentDocuments from '@/components/dashboard/widgets/RecentDocuments';
import ActivityFeed from '@/components/dashboard/ActivityFeed';

interface DashboardPageProps {
    userName?: string | null;
}

// Updated Quick Access Card Component using semantic classes
const QuickAccessCard: React.FC<{ title: string; link: string; iconClass: string; description?: string }> = ({ 
    title, 
    link, 
    iconClass,
    description 
}) => (
    <div className="card module-card">
        <div className="module-card-body">
            <div className="module-icon">
                <i className={iconClass}></i>
            </div>
            <h4 className="module-title">{title}</h4>
            {description && <p className="module-description">{description}</p>}
            <Link href={link} className="action-link">Get Started</Link>
        </div>
    </div>
);

const DashboardPage: React.FC<DashboardPageProps> = ({ userName }) => {
    return (
        <>
            <Head>
                <title>Dashboard - Mountain Care HR</title>
            </Head>

            {/* Header Section */}
            <div className="header">
                <div className="page-title">
                    <h1>Dashboard</h1>
                    <div className="page-subtitle">Welcome back, {userName || 'Faith'}! Here&apos;s what&apos;s happening today.</div>
                </div>
                <div className="header-actions">
                    <div className="search-box">
                        <i className="fas fa-search"></i>
                        <input type="text" placeholder="Search..." />
                    </div>
                    <div className="notification-badge">
                        <i className="fas fa-bell"></i>
                        <span className="badge">3</span>
                    </div>
                    <Link href="/employees/new" className="btn btn-primary">
                        <i className="fas fa-plus"></i>
                        New Employee
                    </Link>
                </div>
            </div>

            {/* Main Dashboard Content */}
            <div className="dashboard-content">
                {/* Stats Row - Using Widgets */}
                <div className="dashboard-grid">
                    <div className="col-span-3">
                        <EmployeeStats />
                    </div>
                    <div className="col-span-3">
                        <AttendanceWidget />
                    </div>
                    <div className="col-span-3">
                        <LeaveWidget />
                    </div>
                    <div className="col-span-3">
                        <ComplianceStatsWidget />
                    </div>
                </div>

                {/* Middle Content - License Operations and Activity Feed */}
                <div className="dashboard-grid" style={{ marginTop: '1.5rem' }}>
                    {/* Expiring Compliance Widget */}
                    <div className="col-span-4">
                        <ExpiringComplianceWidget />
                    </div>
                    
                    {/* Activity Feed Widget */}
                    <div className="col-span-8">
                        <ActivityFeed />
                    </div>
                </div>

                {/* Quick Access Section */}
                <div className="quick-access-section" style={{ marginTop: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '600' }}>Quick Access</h3>
                    <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                        <QuickAccessCard
                            title="Onboarding"
                            link="/onboarding"
                            iconClass="fas fa-user-plus"
                            description="Add new employees to the system"
                        />
                        <QuickAccessCard
                            title="Compliance"
                            link="/compliance"
                            iconClass="fas fa-clipboard-check"
                            description="Track licenses and certifications"
                        />
                        <QuickAccessCard
                            title="Time Off"
                            link="/leave"
                            iconClass="fas fa-clock"
                            description="Manage leave requests"
                        />
                        <QuickAccessCard
                            title="Documents"
                            link="/documents"
                            iconClass="fas fa-file-alt"
                            description="Upload and manage files"
                        />
                        <QuickAccessCard
                            title="Reports"
                            link="/reports"
                            iconClass="fas fa-chart-line"
                            description="Generate HR analytics"
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);

    if (!session) {
        return { redirect: { destination: '/login', permanent: false } };
    }

    return {
        props: {
            userName: session.user?.name ?? null,
            session,
        },
    };
};

export default DashboardPage;