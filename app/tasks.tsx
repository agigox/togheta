import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '~/context/AuthContext';
import { useUserFamily } from '~/hooks/useUserFamily';
import { TaskScreen } from '~/features/tasks';
import { LoadingScreen } from '~/shared';

export default function Tasks() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { hasFamilyId, loading: familyLoading } = useUserFamily();
  const router = useRouter();

  useEffect(() => {
    console.log('📋 Tasks route protection check:', {
      isAuthenticated,
      hasFamilyId,
      authLoading,
      familyLoading
    });
    
    if (!authLoading && !familyLoading) {
      if (!isAuthenticated) {
        console.log('📋 Tasks: Redirecting to /auth - not authenticated');
        router.replace('/auth');
      } else if (!hasFamilyId) {
        console.log('📋 Tasks: Redirecting to /onboarding - no family');
        router.replace('/onboarding');
      }
      // If user is authenticated and has family, stay on tasks
    }
  }, [isAuthenticated, hasFamilyId, authLoading, familyLoading, router]);

  // Show loading while checking authentication and family status
  if (authLoading || familyLoading) {
    return <LoadingScreen message="Loading tasks..." />;
  }

  // Only render TaskScreen if user is authenticated and has a family
  if (isAuthenticated && hasFamilyId) {
    return <TaskScreen />;
  }

  // Return loading screen while redirecting
  return <LoadingScreen message="Redirecting..." />;
}