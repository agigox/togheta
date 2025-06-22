import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '~/stores';
import { AuthScreen } from '~/features/auth';

export default function Auth() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  return <AuthScreen />;
}