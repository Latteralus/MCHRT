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
                {/* Stats Row - 4 cards in a row */}
                <div className="dashboard-grid">
                    <div className="col-span-3">
                        <div className="card stat-card">
                            <div className="card-body">
                                <div className="stat-label">
                                    <i className="fas fa-users"></i> Total Employees
                                </div>
                                <div className="stat-value">198</div>
                                <div className="stat-description">
                                    <span className="stat-trend trend-up">
                                        <i className="fas fa-arrow-up"></i> 3.2%
                                    </span>
                                    from last month
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-3">
                        <div className="card stat-card">
                            <div className="card-body">
                                <div className="stat-label">
                                    <i className="fas fa-calendar-check"></i> Attendance Rate
                                </div>
                                <div className="stat-value">96.5%</div>
                                <div className="stat-description">
                                    <span className="stat-trend trend-up">
                                        <i className="fas fa-arrow-up"></i> 1.8%
                                    </span>
                                    from last month
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-3">
                        <div className="card stat-card">
                            <div className="card-body">
                                <div className="stat-label">
                                    <i className="fas fa-hourglass-half"></i> Leave Requests
                                </div>
                                <div className="stat-value">12</div>
                                <div className="stat-description">
                                    <span className="stat-trend trend-down">
                                        <i className="fas fa-arrow-down"></i> 2.5%
                                    </span>
                                    from last month
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-3">
                        <div className="card stat-card">
                            <div className="card-body">
                                <div className="stat-label">
                                    <i className="fas fa-clipboard-list"></i> Compliance Rate
                                </div>
                                <div className="stat-value">98.2%</div>
                                <div className="stat-description">
                                    <span className="stat-trend trend-up">
                                        <i className="fas fa-arrow-up"></i> 0.7%
                                    </span>
                                    from last month
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Middle Content - License Operations and Activity Feed */}
                <div className="dashboard-grid" style={{ marginTop: '1.5rem' }}>
                    {/* License Operations Section */}
                    <div className="col-span-4">
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">License Operations</h3>
                                <Link href="/compliance" className="action-link">View all <i className="fas fa-chevron-right"></i></Link>
                            </div>
                            <div className="card-body">
                                <div className="license-item">
                                    <div className="license-item-avatar">EK</div>
                                    <div className="license-item-info">
                                        <div className="license-item-name">Ethan Klore</div>
                                        <div className="license-item-detail">Pharmacist License</div>
                                    </div>
                                    <div className="license-status status-danger">7 days</div>
                                </div>
                                
                                <div className="license-item">
                                    <div className="license-item-avatar">AE</div>
                                    <div className="license-item-info">
                                        <div className="license-item-name">Alice Edwards</div>
                                        <div className="license-item-detail">Pharmacy Tech License</div>
                                    </div>
                                    <div className="license-status status-warning">14 days</div>
                                </div>
                                
                                <div className="license-item">
                                    <div className="license-item-avatar">JL</div>
                                    <div className="license-item-info">
                                        <div className="license-item-name">John Lumbridge</div>
                                        <div className="license-item-detail">Controlled Substance License</div>
                                    </div>
                                    <div className="license-status status-warning">21 days</div>
                                </div>
                                
                                <div className="license-item">
                                    <div className="license-item-avatar">WS</div>
                                    <div className="license-item-info">
                                        <div className="license-item-name">William Sharpe</div>
                                        <div className="license-item-detail">90 Day Review</div>
                                    </div>
                                    <div className="license-status status-warning">23 days</div>
                                </div>
                                
                                <div className="license-item">
                                    <div className="license-item-avatar">WS</div>
                                    <div className="license-item-info">
                                        <div className="license-item-name">Washington State</div>
                                        <div className="license-item-detail">State License Renewal</div>
                                    </div>
                                    <div className="license-status status-warning">25 days</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Recent Activity Section */}
                    <div className="col-span-8">
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">Recent Activity</h3>
                                <Link href="/activity" className="action-link">View all <i className="fas fa-chevron-right"></i></Link>
                            </div>
                            <div className="card-body">
                                <div className="activity-item">
                                    <div className="activity-badge"></div>
                                    <div className="activity-time">Today, 10:30 AM</div>
                                    <div className="activity-description">
                                        <span className="activity-user">Sarah Johnson</span> approved time off request for Emily Chen
                                    </div>
                                </div>
                                
                                <div className="activity-item">
                                    <div className="activity-badge"></div>
                                    <div className="activity-time">Today, 9:45 AM</div>
                                    <div className="activity-description">
                                        <span className="activity-user">David Wilson</span> uploaded a new document to the compliance portal
                                    </div>
                                </div>
                                
                                <div className="activity-item">
                                    <div className="activity-badge"></div>
                                    <div className="activity-time">Today, 8:15 AM</div>
                                    <div className="activity-description">
                                        <span className="activity-user">Lisa Patel</span> completed onboarding for Mark Thompson
                                    </div>
                                </div>
                                
                                <div className="activity-item">
                                    <div className="activity-badge"></div>
                                    <div className="activity-time">Yesterday, 4:30 PM</div>
                                    <div className="activity-description">
                                        <span className="activity-user">James Rodriguez</span> updated the employee handbook
                                    </div>
                                </div>
                                
                                <div className="activity-item">
                                    <div className="activity-badge"></div>
                                    <div className="activity-time">Yesterday, 2:15 PM</div>
                                    <div className="activity-description">
                                        <span className="activity-user">Maria Garcia</span> added 3 new training modules to the compliance system
                                    </div>
                                </div>
                            </div>
                        </div>
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