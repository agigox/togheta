import { StatusBar } from 'expo-status-bar';
import './global.css';
import { TaskScreen } from './src/features/tasks';
import {
  useFonts,
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import AppLoading from 'expo-app-loading';
import { AuthScreen } from '~/features/auth';
import { useAuth } from '~/hooks/useAuth';

export default function App() {
  const { user, loading } = useAuth();
  const [fontsLoaded] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded || loading) return <AppLoading />;

  return (
    <>
      {user ? <TaskScreen /> : <AuthScreen />}
      <StatusBar style="auto" />
    </>
  );
}
