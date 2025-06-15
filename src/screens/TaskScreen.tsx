import { useEffect, useState } from 'react';
import { Alert, StyleSheet, TextInput, View, Text, Pressable, FlatList } from 'react-native';
import { addTask, getTasksForFamily, toggleTask } from '~/firebase/tasks';
import { Task } from '../modals/Task'; // Assuming you have a Task type defined in your types file

const TaskScreen = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  // Mock family ID for now - you'll get this from your auth context later
  const familyId = 'family123';
  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }
    setIsLoading(true);
    try {
      await addTask(newTaskTitle.trim(), familyId);
      setNewTaskTitle('');
      setTasks((prevTasks) => [
        ...prevTasks,
        {
          id: Date.now().toString(),
          title: newTaskTitle.trim(),
          completed: false,
          createdAt: new Date(),
          familyId,
        }, // Mock ID for now
      ]);
      Alert.alert('Success', 'Task added successfully!');
      // In a real app, subscribeToTasks would update the list automatically
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
      // Update local state optimistically
      const updatedTasks = (await getTasksForFamily(familyId)) as Task[];
      setTasks(updatedTasks);
    } catch (error) {
      console.error('Error toggling task:', error);
      Alert.alert('Error', 'Failed to update task');
    }
  };
  const renderTask = ({ item }: { item: Task }) => {
    const { id, title, completed } = item;
    return (
      <View className="flex-row items-center justify-between border-b border-gray-200 p-4">
        <Text className="text-base text-gray-800">
          {title} - {completed ? 'Completed' : 'Incomplete'}
        </Text>
        <Pressable
          onPress={() => handleToggleTask(id, completed)}
          className="rounded-full bg-blue-500 px-3 py-1">
          <Text className="text-sm text-white">Toggle</Text>
        </Pressable>
      </View>
    );
  };
  // Load tasks when component mounts
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setIsLoadingTasks(true);
        const familyTasks = (await getTasksForFamily(familyId)) as Task[];
        setTasks(familyTasks);
      } catch (error) {
        console.error('Error loading tasks:', error);
        Alert.alert('Error', 'Failed to load tasks');
      } finally {
        setIsLoadingTasks(false);
      }
    };

    loadTasks();
  }, [familyId]);

  return (
    <View className="flex p-4" style={styles.container}>
      {/* Header */}
      <View>
        <Text className="mb-6 mt-10 text-2xl font-bold text-gray-900">Family Tasks</Text>
      </View>
      {/* Add Task Section */}
      <View className="mb-6">
        <TextInput
          value={newTaskTitle}
          onChangeText={setNewTaskTitle}
          placeholder="Enter new task..."
          className="mb-3 rounded-lg border border-gray-300 p-4 text-base"
          multiline={false}
          returnKeyType="done"
          onSubmitEditing={handleAddTask}
        />
        <Pressable
          onPress={handleAddTask}
          // disabled={isLoading}
          className={`rounded-lg py-3 ${isLoading ? 'bg-gray-400' : 'bg-blue-500'}`}>
          <Text className="text-center text-base font-semibold text-white">
            {isLoading ? 'Adding...' : 'Add Task'}
          </Text>
        </Pressable>
      </View>

      {/* Tasks List */}
      <View className="flex-1">
        <Text className="mb-3 text-lg font-semibold text-gray-700">Tasks ({tasks.length})</Text>

        {tasks.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-500">No tasks yet. Add one above!</Text>
          </View>
        ) : (
          <FlatList
            data={tasks}
            renderItem={renderTask}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    marginLeft: 16,
    marginRight: 16,
    padding: 16,
    borderWidth: 1,
  },
});
export default TaskScreen;
