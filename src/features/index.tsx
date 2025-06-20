import { StatusBar } from 'expo-status-bar';
import { AuthScreen } from '~/features/auth';
import { useAuth } from '~/context/AuthContext';
import { TaskScreen } from './tasks';
import { LoadingScreen } from '~/shared/components';

export default function Features() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  return (
    <>
      {isAuthenticated && user ? <TaskScreen /> : <AuthScreen />}
      <StatusBar style="auto" />
    </>
  );
}
