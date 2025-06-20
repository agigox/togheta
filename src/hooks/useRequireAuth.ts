import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '~/context/AuthContext';

/**
 * Custom hook that ensures the user is authenticated before accessing a route.
 * Automatically redirects to /auth if the user is not authenticated.
 * 
 * @returns boolean - true if user is authenticated, false otherwise
 */
export function useRequireAuth() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/auth');
    }
  }, [isAuthenticated, loading, router]);

  return { isAuthenticated, loading };
}
