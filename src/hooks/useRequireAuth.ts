import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '~/stores';

/**
 * Custom hook that ensures the user is authenticated before accessing a route.
 * Automatically redirects to /auth if the user is not authenticated.
 * 
 * @returns boolean - true if user is authenticated, false otherwise
 */
export function useRequireAuth() {
  const { isAuthenticated, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/auth');
    }
  }, [isAuthenticated, loading, router]);

  return { isAuthenticated, loading };
}
