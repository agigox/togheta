import { ScreenContent } from './src/screens/ScreenContent';
import { StatusBar } from 'expo-status-bar';
import './global.css';
import TaskScreen from './src/screens/TaskScreen';

export default function App() {
  return (
    <>
      <TaskScreen />
      <StatusBar style="auto" />
    </>
  );
}
