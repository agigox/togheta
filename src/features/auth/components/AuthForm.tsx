import React, { useState } from 'react';
import { View, Text, Pressable, Alert, StyleSheet } from 'react-native';
import { Button, Input } from '~/shared';
import TabToggle from './TabToggle';
import HeaderAuth from './AuthHeader';
import SplashScreen from '~/shared/components/SplashScreen';
import { useAuthStore } from '~/stores';

const AuthForm: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const { loading, login, signup } = useAuthStore();

  const validateForm = () => {
    const newErrors: typeof errors = {};

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation for signup
    if (activeTab === 'signup') {
      if (!confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (activeTab === 'login') {
        await login(email, password);
        // Auth state and persistence are handled automatically by AuthContext
        console.log('Login successful - user data persisted');
      } else {
        await signup(email, password);
        // Auth state and persistence are handled automatically by AuthContext
        console.log('Signup successful - user data persisted');
      }

      // Reset form on success
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setErrors({});
    } catch (error: any) {
      console.error('Authentication error:', error);

      // Handle specific Firebase auth errors
      let errorMessage = 'Something went wrong. Please try again.';

      if (error.code) {
        switch (error.code) {
          case 'auth/user-not-found':
            errorMessage = 'No account found with this email.';
            if (activeTab === 'login') {
              Alert.alert('Account Not Found', 'Would you like to create a new account?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign Up', onPress: () => handleTabChange('signup') },
              ]);
              return;
            }
            break;
          case 'auth/wrong-password':
            errorMessage = 'Incorrect password. Please try again.';
            break;
          case 'auth/email-already-in-use':
            errorMessage = 'An account with this email already exists.';
            if (activeTab === 'signup') {
              Alert.alert('Account Exists', 'Would you like to sign in instead?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign In', onPress: () => handleTabChange('login') },
              ]);
              return;
            }
            break;
          case 'auth/weak-password':
            errorMessage = 'Password should be at least 6 characters long.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Please enter a valid email address.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your connection.';
            break;
          default:
            errorMessage = error.message || errorMessage;
        }
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tab: 'login' | 'signup') => {
    console.log('Tab changing from', activeTab, 'to', tab);
    try {
      setActiveTab(tab);
      setErrors({}); // Clear errors when switching tabs
      setConfirmPassword(''); // Clear confirm password when switching to login
      console.log('Tab change completed successfully');
    } catch (error) {
      console.error('Error during tab change:', error);
    }
  };
  if (loading) {
    return <SplashScreen />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <HeaderAuth activeTab={activeTab} />

      {/* Tab Toggle */}
      <TabToggle activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Form */}
      <View style={styles.formContainer}>
        <Input
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          error={errors.email}
        />

        <Input
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry
          autoCapitalize="none"
          autoComplete={activeTab === 'signup' ? 'new-password' : 'password'}
          error={errors.password}
        />

        {activeTab === 'signup' && (
          <Input
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm your password"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            error={errors.confirmPassword}
          />
        )}
      </View>

      {/* Submit Button */}
      <Button
        title={
          isLoading
            ? activeTab === 'login'
              ? 'Signing In...'
              : 'Signing Up...'
            : activeTab === 'login'
              ? 'Sign In'
              : 'Sign Up'
        }
        onPress={handleSubmit}
        variant="primary"
        size="lg"
        fullWidth
        loading={isLoading}
        disabled={isLoading}
      />

      {/* Additional Links */}
      {activeTab === 'login' && (
        <View className="mt-6">
          <Pressable
            onPress={() => Alert.alert('Info', 'Forgot password functionality coming soon!')}>
            <Text className="text-accent text-center text-base font-medium">Forgot Password?</Text>
          </Pressable>

          <View className="mt-4 flex-row justify-center">
            <Text className="text-muted font-regular text-base">{`Don't have an account?`} </Text>
            <Pressable onPress={() => handleTabChange('signup')}>
              <Text className="text-accent text-base font-medium">Sign Up</Text>
            </Pressable>
          </View>
        </View>
      )}

      {activeTab === 'signup' && (
        <View className="mt-6">
          <View className="flex-row justify-center">
            <Text className="text-muted font-regular text-base">Already have an account? </Text>
            <Pressable onPress={() => handleTabChange('login')}>
              <Text className="text-accent text-base font-medium">Log In</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  formContainer: {
    marginBottom: 24,
  },
});

export default AuthForm;
