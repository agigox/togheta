import React from 'react';
import { View, Text, Pressable } from 'react-native';

interface TabToggleProps {
  activeTab: 'login' | 'signup';
  onTabChange: (tab: 'login' | 'signup') => void;
}

const TabToggle: React.FC<TabToggleProps> = ({ activeTab, onTabChange }) => {
  return (
    <View className="mb-6 flex-row rounded-xl bg-gray-100 p-1">
      <Pressable
        onPress={() => onTabChange('login')}
        className={`flex-1 rounded-lg px-4 py-3 ${
          activeTab === 'login' ? 'bg-background shadow-sm' : ''
        }`}>
        <Text
          className={`text-center text-base font-medium ${
            activeTab === 'login' ? 'text-primary' : 'text-muted'
          }`}>
          Log In
        </Text>
      </Pressable>

      <Pressable
        onPress={() => onTabChange('signup')}
        className={`flex-1 rounded-lg px-4 py-3 ${
          activeTab === 'signup' ? 'bg-background shadow-sm' : ''
        }`}>
        <Text
          className={`text-center text-base font-medium ${
            activeTab === 'signup' ? 'text-primary' : 'text-muted'
          }`}>
          Sign Up
        </Text>
      </Pressable>
    </View>
  );
};

export default TabToggle;
