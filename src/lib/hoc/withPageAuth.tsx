import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Role } from '@/types/roles'; // Assuming Role enum path

interface WithPageAuthOptions {
  requiredRoles?: Role[];
  redirectTo?: string; // Where to redirect if not authenticated/authorized
  showLoading?: boolean; // Whether to show a loading indicator
}

export function withPageAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithPageAuthOptions = {}
): React.FC<P> {
  const {
    requiredRoles = [],
    redirectTo = '/login',
    showLoading = true,
  } = options;

  const WithPageAuthComponent: React.FC<P> = (props) => {
    const { data: session, status } = useSession();
    const router = useRouter();

    const isLoading = status === 'loading';
    const isAuthenticated = status === 'authenticated';
    const userRole = session?.user?.role as Role | undefined; // Cast role from session

    // Handle loading state
    if (isLoading && showLoading) {
      // You might want a more sophisticated loading component
      return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    // Handle unauthenticated state
    if (!isLoading && !isAuthenticated) {
      if (typeof window !== 'undefined') { // Ensure router push happens client-side
        router.push(`${redirectTo}?callbackUrl=${encodeURIComponent(router.asPath)}`);
      }
      return null; // Render nothing while redirecting
    }

    // Handle authenticated but unauthorized state
    if (isAuthenticated && requiredRoles.length > 0 && (!userRole || !requiredRoles.includes(userRole))) {
      // Optionally redirect to an unauthorized page or show a message
      // For simplicity, redirecting back or showing a simple message
      // router.push('/unauthorized'); // Example redirect
      return (
        <div className="flex justify-center items-center h-screen text-red-600">
          Unauthorized: You do not have permission to view this page.
        </div>
      );
    }

    // User is authenticated and authorized (or no roles required)
    if (isAuthenticated) {
      return <WrappedComponent {...props} />;
    }

    // Fallback (should ideally not be reached if logic above is correct)
    return null;
  };

  // Set display name for easier debugging
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  WithPageAuthComponent.displayName = `withPageAuth(${displayName})`;

  return WithPageAuthComponent;
}