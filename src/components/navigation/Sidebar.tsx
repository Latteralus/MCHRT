import React from 'react';
import Link from 'next/link';
// Assuming a logo file exists or using a placeholder
// import logo from '@/public/logo.svg'; // Example path
import Image from 'next/image';

interface SidebarProps {
  // Add any necessary props, e.g., user info, active path
  userName?: string;
  userRole?: string;
  userAvatarUrl?: string;
  activePath?: string;
}

const menuItems = [
  { href: '/', icon: 'fas fa-home', label: 'Dashboard' },
  { href: '/employees', icon: 'fas fa-users', label: 'Employees' },
  { href: '/attendance', icon: 'fas fa-calendar-alt', label: 'Attendance' },
  { href: '/leave', icon: 'fas fa-calendar-check', label: 'Leave Management' },
  { href: '/onboarding', icon: 'fas fa-clipboard-list', label: 'Onboarding' },
  { href: '/offboarding', icon: 'fas fa-user-minus', label: 'Offboarding' },
  { href: '/compliance', icon: 'fas fa-shield-alt', label: 'Compliance' },
  { href: '/documents', icon: 'fas fa-file-alt', label: 'Documents' },
  { href: '/settings', icon: 'fas fa-cog', label: 'Settings' },
];

const Sidebar: React.FC<SidebarProps> = ({
  userName = 'Faith Calkins', // Default placeholder
  userRole = 'HR Director', // Default placeholder
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
        {menuItems.map((item) => (
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