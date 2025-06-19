import React from 'react';
import { View, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import Button from '../../../shared/components/Button';
import { colors } from '../../../shared/utils/colors';

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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="absolute bottom-0 left-0 right-0">
      <View className="bg-background border-border border-t px-4 pb-6 pt-4 shadow-lg">
        <View className="mb-4">
          <TextInput
            value={newTaskTitle}
            onChangeText={onTaskTitleChange}
            placeholder="What needs to be done?"
            className="border-border bg-background font-regular rounded-xl border p-4 text-base shadow-sm"
            multiline={false}
            returnKeyType="done"
            onSubmitEditing={onSubmit}
            placeholderTextColor={colors.muted}
            blurOnSubmit={true}
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
    </KeyboardAvoidingView>
  );
};

export default AddTaskForm;
