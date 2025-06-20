import React from 'react';
import { Alert } from 'react-native';
import { Button } from '~/shared/components';
import { useAuth } from '~/context/AuthContext';

const LogoutButton: React.FC = () => {
  const { logout, user } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('Error', 'Failed to sign out. Please try again.');
          }
        },
      },
    ]);
  };

  if (!user) return null;

  return <Button title="Sign Out" onPress={handleLogout} variant="outline" size="sm" />;
};

export default LogoutButton;
