import React, { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { Button, Input } from '../../../shared/components';
import TabToggle from './TabToggle';

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
      // TODO: Implement authentication logic here
      // For now, just show a success message
      const action = activeTab === 'login' ? 'logged in' : 'signed up';
      Alert.alert('Success', `You have successfully ${action}!`);

      // Reset form
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setErrors({});
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tab: 'login' | 'signup') => {
    setActiveTab(tab);
    setErrors({}); // Clear errors when switching tabs
    setConfirmPassword(''); // Clear confirm password when switching to login
  };

  return (
    <View className="px-6 py-8">
      {/* Header */}
      <View className="mb-8">
        <Text className="text-primary mb-2 text-center text-xl font-bold">Welcome to Togetha</Text>
        <Text className="text-muted font-regular text-center text-base">
          {activeTab === 'login'
            ? 'Sign in to your account to continue'
            : 'Create a new account to get started'}
        </Text>
      </View>

      {/* Tab Toggle */}
      <TabToggle activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Form */}
      <View className="mb-6">
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          error={errors.email}
        />

        <Input
          label="Password"
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
            label="Confirm Password"
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
            <Text className="text-muted font-regular text-base">Don't have an account? </Text>
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

export default AuthForm;
