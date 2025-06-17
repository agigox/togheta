import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import { addTask, getTasksForFamily, toggleTask } from '~/firebase/tasks';
import { Task } from '../../modals/Task';
import TaskHeader from './components/TaskHeader';
import TaskList from './components/TaskList';
import AddTaskForm from './components/AddTaskForm';
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
    console.log(tasks);
  }, [familyId]);

  return (
    <View className="bg-background flex-1">
      {/* Fixed Header */}
      <TaskHeader taskCount={tasks.length} />

      {/* Tasks List */}
      <View className="flex-1 px-4 pt-4">
        <TaskList tasks={tasks} isLoading={isLoadingTasks} onToggleTask={handleToggleTask} />
      </View>

      {/* Floating Add Task Form */}
      <AddTaskForm
        newTaskTitle={newTaskTitle}
        onTaskTitleChange={setNewTaskTitle}
        onSubmit={handleAddTask}
        isLoading={isLoading}
      />
    </View>
  );
};
export default TaskScreen;
