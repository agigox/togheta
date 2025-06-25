import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { initializeStores } from '~/stores/init';
import '../global.css';
import {
  useFonts,
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { SplashScreen } from '~/shared';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Initialize Zustand stores
  useEffect(() => {
    initializeStores();
  }, []);

  if (!fontsLoaded) {
    return <SplashScreen />;
  }

  return (
      <Stack screenOptions={{ headerShown: true }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="tasks" />
        <Stack.Screen name="family" />
      </Stack>
  );
}