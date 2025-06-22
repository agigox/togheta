import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore, useFamilyStore } from '~/stores';
import { LoadingScreen } from '~/shared';

export default function Index() {
  const { user, isAuthenticated, loading: authLoading } = useAuthStore();
  const { hasFamilyId, loading: familyLoading, subscribeToUserFamily, reset: resetFamily } = useFamilyStore();
  const router = useRouter();

  // Subscribe to user family changes when user is authenticated
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    
    if (user && isAuthenticated) {
      console.log('👤 Setting up family subscription for user:', user.uid);
      cleanup = subscribeToUserFamily(user.uid);
    } else {
      // Reset family state when user is not authenticated
      console.log('🔄 Resetting family state - user not authenticated');
      resetFamily();
    }
    
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [user, isAuthenticated, subscribeToUserFamily, resetFamily]);

  useEffect(() => {
    console.log('🔄 Routing logic check:', {
      hasUser: !!user,
      userUid: user?.uid,
      authLoading,
      familyLoading,
      isAuthenticated,
      hasFamilyId
    });
    
    // If auth is still loading, wait
    if (authLoading) {
      console.log('⏳ Auth still loading...');
      return;
    }
    
    // If user is not authenticated, go to auth (don't wait for family loading)
    if (!isAuthenticated) {
      console.log('➡️ Redirecting to /auth - user not authenticated');
      router.replace('/auth');
      return;
    }
    
    // If user is authenticated but family is still loading, wait
    if (familyLoading) {
      console.log('⏳ Family still loading...');
      return;
    }
    
    // User is authenticated and family loading is done
    if (!hasFamilyId) {
      console.log('➡️ Redirecting to /onboarding - user has no family');
      router.replace('/onboarding');
    } else {
      console.log('➡️ Redirecting to /tasks - user has family');
      router.replace('/tasks');
    }
  }, [user, isAuthenticated, hasFamilyId, authLoading, familyLoading, router]);

  return <LoadingScreen message="Loading..." />;
}