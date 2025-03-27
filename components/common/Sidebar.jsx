import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

const Sidebar = ({ isActive }) => {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <div className={`sidebar ${isActive ? 'active' : ''}`}>
      <div className="sidebar-logo">
        <img src="/images/logo.png" alt="Mountain Care Logo" 
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 width%3D%2232%22 height%3D%2232%22 viewBox%3D%220 0 24 24%22 fill%3D%22none%22 stroke%3D%22%231D4ED8%22 stroke-width%3D%222%22 stroke-linecap%3D%22round%22 stroke-linejoin%3D%22round%22%3E%3Cpath d%3D%22M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z%22%2F%3E%3Cpolyline points%3D%229 22 9 12 15 12 15 22%22%2F%3E%3C%2Fsvg%3E'
          }}
        />
        <span>HR</span>
      </div>
      
      <nav className="sidebar-menu">
        <Link href="/" legacyBehavior>
          <a className={`menu-item ${router.pathname === '/' ? 'active' : ''}`}>
            <i className="fas fa-home"></i>
            Dashboard
          </a>
        </Link>
        <Link href="/employees" legacyBehavior>
          <a className={`menu-item ${router.pathname.startsWith('/employees') ? 'active' : ''}`}>
            <i className="fas fa-users"></i>
            Employees
          </a>
        </Link>
        <Link href="/attendance" legacyBehavior>
          <a className={`menu-item ${router.pathname.startsWith('/attendance') ? 'active' : ''}`}>
            <i className="fas fa-calendar-alt"></i>
            Attendance
          </a>
        </Link>
        <Link href="/leave" legacyBehavior>
          <a className={`menu-item ${router.pathname.startsWith('/leave') ? 'active' : ''}`}>
            <i className="fas fa-calendar-check"></i>
            Leave Management
          </a>
        </Link>
        <Link href="/compliance" legacyBehavior>
          <a className={`menu-item ${router.pathname.startsWith('/compliance') ? 'active' : ''}`}>
            <i className="fas fa-shield-alt"></i>
            Compliance
          </a>
        </Link>
        <Link href="/documents" legacyBehavior>
          <a className={`menu-item ${router.pathname.startsWith('/documents') ? 'active' : ''}`}>
            <i className="fas fa-file-alt"></i>
            Documents
          </a>
        </Link>
        <Link href="/onboarding" legacyBehavior>
          <a className={`menu-item ${router.pathname.startsWith('/onboarding') ? 'active' : ''}`}>
            <i className="fas fa-clipboard-list"></i>
            Onboarding
          </a>
        </Link>
        <Link href="/offboarding" legacyBehavior>
          <a className={`menu-item ${router.pathname.startsWith('/offboarding') ? 'active' : ''}`}>
            <i className="fas fa-user-minus"></i>
            Offboarding
          </a>
        </Link>
        <Link href="/reports" legacyBehavior>
          <a className={`menu-item ${router.pathname.startsWith('/reports') ? 'active' : ''}`}>
            <i className="fas fa-chart-bar"></i>
            Reports
          </a>
        </Link>
        <Link href="/settings" legacyBehavior>
          <a className={`menu-item ${router.pathname.startsWith('/settings') ? 'active' : ''}`}>
            <i className="fas fa-cog"></i>
            Settings
          </a>
        </Link>
      </nav>
      
      <div className="sidebar-footer">
        <img 
          src="/images/avatar.png" 
          alt="User avatar" 
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 width%3D%2232%22 height%3D%2232%22 viewBox%3D%220 0 24 24%22 fill%3D%22none%22 stroke%3D%22%23666666%22 stroke-width%3D%222%22 stroke-linecap%3D%22round%22 stroke-linejoin%3D%22round%22%3E%3Cpath d%3D%22M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2%22%2F%3E%3Ccircle cx%3D%2212%22 cy%3D%227%22 r%3D%224%22%2F%3E%3C%2Fsvg%3E'
          }}
        />
        <div className="user-info">
          <div className="user-name">{session?.user?.name || 'User'}</div>
          <div className="user-role">{session?.user?.role || 'Staff'}</div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;