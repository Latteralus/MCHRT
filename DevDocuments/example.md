// Use the below file as a guide for our platform. This is the Dashboard and the styling should be similar throughout the entire website.

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mountain Care HR - Dashboard</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --primary: #00796B;
            --primary-light: #4DB6AC;
            --primary-dark: #004D40;
            --secondary: #4FC3F7;
            --accent: #FFC107;
            --warning: #FF9800;
            --danger: #F44336;
            --success: #4CAF50;
            --gray-100: #F5F5F5;
            --gray-200: #EEEEEE;
            --gray-300: #E0E0E0;
            --gray-400: #BDBDBD;
            --gray-500: #9E9E9E;
            --gray-600: #757575;
            --gray-700: #616161;
            --gray-800: #424242;
            --gray-900: #212121;
            --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
            --shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
            --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            --radius: 8px;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Nunito', sans-serif;
            background-color: var(--gray-100);
            color: var(--gray-800);
            font-size: 16px;
            line-height: 1.5;
        }

        h1, h2, h3, h4, h5, h6 {
            font-family: 'Inter', sans-serif;
            font-weight: 600;
            color: var(--gray-900);
        }

        .container {
            display: flex;
            min-height: 100vh;
        }

        /* Sidebar styles */
        .sidebar {
            width: 250px;
            background-color: white;
            box-shadow: var(--shadow);
            padding: 1.5rem 0;
            display: flex;
            flex-direction: column;
            position: fixed;
            height: 100vh;
            z-index: 100;
        }

        .sidebar-logo {
            padding: 0 1.5rem 1.5rem;
            border-bottom: 1px solid var(--gray-200);
            display: flex;
            align-items: center;
            margin-bottom: 1.5rem;
        }

        .sidebar-logo img {
            height: 40px;
        }

        .sidebar-logo span {
            font-size: 20px;
            font-weight: 700;
            color: var(--primary);
            margin-left: 10px;
        }

        .sidebar-menu {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
        }

        .menu-item {
            display: flex;
            align-items: center;
            padding: 0.75rem 1.5rem;
            color: var(--gray-700);
            text-decoration: none;
            transition: all 0.2s ease;
            position: relative;
        }

        .menu-item.active {
            color: var(--primary);
            background-color: var(--gray-100);
            font-weight: 600;
        }

        .menu-item.active::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 4px;
            background-color: var(--primary);
        }

        .menu-item:hover {
            background-color: var(--gray-100);
            color: var(--primary);
        }

        .menu-item i {
            font-size: 1.2rem;
            margin-right: 10px;
            width: 20px;
            text-align: center;
        }

        .sidebar-footer {
            border-top: 1px solid var(--gray-200);
            padding: 1rem 1.5rem;
            display: flex;
            align-items: center;
        }

        .sidebar-footer img {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            object-fit: cover;
            margin-right: 10px;
        }

        .user-info {
            flex-grow: 1;
        }

        .user-name {
            font-weight: 600;
            font-size: 14px;
            color: var(--gray-900);
        }

        .user-role {
            font-size: 12px;
            color: var(--gray-600);
        }

        /* Main content styles */
        .main-content {
            margin-left: 250px;
            flex-grow: 1;
            padding: 2rem;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
        }

        .page-title h1 {
            font-size: 1.75rem;
            font-weight: 700;
        }

        .page-subtitle {
            color: var(--gray-600);
            margin-top: 0.25rem;
        }

        .header-actions {
            display: flex;
            gap: 1rem;
        }

        .search-box {
            position: relative;
        }

        .search-box input {
            padding: 0.5rem 1rem 0.5rem 2.5rem;
            border: 1px solid var(--gray-300);
            border-radius: var(--radius);
            width: 250px;
            font-size: 0.875rem;
            color: var(--gray-800);
            outline: none;
            transition: all 0.2s ease;
        }

        .search-box input:focus {
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(0, 121, 107, 0.1);
        }

        .search-box i {
            position: absolute;
            left: 0.75rem;
            top: 50%;
            transform: translateY(-50%);
            color: var(--gray-500);
        }

        .notification-badge {
            position: relative;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: white;
            border-radius: 50%;
            color: var(--gray-700);
            cursor: pointer;
            border: 1px solid var(--gray-300);
            transition: all 0.2s ease;
        }

        .notification-badge:hover {
            background-color: var(--gray-100);
        }

        .notification-badge .badge {
            position: absolute;
            top: -5px;
            right: -5px;
            background-color: var(--danger);
            color: white;
            font-size: 0.75rem;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
            font-weight: 600;
            border-radius: var(--radius);
            transition: all 0.2s ease;
            cursor: pointer;
            border: none;
        }

        .btn-primary {
            background-color: var(--primary);
            color: white;
        }

        .btn-primary:hover {
            background-color: var(--primary-dark);
        }

        .btn-outline {
            background-color: transparent;
            border: 1px solid var(--gray-300);
            color: var(--gray-700);
        }

        .btn-outline:hover {
            background-color: var(--gray-100);
            border-color: var(--gray-400);
        }

        .btn i {
            margin-right: 0.5rem;
        }

        /* Dashboard grid */
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(12, 1fr);
            gap: 1.5rem;
        }

        .col-span-3 {
            grid-column: span 3;
        }

        .col-span-4 {
            grid-column: span 4;
        }

        .col-span-6 {
            grid-column: span 6;
        }

        .col-span-8 {
            grid-column: span 8;
        }

        .col-span-12 {
            grid-column: span 12;
        }

        /* Card components */
        .card {
            background-color: white;
            border-radius: var(--radius);
            box-shadow: var(--shadow);
            overflow: hidden;
        }

        .card-header {
            padding: 1.25rem 1.5rem;
            border-bottom: 1px solid var(--gray-200);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .card-title {
            font-size: 1.125rem;
            font-weight: 600;
            color: var(--gray-900);
        }

        .card-body {
            padding: 1.5rem;
        }

        .card-footer {
            background-color: var(--gray-50);
            padding: 1rem 1.5rem;
            border-top: 1px solid var(--gray-200);
        }

        /* Stat card */
        .stat-card {
            display: flex;
            flex-direction: column;
            height: 100%;
        }

        .stat-card .card-body {
            display: flex;
            flex-direction: column;
            flex-grow: 1;
            padding: 1.25rem;
        }

        .stat-label {
            font-size: 0.875rem;
            color: var(--gray-600);
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
        }

        .stat-label i {
            margin-right: 0.5rem;
            font-size: 1rem;
            color: var(--primary);
        }

        .stat-value {
            font-size: 1.75rem;
            font-weight: 700;
            color: var(--gray-900);
            margin-bottom: 0.5rem;
        }

        .stat-description {
            font-size: 0.875rem;
            color: var(--gray-600);
            margin-top: auto;
        }

        .stat-trend {
            display: inline-flex;
            align-items: center;
            font-size: 0.75rem;
            font-weight: 600;
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            margin-right: 0.5rem;
        }

        .trend-up {
            background-color: rgba(76, 175, 80, 0.1);
            color: var(--success);
        }

        .trend-down {
            background-color: rgba(244, 67, 54, 0.1);
            color: var(--danger);
        }

        /* Module card */
        .module-card {
            position: relative;
            overflow: hidden;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .module-card:hover {
            transform: translateY(-5px);
            box-shadow: var(--shadow-md);
        }

        .module-card-body {
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
        }

        .module-icon {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background-color: rgba(0, 121, 107, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1rem;
        }

        .module-icon i {
            font-size: 1.5rem;
            color: var(--primary);
        }

        .module-title {
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
        }

        .module-description {
            font-size: 0.875rem;
            color: var(--gray-600);
            margin-bottom: 1rem;
        }

        /* License expiry card */
        .license-item {
            display: flex;
            align-items: center;
            padding: 1rem 0;
            border-bottom: 1px solid var(--gray-200);
        }

        .license-item:last-child {
            border-bottom: none;
            padding-bottom: 0;
        }

        .license-item-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            overflow: hidden;
            margin-right: 1rem;
            background-color: var(--gray-300);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 1rem;
            color: var(--gray-700);
        }

        .license-item-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .license-item-info {
            flex-grow: 1;
        }

        .license-item-name {
            font-weight: 600;
            margin-bottom: 0.25rem;
        }

        .license-item-detail {
            font-size: 0.875rem;
            color: var(--gray-600);
        }

        .license-status {
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            font-size: 0.75rem;
            font-weight: 600;
        }

        .status-warning {
            background-color: rgba(255, 152, 0, 0.1);
            color: var(--warning);
        }

        .status-danger {
            background-color: rgba(244, 67, 54, 0.1);
            color: var(--danger);
        }

        /* Activity card */
        .activity-item {
            position: relative;
            padding-left: 2rem;
            padding-bottom: 1.5rem;
        }

        .activity-item:last-child {
            padding-bottom: 0;
        }

        .activity-item::before {
            content: '';
            position: absolute;
            left: 6px;
            top: 0;
            bottom: 0;
            width: 2px;
            background-color: var(--gray-200);
        }

        .activity-item:last-child::before {
            height: 10px;
        }

        .activity-badge {
            position: absolute;
            left: 0;
            top: 0;
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background-color: var(--primary);
            border: 2px solid white;
        }

        .activity-time {
            font-size: 0.75rem;
            color: var(--gray-500);
            margin-bottom: 0.25rem;
        }

        .activity-description {
            font-size: 0.875rem;
            margin-bottom: 0.25rem;
        }

        .activity-user {
            font-weight: 600;
        }

        /* Action links */
        .action-link {
            color: var(--primary);
            text-decoration: none;
            font-weight: 600;
            font-size: 0.875rem;
            transition: all 0.2s ease;
        }

        .action-link:hover {
            color: var(--primary-dark);
            text-decoration: underline;
        }

        .action-link i {
            margin-left: 0.25rem;
            font-size: 0.75rem;
        }

        /* Responsive styles */
        @media (max-width: 1024px) {
            .dashboard-grid {
                grid-template-columns: repeat(6, 1fr);
            }

            .col-span-3, .col-span-4 {
                grid-column: span 3;
            }

            .col-span-6, .col-span-8, .col-span-12 {
                grid-column: span 6;
            }
        }

        @media (max-width: 768px) {
            .sidebar {
                position: fixed;
                left: -250px;
                transition: all 0.3s ease;
            }

            .sidebar.active {
                left: 0;
            }

            .main-content {
                margin-left: 0;
            }

            .col-span-3, .col-span-4, .col-span-6, .col-span-8, .col-span-12 {
                grid-column: span 6;
            }

            .header {
                flex-direction: column;
                align-items: flex-start;
            }

            .header-actions {
                margin-top: 1rem;
                width: 100%;
                justify-content: space-between;
            }

            .search-box input {
                width: 100%;
            }
        }

        @media (max-width: 640px) {
            .dashboard-grid {
                grid-template-columns: 1fr;
            }

            .col-span-3, .col-span-4, .col-span-6, .col-span-8, .col-span-12 {
                grid-column: span 1;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Sidebar -->
        <aside class="sidebar">
            <div class="sidebar-logo">
                <img src="https://via.placeholder.com/40" alt="Mountain Care Logo">
                <span>Mountain Care</span>
            </div>
            <nav class="sidebar-menu">
                <a href="#" class="menu-item active">
                    <i class="fas fa-home"></i>
                    Dashboard
                </a>
                <a href="#" class="menu-item">
                    <i class="fas fa-users"></i>
                    Employees
                </a>
                <a href="#" class="menu-item">
                    <i class="fas fa-calendar-alt"></i>
                    Attendance
                </a>
                <a href="#" class="menu-item">
                    <i class="fas fa-calendar-check"></i>
                    Leave Management
                </a>
                <a href="#" class="menu-item">
                    <i class="fas fa-clipboard-list"></i>
                    Onboarding
                </a>
                <a href="#" class="menu-item">
                    <i class="fas fa-user-minus"></i>
                    Offboarding
                </a>
                <a href="#" class="menu-item">
                    <i class="fas fa-shield-alt"></i>
                    Compliance
                </a>
                <a href="#" class="menu-item">
                    <i class="fas fa-file-alt"></i>
                    Documents
                </a>
                <a href="#" class="menu-item">
                    <i class="fas fa-cog"></i>
                    Settings
                </a>
            </nav>
            <div class="sidebar-footer">
                <img src="https://via.placeholder.com/36" alt="User avatar">
                <div class="user-info">
                    <div class="user-name">Faith Calkins</div>
                    <div class="user-role">HR Director</div>
                </div>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
            <div class="header">
                <div class="page-title">
                    <h1>Dashboard</h1>
                    <div class="page-subtitle">Welcome back, Faith! Here's what's happening today.</div>
                </div>
                <div class="header-actions">
                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" placeholder="Search...">
                    </div>
                    <div class="notification-badge">
                        <i class="fas fa-bell"></i>
                        <span class="badge">3</span>
                    </div>
                    <button class="btn btn-primary">
                        <i class="fas fa-plus"></i> New Employee
                    </button>
                </div>
            </div>

            <div class="dashboard-grid">
                <!-- Stats Row -->
                <div class="col-span-3">
                    <div class="card stat-card">
                        <div class="card-body">
                            <div class="stat-label">
                                <i class="fas fa-users"></i> Total Employees
                            </div>
                            <div class="stat-value">198</div>
                            <div class="stat-description">
                                <span class="stat-trend trend-up">
                                    <i class="fas fa-arrow-up"></i> 3.2%
                                </span>
                                from last month
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-span-3">
                    <div class="card stat-card">
                        <div class="card-body">
                            <div class="stat-label">
                                <i class="fas fa-calendar-check"></i> Attendance Rate
                            </div>
                            <div class="stat-value">96.5%</div>
                            <div class="stat-description">
                                <span class="stat-trend trend-up">
                                    <i class="fas fa-arrow-up"></i> 1.8%
                                </span>
                                from last month
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-span-3">
                    <div class="card stat-card">
                        <div class="card-body">
                            <div class="stat-label">
                                <i class="fas fa-hourglass-half"></i> Leave Requests
                            </div>
                            <div class="stat-value">12</div>
                            <div class="stat-description">
                                <span class="stat-trend trend-down">
                                    <i class="fas fa-arrow-down"></i> 2.5%
                                </span>
                                from last month
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-span-3">
                    <div class="card stat-card">
                        <div class="card-body">
                            <div class="stat-label">
                                <i class="fas fa-clipboard-list"></i> Compliance Rate
                            </div>
                            <div class="stat-value">98.2%</div>
                            <div class="stat-description">
                                <span class="stat-trend trend-up">
                                    <i class="fas fa-arrow-up"></i> 0.7%
                                </span>
                                from last month
                            </div>
                        </div>
                    </div>
                </div>

                <!-- License Expiry -->
                <div class="col-span-4">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">License Operations</h3>
                            <a href="#" class="action-link">View all <i class="fas fa-chevron-right"></i></a>
                        </div>
                        <div class="card-body">
                            <div class="license-item">
                                <div class="license-item-avatar">JD</div>
                                <div class="license-item-info">
                                    <div class="license-item-name">James Kirk</div>
                                    <div class="license-item-detail">Pharmacist License</div>
                                </div>
                                <div class="license-status status-danger">7 days</div>
                            </div>
                            <div class="license-item">
                                <div class="license-item-avatar">MM</div>
                                <div class="license-item-info">
                                    <div class="license-item-name">Leonard McCoy</div>
                                    <div class="license-item-detail">Pharmacy Tech License</div>
                                </div>
                                <div class="license-status status-warning">14 days</div>
                            </div>
                            <div class="license-item">
                                <div class="license-item-avatar">RL</div>
                                <div class="license-item-info">
                                    <div class="license-item-name">Nyota Uhura</div>
                                    <div class="license-item-detail">Controlled Substance License</div>
                                </div>
                                <div class="license-status status-warning">21 days</div>
                            </div>
                            <div class="license-item">
                                <div class="license-item-avatar">JD</div>
                                <div class="license-item-info">
                                    <div class="license-item-name">William Manager</div>
                                    <div class="license-item-detail">90 Day Review</div>
                                </div>
                                <div class="license-status status-warning">23 days</div>
                            </div>
                            <div class="license-item">
                                <div class="license-item-avatar">JD</div>
                                <div class="license-item-info">
                                    <div class="license-item-name">Washington State</div>
                                    <div class="license-item-detail">State License Renewal</div>
                                </div>
                                <div class="license-status status-warning">25 days</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Recent Activity -->
                <div class="col-span-8">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Recent Activity</h3>
                            <a href="#" class="action-link">View all <i class="fas fa-chevron-right"></i></a>
                        </div>
                        <div class="card-body">
                            <div class="activity-item">
                                <div class="activity-badge"></div>
                                <div class="activity-time">Today, 10:30 AM</div>
                                <div class="activity-description">
                                    <span class="activity-user">Sarah Johnson</span> approved time off request for Emily Chen
                                </div>
                            </div>
                            <div class="activity-item">
                                <div class="activity-badge"></div>
                                <div class="activity-time">Today, 9:45 AM</div>
                                <div class="activity-description">
                                    <span class="activity-user">David Wilson</span> uploaded a new document to the compliance portal
                                </div>
                            </div>
                            <div class="activity-item">
                                <div class="activity-badge"></div>
                                <div class="activity-time">Today, 8:15 AM</div>
                                <div class="activity-description">
                                    <span class="activity-user">Lisa Patel</span> completed onboarding for Mark Thompson
                                </div>
                            </div>
                            <div class="activity-item">
                                <div class="activity-badge"></div>
                                <div class="activity-time">Yesterday, 4:30 PM</div>
                                <div class="activity-description">
                                    <span class="activity-user">James Rodriguez</span> updated the employee handbook
                                </div>
                            </div>
                            <div class="activity-item">
                                <div class="activity-badge"></div>
                                <div class="activity-time">Yesterday, 2:15 PM</div>
                                <div class="activity-description">
                                    <span class="activity-user">Maria Garcia</span> added 3 new training modules to the compliance system
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Module Access Cards -->
                <div class="col-span-12">
                    <h3 style="margin-bottom: 1rem;">Quick Access</h3>
                    <div class="dashboard-grid" style="grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
                        <div class="card module-card">
                            <div class="module-card-body">
                                <div class="module-icon">
                                    <i class="fas fa-user-plus"></i>
                                </div>
                                <h4 class="module-title">Onboarding</h4>
                                <p class="module-description">Add new employees to the system</p>
                                <a href="#" class="action-link">Get Started</a>
                            </div>
                        </div>
                        <div class="card module-card">
                            <div class="module-card-body">
                                <div class="module-icon">
                                    <i class="fas fa-clipboard-check"></i>
                                </div>
                                <h4 class="module-title">Compliance</h4>
                                <p class="module-description">Track licenses and certifications</p>
                                <a href="#" class="action-link">Manage</a>
                            </div>
                        </div>
                        <div class="card module-card">
                            <div class="module-card-body">
                                <div class="module-icon">
                                    <i class="fas fa-clock"></i>
                                </div>
                                <h4 class="module-title">Time Off</h4>
                                <p class="module-description">Manage leave requests</p>
                                <a href="#" class="action-link">Review</a>
                            </div>
                        </div>
                        <div class="card module-card">
                            <div class="module-card-body">
                                <div class="module-icon">
                                    <i class="fas fa-file-upload"></i>
                                </div>
                                <h4 class="module-title">Documents</h4>
                                <p class="module-description">Upload and manage files</p>
                                <a href="#" class="action-link">Access</a>
                            </div>
                        </div>
                        <div class="card module-card">
                            <div class="module-card-body">
                                <div class="module-icon">
                                    <i class="fas fa-chart-line"></i>
                                </div>
                                <h4 class="module-title">Reports</h4>
                                <p class="module-description">Generate HR analytics</p>
                                <a href="#" class="action-link">View</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <script>
        // Simple JavaScript for mobile menu toggle
        document.addEventListener('DOMContentLoaded', function() {
            // For a real implementation, we would add toggle functionality here
            // This is placeholder code for the MVP demonstration
            console.log('Dashboard loaded successfully');
        });
    </script>
</body>
</html>