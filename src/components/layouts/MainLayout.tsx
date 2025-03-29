import React, { ReactNode } from 'react';
import Sidebar from '@/components/navigation/Sidebar';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react'; // Uncomment to get session
import { Role } from '@/types/roles'; // Import Role enum

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const router = useRouter(); // Get router object
  const activePath = router.pathname; // Get current path

  // Example: Fetch user data if needed
  const { data: session } = useSession();
  // Extract user info, casting role to the Role enum
  const userName = session?.user?.name ?? 'Guest';
  // Ensure the role from the session matches the Role enum values
  const userRole = session?.user?.role as Role | undefined;

  return (
    <div className="container">
      <Sidebar
        // Pass actual user info to Sidebar
        userName={userName}
        userRole={userRole}
        activePath={activePath} // Pass the current path
      />
      {/* Added background color and padding for consistency */}
      {/* Removed redundant utility classes (flex-1, bg-gray-100, p-8) - rely on main-content class */}
      <main className="main-content overflow-y-auto">
        {/* TopBar would go here if we had one */}
        {children}
      </main>
    </div>
  );
};

export default MainLayout;