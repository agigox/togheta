import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Task } from '../../modals/Task';
import Checkbox from './Checkbox';
import { Icon } from './Icon';

interface TaskCardProps {
  task: Task;
  onToggle: (taskId: string, currentStatus: boolean) => void;
  onDelete?: (taskId: string) => void;
  onEdit?: (taskId: string) => void;
  isNewlyAdded?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggle,
  onDelete,
  onEdit,
  isNewlyAdded = false,
}) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <View
      className={`border-border mb-2 rounded-lg border-2 p-2 shadow-sm ${
        isNewlyAdded ? 'bg-green-100' : 'bg-background'
      }`}>
      <View className="flex-row items-start justify-between">
        {/* Left side - Checkbox and content */}
        <View className="flex-1 flex-row items-start gap-2 space-x-3">
          <View className="pt-1">
            <Checkbox
              checked={task.completed || false}
              onToggle={() => onToggle(task.id, task.completed || false)}
              size="md"
              color="#22C55E"
            />
          </View>

          <View className="flex-1">
            <Text
              className={`text-base font-medium ${
                task.completed ? 'text-muted line-through' : 'text-primary'
              }`}>
              {task.title}
            </Text>

            {task.createdAt && (
              <Text className="text-2xs text-muted mt-1 font-light">
                Created {formatDate(task.createdAt)}
              </Text>
            )}

            {task.completed && (
              <View className="mt-2 flex-row items-center">
                <Icon name="CheckCircleIcon" size={14} color="#22C55E" variant="solid" />
                <Text className="text-2xs ml-1 font-medium text-green-600">Completed</Text>
              </View>
            )}
          </View>
        </View>

        {/* Right side - Action buttons */}
        <View className="flex-row items-center space-x-2">
          {onEdit && (
            <Pressable onPress={() => onEdit(task.id)} className="rounded-full bg-gray-100 p-2">
              <Icon name="PencilIcon" size={16} color="#6B7280" variant="outline" />
            </Pressable>
          )}

          {onDelete && (
            <Pressable onPress={() => onDelete(task.id)} className="rounded-full bg-red-50 p-2">
              <Icon name="TrashIcon" size={16} color="#EF4444" variant="outline" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Task status indicator
      <View className="mt-3 flex-row items-center justify-between">
        <View
          className={`rounded-full px-2 py-1 ${
            task.completed ? 'bg-green-100' : 'bg-accent bg-opacity-20'
          }`}>
          <Text
            className={`text-2xs font-medium ${
              task.completed ? 'text-green-700' : 'text-orange-700'
            }`}>
            {task.completed ? 'Done' : 'Pending'}
          </Text>
        </View>

        {!task.completed && (
          <Pressable
            onPress={() => onToggle(task.id, task.completed || false)}
            className="bg-accent rounded-md px-3 py-1">
            <Text className="text-2xs font-semiBold text-white">Mark Complete</Text>
          </Pressable>
        )}
      </View> */}
    </View>
  );
};

export default TaskCard;
