import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

interface TabToggleProps {
  activeTab: 'login' | 'signup';
  onTabChange: (tab: 'login' | 'signup') => void;
}

const TabToggle: React.FC<TabToggleProps> = ({ activeTab, onTabChange }) => {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => onTabChange('login')}
        style={[styles.tab, activeTab === 'login' && styles.activeTab]}>
        <Text
          style={[
            styles.tabText,
            activeTab === 'login' ? styles.activeTabText : styles.inactiveTabText,
          ]}>
          Log In
        </Text>
      </Pressable>

      <Pressable
        onPress={() => onTabChange('signup')}
        style={[styles.tab, activeTab === 'signup' && styles.activeTab]}>
        <Text
          style={[
            styles.tabText,
            activeTab === 'signup' ? styles.activeTabText : styles.inactiveTabText,
          ]}>
          Sign Up
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#111111',
  },
  inactiveTabText: {
    color: '#9CA3AF',
  },
});

export default TabToggle;
