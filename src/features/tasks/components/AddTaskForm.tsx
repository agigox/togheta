import React from 'react';
import { View, TextInput } from 'react-native';
import Button from '../../../shared/components/Button';

interface AddTaskFormProps {
  newTaskTitle: string;
  onTaskTitleChange: (title: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const AddTaskForm: React.FC<AddTaskFormProps> = ({
  newTaskTitle,
  onTaskTitleChange,
  onSubmit,
  isLoading,
}) => {
  return (
    <View className="absolute bottom-6 left-4 right-4">
      <View className="mb-4">
        <TextInput
          value={newTaskTitle}
          onChangeText={onTaskTitleChange}
          placeholder="What needs to be done?"
          className="border-border bg-background font-regular rounded-xl border p-4 text-base shadow-sm"
          multiline={false}
          returnKeyType="done"
          onSubmitEditing={onSubmit}
          placeholderTextColor="#9CA3AF"
        />
      </View>
      <Button
        title={isLoading ? 'Adding...' : 'Add Task'}
        onPress={onSubmit}
        icon="PlusIcon"
        variant="primary"
        size="lg"
        fullWidth={true}
        disabled={isLoading || !newTaskTitle.trim()}
        loading={isLoading}
      />
    </View>
  );
};

export default AddTaskForm;
