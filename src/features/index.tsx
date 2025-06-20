import { StatusBar } from 'expo-status-bar';
import AppLoading from 'expo-app-loading';
import { AuthScreen } from '~/features/auth';
import { useAuth } from '~/context/AuthContext';
import { TaskScreen } from './tasks';
import * as SecureStore from 'expo-secure-store';
async function save(key: string, value: string) {
  await SecureStore.setItemAsync(key, value);
}

async function getValueFor(key: string) {
  let result = await SecureStore.getItemAsync(key);
  if (result) {
    alert("🔐 Here's your value 🔐 \n" + result);
  } else {
    alert('No values stored under that key.');
  }
}

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
