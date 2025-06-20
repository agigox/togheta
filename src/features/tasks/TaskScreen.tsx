import { useEffect, useState } from 'react';
import { Text, Alert, View, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTasks } from '../../hooks/useTasks';
import { useAuth } from '~/context/AuthContext';
import { LogoutButton } from '~/shared';
import TaskHeader from './components/TaskHeader';
import TaskList from './components/TaskList';
import AddTaskForm from './components/AddTaskForm';
import { Link } from 'expo-router';
const TaskScreen = () => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [newlyAddedTaskId, setNewlyAddedTaskId] = useState<string | undefined>(undefined);
  // Keep track of timeout to clean it up if needed
  const [highlightTimeout, setHighlightTimeout] = useState<NodeJS.Timeout | null>(null);

  // Get authenticated user
  const { user } = useAuth();

  // Use the user's ID as the family ID for now - this can be enhanced later to support actual family groups
  const familyId = user?.uid || 'anonymous';

  // Use the custom hook
  const { tasks, loading: isLoadingTasks, error, addTask, toggleTask } = useTasks(familyId);

  // Handle Firebase errors
  useEffect(() => {
    if (error) {
      Alert.alert('Database Error', error);
    }
  }, [error]);

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }
    setIsLoading(true);
    try {
      const currentTitle = newTaskTitle.trim();
      await addTask(currentTitle);
      setNewTaskTitle('');

      // Dismiss the keyboard
      Keyboard.dismiss();

      // Set the newly added task title for visual feedback
      // We'll match by title and recent creation time
      setNewlyAddedTaskId(currentTitle);

      // Clear any existing timeout
      if (highlightTimeout) {
        clearTimeout(highlightTimeout);
      }

      // Clear the newly added task ID after 3 seconds
      const timeoutId = setTimeout(() => {
        setNewlyAddedTaskId(undefined);
        setHighlightTimeout(null);
      }, 3000);

      setHighlightTimeout(timeoutId);
    } catch (error) {
      console.error('Error adding task:', error);
      Alert.alert('Error', 'Failed to add task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    try {
      await toggleTask(taskId, currentStatus);
    } catch (error) {
      console.error('Error toggling task:', error);
      Alert.alert('Error', 'Failed to update task');
    }
  };

  // Cleanup timeout when component unmounts
  useEffect(() => {
    return () => {
      if (highlightTimeout) {
        clearTimeout(highlightTimeout);
      }
    };
  }, [highlightTimeout]);

  return (
    <SafeAreaView className="bg-background flex-1">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        {/* Fixed Header with Logout Button */}
        <View className="px-4 pt-2">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <TaskHeader taskCount={tasks.length} />
            </View>
            <View className="ml-4">
              <LogoutButton />
              <Link href="/family">
                <Text>Go to Family</Text>
              </Link>
            </View>
          </View>
        </View>

        {/* Tasks List */}
        <View className="flex-1 px-4 pt-4">
          <TaskList
            tasks={tasks}
            isLoading={isLoadingTasks}
            onToggleTask={handleToggleTask}
            newlyAddedTaskId={newlyAddedTaskId}
          />
        </View>

        {/* Floating Add Task Form */}
        <AddTaskForm
          newTaskTitle={newTaskTitle}
          onTaskTitleChange={setNewTaskTitle}
          onSubmit={handleAddTask}
          isLoading={isLoading}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
export default TaskScreen;
