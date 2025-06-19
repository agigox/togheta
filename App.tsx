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

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) return <AppLoading />;
  return (
    <>
      {true ? <AuthScreen /> : <TaskScreen />}
      <StatusBar style="auto" />
    </>
  );
}
