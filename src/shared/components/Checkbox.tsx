import React from 'react';
import { View, Pressable, Text } from 'react-native';
import { Icon } from './Icon';

interface CheckboxProps {
  checked: boolean;
  onToggle: () => void;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  disabled?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onToggle,
  label,
  size = 'md',
  color = '#3B82F6',
  disabled = false,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 20,
  };

  return (
    <Pressable
      onPress={onToggle}
      disabled={disabled}
      className={`flex-row items-center ${disabled ? 'opacity-50' : ''}`}>
      <View
        className={`
          ${sizeClasses[size]} 
          rounded border-2 
          ${checked ? 'border-blue-500 bg-blue-500' : 'border-gray-300 bg-white'}
          ${disabled ? 'opacity-50' : ''}
          items-center justify-center
        `}
        style={{
          backgroundColor: checked ? color : 'white',
          borderColor: checked ? color : '#D1D5DB',
        }}>
        {checked && <Icon name="CheckIcon" size={iconSizes[size]} color="white" variant="solid" />}
      </View>
      {label && (
        <Text className={`ml-2 text-gray-700 ${disabled ? 'opacity-50' : ''}`}>{label}</Text>
      )}
    </Pressable>
  );
};

export default Checkbox;
