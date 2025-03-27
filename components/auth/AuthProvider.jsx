import { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const isLoading = status === 'loading';
  const router = useRouter();

  // Public paths that don't require authentication
  const publicPaths = ['/login', '/forgot-password', '/reset-password'];
  const isPublicPath = publicPaths.some(path => router.pathname.startsWith(path));

  // Set the user from the session
  useEffect(() => {
    if (session?.user) {
      setUser(session.user);
    } else {
      setUser(null);
    }
  }, [session]);

  // Handle authentication redirects - only if not in a loading state
  useEffect(() => {
    // Don't do anything if still loading
    if (isLoading) return;
    
    // Allow access to public paths without a session
    if (isPublicPath) return;
    
    // Redirect to login if no session and trying to access protected route
    if (!session && !isPublicPath) {
      router.push(`/login?callbackUrl=${encodeURIComponent(router.asPath)}`);
    }
  }, [isLoading, session, isPublicPath, router]);

  // Function to check user permissions
  const hasPermission = (requiredRole) => {
    if (!user) return false;
    
    const roleHierarchy = {
      'admin': 4,
      'hr_manager': 3,
      'department_head': 2,
      'employee': 1
    };
    
    const userRoleLevel = roleHierarchy[user.role] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0;
    
    return userRoleLevel >= requiredRoleLevel;
  };
  
  // Function to check if user has access to a department
  const hasDepartmentAccess = (departmentId) => {
    if (!user) return false;
    
    // Admins and HR managers have access to all departments
    if (user.role === 'admin' || user.role === 'hr_manager') {
      return true;
    }
    
    // Department heads can only access their own department
    if (user.role === 'department_head') {
      return user.departmentId === departmentId;
    }
    
    // Employees can only access their own data, handled separately
    return false;
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    hasPermission,
    hasDepartmentAccess
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}