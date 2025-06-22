import { useEffect, useState } from 'react';
import { Text, Alert, View, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTasks } from '../../hooks/useTasks';
import { useAuth } from '~/context/AuthContext';
import { useFamily } from '~/hooks/useFamily';
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

  // Get authenticated user and family
  const { user } = useAuth();
  const { family, loading: familyLoading, error: familyError } = useFamily();

  // Wait for family to be loaded before using familyId to prevent permission errors
  const familyId = family?.id || (familyLoading ? '' : user?.uid || 'anonymous');

  // Use the custom hook
  const { tasks, loading: isLoadingTasks, error, addTask, toggleTask } = useTasks(familyId);

  // Handle Firebase errors
  useEffect(() => {
    if (error) {
      Alert.alert('Database Error', error);
    }
    if (familyError) {
      Alert.alert('Family Error', familyError);
    }
  }, [error, familyError]);

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
          {familyLoading && !family ? (
            <View className="flex-1 justify-center items-center">
              <Text className="text-lg text-gray-600 text-center mb-2">
                Setting up your family...
              </Text>
              <Text className="text-sm text-gray-500 text-center">
                This may take a few seconds for new accounts
              </Text>
            </View>
          ) : (
            <TaskList
              tasks={tasks}
              isLoading={isLoadingTasks}
              onToggleTask={handleToggleTask}
              newlyAddedTaskId={newlyAddedTaskId}
            />
          )}
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
