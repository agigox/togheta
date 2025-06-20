import { StatusBar } from 'expo-status-bar';
import AppLoading from 'expo-app-loading';
import { AuthScreen } from '~/features/auth';
import { useAuth } from '~/context/AuthContext';
import { TaskScreen } from './tasks';

export default function Features() {
  const { user, loading } = useAuth();

  if (loading) return <AppLoading />;

  return (
    <>
      {user ? <TaskScreen /> : <AuthScreen />}
      <StatusBar style="auto" />
    </>
  );
}
