import React from 'react';
import { TextInput, View, Text } from 'react-native';

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: 'email' | 'password' | 'new-password' | 'name' | 'off';
  error?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoComplete = 'off',
  error,
}) => {
  return (
    <View className="mb-4">
      <Text className="text-primary mb-2 text-base font-medium">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || label}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        className={`font-regular border-2 p-4 text-base ${
          error ? 'border-red-500' : 'border-border'
        } bg-background`}
        placeholderTextColor="#9CA3AF"
      />
      {error && <Text className="text-2xs font-regular mt-1 text-red-500">{error}</Text>}
    </View>
  );
};

export default Input;
