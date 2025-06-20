import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '~/context/AuthContext';
import { TaskScreen } from '~/features/tasks';

export default function Tasks() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth');
    }
  }, [isAuthenticated, router]);

  return <TaskScreen />;
}