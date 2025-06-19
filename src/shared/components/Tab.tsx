import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { colors } from '../utils/colors';

type TabProps = {
  label: string;
  isActive: boolean;
  onPress: () => void;
};

export default function Tab({ label, isActive, onPress }: TabProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tab, isActive && styles.activeTab]}>
      <Text
        style={[
          styles.tabText,
          isActive ? styles.activeTabText : styles.inactiveTabText,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tab: {
    width: '50%',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#111111',
  },
  inactiveTabText: {
    color: '#888888',
  },
});