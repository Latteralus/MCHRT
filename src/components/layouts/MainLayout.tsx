import React, { ReactNode } from 'react';
import Sidebar from '@/components/navigation/Sidebar'; // Using path alias defined in tsconfig.json
// We might need to get user info and active path from session/context later
// import { useSession } from 'next-auth/react';
// import { useRouter } from 'next/router';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  // Example: Fetch user data and active path if needed
  // const { data: session } = useSession();
  // const router = useRouter();
  // const activePath = router.pathname;
  // const userName = session?.user?.name ?? 'Guest';
  // const userRole = session?.user?.role ?? 'Employee'; // Assuming role is part of session

  return (
    <div className="container">
      <Sidebar
        // Pass relevant props if needed, using placeholders for now
        // userName={userName}
        // userRole={userRole}
        // activePath={activePath}
      />
      {/* Added background color and padding for consistency */}
      <main className="main-content flex-1 bg-gray-100 p-8 overflow-y-auto">
        {/* TopBar would go here if we had one */}
        {children}
      </main>
    </div>
  );
};

export default MainLayout;