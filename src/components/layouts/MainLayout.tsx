import React, { ReactNode } from 'react';
import Sidebar from '@/components/navigation/Sidebar';
import { useRouter } from 'next/router'; // Import useRouter
// import { useSession } from 'next-auth/react'; // Keep if needed for user info

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const router = useRouter(); // Get router object
  const activePath = router.pathname; // Get current path

  // Example: Fetch user data if needed
  // const { data: session } = useSession();
  // const userName = session?.user?.name ?? 'Guest';
  // const userRole = session?.user?.role ?? 'Employee';

  return (
    <div className="container">
      <Sidebar
        // Pass relevant props if needed, using placeholders for now
        // userName={userName}
        // userRole={userRole}
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