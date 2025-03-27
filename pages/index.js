import Head from 'next/head';
import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '../components/common/Sidebar';

export default function Dashboard() {
  const [sidebarActive, setSidebarActive] = useState(false);

  const toggleSidebar = () => {
    setSidebarActive(!sidebarActive);
  };

  return (
    <>
      <Head>
        <title>Mountain Care HR - Dashboard</title>
        <meta name="description" content="Mountain Care HR Management Dashboard" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Nunito:wght@400;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </Head>

      <div className="container">
        {/* Using Sidebar Component */}
        <Sidebar isActive={sidebarActive} />

        {/* Main Content */}
        <main className="main-content">
          <div className="header">
            <div className="page-title">
              <h1>Dashboard</h1>
              <div className="page-subtitle">Welcome back, Faith! Here's what's happening today.</div>
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
                <i className="fas fa-plus"></i> New Employee
              </Link>
            </div>
          </div>

          <div className="dashboard-grid">
            {/* Stats Row */}
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

            {/* License Expiry */}
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
                      <div className="license-item-name">Eathan Klore</div>
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

            {/* Recent Activity */}
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

            {/* Module Access Cards */}
            <div className="col-span-12">
              <h3 style={{ marginBottom: '1rem' }}>Quick Access</h3>
              <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="card module-card">
                  <div className="module-card-body">
                    <div className="module-icon">
                      <i className="fas fa-user-plus"></i>
                    </div>
                    <h4 className="module-title">Onboarding</h4>
                    <p className="module-description">Add new employees to the system</p>
                    <Link href="/onboarding" className="action-link">Get Started</Link>
                  </div>
                </div>
                <div className="card module-card">
                  <div className="module-card-body">
                    <div className="module-icon">
                      <i className="fas fa-clipboard-check"></i>
                    </div>
                    <h4 className="module-title">Compliance</h4>
                    <p className="module-description">Track licenses and certifications</p>
                    <Link href="/compliance" className="action-link">Manage</Link>
                  </div>
                </div>
                <div className="card module-card">
                  <div className="module-card-body">
                    <div className="module-icon">
                      <i className="fas fa-clock"></i>
                    </div>
                    <h4 className="module-title">Time Off</h4>
                    <p className="module-description">Manage leave requests</p>
                    <Link href="/leave" className="action-link">Review</Link>
                  </div>
                </div>
                <div className="card module-card">
                  <div className="module-card-body">
                    <div className="module-icon">
                      <i className="fas fa-file-upload"></i>
                    </div>
                    <h4 className="module-title">Documents</h4>
                    <p className="module-description">Upload and manage files</p>
                    <Link href="/documents" className="action-link">Access</Link>
                  </div>
                </div>
                <div className="card module-card">
                  <div className="module-card-body">
                    <div className="module-icon">
                      <i className="fas fa-chart-line"></i>
                    </div>
                    <h4 className="module-title">Reports</h4>
                    <p className="module-description">Generate HR analytics</p>
                    <Link href="/reports" className="action-link">View</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile menu toggle button */}
      <button 
        className="mobile-menu-toggle" 
        onClick={toggleSidebar}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: '200',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary)',
          color: 'white',
          display: 'none',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          boxShadow: 'var(--shadow-md)',
          cursor: 'pointer',
          '@media (max-width: 768px)': {
            display: 'flex'
          }
        }}
      >
        <i className={`fas ${sidebarActive ? 'fa-times' : 'fa-bars'}`}></i>
      </button>
    </>
  );
}