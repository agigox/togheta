import React from 'react';
import { View, Text } from 'react-native';
import { Icon } from '../../../shared/components/Icon';
import { colors } from '../../../shared/utils/colors';

interface TaskHeaderProps {
  taskCount: number;
}

const TaskHeader: React.FC<TaskHeaderProps> = ({ taskCount }) => {
  return (
    <View className="bg-background border-border border-b px-4 pb-4 pt-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Icon name="SparklesIcon" variant="solid" size={32} color={colors.accent} />
          <Text className="text-primary ml-3 text-xl font-bold">Family Tasks</Text>
        </View>
        <View className="bg-accent rounded-full bg-opacity-20 px-3 py-1">
          <Text className="text-2xs font-semiBold text-primary">
            {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default TaskHeader;
