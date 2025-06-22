import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '~/context/AuthContext';
import { useUserFamily } from '~/hooks/useUserFamily';
import { LoadingScreen } from '~/shared';

export default function Index() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { hasFamilyId, loading: familyLoading } = useUserFamily();
  const router = useRouter();
  console.log('first, /onboarding', !authLoading && !familyLoading);

  useEffect(() => {
    console.log('🔄 Routing logic check:', {
      hasUser: !!user,
      userUid: user?.uid,
      authLoading,
      familyLoading,
      isAuthenticated,
      hasFamilyId
    });
    
    if (!authLoading && !familyLoading) {
      if (!isAuthenticated) {
        console.log('➡️ Redirecting to /auth - user not authenticated');
        router.replace('/auth');
      } else if (!hasFamilyId) {
        console.log('➡️ Redirecting to /onboarding - user has no family');
        router.replace('/onboarding');
      } else {
        console.log('➡️ Redirecting to /tasks - user has family');
        router.replace('/tasks');
      }
    } else {
      console.log('⏳ Waiting for loading to complete...', { authLoading, familyLoading });
    }
  }, [user, isAuthenticated, hasFamilyId, authLoading, familyLoading, router]);

  return <LoadingScreen message="Loading..." />;
}