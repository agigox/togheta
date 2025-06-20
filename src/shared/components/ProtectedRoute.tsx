import React from 'react';
import { useRequireAuth } from '~/hooks/useRequireAuth';
import { LoadingScreen } from '~/shared';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Wrapper component that protects routes from unauthorized access.
 * Shows loading screen while checking authentication.
 * Automatically redirects to /auth if user is not authenticated.
 * 
 * @param children - The protected content to render
 * @param fallback - Optional custom loading component
 */
export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useRequireAuth();
  
  if (loading) {
    return fallback || <LoadingScreen message="Checking authentication..." />;
  }
  
  if (!isAuthenticated) {
    return <LoadingScreen message="Redirecting to login..." />;
  }
  
  return <>{children}</>;
}

export default ProtectedRoute;
