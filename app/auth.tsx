import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '~/context/AuthContext';
import { AuthScreen } from '~/features/auth';

export default function Auth() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/tasks');
    }
  }, [isAuthenticated, router]);

  return <AuthScreen />;
}