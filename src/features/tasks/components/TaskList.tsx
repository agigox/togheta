import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { Task } from '../../../modals/Task';
import { Icon } from '../../../shared/components/Icon';
import { colors } from '../../../shared/utils/colors';
import TaskCard from '../../../shared/components/TaskCard';

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  onToggleTask: (taskId: string, currentStatus: boolean) => void;
  onDeleteTask?: (taskId: string) => void;
  onEditTask?: (taskId: string) => void;
  newlyAddedTaskId?: string;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  isLoading,
  onToggleTask,
  onDeleteTask,
  onEditTask,
  newlyAddedTaskId,
}) => {
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Icon name="ArrowPathIcon" size={24} color={colors.muted} variant="outline" />
        <Text className="text-muted mt-2 font-light">Loading tasks...</Text>
      </View>
    );
  }

  if (tasks.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <Icon name="CheckCircleIcon" size={48} color={colors.muted} variant="outline" />
        <Text className="text-primary mt-4 text-lg font-medium">No tasks yet</Text>
        <Text className="text-muted mt-1 font-light">Tap the + button to add your first task</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={tasks}
      renderItem={({ item }) => {
        // Check if this task was recently added (within last 5 seconds and matches title)
        const isRecentlyAdded =
          newlyAddedTaskId === item.title &&
          item.createdAt &&
          Date.now() - new Date(item.createdAt).getTime() < 5000;

        return (
          <TaskCard
            task={item}
            onToggle={onToggleTask}
            onDelete={onDeleteTask}
            onEdit={onEditTask}
            isNewlyAdded={isRecentlyAdded}
          />
        );
      }}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 150 }}
    />
  );
};

export default TaskList;
