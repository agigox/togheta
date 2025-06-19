import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type HeaderAuthProps = {
  activeTab: 'login' | 'signup';
};

export default function HeaderAuth({ activeTab }: HeaderAuthProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Welcome to Togetha</Text>
      <Text style={styles.subtitle}>
        {activeTab === 'login'
          ? 'Sign in to your account to continue'
          : 'Create a new account to get started'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111111',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
  },
});