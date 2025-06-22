import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore, useFamilyStore } from '~/stores';
import { TaskScreen } from '~/features/tasks';
import { LoadingScreen } from '~/shared';

export default function Tasks() {
  const { isAuthenticated, loading: authLoading } = useAuthStore();
  const { hasFamilyId } = useFamilyStore();
  const router = useRouter();

  useEffect(() => {
    console.log('📋 Tasks route protection check:', {
      isAuthenticated,
      hasFamilyId,
      authLoading
    });
    
    // Only check auth loading and essential states
    if (!authLoading) {
      if (!isAuthenticated) {
        console.log('📋 Tasks: Redirecting to /auth - not authenticated');
        router.replace('/auth');
      } else if (!hasFamilyId) {
        console.log('📋 Tasks: Redirecting to /onboarding - no family');
        router.replace('/onboarding');
      }
      // If user is authenticated and has family ID, show tasks
      // (family data can load in the background)
    }
  }, [isAuthenticated, hasFamilyId, authLoading, router]);

  // Show loading while checking authentication status
  if (authLoading) {
    return <LoadingScreen message="Loading tasks..." />;
  }

  // Only render TaskScreen if user is authenticated and has a family
  if (isAuthenticated && hasFamilyId) {
    return <TaskScreen />;
  }

  // Return loading screen while redirecting
  return <LoadingScreen message="Redirecting..." />;
}