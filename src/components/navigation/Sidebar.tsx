import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Role } from '@/types/roles'; // Import Role enum

interface SidebarProps {
  // Add any necessary props, e.g., user info, active path
  userName?: string;
  userRole?: Role; // Use Role enum for type safety
  userAvatarUrl?: string;
  activePath?: string;
}

interface MenuItem {
  href: string;
  icon: string;
  label: string;
  requiredRole?: Role; // Add optional role requirement
}

const menuItems: MenuItem[] = [
  // Standard User Links
  { href: '/', icon: 'fas fa-home', label: 'Dashboard' },
  { href: '/employees', icon: 'fas fa-users', label: 'Employees' },
  { href: '/attendance', icon: 'fas fa-calendar-alt', label: 'Attendance' },
  { href: '/leave', icon: 'fas fa-calendar-check', label: 'Leave Management' },
  { href: '/onboarding', icon: 'fas fa-clipboard-list', label: 'Onboarding' },
  { href: '/offboarding', icon: 'fas fa-user-minus', label: 'Offboarding' },
  { href: '/compliance', icon: 'fas fa-shield-alt', label: 'Compliance' },
  { href: '/documents', icon: 'fas fa-file-alt', label: 'Documents' },
  { href: '/reports', icon: 'fas fa-chart-bar', label: 'Reports' }, // Added Reports link
  { href: '/profile', icon: 'fas fa-cog', label: 'Settings' }, // Added Settings link pointing to profile

  // Admin Section - Moved to bottom
  { href: '/admin/departments', icon: 'fas fa-building', label: 'Manage Departments', requiredRole: Role.ADMIN },
  { href: '/admin/users', icon: 'fas fa-user-cog', label: 'Manage Users', requiredRole: Role.ADMIN },
];

const Sidebar: React.FC<SidebarProps> = ({
  userName = 'Faith Calkins', // Default placeholder
  userRole, // Remove default, should come from session/props
  userAvatarUrl = '/images/default-avatar.png', // Default placeholder
  activePath = '/', // Default placeholder
}) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        {/* Replace with actual logo */}
        {/* <Image src="/images/logo.png" alt="Mountain Care Logo" width={40} height={40} /> */} {/* Commented out due to missing image */}
        {/* <Image src={logo} alt="Mountain Care Logo" height={40} /> */}
        <span>Mountain Care</span>
      </div>
      <nav className="sidebar-menu">
        {menuItems
          .filter(item => !item.requiredRole || item.requiredRole === userRole) // Filter based on role
          .map((item) => (
            <Link href={item.href} key={item.label} legacyBehavior>
              <a className={`menu-item ${activePath === item.href ? 'active' : ''}`}>
                <i className={item.icon}></i>
                {item.label}
              </a>
            </Link>
        ))}
      </nav>
      <div className="sidebar-footer">
        {/* <Image src={userAvatarUrl} alt="User avatar" width={36} height={36} className="rounded-full" /> */} {/* Commented out due to missing image */}
        <div className="user-info">
          <div className="user-name">{userName}</div>
          <div className="user-role">{userRole}</div>
        </div>
        {/* Add logout or profile link if needed */}
      </div>
    </aside>
  );
};

export default Sidebar;