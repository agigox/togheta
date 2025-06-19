import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '../../../shared/utils/colors';
import Tab from '~/shared/components/Tab';

interface TabToggleProps {
  activeTab: 'login' | 'signup';
  onTabChange: (tab: 'login' | 'signup') => void;
}

const TabToggle: React.FC<TabToggleProps> = ({ activeTab, onTabChange }) => {
  return (
    <View style={styles.container}>
      
      <Tab
  label="Log In"
  isActive={activeTab === 'login'}
  onPress={() => onTabChange('login')}
/>
      

      <Tab
  label="Sign Up"
  isActive={activeTab === 'signup'}
  onPress={() => onTabChange('signup')}
/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 4,
    marginBottom: 24,
  },
});

export default TabToggle;
